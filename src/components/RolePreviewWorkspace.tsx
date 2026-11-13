import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Layers,
  Eye,
  Compass,
  GitMerge,
  RefreshCw,
  Grid,
  Award,
  AlertTriangle,
  ArrowRight,
  Check,
  KeyRound,
  Database,
  Server,
  FileCheck2,
  Camera,
  Send,
  Terminal
} from 'lucide-react';
import { Language, UserRole } from '../types/sdas';
import { ALL_ROLES, RoleDefinition } from '../data/rolesData';
import { MOCK_ADDRESSES, MOCK_DISTRICTS, MOCK_PENDING_APPLICATIONS } from '../data/mockData';

interface RolePreviewWorkspaceProps {
  language: Language;
  activeRole: UserRole;
  breakGlassActive?: boolean;
  onToggleBreakGlass?: (active: boolean) => void;
  onSelectRole: (role: UserRole) => void;
  onNavigate: (view: string) => void;
}

type CategoryFilter = 'all' | RoleDefinition['category'];

interface AuditEntry {
  id: string;
  timestamp: string;
  actorRole: string;
  action: string;
  target: string;
  detail: string;
}

const INITIAL_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'AUD-9041',
    timestamp: '2026-11-12 09:42:11',
    actorRole: 'R03 Director General',
    action: 'address.designated_official',
    target: 'SDAS-MOG-7482',
    detail: 'Designated official under Instrument BRA/MOG/EXEC/2026/089-A'
  },
  {
    id: 'AUD-9040',
    timestamp: '2026-11-12 09:18:04',
    actorRole: 'R11 Address Verifier',
    action: 'address.verified',
    target: 'SDAS-MOG-3091',
    detail: 'Entrance GPS verified at 0.8m accuracy (Wadajir District)'
  },
  {
    id: 'AUD-9039',
    timestamp: '2026-11-12 08:55:29',
    actorRole: 'R06 District Administrator',
    action: 'address.approved',
    target: 'APP-2026-4409',
    detail: 'Local approval granted after independent verification (Kaaraan)'
  },
  {
    id: 'AUD-9038',
    timestamp: '2026-11-11 17:10:42',
    actorRole: 'R07 GIS Officer',
    action: 'gis.boundary_validated',
    target: 'BN-HODAN-V4',
    detail: 'Dry-run geometry validation passed (EPSG:32638); awaiting Dual Control'
  },
  {
    id: 'AUD-9037',
    timestamp: '2026-11-11 15:02:18',
    actorRole: 'R14 Institutional API Client',
    action: 'api.geocoding_lookup',
    target: 'SDAS-MOG-7482',
    detail: 'Emergency 999 Dispatch lookup | Correlation ID: DISPATCH-999-8412'
  }
];

export const RolePreviewWorkspace: React.FC<RolePreviewWorkspaceProps> = ({
  language,
  activeRole,
  breakGlassActive: propBreakGlass,
  onToggleBreakGlass,
  onSelectRole,
  onNavigate
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'matrix'>('preview');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  const currentRole = ALL_ROLES.find((r) => r.id === activeRole) || ALL_ROLES[0];
  const [activeModule, setActiveModule] = useState<string>(currentRole.visibleModules[0]);

  useEffect(() => {
    setActiveModule(currentRole.visibleModules[0]);
  }, [activeRole, currentRole]);

  // Interactive operational states
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [localBreakGlass, setLocalBreakGlass] = useState(false);
  const breakGlassActive = propBreakGlass !== undefined ? propBreakGlass : localBreakGlass;
  const setBreakGlassActive = (val: boolean) => {
    setLocalBreakGlass(val);
    if (onToggleBreakGlass) onToggleBreakGlass(val);
  };
  const [mfaEnforced, setMfaEnforced] = useState(true);

  const [policyProposalStatus, setPolicyProposalStatus] = useState<'pending_second_approver' | 'countersigned'>('pending_second_approver');
  const [dgInstrumentRef, setDgInstrumentRef] = useState('BRA/MOG/EXEC/2026/114-D');
  const [dgDesignatedIds, setDgDesignatedIds] = useState<string[]>(['SDAS-MOG-7482']);

  const [deptTasks, setDeptTasks] = useState([
    { id: 'TSK-104', title: 'Review Hodan Duplicate Batch #12', assignee: 'Khadra Cabdi Maxamed', status: 'In Progress', sla: '4h left' },
    { id: 'TSK-105', title: 'Audit Boundary Coordinates — Wadajir', assignee: 'Saciid Cabdi Faarax', status: 'Pending', sla: '1d left' },
    { id: 'TSK-106', title: 'Verify Commercial Street Plate Evidence', assignee: 'Nasteexo Axmed Nuur', status: 'Escalated', sla: 'Urgent' }
  ]);

  const [regionalPublishedIds, setRegionalPublishedIds] = useState<string[]>(['APP-2026-4409']);
  const [applications, setApplications] = useState(MOCK_PENDING_APPLICATIONS);
  const [mergeProposed, setMergeProposed] = useState(false);
  const [qaSampledIds, setQaSampledIds] = useState<string[]>(['SURV-TASK-401']);

  // R10 Field Surveyor building registration + offline queue
  const [fieldBuildingNo, setFieldBuildingNo] = useState('418');
  const [fieldStreet, setFieldStreet] = useState('Wadada Taleex');
  const [fieldEntranceLat, setFieldEntranceLat] = useState('2.03764');
  const [fieldEntranceLon, setFieldEntranceLon] = useState('45.31892');
  const [offlineSyncQueue, setOfflineSyncQueue] = useState([
    { clientUuid: '8f1c-44a9-b201', sector: 'Taleex Sector 4', gnssAccuracy: 1.1, status: 'queued_offline' as 'queued_offline' | 'synced' },
    { clientUuid: '8f1c-44a9-b202', sector: 'Taleex Sector 4', gnssAccuracy: 1.4, status: 'queued_offline' as 'queued_offline' | 'synced' },
    { clientUuid: '8f1c-44a9-b203', sector: 'Taleex Sector 4', gnssAccuracy: 7.8, status: 'queued_offline' as 'queued_offline' | 'synced' }
  ]);

  // R11 Verifier
  const [verifierDecisions, setVerifierDecisions] = useState<Record<string, 'verified' | 'correction_requested'>>({});
  const [verifierReason, setVerifierReason] = useState('');

  // R12 Auditor
  const [auditFilter, setAuditFilter] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOG);

  // R14 Institutional API Client
  const [apiKeyToken, setApiKeyToken] = useState('sdas_live_bra999_84f1c9a0e7b2');
  const [apiTestCode, setApiTestCode] = useState('SDAS-MOG-7482');
  const [apiTestOutput, setApiTestOutput] = useState<string | null>(null);

  const notify = (text: string, type: 'success' | 'warning' = 'success') => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 4500);
  };

  const appendAudit = (action: string, target: string, detail: string) => {
    const newEntry: AuditEntry = {
      id: `AUD-${Math.floor(9042 + Math.random() * 900)}`,
      timestamp: '2026-11-12 Just now',
      actorRole: `${currentRole.code} ${currentRole.name.en}`,
      action,
      target,
      detail
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const filteredRoles =
    categoryFilter === 'all' ? ALL_ROLES : ALL_ROLES.filter((r) => r.category === categoryFilter);

  const labels = {
    en: {
      title: 'SDAS — All 14 Roles & Individual Previews',
      subtitle:
        'Select any of the 14 SDAS roles below to preview its individual workspace, exact visible modules ("Wuxuu arkaa"), allowed actions, and enforced restrictions.',
      btnPreview: 'Individual Role Preview',
      btnMatrix: 'All 14 Roles Matrix',
      all: 'All 14 Roles',
      national: 'National & Executive (1–4)',
      regional_district: 'Regional & District (5–6)',
      specialist: 'GIS, Quality & Audit (7–8, 12)',
      field: 'Field & Verification (9–11)',
      external: 'Citizen & API (13–14)',
      modulesTitle: 'Wuxuu arkaa (Visible Modules)',
      capabilitiesTitle: 'Waxyaabaha uu qaban karo (Capabilities)',
      restrictionsTitle: 'Xaddidaad (Enforced Restrictions)',
      stepInto: 'Open Preview'
    },
    so: {
      title: 'SDAS — Dhammaan 14-ka Door & Muuqaalkooda Gaarka ah',
      subtitle:
        'Dooro mid kasta oo ka mid ah 14-ka door si aad u aragto shaashaddiisa u gaarka ah, qaybaha uu arko ("Wuxuu arkaa"), waxyaabaha uu qaban karo, iyo xaddidaadda nidaamka.',
      btnPreview: 'Muuqaalka Doorka (Individual Preview)',
      btnMatrix: 'Shaxda 14-ka Door',
      all: 'Dhammaan 14-ka Door',
      national: 'Heer Qaran & Waax (1–4)',
      regional_district: 'Gobol & Degmo (5–6)',
      specialist: 'GIS, Tayada & Hanti-dhowrka (7–8, 12)',
      field: 'Goobta & Xaqiijinta (9–11)',
      external: 'Muwaadinka & Hay’adaha API (13–14)',
      modulesTitle: 'Wuxuu arkaa (Qaybaha Nidaamka)',
      capabilitiesTitle: 'Waxyaabaha uu qaban karo',
      restrictionsTitle: 'Xaddidaad (Xeerarka Xadka Awoodda)',
      stepInto: 'Eeg Doorkan'
    },
    ar: {
      title: 'نظام العنونة — جميع الأدوار الـ 14 ومعايناتها الفردية',
      subtitle:
        'اختر أي دور من الأدوار الـ 14 أدناه لمعاينة واجهته الخاصة ووحداته المرئية وصلاحياته والقيود المفروضة.',
      btnPreview: 'معاينة الدور الفردية',
      btnMatrix: 'مصفوفة الأدوار الـ 14',
      all: 'جميع الأدوار (14)',
      national: 'وطني وتنفيذي (1–4)',
      regional_district: 'إقليمي ومديرية (5–6)',
      specialist: 'جغرافي وجودة وتدقيق (7–8, 12)',
      field: 'ميداني وتحقق (9–11)',
      external: 'المواطن وشركاء API (13–14)',
      modulesTitle: 'الوحدات المرئية لهذا الدور',
      capabilitiesTitle: 'الصلاحيات والمهام المسموحة',
      restrictionsTitle: 'القيود والضوابط المفروضة',
      stepInto: 'فتح المعاينة'
    }
  }[language];

  const renderRoleOperationalWorkspace = () => {
    switch (activeRole) {
      /* 1. NATIONAL SUPER ADMINISTRATOR */
      case 'national_super_admin':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Hardware MFA Policy
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {mfaEnforced ? 'Enforced (R01–R12)' : 'Standard MFA'}
                </div>
                <button
                  onClick={() => {
                    setMfaEnforced(!mfaEnforced);
                    notify(`Hardware MFA enforcement policy updated (Dual Control logged).`);
                  }}
                  className="mt-2 text-[11px] font-semibold text-blue-900 hover:underline cursor-pointer"
                >
                  Toggle MFA Policy Mode
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-blue-800" /> Platform & DB Status
                </div>
                <div className="text-sm font-bold text-emerald-700 mt-1">99.98% Uptime • Backup OK</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Last snapshot: Today 03:00 EAT</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> Address Approval
                </div>
                <div className="text-sm font-bold text-rose-700 mt-1">Permanently Blocked</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Cannot approve or publish addresses</div>
              </div>
            </div>

            {activeModule === 'Database & Backup Status' || activeModule === 'Platform Health' || activeModule === 'API Infrastructure' ? (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-900" /> {activeModule}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <div className="font-semibold text-slate-800">Primary Spatial Registry Cluster</div>
                    <div className="text-emerald-700 font-mono text-[11px]">HEALTHY • Replication Lag: 4ms</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <div className="font-semibold text-slate-800">API Gateway & USSD Bridge</div>
                    <div className="text-emerald-700 font-mono text-[11px]">99.99% Availability • WAF Active</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {activeModule} — Emergency Break-Glass & Masked Registry Preview
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Routine address coordinates and street names remain masked unless time-boxed Break-Glass is unlocked.
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${breakGlassActive ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'}`}>
                    {breakGlassActive ? 'BREAK-GLASS ACTIVE' : 'ROUTINE DATA MASKED'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Code</th>
                        <th className="p-2">District</th>
                        <th className="p-2">Street & Coordinates</th>
                        <th className="p-2">Policy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {MOCK_ADDRESSES.slice(0, 3).map((addr) => (
                        <tr key={addr.id}>
                          <td className="p-2 font-mono font-semibold text-slate-800">{addr.publicCode}</td>
                          <td className="p-2">{addr.components.district}</td>
                          <td className="p-2 font-mono text-[11px]">
                            {breakGlassActive
                              ? `${addr.components.street} (${addr.location.coordinates[1]}, ${addr.location.coordinates[0]})`
                              : '[MASKED — HARDWARE MFA + BREAK-GLASS REQUIRED]'}
                          </td>
                          <td className="p-2">
                            <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Publish Blocked
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={breakGlassReason}
                    onChange={(e) => setBreakGlassReason(e.target.value)}
                    placeholder="Enter incident ticket & justification for 15m Break-Glass..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                  <button
                    onClick={() => {
                      if (!breakGlassActive && breakGlassReason.trim().length < 8) {
                        notify('Enter an incident justification (min 8 chars) to initiate Break-Glass.', 'warning');
                        return;
                      }
                      const next = !breakGlassActive;
                      setBreakGlassActive(next);
                      if (next) {
                        appendAudit('break_glass.activated', 'PLATFORM', `15m emergency access: ${breakGlassReason}`);
                        notify('Break-Glass active for 15m. Director General & Audit notified.', 'warning');
                      } else {
                        notify('Break-Glass closed. Routine data masking restored.');
                      }
                    }}
                    className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      breakGlassActive ? 'bg-slate-800 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {breakGlassActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{breakGlassActive ? 'Close Break-Glass' : 'Activate Break-Glass'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      /* 2. NATIONAL AUTHORITY ADMINISTRATOR */
      case 'national_authority_admin':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 space-y-2.5 bg-white text-xs">
                <h4 className="font-bold text-slate-900 text-sm">{activeModule}</h4>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-600">National Address Code Rule</span>
                  <span className="font-mono font-bold text-blue-900">SDAS-&#123;CITY&#125;-&#123;4-DIGIT&#125;</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-600">Active Federal Regions</span>
                  <span className="font-bold text-slate-900">Banaadir (17 Districts) + Federal Hubs</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-600">Custodian Departments</span>
                  <span className="font-bold text-slate-900">6 Active National Departments</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-2.5 bg-white text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">Dual-Control Standard Governance</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${policyProposalStatus === 'countersigned' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {policyProposalStatus === 'countersigned' ? 'Approved by 2nd Approver' : 'Pending 2nd Approver'}
                  </span>
                </div>
                <p className="text-slate-600">
                  <strong>Rule Proposal POL-2026-07:</strong> Expand Mogadishu corridor code prefix allocation for Kaxda & Heliwaa growth sectors.
                </p>
                <button
                  disabled
                  className="w-full py-2 bg-slate-100 text-slate-400 border border-slate-200 rounded text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ma ansixin karo shaqadiisa (Requires R03 Countersign)</span>
                </button>
              </div>
            </div>
          </div>
        );

      /* 3. DIRECTOR GENERAL */
      case 'director_general':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Official Designation & Dual-Control</h4>
                  <p className="text-xs text-slate-500">Authorize official government addresses and countersign national policies. Routine editing disabled.</p>
                </div>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-900 px-2.5 py-1 rounded border border-blue-200">
                  Data-Entry Blocked
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-slate-700">Authority Instrument Reference</label>
                <input
                  type="text"
                  value={dgInstrumentRef}
                  onChange={(e) => setDgInstrumentRef(e.target.value)}
                  className="w-full sm:max-w-md bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono text-xs text-slate-900"
                />
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
                {MOCK_ADDRESSES.slice(0, 3).map((addr) => {
                  const isOfficial = dgDesignatedIds.includes(addr.publicCode) || addr.designationStatus === 'official';
                  return (
                    <div key={addr.id} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{addr.publicCode}</span>
                        <span className="ml-2 text-slate-600">{addr.components.district} — {addr.components.locality}</span>
                      </div>
                      {!isOfficial ? (
                        <button
                          onClick={() => {
                            if (!dgInstrumentRef.trim()) {
                              notify('Authority Instrument Reference required.', 'warning');
                              return;
                            }
                            setDgDesignatedIds((prev) => [...prev, addr.publicCode]);
                            appendAudit('address.designated_official', addr.publicCode, `Ref: ${dgInstrumentRef}`);
                            notify(`${addr.publicCode} designated official under ${dgInstrumentRef}.`);
                          }}
                          className="bg-[#0c243e] hover:bg-blue-900 text-white px-3 py-1.5 rounded font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> Designate Official
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Official ({addr.authorityReference || dgInstrumentRef})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <span><strong>Dual-Control Policy POL-2026-07:</strong> Prefix expansion awaiting countersignature.</span>
                {policyProposalStatus === 'countersigned' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Countersigned
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setPolicyProposalStatus('countersigned');
                      appendAudit('dual_control.countersign', 'POL-2026-07', 'DG countersigned policy');
                      notify('Policy POL-2026-07 countersigned.');
                    }}
                    className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded font-semibold cursor-pointer"
                  >
                    Countersign Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      /* 4. DEPARTMENT ADMINISTRATOR */
      case 'department_admin':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Department Operations</h4>
                  <p className="text-slate-500">Scoped strictly to Data Quality & Verification Department.</p>
                </div>
                <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded border border-blue-200 font-semibold">
                  Dept SLA: 96.4%
                </span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded">
                {deptTasks.map((task) => (
                  <div key={task.id} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="font-mono font-bold text-blue-900">{task.id}</span>
                      <span className="ml-2 font-semibold text-slate-900">{task.title}</span>
                      <div className="text-[11px] text-slate-500">Assignee: {task.assignee} • SLA: {task.sla}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {task.status}
                      </span>
                      {task.status !== 'Escalated' && (
                        <button
                          onClick={() => {
                            setDeptTasks((prev) =>
                              prev.map((t) => (t.id === task.id ? { ...t, status: 'Escalated' } : t))
                            );
                            appendAudit('dept.escalate', task.id, 'Escalated to Regional/Executive authority');
                            notify(`${task.id} escalated to senior level.`);
                          }}
                          className="px-2.5 py-1 bg-[#0c243e] hover:bg-blue-900 text-white rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* 5. REGIONAL ADMINISTRATOR */
      case 'regional_admin':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Banaadir 17 Districts</h4>
                  <p className="text-slate-500">Approve & publish records within Banaadir delegation. Other regions restricted.</p>
                </div>
                <span className="font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
                  Banaadir Scope
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {MOCK_DISTRICTS.slice(0, 4).map((d) => (
                  <div key={d.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-slate-900">{d.name}</div>
                    <div className="text-[11px] text-slate-500">Approved: {d.approvedDesignations.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded">
                {applications.map((app) => {
                  const isPub = regionalPublishedIds.includes(app.id);
                  return (
                    <div key={app.id} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{app.id}</span>
                        <span className="ml-2 font-semibold">{app.district} — {app.locality}</span>
                      </div>
                      {isPub ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Published
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setRegionalPublishedIds((prev) => [...prev, app.id]);
                            appendAudit('address.published', app.id, `Regional Admin published in ${app.district}`);
                            notify(`${app.id} published across Banaadir registry.`);
                          }}
                          className="bg-[#0c243e] hover:bg-blue-900 text-white px-3 py-1 rounded font-semibold cursor-pointer"
                        >
                          Publish Address
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* 6. DISTRICT ADMINISTRATOR */
      case 'district_admin':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Hodan District (RLS Scoped)</h4>
                  <p className="text-slate-500">Other districts are hidden. Cannot approve records you created or verified.</p>
                </div>
                <span className="font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded">
                  Hodan District Only
                </span>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded">
                {applications
                  .filter((a) => a.district === 'Hodan')
                  .map((app) => (
                    <div key={app.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{app.id}</span>
                        <span className="ml-2 font-semibold text-slate-800">{app.applicantName}</span>
                        <div className="text-[11px] text-slate-500">Hodan — {app.locality}, {app.street}</div>
                      </div>
                      {app.status === 'approved' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setApplications((prev) =>
                              prev.map((p) => (p.id === app.id ? { ...p, status: 'approved', statusLabel: 'La Ansixiyay' } : p))
                            );
                            appendAudit('address.approved', app.id, 'Hodan District Admin approved');
                            notify(`${app.id} approved in Hodan District.`);
                          }}
                          className="bg-[#0c243e] hover:bg-blue-900 text-white px-3.5 py-1.5 rounded font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Address
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      /* 7. GIS OFFICER */
      case 'gis_officer':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Geospatial Workspace</h4>
                  <p className="text-slate-500">Manage boundaries, street networks, and building footprints. Official address approval separated.</p>
                </div>
                <span className="font-mono bg-blue-50 text-blue-900 px-2.5 py-1 rounded border border-blue-200">
                  EPSG:32638
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-800" /> Spatial Dataset & Boundary Validation
                  </div>
                  <p className="text-slate-600">
                    Layer <strong>Banaadir_Districts_v4.geojson</strong>: 17/17 polygons valid, 0 overlaps.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        appendAudit('gis.dry_run_passed', 'Banaadir_Districts_v4', 'Topology & CRS check passed');
                        notify('Spatial dry-run passed (17 district polygons validated).');
                      }}
                      className="px-3 py-1.5 bg-[#0c243e] hover:bg-blue-900 text-white rounded font-semibold cursor-pointer"
                    >
                      Validate Coordinates & Boundaries
                    </button>
                    <button
                      onClick={() => onNavigate('map')}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded font-semibold cursor-pointer"
                    >
                      Open Map View →
                    </button>
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-800" /> Map Layer Classification
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                    <span>Street Network & Building Footprints</span>
                    <span className="text-emerald-700 font-bold">PUBLIC</span>
                  </div>
                  <div className="flex justify-between bg-white p-2 rounded border border-slate-200">
                    <span>Sensitive Infrastructure Geometry</span>
                    <span className="text-rose-700 font-bold">RESTRICTED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      /* 8. DATA QUALITY OFFICER */
      case 'data_quality_officer':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Quality Score: 97.2%</h4>
                  <p className="text-slate-500">Detect duplicates & invalid coordinates. Merges require independent approval.</p>
                </div>
                <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded border border-amber-200 font-semibold">
                  2 Quality Flags
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="font-bold text-slate-900 block">Duplicate Candidate #DQ-308 (2.4m proximity)</span>
                  <span className="text-slate-600">
                    <code className="font-mono text-blue-900">SDAS-MOG-7482</code> vs <code className="font-mono">DRAFT-HOD-9921</code>
                  </span>
                </div>
                {mergeProposed ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Merge Proposed (Awaiting Approval)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setMergeProposed(true);
                      appendAudit('merge.proposed', 'DRAFT-HOD-9921', 'Proposed merge to SDAS-MOG-7482');
                      notify('Merge proposal submitted for independent approval.');
                    }}
                    className="bg-[#0c243e] hover:bg-blue-900 text-white px-3 py-1.5 rounded font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <GitMerge className="w-3.5 h-3.5" /> Propose Address Merge
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      /* 9. FIELD OPERATIONS SUPERVISOR */
      case 'field_ops_supervisor':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Survey Fleet & Task Assignment</h4>
                  <p className="text-slate-500">Assign surveyor tasks, monitor offline sync, and return submissions needing fixes.</p>
                </div>
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200 font-semibold">
                  14 Active Tablets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'SURV-TASK-401', team: 'Team Alpha — Hodan Sector 4', progress: '42 / 50 structures', device: 'GNSS-TAB-19' },
                  { id: 'SURV-TASK-402', team: 'Team Bravo — Wadajir West', progress: '38 / 45 structures', device: 'GNSS-TAB-24' }
                ].map((pkg) => {
                  const isSampled = qaSampledIds.includes(pkg.id);
                  return (
                    <div key={pkg.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-900">{pkg.id}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">{pkg.device}</span>
                      </div>
                      <div className="font-semibold text-slate-800">{pkg.team}</div>
                      <div className="text-slate-500">Progress: {pkg.progress}</div>
                      <button
                        onClick={() => {
                          if (!isSampled) {
                            setQaSampledIds((prev) => [...prev, pkg.id]);
                            appendAudit('qa.recheck_assigned', pkg.id, 'Scheduled 10% QA recheck');
                            notify(`${pkg.id} flagged for QA field evidence review.`);
                          }
                        }}
                        className={`px-3 py-1 rounded font-semibold cursor-pointer ${
                          isSampled ? 'bg-emerald-100 text-emerald-800' : 'bg-[#0c243e] text-white'
                        }`}
                      >
                        {isSampled ? '✓ QA Review Assigned' : 'Assign QA Recheck'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* 10. FIELD SURVEYOR */
      case 'field_surveyor':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Taleex Sector 4 (Offline Capture)</h4>
                  <p className="text-slate-500">Assigned area only. Capture building/entrance GNSS points offline and sync when online.</p>
                </div>
                <span className="bg-rose-50 text-rose-800 px-2.5 py-1 rounded border border-rose-200 font-semibold">
                  Verify / Approve Blocked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <input
                  type="text"
                  value={fieldBuildingNo}
                  onChange={(e) => setFieldBuildingNo(e.target.value)}
                  placeholder="Building #"
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={fieldStreet}
                  onChange={(e) => setFieldStreet(e.target.value)}
                  placeholder="Street Name"
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={`${fieldEntranceLat}, ${fieldEntranceLon}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    if (parts[0]) setFieldEntranceLat(parts[0].trim());
                    if (parts[1]) setFieldEntranceLon(parts[1].trim());
                  }}
                  placeholder="Lat, Lon"
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs"
                />
                <button
                  onClick={() => {
                    const uuid = '8f1c-' + Math.floor(1000 + Math.random() * 9000);
                    setOfflineSyncQueue((prev) => [
                      { clientUuid: uuid, sector: `Taleex #${fieldBuildingNo} (${fieldStreet})`, gnssAccuracy: 1.2, status: 'queued_offline' },
                      ...prev
                    ]);
                    notify(`Building #${fieldBuildingNo} saved offline with UUID ${uuid}.`);
                  }}
                  className="bg-blue-900 hover:bg-blue-800 text-white rounded px-3 py-1.5 font-semibold cursor-pointer flex items-center justify-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" /> Save Offline
                </button>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded">
                {offlineSyncQueue.map((item) => (
                  <div key={item.clientUuid} className="p-3 flex justify-between items-center gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900">UUID: {item.clientUuid}</span>
                      <span className="ml-2 text-slate-600">{item.sector} (GNSS: {item.gnssAccuracy}m)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'synced' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {item.status === 'synced' ? 'SYNCED' : 'OFFLINE QUEUE'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setOfflineSyncQueue((prev) => prev.map((q) => ({ ...q, status: 'synced' })));
                  appendAudit('survey.sync_offline', 'Taleex Sector 4', 'Synced offline observations');
                  notify('Offline records synced to independent verification queue.');
                }}
                className="bg-[#0c243e] hover:bg-blue-900 text-white px-3.5 py-2 rounded font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Offline Records Now
              </button>
            </div>
          </div>
        );

      /* 11. ADDRESS VERIFIER */
      case 'address_verifier':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Independent Verification</h4>
                  <p className="text-slate-500">Check building existence, GNSS accuracy, and photo evidence. Cannot approve or publish.</p>
                </div>
                <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded border border-blue-200 font-semibold">
                  Final Approval Blocked
                </span>
              </div>

              <input
                type="text"
                value={verifierReason}
                onChange={(e) => setVerifierReason(e.target.value)}
                placeholder="Verification note (required when returning for correction)..."
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs"
              />

              <div className="divide-y divide-slate-200 border border-slate-200 rounded">
                {MOCK_PENDING_APPLICATIONS.slice(0, 2).map((app) => {
                  const decision = verifierDecisions[app.id];
                  return (
                    <div key={app.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{app.id}</span>
                        <span className="ml-2 font-semibold">{app.district} — {app.locality} ({app.street})</span>
                        <div className="text-[11px] text-slate-500">Photo & GNSS evidence attached (0.9m accuracy)</div>
                      </div>
                      {decision ? (
                        <span className={`font-bold px-2.5 py-1 rounded text-[11px] ${decision === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {decision === 'verified' ? '✓ Verified' : 'Returned for Correction'}
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setVerifierDecisions((prev) => ({ ...prev, [app.id]: 'verified' }));
                              appendAudit('address.verified', app.id, verifierReason || 'GPS & photo evidence verified');
                              notify(`${app.id} verified and routed to District Admin.`);
                            }}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded font-semibold cursor-pointer"
                          >
                            Verify Evidence
                          </button>
                          <button
                            onClick={() => {
                              if (!verifierReason.trim()) {
                                notify('Enter verification note before returning for correction.', 'warning');
                                return;
                              }
                              setVerifierDecisions((prev) => ({ ...prev, [app.id]: 'correction_requested' }));
                              appendAudit('address.returned', app.id, verifierReason);
                              notify(`${app.id} returned to surveyor.`, 'warning');
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded font-semibold cursor-pointer"
                          >
                            Return Correction
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      /* 12. AUDITOR */
      case 'auditor': {
        const logs = auditFilter.trim()
          ? auditLogs.filter(
              (l) =>
                l.target.toLowerCase().includes(auditFilter.toLowerCase()) ||
                l.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
                l.actorRole.toLowerCase().includes(auditFilter.toLowerCase())
            )
          : auditLogs;

        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Immutable Oversight</h4>
                  <p className="text-slate-500">Inspect every change, approver, login, and export event. Strictly Read-Only.</p>
                </div>
                <span className="font-bold bg-slate-800 text-white px-2.5 py-1 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" /> READ-ONLY
                </span>
              </div>

              <input
                type="text"
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                placeholder="Search logs by SDAS code, actor role, or event..."
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs"
              />

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Event ID</th>
                      <th className="p-2">Timestamp</th>
                      <th className="p-2">Actor</th>
                      <th className="p-2">Action</th>
                      <th className="p-2">Target</th>
                      <th className="p-2">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {logs.map((entry) => (
                      <tr key={entry.id}>
                        <td className="p-2 font-mono font-semibold text-blue-900">{entry.id}</td>
                        <td className="p-2 font-mono text-[11px] text-slate-500">{entry.timestamp}</td>
                        <td className="p-2 font-semibold">{entry.actorRole}</td>
                        <td className="p-2 font-mono text-[11px]">{entry.action}</td>
                        <td className="p-2 font-mono text-[11px]">{entry.target}</td>
                        <td className="p-2 text-slate-600">{entry.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      /* 13. PUBLIC CITIZEN */
      case 'public_citizen':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="border-b border-slate-200 pb-2.5">
                <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Citizen Self-Service</h4>
                <p className="text-slate-500">Approved public addresses & own requests only. Administrative dashboards & private data hidden.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onNavigate('search')}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded text-left cursor-pointer"
                >
                  <div className="font-bold text-blue-900 flex items-center justify-between">
                    <span>Search & QR Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">Verify public address code & share QR certificate.</p>
                </button>
                <button
                  onClick={() => onNavigate('request')}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded text-left cursor-pointer"
                >
                  <div className="font-bold text-blue-900 flex items-center justify-between">
                    <span>Request New Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">Submit new property or correction request.</p>
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded text-left cursor-pointer"
                >
                  <div className="font-bold text-blue-900 flex items-center justify-between">
                    <span>Explore Somalia Map</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">Browse approved public addresses on map.</p>
                </button>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">My Recent Citizen Requests</div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span><strong className="font-mono text-blue-900">APP-2026-4412</strong> — Hodan, Taleex</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">Pending Field Verification</span>
                </div>
              </div>
            </div>
          </div>
        );

      /* 14. INSTITUTIONAL API CLIENT */
      case 'institutional_api_client':
        return (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{activeModule} — Partner API & Emergency Dispatch</h4>
                  <p className="text-slate-500">Scoped read-only lookup, validation, geocoding, and rate-limited credentials.</p>
                </div>
                <button
                  onClick={() => onNavigate('partners')}
                  className="bg-[#0c243e] hover:bg-blue-900 text-white px-3 py-1.5 rounded font-semibold cursor-pointer flex items-center gap-1"
                >
                  Full Dispatch Console <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">API Credential Key</span>
                  <div className="font-mono font-bold text-blue-900 truncate mt-1">{apiKeyToken}</div>
                  <button
                    onClick={() => {
                      const nextKey = 'sdas_live_bra999_' + Math.random().toString(36).slice(2, 10);
                      setApiKeyToken(nextKey);
                      notify('API key rotated cleanly. Old key scheduled for 24h grace revocation.');
                    }}
                    className="mt-1.5 text-[11px] font-semibold text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" /> Rotate API Key
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Rate Limit Quota</span>
                  <span className="font-bold text-emerald-700 mt-1 block">4,820 / 50,000 req/day</span>
                  <span className="text-[11px] text-slate-500">Burst limit: 120 req/sec</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Authorized Scopes</span>
                  <span className="font-mono font-bold text-slate-800 mt-1 block">lookup, validate, geocode, qr</span>
                  <span className="text-[11px] text-slate-500">Avg latency: 12ms</span>
                </div>
              </div>

              {/* Live API Endpoint Simulator */}
              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-md space-y-2">
                <div className="flex items-center justify-between text-[11px] text-sky-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> GET /v1/addresses/{apiTestCode}/validate
                  </span>
                  <span>200 OK</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiTestCode}
                    onChange={(e) => setApiTestCode(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      const match = MOCK_ADDRESSES.find((a) => a.publicCode.toLowerCase() === apiTestCode.trim().toLowerCase()) || MOCK_ADDRESSES[0];
                      setApiTestOutput(
                        JSON.stringify(
                          {
                            code: match.publicCode,
                            status: 'official_verified',
                            district: match.components.district,
                            locality: match.components.locality,
                            coordinates: match.location.coordinates
                          },
                          null,
                          2
                        )
                      );
                    }}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Test Lookup API
                  </button>
                </div>
                {apiTestOutput && (
                  <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-2.5 rounded overflow-x-auto">
                    {apiTestOutput}
                  </pre>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
            {labels.title}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">{labels.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              viewMode === 'preview'
                ? 'bg-[#0c243e] text-white border-[#0c243e]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{labels.btnPreview}</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              viewMode === 'matrix'
                ? 'bg-[#0c243e] text-white border-[#0c243e]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{labels.btnMatrix}</span>
          </button>
        </div>
      </div>

      {/* Category Filter + Quick 14-Role Selector Strip */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(['all', 'national', 'regional_district', 'specialist', 'field', 'external'] as CategoryFilter[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[cat]}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {filteredRoles.map((role) => {
            const isSelected = role.id === activeRole;
            return (
              <button
                key={role.id}
                onClick={() => {
                  onSelectRole(role.id);
                  setViewMode('preview');
                }}
                className={`p-2.5 rounded-md border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#0c243e] text-white border-[#0c243e] shadow-xs'
                    : 'bg-slate-50 hover:bg-blue-50/70 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'}`}>
                    #{role.order} • {role.code}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />}
                </div>
                <div className="text-[11px] font-bold leading-tight line-clamp-2">{role.name[language]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {bannerMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            bannerMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {bannerMessage.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {viewMode === 'matrix' ? (
        /* All 14 Roles Matrix Overview */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoles.map((role) => {
            const isSelected = role.id === activeRole;
            return (
              <div
                key={role.id}
                className={`bg-white rounded-lg border p-5 shadow-xs space-y-3 transition ${
                  isSelected ? 'border-blue-900 ring-1 ring-blue-900' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-[#0c243e] text-white px-2 py-0.5 rounded">
                        {role.order}. {role.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{role.name[language]}</h3>
                    </div>
                    <div className="text-[11px] text-blue-900 font-semibold mt-1">{role.tierLabel[language]}</div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectRole(role.id);
                      setViewMode('preview');
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded text-xs font-semibold shrink-0 cursor-pointer transition"
                  >
                    {labels.stepInto} →
                  </button>
                </div>

                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">{labels.modulesTitle}:</strong>{' '}
                  {role.visibleModules.slice(0, 6).join(' • ')} +{role.visibleModules.length - 6} more
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-900 space-y-0.5">
                  {role.restrictions.map((res, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dedicated Individual Role Preview Shell */
        <div className="space-y-5">
          {/* Role Identity Header */}
          <div className="bg-[#0c243e] text-white rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold bg-sky-500/20 text-sky-200 border border-sky-400/40 px-2 py-0.5 rounded">
                  #{currentRole.order} • {currentRole.code}
                </span>
                <span className="text-xs text-sky-300 font-semibold">{currentRole.tierLabel[language]}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {currentRole.order}. {currentRole.name[language]}
              </h3>
              <p className="text-xs text-slate-300">{currentRole.summary[language]}</p>
            </div>

            <div className="bg-[#081a2d] border border-blue-800/80 rounded-md p-3 text-xs space-y-1 shrink-0 min-w-[240px]">
              <div className="text-slate-400 text-[10px] uppercase">Signed-In Official / Actor</div>
              <div className="font-semibold text-white">{currentRole.sampleHolder}</div>
              <div className="text-sky-300 text-[11px]">{currentRole.assignedArea}</div>
            </div>
          </div>

          {/* Individual Role App Shell: Left Sidebar ("Wuxuu arkaa") + Right Interactive Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Sidebar: Exact Visible Modules */}
            <aside className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{labels.modulesTitle}</span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                  {currentRole.visibleModules.length} Screens
                </span>
              </div>
              <nav className="divide-y divide-slate-100">
                {currentRole.visibleModules.map((mod, idx) => {
                  const isModActive = activeModule === mod;
                  return (
                    <button
                      key={mod}
                      onClick={() => setActiveModule(mod)}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition cursor-pointer ${
                        isModActive
                          ? 'bg-[#0c243e] text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] ${isModActive ? 'text-sky-300' : 'text-slate-400'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{mod}</span>
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isModActive ? 'text-sky-300' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Right Main Panel: Interactive Screen + Capabilities + Restrictions */}
            <div className="lg:col-span-8 space-y-5">
              {/* Interactive Role & Module Workspace */}
              {renderRoleOperationalWorkspace()}

              {/* Capabilities ("Waxyaabaha uu qaban karo") & Restrictions ("Xaddidaad") */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2.5 shadow-xs">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" />
                    <span>{labels.capabilitiesTitle}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {currentRole.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/70 rounded-lg border border-amber-200 p-4 space-y-2.5 shadow-xs">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-200/80 pb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>{labels.restrictionsTitle}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {currentRole.restrictions.map((res, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
