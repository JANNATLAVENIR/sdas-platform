import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { Download, Search, Lock } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role12AuditorWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'auditor')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Audit Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'auditor') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyDenied, setOnlyDenied] = useState(false);

  const load = async (q = '') => {
    try {
      const [auditRes, regRes] = await Promise.all([
        apiRequest(`/api/audit/logs${q ? `?q=${encodeURIComponent(q)}` : ''}`),
        apiRequest('/api/registry/addresses')
      ]);
      setLogs(auditRes.logs || []);
      setSummary(auditRes.summary || null);
      setAddresses(regRes.addresses || []);
    } catch {
      // ignore read failure in summary view
    }
  };

  useEffect(() => {
    load();
  }, []);

  const displayedLogs = onlyDenied ? logs.filter((l) => l.outcome === 'denied') : logs;

  const handleExportReport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      auditor: user.email,
      summary,
      recordsInspected: displayedLogs
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sdas-compliance-audit-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <WorkspaceShell
      portalLabel="Independent Audit & Oversight"
      roleTitle="Auditor (Strictly Read-Only)"
      roleCode="R12"
      tierText="Read-Only · Immutable Trail"
      user={user}
      navItems={getLocalizedModules(roleDef, language)}
      activeSection={section}
      onSelectSection={setSection}
      restrictions={roleDef.restrictions}
      onBackToPublicPortal={onBackToPublicPortal}
      onLogout={onLogout}
    >
      <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-lg font-serif font-bold text-slate-900">{section}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly read-only inspection of immutable append-only audit logs, security denials, and official designations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700">
            <Lock className="w-3.5 h-3.5" /> WRITE MUTATIONS GLOBALLY BLOCKED
          </span>
          <button
            onClick={handleExportReport}
            className="px-3.5 py-1.5 bg-[#0c243e] hover:bg-[#133860] text-white text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Audit JSON
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Immutable Audit Events</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{summary?.totalEvents ?? logs.length}</div>
          <div className="text-xs text-slate-500 mt-1">DB triggers prevent UPDATE / DELETE</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Denied / Security Events</div>
          <div className="text-xl font-bold text-rose-800 mt-1 tabular-nums">{summary?.deniedEvents ?? 0}</div>
          <div className="text-xs text-slate-500 mt-1">Cross-scope & SoD blocks logged</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Inspected Registry Records</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{addresses.length}</div>
          <div className="text-xs text-slate-500 mt-1">No edit, verify, or delete actions exposed</div>
        </div>
      </div>

      {/* Audit Trail Search & Table */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(searchTerm);
            }}
            className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:min-w-[240px]"
          >
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by role, action, target ID, or detail..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded bg-slate-50"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#0c243e] text-white text-xs font-medium rounded cursor-pointer"
            >
              Filter
            </button>
          </form>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyDenied}
              onChange={(e) => setOnlyDenied(e.target.checked)}
            />
            Security Denials Only
          </label>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Actor Role</th>
                <th className="p-2.5">Action</th>
                <th className="p-2.5">Target</th>
                <th className="p-2.5">Outcome</th>
                <th className="p-2.5">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedLogs.map((l) => (
                <tr key={l.id}>
                  <td className="p-2.5 font-mono text-[11px] tabular-nums text-slate-500">{l.timestamp}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-800">{l.actor_role}</td>
                  <td className="p-2.5 font-mono text-[11px] font-semibold text-slate-900">{l.action}</td>
                  <td className="p-2.5 font-mono text-[11px]">{l.target_id}</td>
                  <td className={`p-2.5 font-mono text-[11px] font-semibold ${l.outcome === 'denied' ? 'text-rose-700' : 'text-emerald-800'}`}>
                    {l.outcome}
                  </td>
                  <td className="p-2.5 text-slate-600">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Address History Inspection */}
      {(section === 'Address Change History' || section === 'Approval History') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <h2 className="font-semibold text-sm text-slate-900">Official Designation & Approval Chain (Read-Only)</h2>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Public Code</th>
                  <th className="p-2.5">Created By</th>
                  <th className="p-2.5">Verified By</th>
                  <th className="p-2.5">Approved By</th>
                  <th className="p-2.5">Authority Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {addresses.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2.5 font-bold text-slate-900">{a.public_code}</td>
                    <td className="p-2.5">{a.created_by}</td>
                    <td className="p-2.5">{a.verified_by}</td>
                    <td className="p-2.5">{a.approved_by}</td>
                    <td className="p-2.5">{a.authority_reference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
