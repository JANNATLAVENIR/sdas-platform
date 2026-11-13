import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  regionId: string;
  districtId: string | null;
  assignedArea: string;
  mfaEnabled: boolean;
  isActive: boolean;
  isDevAccount: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  sessionToken?: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function createSession(db: DatabaseSync, userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  return token;
}

export function getUserByToken(db: DatabaseSync, token: string): AuthenticatedUser | null {
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.full_name, u.role, u.department, u.region_id, u.district_id,
              u.assigned_area, u.mfa_enabled, u.is_active, u.is_dev_account, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as Record<string, any> | undefined;

  if (!row) return null;
  if (!row.is_active) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return {
    id: String(row.id),
    email: String(row.email),
    fullName: String(row.full_name),
    role: String(row.role),
    department: String(row.department),
    regionId: String(row.region_id),
    districtId: row.district_id ? String(row.district_id) : null,
    assignedArea: String(row.assigned_area),
    mfaEnabled: Boolean(row.mfa_enabled),
    isActive: Boolean(row.is_active),
    isDevAccount: Boolean(row.is_dev_account)
  };
}

export function logAudit(
  db: DatabaseSync,
  entry: {
    actorUserId: string | null;
    actorRole: string;
    action: string;
    targetType: string;
    targetId: string;
    detail: string;
    outcome?: 'allowed' | 'denied';
  }
): void {
  const id = `AUD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  db.prepare(
    `INSERT INTO audit_logs (id, actor_user_id, actor_role, action, target_type, target_id, detail, outcome)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    entry.actorUserId,
    entry.actorRole,
    entry.action,
    entry.targetType,
    entry.targetId,
    entry.detail,
    entry.outcome || 'allowed'
  );
}

export function isBreakGlassActive(db: DatabaseSync, userId: string): boolean {
  const row = db
    .prepare(
      `SELECT id, expires_at FROM break_glass_sessions
       WHERE user_id = ? AND active = 1
       ORDER BY created_at DESC LIMIT 1`
    )
    .get(userId) as { id: string; expires_at: string } | undefined;
  if (!row) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('UPDATE break_glass_sessions SET active = 0 WHERE id = ?').run(row.id);
    return false;
  }
  return true;
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

export function makeAuthMiddleware(db: DatabaseSync) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = extractBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const user = getUserByToken(db, token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired session token' });
      return;
    }
    req.user = user;
    req.sessionToken = token;

    // Strictly block ANY write method for Auditor role at middleware layer
    if (user.role === 'auditor' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !req.path.endsWith('/logout')) {
      logAudit(db, {
        actorUserId: user.id,
        actorRole: user.role,
        action: 'auditor.write_blocked',
        targetType: 'http_endpoint',
        targetId: `${req.method} ${req.originalUrl}`,
        detail: 'Auditor write attempt rejected by strictly read-only enforcement',
        outcome: 'denied'
      });
      res.status(403).json({ error: 'Auditor role is strictly read-only; write operations are prohibited.' });
      return;
    }

    next();
  };
}

export function requireRoles(db: DatabaseSync, allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      logAudit(db, {
        actorUserId: req.user.id,
        actorRole: req.user.role,
        action: 'rbac.access_denied',
        targetType: 'http_endpoint',
        targetId: `${req.method} ${req.originalUrl}`,
        detail: `Role ${req.user.role} lacks required clearance (${allowedRoles.join(', ')})`,
        outcome: 'denied'
      });
      res.status(403).json({
        error: `Access denied for role '${req.user.role}'. Required role: ${allowedRoles.join(' or ')}.`
      });
      return;
    }
    next();
  };
}
