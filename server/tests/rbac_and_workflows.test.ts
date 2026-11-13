import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createDatabase } from '../db.ts';
import { seedDatabase, DEV_TEST_ACCOUNTS, DEV_TEST_PASSWORD } from '../seed.ts';
import { createApp } from '../app.ts';

let server: http.Server;
let baseUrl: string;
let db: ReturnType<typeof createDatabase>;

async function api(
  method: string,
  path: string,
  options: { token?: string; apiKey?: string; body?: any } = {}
) {
  const headers: Record<string, string> = {};
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
  if (options.apiKey) headers['X-API-Key'] = options.apiKey;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function loginAs(email: string): Promise<string> {
  const res = await api('POST', '/api/auth/login', {
    body: { email, password: DEV_TEST_PASSWORD }
  });
  assert.equal(res.status, 200, `Login failed for ${email}: ${JSON.stringify(res.json)}`);
  assert.ok(res.json.token, 'Session token must be returned');
  return res.json.token;
}

describe('SDAS V3.0 Backend Auth, RBAC, RLS, SoD & 14-Role Acceptance Tests', () => {
  before(async () => {
    db = createDatabase(':memory:');
    seedDatabase(db, { allowDevAccounts: true });
    const app = createApp(db, { allowDevAccounts: true });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    db.close();
  });

  it('authenticates all 14 development test accounts and rejects wrong passwords', async () => {
    assert.equal(DEV_TEST_ACCOUNTS.length, 14);
    for (const acc of DEV_TEST_ACCOUNTS) {
      const token = await loginAs(acc.email);
      const me = await api('GET', '/api/auth/me', { token });
      assert.equal(me.status, 200);
      assert.equal(me.json.user.role, acc.role);
    }

    const bad = await api('POST', '/api/auth/login', {
      body: { email: 'r01.superadmin@sdas.dev', password: 'WrongPassword!' }
    });
    assert.equal(bad.status, 401);
  });

  it('disables dev accounts and dev-accounts endpoint when allowDevAccounts is false (production guard)', async () => {
    const prodApp = createApp(db, { allowDevAccounts: false });
    let prodUrl = '';
    const prodServer = await new Promise<http.Server>((resolve) => {
      const s = prodApp.listen(0, '127.0.0.1', () => {
        const addr = s.address() as { port: number };
        prodUrl = `http://127.0.0.1:${addr.port}`;
        resolve(s);
      });
    });

    try {
      const listRes = await fetch(`${prodUrl}/api/auth/dev-accounts`);
      assert.equal(listRes.status, 404);

      const loginRes = await fetch(`${prodUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'r01.superadmin@sdas.dev', password: DEV_TEST_PASSWORD })
      });
      assert.equal(loginRes.status, 403);
    } finally {
      await new Promise<void>((resolve) => prodServer.close(() => resolve()));
    }
  });

  it('enforces immutable audit_logs at SQLite trigger level', () => {
    assert.throws(() => {
      db.prepare("UPDATE audit_logs SET detail = 'tampered' WHERE id = 'AUD-INIT-01'").run();
    }, /immutable/i);

    assert.throws(() => {
      db.prepare("DELETE FROM audit_logs WHERE id = 'AUD-INIT-01'").run();
    }, /immutable/i);
  });

  it('R01 Super Admin masks routine addresses until Break-Glass and cannot approve/designate', async () => {
    const token = await loginAs('r01.superadmin@sdas.dev');

    const maskedRes = await api('GET', '/api/registry/addresses', { token });
    assert.equal(maskedRes.status, 200);
    assert.equal(maskedRes.json.breakGlassActive, false);
    assert.equal(maskedRes.json.addresses[0].masked, true);
    assert.equal(maskedRes.json.addresses[0].lat, null);

    // Reject short break-glass reason
    const shortBg = await api('POST', '/api/superadmin/break-glass', {
      token,
      body: { reason: 'short' }
    });
    assert.equal(shortBg.status, 400);

    // Activate break-glass with justification
    const bgRes = await api('POST', '/api/superadmin/break-glass', {
      token,
      body: { reason: 'INC-2026-91: Investigate spatial sync outage', ticketRef: 'INC-2026-91' }
    });
    assert.equal(bgRes.status, 200);
    assert.equal(bgRes.json.breakGlassActive, true);

    const unmaskedRes = await api('GET', '/api/registry/addresses', { token });
    assert.equal(unmaskedRes.json.addresses[0].masked, false);
    assert.ok(typeof unmaskedRes.json.addresses[0].lat === 'number');

    await api('POST', '/api/superadmin/break-glass/close', { token });

    // Super Admin cannot approve or designate official addresses
    const approveDenied = await api('POST', '/api/applications/APP-TEST-4415/approve', { token });
    assert.equal(approveDenied.status, 403);
    const designateDenied = await api('POST', '/api/addresses/SDAS-MOG-7482/designate-official', {
      token,
      body: { authorityReference: 'TEST-DEC-99' }
    });
    assert.equal(designateDenied.status, 403);
  });

  it('R02 Authority Admin & R03 Director General enforce Dual-Control and official designation rules', async () => {
    const r02 = await loginAs('r02.authority@sdas.dev');
    const r03 = await loginAs('r03.dg@sdas.dev');

    const propRes = await api('POST', '/api/authority/proposals', {
      token: r02,
      body: { category: 'standard', title: 'Test Standard Dual Control', description: 'Require dual sign-off' }
    });
    assert.equal(propRes.status, 201);
    const propId = propRes.json.id;

    // R02 cannot countersign own proposal
    const selfSign = await api('POST', `/api/governance/proposals/${propId}/countersign`, { token: r02 });
    assert.equal(selfSign.status, 403);

    // R03 countersigns R02 proposal
    const dgSign = await api('POST', `/api/governance/proposals/${propId}/countersign`, { token: r03 });
    assert.equal(dgSign.status, 200);
    assert.equal(dgSign.json.status, 'countersigned');

    // R03 designation requires authorityReference
    const missingRef = await api('POST', '/api/addresses/SDAS-MOG-7482/designate-official', {
      token: r03,
      body: { authorityReference: '' }
    });
    assert.equal(missingRef.status, 400);

    const designateOk = await api('POST', '/api/addresses/SDAS-MOG-7482/designate-official', {
      token: r03,
      body: { authorityReference: 'TEST-DECREE-2026-7482' }
    });
    assert.equal(designateOk.status, 200);
    assert.equal(designateOk.json.designationStatus, 'official');

    // R03 cannot submit citizen/field address requests
    const entryBlocked = await api('POST', '/api/citizen/requests', {
      token: r03,
      body: { applicantName: 'Blocked', districtId: 'dis-hodan', locality: 'Taleex', street: 'Wadada' }
    });
    assert.equal(entryBlocked.status, 403);
  });

  it('R04 Department Admin is strictly scoped to own department', async () => {
    const r04 = await loginAs('r04.dept@sdas.dev');
    const tasksRes = await api('GET', '/api/department/tasks', { token: r04 });
    assert.equal(tasksRes.status, 200);
    assert.ok(tasksRes.json.tasks.every((t: any) => t.department === 'Data Quality & Verification Dept'));

    // Cannot modify GIS department task TSK-201
    const crossDept = await api('PATCH', '/api/department/tasks/TSK-201/assign', {
      token: r04,
      body: { assignedTo: 'Someone Else' }
    });
    assert.equal(crossDept.status, 403);

    const ownEscalate = await api('POST', '/api/department/tasks/TSK-104/escalate', { token: r04 });
    assert.equal(ownEscalate.status, 200);
  });

  it('R05 Regional Admin & R06 District Admin enforce geographic RLS, workflow order & SoD', async () => {
    const r06 = await loginAs('r06.district@sdas.dev');
    const r05 = await loginAs('r05.regional@sdas.dev');

    // District Admin sees only Hodan
    const hodanRegistry = await api('GET', '/api/registry/addresses', { token: r06 });
    assert.equal(hodanRegistry.status, 200);
    assert.ok(hodanRegistry.json.addresses.every((a: any) => a.district_id === 'dis-hodan'));

    // Cross-district query blocked
    const crossQuery = await api('GET', '/api/registry/addresses?districtId=dis-wadajir', { token: r06 });
    assert.equal(crossQuery.status, 403);

    // Cross-district approval blocked (APP-TEST-4413 is Wadajir)
    const crossApprove = await api('POST', '/api/applications/APP-TEST-4413/approve', { token: r06 });
    assert.equal(crossApprove.status, 403);

    // Unverified Hodan APP-TEST-4412 cannot skip verification
    const skipVerify = await api('POST', '/api/applications/APP-TEST-4412/approve', { token: r06 });
    assert.equal(skipVerify.status, 400);

    // Verified Hodan APP-TEST-4415 succeeds for R06
    const approveHodan = await api('POST', '/api/applications/APP-TEST-4415/approve', { token: r06 });
    assert.equal(approveHodan.status, 200);
    assert.equal(approveHodan.json.workflowState, 'approved');

    // Regional Admin publishes unpublished Warta address SDAS-MOG-4410
    const pubRes = await api('POST', '/api/addresses/SDAS-MOG-4410/publish', { token: r05 });
    assert.equal(pubRes.status, 200);
    assert.equal(pubRes.json.publicationStatus, 'published');
  });

  it('R07 GIS, R08 Data Quality & R09 Supervisor perform specialist duties and are blocked from approvals', async () => {
    const r07 = await loginAs('r07.gis@sdas.dev');
    const r08 = await loginAs('r08.quality@sdas.dev');
    const r09 = await loginAs('r09.supervisor@sdas.dev');

    const gisVal = await api('POST', '/api/gis/validate', { token: r07, body: { layerId: 'LYR-DISTRICTS-V4' } });
    assert.equal(gisVal.status, 200);
    assert.equal((await api('POST', '/api/applications/APP-TEST-4413/approve', { token: r07 })).status, 403);

    const mergeProp = await api('POST', '/api/quality/flags/DQ-308/propose-merge', { token: r08 });
    assert.equal(mergeProp.status, 200);
    assert.equal(mergeProp.json.autoMerged, false);
    assert.equal((await api('POST', '/api/addresses/SDAS-MOG-7482/publish', { token: r08 })).status, 403);

    const newTask = await api('POST', '/api/field-ops/tasks', {
      token: r09,
      body: { projectName: 'Hodan Grid Sweep', districtId: 'dis-hodan', assignedArea: 'Taleex Sector 4', targetCount: 30 }
    });
    assert.equal(newTask.status, 201);
    assert.equal((await api('POST', '/api/verification/APP-TEST-4412/decide', { token: r09, body: { decision: 'verified' } })).status, 403);
  });

  it('R10 Field Surveyor syncs offline observations idempotently within assigned district only', async () => {
    const r10 = await loginAs('r10.surveyor@sdas.dev');
    const uuid = 'offline-uuid-test-901';

    const sync1 = await api('POST', '/api/field/sync', {
      token: r10,
      body: {
        observations: [{ clientUuid: uuid, districtId: 'dis-hodan', locality: 'Taleex', street: 'Wadada Taleex', buildingNumber: '510' }]
      }
    });
    assert.equal(sync1.status, 200);
    assert.equal(sync1.json.syncedIds.length, 1);

    // Idempotent replay
    const sync2 = await api('POST', '/api/field/sync', {
      token: r10,
      body: {
        observations: [{ clientUuid: uuid, districtId: 'dis-hodan', locality: 'Taleex', street: 'Wadada Taleex', buildingNumber: '510' }]
      }
    });
    assert.equal(sync2.status, 200);
    assert.equal(sync2.json.deduplicatedIds.length, 1);

    // Out-of-area capture blocked
    const outOfArea = await api('POST', '/api/field/sync', {
      token: r10,
      body: { observations: [{ clientUuid: 'other-dist-uuid', districtId: 'dis-wadajir', locality: 'Buulo Xuubeey' }] }
    });
    assert.equal(outOfArea.status, 403);
  });

  it('R11 Address Verifier blocks self-verification and enforces correction notes', async () => {
    const r11 = await loginAs('r11.verifier@sdas.dev');

    // Self-submitted APP-TEST-4499 must be blocked
    const selfVerify = await api('POST', '/api/verification/APP-TEST-4499/decide', {
      token: r11,
      body: { decision: 'verified', notes: 'Attempting self verification' }
    });
    assert.equal(selfVerify.status, 403);

    // Return without reason blocked
    const missingReason = await api('POST', '/api/verification/APP-TEST-4412/decide', {
      token: r11,
      body: { decision: 'correction_requested', notes: '' }
    });
    assert.equal(missingReason.status, 400);

    // Verify Hodan APP-TEST-4412 succeeds
    const okVerify = await api('POST', '/api/verification/APP-TEST-4412/decide', {
      token: r11,
      body: { decision: 'verified', notes: 'Confirmed GNSS location and front door photo' }
    });
    assert.equal(okVerify.status, 200);

    // Verifier cannot approve
    assert.equal((await api('POST', '/api/applications/APP-TEST-4412/approve', { token: r11 })).status, 403);
  });

  it('R12 Auditor is strictly read-only across all write endpoints and can inspect audit trail', async () => {
    const r12 = await loginAs('r12.auditor@sdas.dev');

    const auditRes = await api('GET', '/api/audit/logs', { token: r12 });
    assert.equal(auditRes.status, 200);
    assert.ok(auditRes.json.logs.length > 0);
    assert.equal(auditRes.json.summary.immutableTriggersActive, true);

    // Any write attempt by auditor returns 403
    const write1 = await api('POST', '/api/citizen/requests', {
      token: r12,
      body: { applicantName: 'Audit Write', districtId: 'dis-hodan', locality: 'Taleex', street: 'Wadada' }
    });
    assert.equal(write1.status, 403);

    const write2 = await api('POST', '/api/superadmin/break-glass', {
      token: r12,
      body: { reason: 'Unauthorized attempt' }
    });
    assert.equal(write2.status, 403);
  });

  it('R13 Public Citizen sees only public published addresses & own requests', async () => {
    const r13 = await loginAs('r13.citizen@sdas.dev');

    const pubRes = await api('GET', '/api/public/addresses');
    assert.equal(pubRes.status, 200);
    const codes = pubRes.json.addresses.map((a: any) => a.public_code);
    assert.ok(codes.includes('SDAS-MOG-7482'));
    assert.ok(!codes.includes('SDAS-MOG-8801'), 'Restricted infrastructure must NEVER appear in public lookup');

    const myReqs = await api('GET', '/api/citizen/my-requests', { token: r13 });
    assert.equal(myReqs.status, 200);
    assert.ok(myReqs.json.requests.every((r: any) => r.submitted_by === 'usr-r13'));

    // Citizen blocked from internal audit or admin
    assert.equal((await api('GET', '/api/audit/logs', { token: r13 })).status, 403);
    assert.equal((await api('GET', '/api/superadmin/overview', { token: r13 })).status, 403);
  });

  it('R14 Institutional API Client validates X-API-Key, logs usage, blocks restricted sites & rotates keys', async () => {
    const r14 = await loginAs('r14.api@sdas.dev');

    const overview = await api('GET', '/api/partner/overview', { token: r14 });
    assert.equal(overview.status, 200);
    const oldKey = overview.json.credential.api_key;
    assert.ok(oldKey);

    // Public lookup via X-API-Key succeeds
    const lookupOk = await api('GET', '/api/v1/addresses/SDAS-MOG-7482', { apiKey: oldKey });
    assert.equal(lookupOk.status, 200);
    assert.equal(lookupOk.json.address.public_code, 'SDAS-MOG-7482');

    // Restricted infrastructure returns 404 via API
    const restrictedRes = await api('GET', '/api/v1/addresses/SDAS-MOG-8801', { apiKey: oldKey });
    assert.equal(restrictedRes.status, 404);

    // Rotate key -> old key becomes invalid, new key succeeds
    const rotRes = await api('POST', '/api/partner/credentials/rotate', { token: r14 });
    assert.equal(rotRes.status, 200);
    const newKey = rotRes.json.apiKey;
    assert.notEqual(newKey, oldKey);

    assert.equal((await api('GET', '/api/v1/addresses/SDAS-MOG-7482', { apiKey: oldKey })).status, 401);
    assert.equal((await api('GET', '/api/v1/addresses/SDAS-MOG-7482', { apiKey: newKey })).status, 200);

    // Partner cannot approve or view internal queues
    assert.equal((await api('GET', '/api/applications', { token: r14 })).status, 403);
  });

  it('enforces strict input validation, duplicate conflict checks, and structured JSON 404/400 error handling', async () => {
    const r01 = await loginAs('r01.superadmin@sdas.dev');

    // Invalid role rejected cleanly (400)
    const badRole = await api('POST', '/api/superadmin/users', {
      token: r01,
      body: { email: 'badrole@sdas.gov.so', fullName: 'Bad Role', role: 'fake_god_mode', department: 'IT' }
    });
    assert.equal(badRole.status, 400);

    // Duplicate email rejected cleanly with 409 (not 500)
    const dupEmail = await api('POST', '/api/superadmin/users', {
      token: r01,
      body: { email: 'r01.superadmin@sdas.dev', fullName: 'Duplicate', role: 'auditor', department: 'Audit' }
    });
    assert.equal(dupEmail.status, 409);

    // Unknown GIS layer returns 404 (not fake 200)
    const r07 = await loginAs('r07.gis@sdas.dev');
    const missingLayer = await api('POST', '/api/gis/validate', {
      token: r07,
      body: { layerId: 'LYR-DOES-NOT-EXIST' }
    });
    assert.equal(missingLayer.status, 404);

    // Unknown citizen request district returns 400 (not FK 500)
    const r13 = await loginAs('r13.citizen@sdas.dev');
    const badDistrict = await api('POST', '/api/citizen/requests', {
      token: r13,
      body: { applicantName: 'Citizen Test', districtId: 'dis-nonexistent', locality: 'X', street: 'Y' }
    });
    assert.equal(badDistrict.status, 400);

    // Unknown API route returns structured JSON 404
    const notFound = await api('GET', '/api/nonexistent-endpoint');
    assert.equal(notFound.status, 404);
    assert.equal(notFound.json.error, 'API endpoint not found.');

    // Malformed JSON returns 400
    const rawBadJson = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":'
    });
    assert.equal(rawBadJson.status, 400);
  });
});
