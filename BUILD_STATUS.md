# SDAS Master Blueprint V3.0 — Build & Implementation Status

## 1. Pre-Modification Implementation Gap Report
Prior to implementing V3.0 multi-role architecture, repository inspection identified:
- **Database & Persistence**: No backend server, SQLite/SQL database, or schema migrations existed; all records lived in static client-side TypeScript files (`src/data/mockData.ts`).
- **Authentication & Authorization**: `SignInModal` and `App.tsx` toggled React state client-side with zero password verification, session tokens, or backend RBAC checks.
- **Role-Specific Workspaces**: All 14 roles shared one generic `RolePreviewWorkspace` screen displaying text descriptions and permission badges rather than distinct functional workspaces connected to backend endpoints.
- **Scoping, Separation of Duties & Audit Integrity**: Geographic Row-Level Security (District/Department scoping), Dual-Control countersignatures, self-approval/self-verification blocks, Super Admin routine data masking + Break-Glass expiry, Field Surveyor offline idempotency, strict Auditor read-only enforcement, and append-only audit triggers did not exist on a server or database layer.
- **Test Accounts & Automated Verification**: No dev-only 14-role test accounts, production guard, or automated acceptance test suite existed.

---

## 2. Completed Work

### Database Schema, Migrations & Immutability (`server/`)
- **`server/migrations/001_initial_sdas_schema.sql`**: Created relational SQLite schema with foreign keys across `districts`, `users`, `sessions`, `break_glass_sessions`, `addresses`, `address_requests`, `governance_proposals`, `department_tasks`, `gis_layers`, `quality_flags`, `survey_tasks`, `api_credentials`, `api_usage_logs`, and `audit_logs`.
- **Database Audit Immutability Triggers**: Implemented `prevent_audit_update` and `prevent_audit_delete` triggers (`RAISE(ABORT, ...)`) enforcing append-only immutable audit logs at the database layer.
- **`server/db.ts` & `server/seed.ts`**: Configured Node 22 SQLite (`node:sqlite` `DatabaseSync` with WAL + `PRAGMA foreign_keys = ON`), ordered migration tracking (`schema_migrations`), synthetic test fixtures (`is_test_fixture = 1`), and **14 development-only test accounts** (`r01.superadmin@sdas.dev` through `r14.api@sdas.dev`), skipped when `NODE_ENV=production` or `allowDevAccounts=false`.

### Backend Auth, Scoping, SoD & Role API (`server/auth.ts`, `server/app.ts`, `server.ts`)
- **Real Authentication**: `scryptSync` + `timingSafeEqual` password verification and `sessions` Bearer token authentication (`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`). Dev-only listing endpoint `/api/auth/dev-accounts` returns `404` and dev logins return `403` when `allowDevAccounts === false`.
- **Strict Enforcement Across All 14 Roles**:
  - **R01 National Super Admin**: Routine street/coordinate masking in `/api/registry/addresses`; 15-minute justified Break-Glass via `/api/superadmin/break-glass`; permanently blocked from approving, verifying, or designating addresses.
  - **R02 Authority Admin & R03 Director General**: Dual-control proposal submission and countersignature (`POST /api/governance/proposals/:id/countersign` blocks proposer from countersigning own proposal); R03 official designation requires verified+approved address + mandatory `authorityReference`.
  - **R04 Department Admin**: Departmental isolation enforced on task reads, reassignments, and escalations (`/api/department/tasks*`).
  - **R05 Regional Admin & R06 District Admin**: Geographic Row-Level Security blocks R06 cross-district queries and approvals (`dis-hodan` only), blocks unverified workflow skips, blocks self-submitted/self-verified approval (SoD), and separates regional publication (`R05`).
  - **R07 GIS Officer, R08 Data Quality Officer & R09 Field Ops Supervisor**: Specialist endpoints for CRS `EPSG:32638` topology validation & layer classification (`/api/gis/*`), non-destructive merge proposals (`/api/quality/flags/:id/propose-merge`, `autoMerged: false`), and survey task assignment/QA flagging (`/api/field-ops/tasks*`); all blocked from official address approval.
  - **R10 Field Surveyor**: Scoped `/api/field/my-tasks` and idempotent `clientUuid` offline sync (`POST /api/field/sync`) restricted to assigned district (`dis-hodan`), collecting zero occupant PII.
  - **R11 Address Verifier**: Scoped verification queue (`/api/verification/queue`), blocks self-verification (`submitted_by === user.id`), requires mandatory >=5-char notes when returning for correction.
  - **R12 Auditor**: Global middleware blocks every non-GET/HEAD/OPTIONS request from `auditor` with HTTP `403` + audit log; read-only `/api/audit/logs` and `/api/registry/addresses`.
  - **R13 Public Citizen**: Separated public lookup (`publication_status = 'published' AND layer_sensitivity = 'public'`) and ownership-scoped `/api/citizen/my-requests`.
  - **R14 Institutional API Client**: Partner credential management + key rotation (`/api/partner/*`) and `X-API-Key` authenticated endpoint `GET /api/v1/addresses/:code` with rate-limit tracking, usage logging, and restricted site exclusion.

### 14 Distinct Role-Specific Frontend Workspaces (`src/components/workspaces/`)
- Built 14 dedicated workspaces (`Role01SuperAdminWorkspace.tsx` through `Role14InstitutionalApiWorkspace.tsx`) plus `WorkspaceShell.tsx` and `AuthenticatedWorkspaceRouter.tsx`.
- Maintained restrained institutional minimalism (`#0c243e` navy, `#ffffff`, `#f4f6f9`), tabular numerals, zero AI gradients or decorative pills, and separated Citizen (`R13`), Government (`R01`–`R12`), and Institutional API (`R14`) portals.
- Built mobile-first offline-capable Field Surveyor experience (`Role10FieldSurveyorMobileWorkspace.tsx`) with bottom tab bar (`Tasks | Capture | Offline | Synced`), `localStorage` persistent queue, Online/Offline toggle, zero occupant PII fields, and idempotent batch sync.
- Built strictly read-only Auditor oversight workspace (`Role12AuditorWorkspace.tsx`) with log filtering, security denial inspection, and JSON compliance export.
- Replaced client-side demo switching in `PortalModals.tsx` (`SignInModal`), `PortalHeader.tsx`, and `App.tsx` with real backend authentication and session restoration (`src/api/sdasClient.ts`).

---

## 3. Role-by-Role Coverage Matrix

| Code | Role | Backend Enforcement | Distinct UI Workspace | Status |
| :--- | :--- | :--- | :--- | :--- |
| R01 | National Super Administrator | Break-Glass masking + approval block | `Role01SuperAdminWorkspace.tsx` | Complete |
| R02 | National Authority Administrator | Governance rules + self-countersign SoD | `Role02AuthorityAdminWorkspace.tsx` | Complete |
| R03 | Director General | Official designation + countersign + no data entry | `Role03DirectorGeneralWorkspace.tsx` | Complete |
| R04 | Department Administrator | Department-scoped queue + escalation | `Role04DepartmentAdminWorkspace.tsx` | Complete |
| R05 | Regional Administrator | Banaadir queue + regional approve/publish | `Role05RegionalAdminWorkspace.tsx` | Complete |
| R06 | District Administrator | Hodan RLS + workflow order + SoD | `Role06DistrictAdminWorkspace.tsx` | Complete |
| R07 | GIS Officer | Layer validation + sensitivity classification | `Role07GisOfficerWorkspace.tsx` | Complete |
| R08 | Data Quality Officer | Quality flags + manual merge proposals | `Role08DataQualityWorkspace.tsx` | Complete |
| R09 | Field Operations Supervisor | Survey project creation + QA rechecks | `Role09FieldSupervisorWorkspace.tsx` | Complete |
| R10 | Field Surveyor | Area scope + idempotent offline sync | `Role10FieldSurveyorMobileWorkspace.tsx` | Complete |
| R11 | Address Verifier | Independent verification + SoD + notes | `Role11AddressVerifierWorkspace.tsx` | Complete |
| R12 | Auditor | Global write lock + immutable trail read | `Role12AuditorWorkspace.tsx` | Complete |
| R13 | Public Citizen | Published public registry + own requests | `Role13CitizenWorkspace.tsx` | Complete |
| R14 | Institutional API Client | `X-API-Key` validation + rotation + logs | `Role14InstitutionalApiWorkspace.tsx` | Complete |

---

## 4. Executed Tests & Verification Outcomes
- **`npm test` (`server/tests/rbac_and_workflows.test.ts`)**: **14 / 14 tests passed** (exit code `0`). Verified:
  1. All 14 dev accounts authenticate via `POST /api/auth/login`; wrong passwords rejected (`401`).
  2. Production guard disables `/api/auth/dev-accounts` (`404`) and dev logins (`403`) when `allowDevAccounts=false`.
  3. SQLite `audit_logs` `UPDATE` and `DELETE` triggers raise immutability abort errors.
  4. R01 routine masking, Break-Glass unmasked access, and approval/designation prohibition.
  5. R02/R03 Dual-Control self-approval block, countersignature, mandatory `authorityReference`, and R03 entry block.
  6. R04 strict department scoping & cross-department mutation block (`403`).
  7. R05/R06 geographic RLS (`403` cross-district), verification-first order (`400`), SoD, and regional publish.
  8. R07/R08/R09 specialist workflows (`autoMerged: false`, CRS check, QA flag) + approval prohibition (`403`).
  9. R10 idempotent offline sync (`clientUuid` deduplication) + out-of-district capture block (`403`).
  10. R11 self-verification block (`403`), mandatory return reason (`400`), verification pass (`200`).
  11. R12 global write block (`403`) + read-only audit trail access (`200`).
  12. R13 public published lookup excludes restricted infrastructure + ownership-isolated requests.
  13. R14 `X-API-Key` lookup, restricted site exclusion (`404`), key rotation invalidating old key (`401`).
  14. Strict input validation (`400` invalid role/district/propertyType/malformed JSON), duplicate email `409`, unknown GIS layer `404`, fail-closed scoping, and JSON `404` catch-all for `/api/*`.
- **Build & Lint Verification**: Executed via `compile_applet` (`vite build`) and `lint_applet` (`tsc --noEmit`).

---

## 5. Outstanding Work (Production Deployment Hardening) & Blockers
- **Outstanding for Production Rollout**:
  - Replace shared SQLite dev database file with managed PostgreSQL + PostGIS (preserving the exact SQL RLS policies, immutability triggers, and `schema_migrations`).
  - Integrate external Government Hardware WebAuthn/FIDO2 MFA provider for official roles (`R01`–`R12`) and production admin account provisioning CLI (with `NODE_ENV=production` disabling all dev accounts).
  - Provision physical photo object storage bucket and signed upload URLs for field evidence images (`photo_evidence_ref`).
- **Known Blockers**: None for current full-stack build, acceptance test suite, and local development execution.
