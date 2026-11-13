import type { DatabaseSync } from 'node:sqlite';
import { hashPassword } from './auth.ts';

export const DEV_TEST_PASSWORD = 'SdasDev!2026';

export interface DevTestAccountSeed {
  id: string;
  order: number;
  code: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  regionId: string;
  districtId: string | null;
  assignedArea: string;
}

export const DEV_TEST_ACCOUNTS: DevTestAccountSeed[] = [
  {
    id: 'usr-r01',
    order: 1,
    code: 'R01',
    email: 'r01.superadmin@sdas.dev',
    fullName: 'Eng. Cabdiraxmaan Maxamed (Test)',
    role: 'national_super_admin',
    department: 'Technology & Platform Operations',
    regionId: 'FED-SO',
    districtId: null,
    assignedArea: 'Platform-wide Technical Control (Routine Data Masked)'
  },
  {
    id: 'usr-r02',
    order: 2,
    code: 'R02',
    email: 'r02.authority@sdas.dev',
    fullName: 'Xaliimo Axmed Warsame (Test)',
    role: 'national_authority_admin',
    department: 'Legal & National Registry Governance',
    regionId: 'FED-SO',
    districtId: null,
    assignedArea: 'All Federal Regions (Standards & Governance)'
  },
  {
    id: 'usr-r03',
    order: 3,
    code: 'R03',
    email: 'r03.dg@sdas.dev',
    fullName: 'Mudane Maxamed Cali Xasan (Test)',
    role: 'director_general',
    department: 'Executive Authority',
    regionId: 'FED-SO',
    districtId: null,
    assignedArea: 'Federal Republic of Somalia'
  },
  {
    id: 'usr-r04',
    order: 4,
    code: 'R04',
    email: 'r04.dept@sdas.dev',
    fullName: 'Fartuun Cumar Geedi (Test)',
    role: 'department_admin',
    department: 'Data Quality & Verification Dept',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Data Quality & Verification Dept Only'
  },
  {
    id: 'usr-r05',
    order: 5,
    code: 'R05',
    email: 'r05.regional@sdas.dev',
    fullName: 'Yuusuf Xasan Nuur (Test)',
    role: 'regional_admin',
    department: 'Banaadir Regional Administration',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Banaadir Region — 17 Districts'
  },
  {
    id: 'usr-r06',
    order: 6,
    code: 'R06',
    email: 'r06.district@sdas.dev',
    fullName: 'Cabdullaahi Shire Jaamac (Test)',
    role: 'district_admin',
    department: 'District Office (Hodan)',
    regionId: 'BN-01',
    districtId: 'dis-hodan',
    assignedArea: 'Hodan District, Banaadir Only'
  },
  {
    id: 'usr-r07',
    order: 7,
    code: 'R07',
    email: 'r07.gis@sdas.dev',
    fullName: 'Eng. Maryan Axmed Cilmi (Test)',
    role: 'gis_officer',
    department: 'GIS & Mapping Department',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Banaadir Spatial Layers (EPSG:32638)'
  },
  {
    id: 'usr-r08',
    order: 8,
    code: 'R08',
    email: 'r08.quality@sdas.dev',
    fullName: 'Saciid Cabdi Faarax (Test)',
    role: 'data_quality_officer',
    department: 'Data Quality & Verification Dept',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Banaadir Registry Quality'
  },
  {
    id: 'usr-r09',
    order: 9,
    code: 'R09',
    email: 'r09.supervisor@sdas.dev',
    fullName: 'Ibraahim Maxamuud Warsame (Test)',
    role: 'field_ops_supervisor',
    department: 'Field Operations Department',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Hodan, Wadajir & Kaaraan Teams'
  },
  {
    id: 'usr-r10',
    order: 10,
    code: 'R10',
    email: 'r10.surveyor@sdas.dev',
    fullName: 'Aamina Xuseen Cismaan (Test)',
    role: 'field_surveyor',
    department: 'Field Operations Department',
    regionId: 'BN-01',
    districtId: 'dis-hodan',
    assignedArea: 'Taleex Sector 4 — Hodan District Only'
  },
  {
    id: 'usr-r11',
    order: 11,
    code: 'R11',
    email: 'r11.verifier@sdas.dev',
    fullName: 'Khadra Cabdi Maxamed (Test)',
    role: 'address_verifier',
    department: 'Data Quality & Verification Dept',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Hodan & Warta Nabada Districts'
  },
  {
    id: 'usr-r12',
    order: 12,
    code: 'R12',
    email: 'r12.auditor@sdas.dev',
    fullName: 'Cali Yuusuf Cabdiraxmaan (Test)',
    role: 'auditor',
    department: 'Audit & Compliance',
    regionId: 'FED-SO',
    districtId: null,
    assignedArea: 'Full System Read-Only Audit Trail'
  },
  {
    id: 'usr-r13',
    order: 13,
    code: 'R13',
    email: 'r13.citizen@sdas.dev',
    fullName: 'Axmed Maxamed Cali (Test Citizen)',
    role: 'public_citizen',
    department: 'Public Portal',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Public Approved Addresses & Own Submissions'
  },
  {
    id: 'usr-r14',
    order: 14,
    code: 'R14',
    email: 'r14.api@sdas.dev',
    fullName: 'Emergency & Postal Dispatch Client (Test)',
    role: 'institutional_api_client',
    department: 'Partner Ecosystem',
    regionId: 'BN-01',
    districtId: null,
    assignedArea: 'Authorized API Lookup & Geocoding Scopes'
  }
];

export function seedDatabase(db: DatabaseSync, options: { allowDevAccounts?: boolean } = {}): void {
  const allowDevAccounts = options.allowDevAccounts ?? process.env.NODE_ENV !== 'production';

  const existingDistricts = (db.prepare('SELECT COUNT(*) as cnt FROM districts').get() as { cnt: number }).cnt;
  if (existingDistricts === 0) {
    const districts = [
      ['dis-hodan', 'Hodan', 'Hodan', 'هودان', 'Banaadir', 14200, 11400, 9820, 8150, 'live_wave_1'],
      ['dis-wadajir', 'Wadajir', 'Wadajir (Madina)', 'ودجر', 'Banaadir', 16500, 12100, 9400, 7200, 'live_wave_1'],
      ['dis-warta', 'Warta Nabada', 'Warta Nabada', 'ورتا نبادا', 'Banaadir', 9800, 7200, 5600, 4100, 'survey_active'],
      ['dis-shangaani', 'Shangaani', 'Shangaani', 'شنغاني', 'Banaadir', 4500, 4150, 3900, 3650, 'fully_operational'],
      ['dis-karan', 'Kaaraan', 'Kaaraan', 'كاران', 'Banaadir', 13200, 8100, 6200, 4800, 'survey_active'],
      ['dis-waaberi', 'Waaberi', 'Waaberi', 'وابري', 'Banaadir', 7600, 5800, 4400, 3500, 'survey_active']
    ];
    const insertDistrict = db.prepare(
      `INSERT INTO districts (id, name, name_so, name_ar, region, estimated_inventory, mapped_buildings, verified_entrances, approved_designations, readiness_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const d of districts) {
      insertDistrict.run(...d);
    }
  }

  if (allowDevAccounts) {
    const existingUsers = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
    if (existingUsers === 0) {
      const passwordHash = hashPassword(DEV_TEST_PASSWORD);
      const insertUser = db.prepare(
        `INSERT INTO users (id, email, password_hash, full_name, role, department, region_id, district_id, assigned_area, mfa_enabled, is_active, is_dev_account)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1)`
      );
      for (const acc of DEV_TEST_ACCOUNTS) {
        insertUser.run(
          acc.id,
          acc.email,
          passwordHash,
          acc.fullName,
          acc.role,
          acc.department,
          acc.regionId,
          acc.districtId,
          acc.assignedArea
        );
      }
    }
  }

  const existingAddresses = (db.prepare('SELECT COUNT(*) as cnt FROM addresses').get() as { cnt: number }).cnt;
  if (existingAddresses === 0) {
    const insertAddr = db.prepare(
      `INSERT INTO addresses (
        id, public_code, district_id, region, locality, street, building_number, landmark,
        address_type, lat, lon, accuracy_meters, capture_method, layer_sensitivity,
        workflow_state, verification_status, approval_status, publication_status,
        designation_status, authority_reference, created_by, verified_by, approved_by, published_by, designated_by, is_test_fixture
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    );
    insertAddr.run(
      'addr-test-01', 'SDAS-MOG-7482', 'dis-hodan', 'Banaadir', 'Xaafadda Taleex (Test)',
      'Wadada Maka Al-Mukarrama', '412', 'Sample Civic Hub', 'commercial',
      2.0375, 45.3189, 1.2, 'field_survey', 'public',
      'submitted', 'verified', 'approved', 'published',
      'none', 'TEST-FIXTURE-REF-01', 'usr-r10', 'usr-r11', 'usr-r06', 'usr-r05', null
    );
    insertAddr.run(
      'addr-test-02', 'SDAS-MOG-3091', 'dis-wadajir', 'Banaadir', 'Xaafadda Buulo Xuubeey (Test)',
      'Jidka Garoonka', '108', 'Sample Transit Point', 'residential',
      2.0211, 45.3025, 0.8, 'field_survey', 'public',
      'submitted', 'verified', 'approved', 'published',
      'none', 'TEST-FIXTURE-REF-02', 'usr-r10', 'usr-r11', 'usr-r05', 'usr-r05', null
    );
    insertAddr.run(
      'addr-test-03', 'SDAS-MOG-9124', 'dis-shangaani', 'Banaadir', 'Xaafadda Xamar Weyne (Test)',
      'Wadada Xeebta', '014', 'Sample Municipal Facility', 'administrative',
      2.0341, 45.3444, 0.5, 'orthophoto', 'public',
      'submitted', 'verified', 'approved', 'published',
      'official', 'TEST-FIXTURE-DECREE-03', 'usr-r10', 'usr-r11', 'usr-r05', 'usr-r05', 'usr-r03'
    );
    insertAddr.run(
      'addr-test-04', 'SDAS-MOG-4410', 'dis-warta', 'Banaadir', 'Xaafadda Wardhiigley (Test)',
      'Wadada Wadnaha', '220', 'Sample Clinic', 'public_facility',
      2.0432, 45.3318, 1.1, 'field_survey', 'public',
      'submitted', 'verified', 'approved', 'unpublished',
      'none', null, 'usr-r10', 'usr-r11', 'usr-r05', null, null
    );
    insertAddr.run(
      'addr-test-05', 'SDAS-MOG-8801', 'dis-hodan', 'Banaadir', 'Restricted Infrastructure Zone (Test)',
      'Sector 7 Utility Substation', '001', 'Power Substation', 'infrastructure',
      2.0398, 45.3112, 0.6, 'field_survey', 'restricted',
      'submitted', 'verified', 'approved', 'restricted',
      'none', null, 'usr-r10', 'usr-r11', 'usr-r06', null, null
    );
  }

  const existingReqs = (db.prepare('SELECT COUNT(*) as cnt FROM address_requests').get() as { cnt: number }).cnt;
  if (existingReqs === 0) {
    const insertReq = db.prepare(
      `INSERT INTO address_requests (
        id, client_uuid, applicant_name, district_id, locality, street, building_number,
        property_type, lat, lon, accuracy_meters, photo_evidence_ref, workflow_state,
        verification_notes, submitted_by, verified_by, approved_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    // Submitted by Field Surveyor (R10) in Hodan — ready for Address Verifier (R11)
    insertReq.run(
      'APP-TEST-4412', 'seed-uuid-4412', 'Sample Household Hodan', 'dis-hodan',
      'Xaafadda KPP', 'Wadada Taleex', '19B', 'residential', 2.0378, 45.3191, 1.1,
      'PHOTO-HODAN-4412.jpg', 'submitted', null, 'usr-r10', null, null
    );
    // Verified by R11 in Hodan — ready for Hodan District Admin (R06) approval
    insertReq.run(
      'APP-TEST-4415', 'seed-uuid-4415', 'Sample Pharmacy Hodan', 'dis-hodan',
      'Xaafadda Taleex', 'Wadada Maka Al-Mukarrama', '418', 'commercial', 2.0381, 45.3195, 0.9,
      'PHOTO-HODAN-4415.jpg', 'verified', 'Entrance coordinates and storefront photo confirmed', 'usr-r10', 'usr-r11', null
    );
    // Verified by R11 in Wadajir — out of bounds for Hodan District Admin (R06), allowed for Regional Admin (R05)
    insertReq.run(
      'APP-TEST-4413', 'seed-uuid-4413', 'Sample Logistics Wadajir', 'dis-wadajir',
      'Xaafadda Buulo Xuubeey', 'Jidka Garoonka', '88', 'commercial', 2.0215, 45.3029, 0.9,
      'PHOTO-WADAJIR-4413.jpg', 'verified', 'Verified by R11 in Wadajir', 'usr-r10', 'usr-r11', null
    );
    // Submitted by R13 Citizen — so R13 sees own application
    insertReq.run(
      'APP-TEST-4420', 'seed-uuid-4420', 'Axmed Maxamed Cali (Test Citizen)', 'dis-hodan',
      'Xaafadda Taleex', 'Jidka Soddonka', '52', 'residential', 2.0390, 45.3204, 2.4,
      'CITIZEN-UPLOAD-4420.jpg', 'under_review', null, 'usr-r13', null, null
    );
    // Submitted by R11 (verifier!) in Hodan — used to test Separation of Duties: R11 cannot verify own submission!
    insertReq.run(
      'APP-TEST-4499', 'seed-uuid-4499', 'Self-Submitted Test Case', 'dis-hodan',
      'Xaafadda Taleex', 'Wadada Taleex', '999', 'residential', 2.0371, 45.3180, 1.3,
      'PHOTO-SELF-4499.jpg', 'submitted', null, 'usr-r11', null, null
    );
  }

  const existingProposals = (db.prepare('SELECT COUNT(*) as cnt FROM governance_proposals').get() as { cnt: number }).cnt;
  if (existingProposals === 0) {
    db.prepare(
      `INSERT INTO governance_proposals (id, category, title, description, proposed_by, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      'POL-2026-07',
      'code_rule',
      'Mogadishu Outer Corridor Prefix Allocation',
      'Expand prefix rules for Kaxda & Heliwaa survey sectors. Requires dual-control countersignature.',
      'usr-r02',
      'pending_second_approver'
    );
  }

  const existingDeptTasks = (db.prepare('SELECT COUNT(*) as cnt FROM department_tasks').get() as { cnt: number }).cnt;
  if (existingDeptTasks === 0) {
    const ins = db.prepare(
      `INSERT INTO department_tasks (id, department, title, assigned_to, assigned_by, status, sla_due, escalated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    ins.run('TSK-104', 'Data Quality & Verification Dept', 'Review Hodan Duplicate Batch #12', 'Khadra Cabdi Maxamed', 'usr-r04', 'in_progress', '2026-11-13', 0);
    ins.run('TSK-105', 'Data Quality & Verification Dept', 'Validate Entrance Photos — Warta Nabada', 'Saciid Cabdi Faarax', 'usr-r04', 'pending', '2026-11-14', 0);
    ins.run('TSK-201', 'GIS & Mapping Department', 'Topology Check — Kaaraan Sector Grid', 'Eng. Maryan Axmed Cilmi', 'usr-r07', 'in_progress', '2026-11-15', 0);
  }

  const existingLayers = (db.prepare('SELECT COUNT(*) as cnt FROM gis_layers').get() as { cnt: number }).cnt;
  if (existingLayers === 0) {
    const ins = db.prepare(
      `INSERT INTO gis_layers (id, name, crs, feature_count, sensitivity, validation_status, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    ins.run('LYR-DISTRICTS-V4', 'Banaadir_Administrative_Boundaries_v4', 'EPSG:32638', 17, 'public', 'validated', 'usr-r07');
    ins.run('LYR-STREETS-V3', 'Mogadishu_Street_Network_v3', 'EPSG:32638', 1842, 'public', 'validated', 'usr-r07');
    ins.run('LYR-INFRA-SEC', 'Critical_Infrastructure_Assets', 'EPSG:32638', 64, 'restricted', 'validated', 'usr-r07');
  }

  const existingFlags = (db.prepare('SELECT COUNT(*) as cnt FROM quality_flags').get() as { cnt: number }).cnt;
  if (existingFlags === 0) {
    const ins = db.prepare(
      `INSERT INTO quality_flags (id, flag_type, address_code, candidate_code, district_id, details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    ins.run('DQ-308', 'duplicate_candidate', 'SDAS-MOG-7482', 'DRAFT-HOD-9921', 'dis-hodan', '2.4m entrance proximity match in Taleex, Hodan', 'open');
    ins.run('DQ-309', 'invalid_coordinate', 'SDAS-MOG-4410', null, 'dis-warta', 'GNSS horizontal accuracy 8.4m exceeds 5.0m threshold', 'open');
  }

  const existingSurveyTasks = (db.prepare('SELECT COUNT(*) as cnt FROM survey_tasks').get() as { cnt: number }).cnt;
  if (existingSurveyTasks === 0) {
    const ins = db.prepare(
      `INSERT INTO survey_tasks (id, project_name, district_id, assigned_area, assigned_to_user_id, supervisor_id, target_count, completed_count, qa_recheck, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    ins.run('SURV-TASK-401', 'Hodan Taleex Sector 4 Survey', 'dis-hodan', 'Taleex Sector 4 — Hodan District Only', 'usr-r10', 'usr-r09', 50, 42, 0, 'in_progress');
    ins.run('SURV-TASK-402', 'Wadajir West Entrance Audit', 'dis-wadajir', 'Wadajir West Block B', 'usr-r10', 'usr-r09', 45, 38, 1, 'in_progress');
  }

  const existingCreds = (db.prepare('SELECT COUNT(*) as cnt FROM api_credentials').get() as { cnt: number }).cnt;
  if (existingCreds === 0) {
    db.prepare(
      `INSERT INTO api_credentials (id, user_id, org_name, api_key, scopes, rate_limit_per_day, requests_today, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
    ).run(
      'CRED-PARTNER-01',
      'usr-r14',
      'Somali Post & Emergency 888/999 Dispatch (Test)',
      'sdas_test_partner_999_84f1c9a0e7b2',
      'address:lookup,address:validate,geocoding:read,qr:verify',
      50000,
      142
    );

    db.prepare(
      `INSERT INTO api_usage_logs (id, credential_id, endpoint, target_code, status_code, latency_ms, correlation_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run('LOG-API-001', 'CRED-PARTNER-01', 'GET /api/v1/addresses/SDAS-MOG-7482', 'SDAS-MOG-7482', 200, 11, 'DISPATCH-999-INIT');
  }

  const existingAudits = (db.prepare('SELECT COUNT(*) as cnt FROM audit_logs').get() as { cnt: number }).cnt;
  if (existingAudits === 0) {
    const ins = db.prepare(
      `INSERT INTO audit_logs (id, actor_user_id, actor_role, action, target_type, target_id, detail, outcome)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    ins.run('AUD-INIT-01', 'usr-r03', 'director_general', 'address.designated_official', 'address', 'SDAS-MOG-9124', 'Seeded test fixture official designation', 'allowed');
    ins.run('AUD-INIT-02', 'usr-r11', 'address_verifier', 'address.verified', 'address_request', 'APP-TEST-4415', 'Verified entrance GNSS accuracy (0.9m) in Hodan', 'allowed');
  }
}
