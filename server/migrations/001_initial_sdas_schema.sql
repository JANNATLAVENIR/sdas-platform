-- SDAS Master Blueprint V3.0 Initial Relational Schema & Immutability Triggers

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_so TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  region TEXT NOT NULL,
  estimated_inventory INTEGER NOT NULL,
  mapped_buildings INTEGER NOT NULL,
  verified_entrances INTEGER NOT NULL,
  approved_designations INTEGER NOT NULL,
  readiness_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  region_id TEXT NOT NULL,
  district_id TEXT,
  assigned_area TEXT NOT NULL,
  mfa_enabled INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_dev_account INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS break_glass_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  ticket_ref TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  public_code TEXT NOT NULL UNIQUE,
  district_id TEXT NOT NULL REFERENCES districts(id),
  region TEXT NOT NULL,
  locality TEXT NOT NULL,
  street TEXT,
  building_number TEXT,
  landmark TEXT,
  address_type TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  accuracy_meters REAL NOT NULL,
  capture_method TEXT NOT NULL,
  layer_sensitivity TEXT NOT NULL DEFAULT 'public',
  workflow_state TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  approval_status TEXT NOT NULL,
  publication_status TEXT NOT NULL,
  designation_status TEXT NOT NULL DEFAULT 'none',
  authority_reference TEXT,
  created_by TEXT REFERENCES users(id),
  verified_by TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  published_by TEXT REFERENCES users(id),
  designated_by TEXT REFERENCES users(id),
  is_test_fixture INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS address_requests (
  id TEXT PRIMARY KEY,
  client_uuid TEXT UNIQUE,
  applicant_name TEXT NOT NULL,
  district_id TEXT NOT NULL REFERENCES districts(id),
  locality TEXT NOT NULL,
  street TEXT NOT NULL,
  building_number TEXT,
  property_type TEXT NOT NULL,
  lat REAL,
  lon REAL,
  accuracy_meters REAL,
  photo_evidence_ref TEXT,
  workflow_state TEXT NOT NULL,
  verification_notes TEXT,
  submitted_by TEXT NOT NULL REFERENCES users(id),
  verified_by TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS governance_proposals (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_by TEXT NOT NULL REFERENCES users(id),
  countersigned_by TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending_second_approver',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS department_tasks (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  assigned_by TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL,
  sla_due TEXT NOT NULL,
  escalated INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gis_layers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  crs TEXT NOT NULL,
  feature_count INTEGER NOT NULL,
  sensitivity TEXT NOT NULL,
  validation_status TEXT NOT NULL,
  updated_by TEXT REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quality_flags (
  id TEXT PRIMARY KEY,
  flag_type TEXT NOT NULL,
  address_code TEXT NOT NULL,
  candidate_code TEXT,
  district_id TEXT NOT NULL REFERENCES districts(id),
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  proposed_merge_by TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS survey_tasks (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  district_id TEXT NOT NULL REFERENCES districts(id),
  assigned_area TEXT NOT NULL,
  assigned_to_user_id TEXT NOT NULL REFERENCES users(id),
  supervisor_id TEXT NOT NULL REFERENCES users(id),
  target_count INTEGER NOT NULL,
  completed_count INTEGER NOT NULL DEFAULT 0,
  qa_recheck INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'assigned',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  org_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  scopes TEXT NOT NULL,
  rate_limit_per_day INTEGER NOT NULL DEFAULT 50000,
  requests_today INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id TEXT PRIMARY KEY,
  credential_id TEXT NOT NULL REFERENCES api_credentials(id),
  endpoint TEXT NOT NULL,
  target_code TEXT,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER NOT NULL,
  correlation_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  actor_user_id TEXT,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  detail TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'allowed'
);

-- Enforce strict immutability of audit logs at the database engine level
CREATE TRIGGER IF NOT EXISTS prevent_audit_update
BEFORE UPDATE ON audit_logs
BEGIN
  SELECT RAISE(ABORT, 'audit_logs is strictly immutable: updates are prohibited');
END;

CREATE TRIGGER IF NOT EXISTS prevent_audit_delete
BEFORE DELETE ON audit_logs
BEGIN
  SELECT RAISE(ABORT, 'audit_logs is strictly immutable: deletions are prohibited');
END;
