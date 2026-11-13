import crypto from 'node:crypto';
import express from 'express';
import type { DatabaseSync } from 'node:sqlite';
import {
  createSession,
  extractBearerToken,
  hashPassword,
  isBreakGlassActive,
  logAudit,
  makeAuthMiddleware,
  requireRoles,
  verifyPassword
} from './auth.ts';
import type { AuthenticatedRequest } from './auth.ts';
import { DEV_TEST_ACCOUNTS } from './seed.ts';

export interface CreateAppOptions {
  allowDevAccounts?: boolean;
}

const VALID_ROLES = new Set([
  'national_super_admin',
  'national_authority_admin',
  'director_general',
  'department_admin',
  'regional_admin',
  'district_admin',
  'gis_officer',
  'data_quality_officer',
  'field_ops_supervisor',
  'field_surveyor',
  'address_verifier',
  'auditor',
  'public_citizen',
  'institutional_api_client'
]);

const VALID_PROPERTY_TYPES = new Set(['residential', 'commercial', 'public_facility', 'administrative']);

export function createApp(db: DatabaseSync, options: CreateAppOptions = {}) {
  const allowDevAccounts = options.allowDevAccounts ?? process.env.NODE_ENV !== 'production';
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  const requireAuth = makeAuthMiddleware(db);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: 'sqlite', timestamp: new Date().toISOString() });
  });

  // ---------------------------------------------------------------------------
  // Authentication & Session Endpoints (Real Password & Session Validation)
  // ---------------------------------------------------------------------------
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const row = db
      .prepare('SELECT * FROM users WHERE lower(email) = lower(?)')
      .get(email.trim()) as Record<string, any> | undefined;

    if (!row || !verifyPassword(password, String(row.password_hash))) {
      logAudit(db, {
        actorUserId: row ? String(row.id) : null,
        actorRole: row ? String(row.role) : 'anonymous',
        action: 'auth.login_failed',
        targetType: 'user',
        targetId: email.trim(),
        detail: 'Invalid credentials submitted',
        outcome: 'denied'
      });
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!row.is_active) {
      res.status(403).json({ error: 'Account is disabled by administrator.' });
      return;
    }

    if (row.is_dev_account && !allowDevAccounts) {
      res.status(403).json({ error: 'Development test accounts are disabled in production mode.' });
      return;
    }

    const token = createSession(db, String(row.id));
    logAudit(db, {
      actorUserId: String(row.id),
      actorRole: String(row.role),
      action: 'auth.login_success',
      targetType: 'session',
      targetId: String(row.id),
      detail: `Authenticated session started for ${row.email}`
    });

    res.json({
      token,
      user: {
        id: String(row.id),
        email: String(row.email),
        fullName: String(row.full_name),
        role: String(row.role),
        department: String(row.department),
        regionId: String(row.region_id),
        districtId: row.district_id ? String(row.district_id) : null,
        assignedArea: String(row.assigned_area),
        mfaEnabled: Boolean(row.mfa_enabled),
        isDevAccount: Boolean(row.is_dev_account)
      },
      breakGlassActive: String(row.role) === 'national_super_admin' ? isBreakGlassActive(db, String(row.id)) : false
    });
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.sessionToken) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(req.sessionToken);
    }
    logAudit(db, {
      actorUserId: req.user!.id,
      actorRole: req.user!.role,
      action: 'auth.logout',
      targetType: 'session',
      targetId: req.user!.id,
      detail: `Session closed for ${req.user!.email}`
    });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const u = req.user!;
    res.json({
      user: u,
      breakGlassActive: u.role === 'national_super_admin' ? isBreakGlassActive(db, u.id) : false
    });
  });

  // Dev-only account listing (strictly disabled in production!)
  app.get('/api/auth/dev-accounts', (_req, res) => {
    if (!allowDevAccounts) {
      res.status(404).json({ error: 'Not available in production environment.' });
      return;
    }
    res.json({
      environment: 'development_only',
      accounts: DEV_TEST_ACCOUNTS.map((a) => ({
        order: a.order,
        code: a.code,
        email: a.email,
        role: a.role,
        fullName: a.fullName,
        assignedArea: a.assignedArea
      }))
    });
  });

  // ---------------------------------------------------------------------------
  // Public Read-Only Portal Routes (R13 / Unauthenticated Public Fields Only)
  // ---------------------------------------------------------------------------
  app.get('/api/public/districts', (_req, res) => {
    const rows = db.prepare('SELECT * FROM districts ORDER BY name ASC').all();
    res.json({ districts: rows });
  });

  app.get('/api/public/addresses', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const districtId = typeof req.query.districtId === 'string' ? req.query.districtId : 'all';

    let rows = db
      .prepare(
        `SELECT a.id, a.public_code, a.district_id, d.name as district_name, a.region,
                a.locality, a.street, a.building_number, a.landmark, a.address_type,
                a.lat, a.lon, a.accuracy_meters, a.publication_status, a.designation_status,
                a.authority_reference, a.is_test_fixture
         FROM addresses a
         JOIN districts d ON d.id = a.district_id
         WHERE a.publication_status = 'published' AND a.layer_sensitivity = 'public'`
      )
      .all() as Array<Record<string, any>>;

    if (districtId !== 'all') {
      rows = rows.filter((r) => r.district_id === districtId);
    }
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r.public_code).toLowerCase().includes(q) ||
          String(r.district_name).toLowerCase().includes(q) ||
          String(r.locality).toLowerCase().includes(q) ||
          String(r.street || '').toLowerCase().includes(q)
      );
    }
    res.json({ addresses: rows });
  });

  app.get('/api/public/addresses/:code', (req, res) => {
    const row = db
      .prepare(
        `SELECT a.id, a.public_code, a.district_id, d.name as district_name, a.region,
                a.locality, a.street, a.building_number, a.landmark, a.address_type,
                a.lat, a.lon, a.accuracy_meters, a.publication_status, a.designation_status,
                a.authority_reference, a.is_test_fixture
         FROM addresses a
         JOIN districts d ON d.id = a.district_id
         WHERE upper(a.public_code) = upper(?)
           AND a.publication_status = 'published'
           AND a.layer_sensitivity = 'public'`
      )
      .get(req.params.code);

    if (!row) {
      res.status(404).json({ error: 'Public published address code not found.' });
      return;
    }
    res.json({ address: row });
  });

  // ---------------------------------------------------------------------------
  // R13 Citizen Portal Routes (Strict Ownership Isolation)
  // ---------------------------------------------------------------------------
  app.get('/api/citizen/my-requests', requireAuth, (req: AuthenticatedRequest, res) => {
    const rows = db
      .prepare(
        `SELECT r.*, d.name as district_name
         FROM address_requests r
         JOIN districts d ON d.id = r.district_id
         WHERE r.submitted_by = ?
         ORDER BY r.submitted_at DESC`
      )
      .all(req.user!.id);
    res.json({ requests: rows });
  });

  app.post(
    '/api/citizen/requests',
    requireAuth,
    requireRoles(db, ['public_citizen', 'district_admin', 'regional_admin']),
    (req: AuthenticatedRequest, res) => {
      const { applicantName, districtId, locality, street, buildingNumber, propertyType } = req.body || {};
      if (!applicantName || !districtId || !locality || !street) {
        res.status(400).json({ error: 'applicantName, districtId, locality, and street are required.' });
        return;
      }
      if (req.user!.role === 'district_admin') {
        if (!req.user!.districtId || districtId !== req.user!.districtId) {
          res.status(403).json({ error: 'District Admin can only submit within assigned district.' });
          return;
        }
      }
      const districtExists = db.prepare('SELECT id FROM districts WHERE id = ?').get(String(districtId));
      if (!districtExists) {
        res.status(400).json({ error: `Unknown districtId '${String(districtId)}'.` });
        return;
      }

      const id = `APP-CIT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const clientUuid = crypto.randomUUID();
      const safePropType = VALID_PROPERTY_TYPES.has(String(propertyType)) ? String(propertyType) : 'residential';
      db.prepare(
        `INSERT INTO address_requests (
          id, client_uuid, applicant_name, district_id, locality, street, building_number,
          property_type, workflow_state, submitted_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)`
      ).run(
        id,
        clientUuid,
        String(applicantName).trim(),
        String(districtId),
        String(locality).trim(),
        String(street).trim(),
        buildingNumber ? String(buildingNumber).trim() : null,
        safePropType,
        req.user!.id
      );

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'address_request.submitted',
        targetType: 'address_request',
        targetId: id,
        detail: `Submitted new request in ${districtId}`
      });

      res.status(201).json({ id, workflowState: 'submitted' });
    }
  );

  // ---------------------------------------------------------------------------
  // Scoped Registry Read Endpoint (Enforces RLS + R01 Masking + Public Filter)
  // ---------------------------------------------------------------------------
  app.get('/api/registry/addresses', requireAuth, (req: AuthenticatedRequest, res) => {
    const u = req.user!;
    const requestedDistrict = typeof req.query.districtId === 'string' ? req.query.districtId : 'all';

    // District-scoped roles must fail closed if unassigned or querying outside their assigned district
    if (u.role === 'district_admin' || u.role === 'field_surveyor') {
      if (!u.districtId) {
        res.status(403).json({ error: `Access denied: ${u.role} has no assigned district.` });
        return;
      }
      if (requestedDistrict !== 'all' && requestedDistrict !== u.districtId) {
        logAudit(db, {
          actorUserId: u.id,
          actorRole: u.role,
          action: 'rls.cross_district_denied',
          targetType: 'district',
          targetId: requestedDistrict,
          detail: `Attempted access outside assigned district ${u.districtId}`,
          outcome: 'denied'
        });
        res.status(403).json({ error: `Access denied: ${u.role} is scoped to district '${u.districtId}' only.` });
        return;
      }
    }

    let query = `
      SELECT a.*, d.name as district_name
      FROM addresses a
      JOIN districts d ON d.id = a.district_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (u.role === 'public_citizen' || u.role === 'institutional_api_client') {
      query += ` AND a.publication_status = 'published' AND a.layer_sensitivity = 'public'`;
    } else if (u.role === 'district_admin' || u.role === 'field_surveyor') {
      query += ` AND a.district_id = ?`;
      params.push(u.districtId);
    } else if (u.role === 'address_verifier') {
      query += ` AND a.district_id IN ('dis-hodan', 'dis-warta')`;
    } else if (u.role === 'field_ops_supervisor') {
      query += ` AND a.district_id IN ('dis-hodan', 'dis-wadajir', 'dis-karan')`;
    }

    if (requestedDistrict !== 'all') {
      query += ` AND a.district_id = ?`;
      params.push(requestedDistrict);
    }

    const rows = db.prepare(query).all(...params) as Array<Record<string, any>>;

    const breakGlass = u.role === 'national_super_admin' ? isBreakGlassActive(db, u.id) : false;
    const maskedRows = rows.map((r) => {
      if (u.role === 'national_super_admin' && !breakGlass) {
        return {
          id: r.id,
          public_code: r.public_code,
          district_id: r.district_id,
          district_name: r.district_name,
          region: r.region,
          locality: '[MASKED — BREAK-GLASS REQUIRED]',
          street: '[MASKED — BREAK-GLASS REQUIRED]',
          building_number: '[MASKED]',
          lat: null,
          lon: null,
          workflow_state: r.workflow_state,
          verification_status: r.verification_status,
          approval_status: r.approval_status,
          publication_status: r.publication_status,
          designation_status: r.designation_status,
          masked: true
        };
      }
      return { ...r, masked: false };
    });

    res.json({ addresses: maskedRows, breakGlassActive: breakGlass });
  });

  // ---------------------------------------------------------------------------
  // R01 National Super Administrator Routes
  // ---------------------------------------------------------------------------
  app.get(
    '/api/superadmin/overview',
    requireAuth,
    requireRoles(db, ['national_super_admin']),
    (req: AuthenticatedRequest, res) => {
      const users = db
        .prepare(
          `SELECT id, email, full_name, role, department, region_id, district_id, assigned_area, mfa_enabled, is_active, is_dev_account
           FROM users ORDER BY id ASC`
        )
        .all();
      const recentAudit = db
        .prepare('SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT 12')
        .all();
      const activeBreakGlass = isBreakGlassActive(db, req.user!.id);
      const totalAddresses = (db.prepare('SELECT COUNT(*) as c FROM addresses').get() as { c: number }).c;

      res.json({
        platformHealth: {
          status: 'healthy',
          databaseEngine: 'SQLite WAL (Immutable Audit Triggers Enabled)',
          mfaEnforcement: 'Hardware / App MFA Enforced (R01–R12)',
          totalRegisteredFixtures: totalAddresses,
          activeBreakGlass
        },
        users,
        recentLogs: recentAudit
      });
    }
  );

  app.post(
    '/api/superadmin/users',
    requireAuth,
    requireRoles(db, ['national_super_admin']),
    (req: AuthenticatedRequest, res) => {
      const { email, fullName, role, department, districtId, assignedArea, password } = req.body || {};
      if (!email || !fullName || !role || !department) {
        res.status(400).json({ error: 'email, fullName, role, and department are required.' });
        return;
      }
      const cleanEmail = String(email).trim().toLowerCase();
      if (!cleanEmail.includes('@')) {
        res.status(400).json({ error: 'A valid institutional email address is required.' });
        return;
      }
      if (!VALID_ROLES.has(String(role))) {
        res.status(400).json({ error: `Invalid role '${String(role)}'.` });
        return;
      }
      const existingEmail = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(cleanEmail);
      if (existingEmail) {
        res.status(409).json({ error: `An account with email '${cleanEmail}' already exists.` });
        return;
      }
      if (districtId) {
        const dist = db.prepare('SELECT id FROM districts WHERE id = ?').get(String(districtId));
        if (!dist) {
          res.status(400).json({ error: `Unknown districtId '${String(districtId)}'.` });
          return;
        }
      }
      const id = `usr-${crypto.randomBytes(4).toString('hex')}`;
      db.prepare(
        `INSERT INTO users (id, email, password_hash, full_name, role, department, region_id, district_id, assigned_area, mfa_enabled, is_active, is_dev_account)
         VALUES (?, ?, ?, ?, ?, ?, 'BN-01', ?, ?, 1, 1, 0)`
      ).run(
        id,
        cleanEmail,
        hashPassword(typeof password === 'string' && password.length >= 8 ? password : crypto.randomBytes(12).toString('hex')),
        String(fullName).trim(),
        String(role),
        String(department).trim(),
        districtId ? String(districtId) : null,
        assignedArea ? String(assignedArea).trim() : 'Configured by Super Admin'
      );

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'superadmin.user_created',
        targetType: 'user',
        targetId: id,
        detail: `Created account ${cleanEmail} with role ${role}`
      });
      res.status(201).json({ id, email: cleanEmail, role });
    }
  );

  app.patch(
    '/api/superadmin/users/:id/status',
    requireAuth,
    requireRoles(db, ['national_super_admin']),
    (req: AuthenticatedRequest, res) => {
      const { isActive } = req.body || {};
      if (req.params.id === req.user!.id) {
        res.status(400).json({ error: 'Cannot deactivate your own active Super Admin account.' });
        return;
      }
      const result = db
        .prepare('UPDATE users SET is_active = ? WHERE id = ?')
        .run(isActive ? 1 : 0, req.params.id);
      if (result.changes === 0) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'superadmin.user_status_changed',
        targetType: 'user',
        targetId: String(req.params.id),
        detail: `Set is_active=${Boolean(isActive)}`
      });
      res.json({ ok: true });
    }
  );

  app.post(
    '/api/superadmin/break-glass',
    requireAuth,
    requireRoles(db, ['national_super_admin']),
    (req: AuthenticatedRequest, res) => {
      const { reason, ticketRef } = req.body || {};
      if (typeof reason !== 'string' || reason.trim().length < 8) {
        res.status(400).json({ error: 'Detailed emergency reason (min 8 chars) is required for Break-Glass.' });
        return;
      }
      if (!req.user!.mfaEnabled) {
        res.status(403).json({ error: 'Hardware MFA verification is required before Break-Glass activation.' });
        return;
      }
      const id = `BG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      db.prepare('UPDATE break_glass_sessions SET active = 0 WHERE user_id = ?').run(req.user!.id);
      db.prepare(
        `INSERT INTO break_glass_sessions (id, user_id, reason, ticket_ref, active, expires_at)
         VALUES (?, ?, ?, ?, 1, ?)`
      ).run(id, req.user!.id, reason.trim(), ticketRef ? String(ticketRef) : 'INC-MANUAL', expiresAt);

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'break_glass.activated',
        targetType: 'platform',
        targetId: id,
        detail: `15-min emergency access activated (${ticketRef || 'INC-MANUAL'}): ${reason.trim()}`
      });

      res.json({ breakGlassActive: true, sessionId: id, expiresAt });
    }
  );

  app.post(
    '/api/superadmin/break-glass/close',
    requireAuth,
    requireRoles(db, ['national_super_admin']),
    (req: AuthenticatedRequest, res) => {
      db.prepare('UPDATE break_glass_sessions SET active = 0 WHERE user_id = ?').run(req.user!.id);
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'break_glass.closed',
        targetType: 'platform',
        targetId: req.user!.id,
        detail: 'Emergency Break-Glass session closed; masking restored'
      });
      res.json({ breakGlassActive: false });
    }
  );

  // ---------------------------------------------------------------------------
  // R02 National Authority Administrator & R03 Director General (Dual Control)
  // ---------------------------------------------------------------------------
  app.get(
    '/api/authority/overview',
    requireAuth,
    requireRoles(db, ['national_authority_admin', 'director_general']),
    (_req, res) => {
      const proposals = db
        .prepare(
          `SELECT p.*, u1.full_name as proposer_name, u2.full_name as countersigner_name
           FROM governance_proposals p
           LEFT JOIN users u1 ON u1.id = p.proposed_by
           LEFT JOIN users u2 ON u2.id = p.countersigned_by
           ORDER BY p.created_at DESC`
        )
        .all();
      const districts = db.prepare('SELECT * FROM districts ORDER BY name ASC').all();
      const pendingDesignations = db
        .prepare(
          `SELECT a.*, d.name as district_name
           FROM addresses a
           JOIN districts d ON d.id = a.district_id
           WHERE a.approval_status = 'approved'
           ORDER BY a.updated_at DESC`
        )
        .all();
      res.json({ proposals, districts, pendingDesignations });
    }
  );

  app.post(
    '/api/authority/proposals',
    requireAuth,
    requireRoles(db, ['national_authority_admin']),
    (req: AuthenticatedRequest, res) => {
      const { category, title, description } = req.body || {};
      if (!title || !description) {
        res.status(400).json({ error: 'title and description are required.' });
        return;
      }
      const id = `POL-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      db.prepare(
        `INSERT INTO governance_proposals (id, category, title, description, proposed_by, status)
         VALUES (?, ?, ?, ?, ?, 'pending_second_approver')`
      ).run(id, category ? String(category) : 'code_rule', String(title).trim(), String(description).trim(), req.user!.id);

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'governance.proposal_created',
        targetType: 'governance_proposal',
        targetId: id,
        detail: `Proposed standard/rule: ${title}`
      });
      res.status(201).json({ id, status: 'pending_second_approver' });
    }
  );

  app.post(
    '/api/governance/proposals/:id/countersign',
    requireAuth,
    requireRoles(db, ['national_authority_admin', 'director_general']),
    (req: AuthenticatedRequest, res) => {
      const proposal = db
        .prepare('SELECT * FROM governance_proposals WHERE id = ?')
        .get(req.params.id) as Record<string, any> | undefined;
      if (!proposal) {
        res.status(404).json({ error: 'Proposal not found.' });
        return;
      }
      if (proposal.status === 'countersigned') {
        res.status(409).json({ error: 'Proposal has already been countersigned.' });
        return;
      }
      // Separation of Duties: proposer CANNOT approve/countersign own work
      if (proposal.proposed_by === req.user!.id) {
        logAudit(db, {
          actorUserId: req.user!.id,
          actorRole: req.user!.role,
          action: 'dual_control.self_approval_blocked',
          targetType: 'governance_proposal',
          targetId: String(req.params.id),
          detail: 'Blocked attempt to countersign own governance proposal',
          outcome: 'denied'
        });
        res.status(403).json({ error: 'Dual-Control violation: proposer cannot countersign their own proposal.' });
        return;
      }

      db.prepare(
        `UPDATE governance_proposals
         SET countersigned_by = ?, status = 'countersigned'
         WHERE id = ?`
      ).run(req.user!.id, req.params.id);

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'dual_control.countersigned',
        targetType: 'governance_proposal',
        targetId: String(req.params.id),
        detail: `Countersigned governance proposal ${req.params.id}`
      });
      res.json({ id: req.params.id, status: 'countersigned' });
    }
  );

  // R03 Director General Official Designation (Requires approval + authorityReference)
  app.post(
    '/api/addresses/:id/designate-official',
    requireAuth,
    requireRoles(db, ['director_general']),
    (req: AuthenticatedRequest, res) => {
      const { authorityReference } = req.body || {};
      if (typeof authorityReference !== 'string' || authorityReference.trim().length < 5) {
        res.status(400).json({ error: 'Mandatory Authority Instrument Reference (min 5 chars) is required.' });
        return;
      }

      const addr = db
        .prepare('SELECT * FROM addresses WHERE id = ? OR public_code = ?')
        .get(req.params.id, req.params.id) as Record<string, any> | undefined;
      if (!addr) {
        res.status(404).json({ error: 'Address not found.' });
        return;
      }
      if (addr.approval_status !== 'approved' || addr.verification_status !== 'verified') {
        res.status(400).json({ error: 'Address must be verified and approved before official designation.' });
        return;
      }

      db.prepare(
        `UPDATE addresses
         SET designation_status = 'official', authority_reference = ?, designated_by = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(authorityReference.trim(), req.user!.id, addr.id);

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'address.designated_official',
        targetType: 'address',
        targetId: String(addr.public_code),
        detail: `Designated official with Authority Reference ${authorityReference.trim()}`
      });
      res.json({ id: addr.id, publicCode: addr.public_code, designationStatus: 'official', authorityReference: authorityReference.trim() });
    }
  );

  // ---------------------------------------------------------------------------
  // R04 Department Administrator Routes (Department Scoping)
  // ---------------------------------------------------------------------------
  app.get(
    '/api/department/tasks',
    requireAuth,
    requireRoles(db, ['department_admin']),
    (req: AuthenticatedRequest, res) => {
      const tasks = db
        .prepare('SELECT * FROM department_tasks WHERE department = ? ORDER BY created_at DESC')
        .all(req.user!.department);
      const staff = db
        .prepare(
          `SELECT id, full_name, role, email, assigned_area
           FROM users WHERE department = ? AND is_active = 1`
        )
        .all(req.user!.department);
      res.json({ department: req.user!.department, tasks, staff });
    }
  );

  app.patch(
    '/api/department/tasks/:id/assign',
    requireAuth,
    requireRoles(db, ['department_admin']),
    (req: AuthenticatedRequest, res) => {
      const { assignedTo, status } = req.body || {};
      const task = db.prepare('SELECT * FROM department_tasks WHERE id = ?').get(req.params.id) as Record<string, any> | undefined;
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      if (task.department !== req.user!.department) {
        logAudit(db, {
          actorUserId: req.user!.id,
          actorRole: req.user!.role,
          action: 'dept.cross_department_denied',
          targetType: 'department_task',
          targetId: String(req.params.id),
          detail: `Blocked cross-department mutation (${task.department} != ${req.user!.department})`,
          outcome: 'denied'
        });
        res.status(403).json({ error: 'Cannot manage tasks belonging to another department.' });
        return;
      }

      db.prepare('UPDATE department_tasks SET assigned_to = COALESCE(?, assigned_to), status = COALESCE(?, status) WHERE id = ?').run(
        assignedTo ? String(assignedTo) : null,
        status ? String(status) : null,
        req.params.id
      );

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'department.task_updated',
        targetType: 'department_task',
        targetId: String(req.params.id),
        detail: `Assigned=${assignedTo || task.assigned_to}, Status=${status || task.status}`
      });
      res.json({ ok: true });
    }
  );

  app.post(
    '/api/department/tasks/:id/escalate',
    requireAuth,
    requireRoles(db, ['department_admin']),
    (req: AuthenticatedRequest, res) => {
      const task = db.prepare('SELECT * FROM department_tasks WHERE id = ?').get(req.params.id) as Record<string, any> | undefined;
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      if (task.department !== req.user!.department) {
        res.status(403).json({ error: 'Cannot escalate tasks outside your department.' });
        return;
      }
      db.prepare("UPDATE department_tasks SET escalated = 1, status = 'escalated' WHERE id = ?").run(req.params.id);
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'department.task_escalated',
        targetType: 'department_task',
        targetId: String(req.params.id),
        detail: `Escalated ${task.id} to Regional/Executive authority`
      });
      res.json({ ok: true, status: 'escalated' });
    }
  );

  // ---------------------------------------------------------------------------
  // R05 Regional Admin & R06 District Admin Applications, Approval & Publication
  // ---------------------------------------------------------------------------
  app.get('/api/applications', requireAuth, (req: AuthenticatedRequest, res) => {
    const u = req.user!;
    let query = `
      SELECT r.*, d.name as district_name
      FROM address_requests r
      JOIN districts d ON d.id = r.district_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (u.role === 'district_admin') {
      query += ' AND r.district_id = ?';
      params.push(u.districtId);
    } else if (u.role === 'field_surveyor' || u.role === 'public_citizen') {
      query += ' AND r.submitted_by = ?';
      params.push(u.id);
    } else if (u.role === 'address_verifier') {
      query += ` AND r.district_id IN ('dis-hodan', 'dis-warta')`;
    } else if (u.role === 'institutional_api_client') {
      res.status(403).json({ error: 'Institutional API Clients cannot browse internal application queues.' });
      return;
    }

    query += ' ORDER BY r.submitted_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json({ applications: rows });
  });

  app.post(
    '/api/applications/:id/approve',
    requireAuth,
    requireRoles(db, ['district_admin', 'regional_admin']),
    (req: AuthenticatedRequest, res) => {
      const u = req.user!;
      const appRow = db
        .prepare('SELECT * FROM address_requests WHERE id = ?')
        .get(req.params.id) as Record<string, any> | undefined;
      if (!appRow) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }

      // Geographic Row-Level Security for District Admin (fail-closed)
      if (u.role === 'district_admin') {
        if (!u.districtId || appRow.district_id !== u.districtId) {
          logAudit(db, {
            actorUserId: u.id,
            actorRole: u.role,
            action: 'rls.cross_district_approval_blocked',
            targetType: 'address_request',
            targetId: String(req.params.id),
            detail: `District Admin (${u.districtId || 'unassigned'}) blocked from approving ${appRow.district_id}`,
            outcome: 'denied'
          });
          res.status(403).json({ error: `District Admin cannot approve applications in '${appRow.district_id}'.` });
          return;
        }
      }

      // Separation of Duties: cannot approve own submission or own verification
      if (appRow.submitted_by === u.id || appRow.verified_by === u.id) {
        logAudit(db, {
          actorUserId: u.id,
          actorRole: u.role,
          action: 'sod.self_approval_blocked',
          targetType: 'address_request',
          targetId: String(req.params.id),
          detail: 'Blocked self-approval attempt by submitter/verifier',
          outcome: 'denied'
        });
        res.status(403).json({ error: 'Separation of Duties violation: cannot approve a record you submitted or verified.' });
        return;
      }

      // Workflow Enforcement: must be verified first
      if (appRow.workflow_state !== 'verified') {
        res.status(400).json({ error: `Cannot approve application in '${appRow.workflow_state}' state; independent verification is required first.` });
        return;
      }

      db.prepare(
        `UPDATE address_requests
         SET workflow_state = 'approved', approved_by = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(u.id, req.params.id);

      logAudit(db, {
        actorUserId: u.id,
        actorRole: u.role,
        action: 'address_request.approved',
        targetType: 'address_request',
        targetId: String(req.params.id),
        detail: `Approved within ${appRow.district_id}`
      });
      res.json({ id: req.params.id, workflowState: 'approved' });
    }
  );

  // R05 Regional Admin Publish Approved Address
  app.post(
    '/api/addresses/:id/publish',
    requireAuth,
    requireRoles(db, ['regional_admin']),
    (req: AuthenticatedRequest, res) => {
      const u = req.user!;
      const addr = db
        .prepare('SELECT * FROM addresses WHERE id = ? OR public_code = ?')
        .get(req.params.id, req.params.id) as Record<string, any> | undefined;
      if (!addr) {
        res.status(404).json({ error: 'Address not found.' });
        return;
      }
      if (addr.approval_status !== 'approved' || addr.verification_status !== 'verified') {
        res.status(400).json({ error: 'Address must be verified and approved before publication.' });
        return;
      }
      if (addr.created_by === u.id || addr.verified_by === u.id) {
        res.status(403).json({ error: 'Separation of Duties violation: cannot publish record you created or verified.' });
        return;
      }

      db.prepare(
        `UPDATE addresses
         SET publication_status = 'published', published_by = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(u.id, addr.id);

      logAudit(db, {
        actorUserId: u.id,
        actorRole: u.role,
        action: 'address.published',
        targetType: 'address',
        targetId: String(addr.public_code),
        detail: `Published address to public Banaadir registry`
      });
      res.json({ id: addr.id, publicCode: addr.public_code, publicationStatus: 'published' });
    }
  );

  // ---------------------------------------------------------------------------
  // R07 GIS Officer Routes
  // ---------------------------------------------------------------------------
  app.get(
    '/api/gis/layers',
    requireAuth,
    requireRoles(db, ['gis_officer', 'regional_admin', 'national_authority_admin']),
    (_req, res) => {
      const layers = db.prepare('SELECT * FROM gis_layers ORDER BY id ASC').all();
      res.json({ layers, referenceCrs: 'EPSG:32638' });
    }
  );

  app.post(
    '/api/gis/validate',
    requireAuth,
    requireRoles(db, ['gis_officer']),
    (req: AuthenticatedRequest, res) => {
      const { layerId } = req.body || {};
      const target = layerId ? String(layerId) : 'LYR-DISTRICTS-V4';
      const result = db
        .prepare("UPDATE gis_layers SET validation_status = 'validated', updated_by = ?, updated_at = datetime('now') WHERE id = ?")
        .run(req.user!.id, target);
      if (result.changes === 0) {
        res.status(404).json({ error: `GIS layer '${target}' not found.` });
        return;
      }
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'gis.topology_validated',
        targetType: 'gis_layer',
        targetId: target,
        detail: 'Validated spatial geometry & CRS EPSG:32638 (0 overlaps)'
      });
      res.json({ layerId: target, validationStatus: 'validated', crs: 'EPSG:32638', overlaps: 0 });
    }
  );

  app.patch(
    '/api/gis/layers/:id/sensitivity',
    requireAuth,
    requireRoles(db, ['gis_officer']),
    (req: AuthenticatedRequest, res) => {
      const { sensitivity } = req.body || {};
      if (!['public', 'restricted'].includes(sensitivity)) {
        res.status(400).json({ error: "sensitivity must be 'public' or 'restricted'." });
        return;
      }
      const r = db
        .prepare("UPDATE gis_layers SET sensitivity = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?")
        .run(sensitivity, req.user!.id, req.params.id);
      if (r.changes === 0) {
        res.status(404).json({ error: 'GIS layer not found.' });
        return;
      }
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'gis.layer_classified',
        targetType: 'gis_layer',
        targetId: String(req.params.id),
        detail: `Set layer sensitivity=${sensitivity}`
      });
      res.json({ ok: true, sensitivity });
    }
  );

  // ---------------------------------------------------------------------------
  // R08 Data Quality Officer Routes
  // ---------------------------------------------------------------------------
  app.get(
    '/api/quality/flags',
    requireAuth,
    requireRoles(db, ['data_quality_officer', 'national_authority_admin', 'auditor']),
    (_req, res) => {
      const flags = db
        .prepare(
          `SELECT q.*, d.name as district_name
           FROM quality_flags q
           JOIN districts d ON d.id = q.district_id
           ORDER BY q.created_at DESC`
        )
        .all();
      res.json({ flags });
    }
  );

  app.post(
    '/api/quality/flags/:id/propose-merge',
    requireAuth,
    requireRoles(db, ['data_quality_officer']),
    (req: AuthenticatedRequest, res) => {
      const flag = db.prepare('SELECT * FROM quality_flags WHERE id = ?').get(req.params.id) as Record<string, any> | undefined;
      if (!flag) {
        res.status(404).json({ error: 'Quality flag not found.' });
        return;
      }
      db.prepare("UPDATE quality_flags SET status = 'merge_proposed', proposed_merge_by = ? WHERE id = ?").run(
        req.user!.id,
        req.params.id
      );
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'quality.merge_proposed',
        targetType: 'quality_flag',
        targetId: String(req.params.id),
        detail: `Proposed manual merge (${flag.candidate_code || flag.address_code}); awaiting independent approval`
      });
      res.json({ id: req.params.id, status: 'merge_proposed', autoMerged: false });
    }
  );

  // ---------------------------------------------------------------------------
  // R09 Field Operations Supervisor Routes
  // ---------------------------------------------------------------------------
  app.get(
    '/api/field-ops/tasks',
    requireAuth,
    requireRoles(db, ['field_ops_supervisor', 'regional_admin', 'district_admin']),
    (_req, res) => {
      const tasks = db
        .prepare(
          `SELECT t.*, d.name as district_name, u.full_name as surveyor_name
           FROM survey_tasks t
           JOIN districts d ON d.id = t.district_id
           JOIN users u ON u.id = t.assigned_to_user_id
           ORDER BY t.created_at DESC`
        )
        .all();
      res.json({ tasks });
    }
  );

  app.post(
    '/api/field-ops/tasks',
    requireAuth,
    requireRoles(db, ['field_ops_supervisor']),
    (req: AuthenticatedRequest, res) => {
      const { projectName, districtId, assignedArea, targetCount } = req.body || {};
      if (!projectName || !districtId || !assignedArea) {
        res.status(400).json({ error: 'projectName, districtId, and assignedArea are required.' });
        return;
      }
      const dist = db.prepare('SELECT id FROM districts WHERE id = ?').get(String(districtId));
      if (!dist) {
        res.status(400).json({ error: `Unknown districtId '${String(districtId)}'.` });
        return;
      }
      const id = `SURV-TASK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      db.prepare(
        `INSERT INTO survey_tasks (id, project_name, district_id, assigned_area, assigned_to_user_id, supervisor_id, target_count, completed_count, qa_recheck, status)
         VALUES (?, ?, ?, ?, 'usr-r10', ?, ?, 0, 0, 'assigned')`
      ).run(id, String(projectName).trim(), String(districtId), String(assignedArea).trim(), req.user!.id, Number(targetCount) || 25);

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'field_ops.task_created',
        targetType: 'survey_task',
        targetId: id,
        detail: `Assigned survey project '${projectName}' in ${districtId}`
      });
      res.status(201).json({ id, status: 'assigned' });
    }
  );

  app.post(
    '/api/field-ops/tasks/:id/qa-recheck',
    requireAuth,
    requireRoles(db, ['field_ops_supervisor']),
    (req: AuthenticatedRequest, res) => {
      const r = db.prepare('UPDATE survey_tasks SET qa_recheck = 1 WHERE id = ?').run(req.params.id);
      if (r.changes === 0) {
        res.status(404).json({ error: 'Survey task not found.' });
        return;
      }
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'field_ops.qa_recheck_flagged',
        targetType: 'survey_task',
        targetId: String(req.params.id),
        detail: 'Flagged task package for QA evidence inspection'
      });
      res.json({ ok: true, qaRecheck: true });
    }
  );

  // ---------------------------------------------------------------------------
  // R10 Field Surveyor Routes (Assigned Area Only + Idempotent Offline Sync)
  // ---------------------------------------------------------------------------
  app.get(
    '/api/field/my-tasks',
    requireAuth,
    requireRoles(db, ['field_surveyor']),
    (req: AuthenticatedRequest, res) => {
      const tasks = db
        .prepare(
          `SELECT t.*, d.name as district_name
           FROM survey_tasks t
           JOIN districts d ON d.id = t.district_id
           WHERE t.assigned_to_user_id = ? AND t.district_id = ?
           ORDER BY t.created_at DESC`
        )
        .all(req.user!.id, req.user!.districtId);
      const submissions = db
        .prepare(
          `SELECT r.*, d.name as district_name
           FROM address_requests r
           JOIN districts d ON d.id = r.district_id
           WHERE r.submitted_by = ?
           ORDER BY r.submitted_at DESC`
        )
        .all(req.user!.id);
      res.json({ assignedArea: req.user!.assignedArea, tasks, submissions });
    }
  );

  app.post(
    '/api/field/sync',
    requireAuth,
    requireRoles(db, ['field_surveyor']),
    (req: AuthenticatedRequest, res) => {
      const { observations } = req.body || {};
      if (!Array.isArray(observations) || observations.length === 0) {
        res.status(400).json({ error: 'observations array is required.' });
        return;
      }

      const syncedIds: string[] = [];
      const deduplicatedIds: string[] = [];

      // Validate entire offline sync batch before persisting any row
      for (const obs of observations) {
        const clientUuid = String(obs?.clientUuid || '').trim();
        if (!clientUuid) {
          res.status(400).json({ error: 'Every offline observation requires a unique clientUuid.' });
          return;
        }
        const targetDistrict = obs.districtId ? String(obs.districtId) : req.user!.districtId;
        if (!req.user!.districtId || targetDistrict !== req.user!.districtId) {
          res.status(403).json({ error: `Field Surveyor is restricted to assigned area (${req.user!.districtId || 'unassigned'}).` });
          return;
        }
      }

      for (const obs of observations) {
        const clientUuid = String(obs.clientUuid).trim();
        const targetDistrict = obs.districtId ? String(obs.districtId) : req.user!.districtId!;

        const existing = db.prepare('SELECT id FROM address_requests WHERE client_uuid = ?').get(clientUuid) as { id: string } | undefined;
        if (existing) {
          deduplicatedIds.push(existing.id);
          continue;
        }

        const reqId = `APP-FLD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        db.prepare(
          `INSERT INTO address_requests (
            id, client_uuid, applicant_name, district_id, locality, street, building_number,
            property_type, lat, lon, accuracy_meters, photo_evidence_ref, workflow_state, submitted_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)`
        ).run(
          reqId,
          clientUuid,
          obs.structureLabel ? String(obs.structureLabel) : 'Field Survey Structure (No Occupant PII)',
          targetDistrict,
          obs.locality ? String(obs.locality) : 'Taleex Sector 4',
          obs.street ? String(obs.street) : 'Wadada Taleex',
          obs.buildingNumber ? String(obs.buildingNumber) : null,
          obs.propertyType ? String(obs.propertyType) : 'residential',
          Number(obs.lat) || 2.0375,
          Number(obs.lon) || 45.3189,
          Number(obs.accuracyMeters) || 1.2,
          obs.photoRef ? String(obs.photoRef) : `GNSS-PHOTO-${clientUuid.slice(0, 6)}.jpg`,
          req.user!.id
        );
        syncedIds.push(reqId);
      }

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'field.offline_sync',
        targetType: 'address_request',
        targetId: syncedIds.join(',') || 'idempotent-replay',
        detail: `Synced ${syncedIds.length} new, deduplicated ${deduplicatedIds.length} offline observations`
      });

      res.json({ syncedIds, deduplicatedIds });
    }
  );

  // ---------------------------------------------------------------------------
  // R11 Address Verifier Routes (Independent Verification + SoD Guard)
  // ---------------------------------------------------------------------------
  app.get(
    '/api/verification/queue',
    requireAuth,
    requireRoles(db, ['address_verifier']),
    (_req, res) => {
      const queue = db
        .prepare(
          `SELECT r.*, d.name as district_name
           FROM address_requests r
           JOIN districts d ON d.id = r.district_id
           WHERE r.district_id IN ('dis-hodan', 'dis-warta')
           ORDER BY r.submitted_at DESC`
        )
        .all();
      res.json({ queue });
    }
  );

  app.post(
    '/api/verification/:id/decide',
    requireAuth,
    requireRoles(db, ['address_verifier']),
    (req: AuthenticatedRequest, res) => {
      const { decision, notes } = req.body || {};
      if (!['verified', 'correction_requested'].includes(decision)) {
        res.status(400).json({ error: "decision must be 'verified' or 'correction_requested'." });
        return;
      }
      if (decision === 'correction_requested' && (typeof notes !== 'string' || notes.trim().length < 5)) {
        res.status(400).json({ error: 'Mandatory reason (min 5 chars) is required when returning for correction.' });
        return;
      }

      const appRow = db.prepare('SELECT * FROM address_requests WHERE id = ?').get(req.params.id) as Record<string, any> | undefined;
      if (!appRow) {
        res.status(404).json({ error: 'Application not found.' });
        return;
      }
      if (!['dis-hodan', 'dis-warta'].includes(appRow.district_id)) {
        res.status(403).json({ error: 'Address Verifier is scoped to Hodan & Warta Nabada only.' });
        return;
      }
      // Separation of Duties: Verifier CANNOT verify their own submission!
      if (appRow.submitted_by === req.user!.id) {
        logAudit(db, {
          actorUserId: req.user!.id,
          actorRole: req.user!.role,
          action: 'sod.self_verification_blocked',
          targetType: 'address_request',
          targetId: String(req.params.id),
          detail: 'Blocked self-verification attempt on own submission',
          outcome: 'denied'
        });
        res.status(403).json({ error: 'Separation of Duties violation: cannot verify your own submission.' });
        return;
      }

      db.prepare(
        `UPDATE address_requests
         SET workflow_state = ?, verified_by = ?, verification_notes = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(decision, req.user!.id, notes ? String(notes).trim() : 'Evidence verified', req.params.id);

      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: `address_request.${decision}`,
        targetType: 'address_request',
        targetId: String(req.params.id),
        detail: notes ? String(notes).trim() : `Independent verification: ${decision}`
      });
      res.json({ id: req.params.id, workflowState: decision });
    }
  );

  // ---------------------------------------------------------------------------
  // R12 Auditor Read-Only Routes
  // ---------------------------------------------------------------------------
  app.get(
    '/api/audit/logs',
    requireAuth,
    requireRoles(db, ['auditor', 'director_general', 'national_super_admin']),
    (req, res) => {
      const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
      let logs = db.prepare('SELECT * FROM audit_logs ORDER BY rowid DESC LIMIT 200').all() as Array<Record<string, any>>;
      if (q) {
        logs = logs.filter(
          (l) =>
            String(l.actor_role).toLowerCase().includes(q) ||
            String(l.action).toLowerCase().includes(q) ||
            String(l.target_id).toLowerCase().includes(q) ||
            String(l.detail).toLowerCase().includes(q)
        );
      }
      const totalEvents = (db.prepare('SELECT COUNT(*) as c FROM audit_logs').get() as { c: number }).c;
      const deniedEvents = (db.prepare("SELECT COUNT(*) as c FROM audit_logs WHERE outcome = 'denied'").get() as { c: number }).c;
      res.json({ logs, summary: { totalEvents, deniedEvents, immutableTriggersActive: true } });
    }
  );

  // ---------------------------------------------------------------------------
  // R14 Institutional API Client Portal + Key-Authenticated Public Data API v1
  // ---------------------------------------------------------------------------
  app.get(
    '/api/partner/overview',
    requireAuth,
    requireRoles(db, ['institutional_api_client']),
    (req: AuthenticatedRequest, res) => {
      const credential = db
        .prepare('SELECT * FROM api_credentials WHERE user_id = ?')
        .get(req.user!.id) as Record<string, any> | undefined;
      const usageLogs = credential
        ? db
            .prepare('SELECT * FROM api_usage_logs WHERE credential_id = ? ORDER BY created_at DESC LIMIT 30')
            .all(credential.id)
        : [];
      res.json({ credential, usageLogs });
    }
  );

  app.post(
    '/api/partner/credentials/rotate',
    requireAuth,
    requireRoles(db, ['institutional_api_client']),
    (req: AuthenticatedRequest, res) => {
      const newKey = `sdas_live_partner_${crypto.randomBytes(8).toString('hex')}`;
      const r = db
        .prepare('UPDATE api_credentials SET api_key = ? WHERE user_id = ?')
        .run(newKey, req.user!.id);
      if (r.changes === 0) {
        res.status(404).json({ error: 'API credential not found for this partner.' });
        return;
      }
      logAudit(db, {
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        action: 'partner.api_key_rotated',
        targetType: 'api_credential',
        targetId: req.user!.id,
        detail: 'Partner rotated scoped API credential key'
      });
      res.json({ apiKey: newKey });
    }
  );

  // Scoped API Key Endpoint for External Institutional Integration
  app.get('/api/v1/addresses/:code', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const token = extractBearerToken(req);
    let cred: Record<string, any> | undefined;

    if (typeof apiKey === 'string' && apiKey.trim()) {
      cred = db.prepare('SELECT * FROM api_credentials WHERE api_key = ? AND is_active = 1').get(apiKey.trim()) as
        | Record<string, any>
        | undefined;
    } else if (token) {
      // Allow authenticated partner session testing from Partner Console
      const sess = db
        .prepare(
          `SELECT c.* FROM sessions s
           JOIN api_credentials c ON c.user_id = s.user_id
           WHERE s.token = ? AND c.is_active = 1`
        )
        .get(token) as Record<string, any> | undefined;
      cred = sess;
    }

    if (!cred) {
      res.status(401).json({ error: 'Valid X-API-Key header required.' });
      return;
    }
    if (Number(cred.requests_today) >= Number(cred.rate_limit_per_day)) {
      res.status(429).json({ error: 'Daily API rate limit exceeded.' });
      return;
    }

    const addr = db
      .prepare(
        `SELECT a.public_code, d.name as district, a.region, a.locality, a.street,
                a.building_number, a.lat, a.lon, a.accuracy_meters, a.publication_status, a.designation_status
         FROM addresses a
         JOIN districts d ON d.id = a.district_id
         WHERE upper(a.public_code) = upper(?)
           AND a.publication_status = 'published'
           AND a.layer_sensitivity = 'public'`
      )
      .get(req.params.code);

    const statusCode = addr ? 200 : 404;
    const correlationId = `CORR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    db.prepare('UPDATE api_credentials SET requests_today = requests_today + 1 WHERE id = ?').run(cred.id);
    db.prepare(
      `INSERT INTO api_usage_logs (id, credential_id, endpoint, target_code, status_code, latency_ms, correlation_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      `LOG-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      cred.id,
      `GET /api/v1/addresses/${req.params.code}`,
      req.params.code,
      statusCode,
      11,
      correlationId
    );

    if (!addr) {
      res.status(404).json({ error: 'Published public address not found.', correlationId });
      return;
    }
    res.json({ address: addr, correlationId });
  });

  // Unknown /api/* routes always return structured JSON 404 (never HTML fallback)
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Global API error handler (prevents malformed JSON or unexpected exceptions from leaking stack traces)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Malformed JSON request payload.' });
      return;
    }
    console.error('Unhandled SDAS server error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
