import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { CheckCircle2, AlertTriangle, GitMerge } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role08DataQualityWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'data_quality_officer')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Data Quality Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'data_quality_officer') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [flags, setFlags] = useState<any[]>([]);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await apiRequest('/api/quality/flags');
      setFlags(res.flags || []);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleProposeMerge = async (flagId: string) => {
    setNotice(null);
    try {
      const res = await apiRequest(`/api/quality/flags/${flagId}/propose-merge`, { method: 'POST' });
      setNotice({
        type: 'ok',
        text: `Flag ${res.id} marked '${res.status}'. Auto-merge is disabled (${String(res.autoMerged)}); routed for independent approval.`
      });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const openFlags = flags.filter((f) => f.status === 'open').length;

  return (
    <WorkspaceShell
      portalLabel="Data Quality & Governance"
      roleTitle="Data Quality Officer"
      roleCode="R08"
      tierText="Quality Control · Non-Destructive"
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
            Inspect suspected duplicates, horizontal GNSS accuracy violations, and propose non-destructive record merges.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700 tabular-nums">
          {openFlags} Open Anomalies · Auto-Delete Prohibited
        </span>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-md border text-xs flex items-center gap-2 ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notice.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Total Quality Flags</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{flags.length}</div>
          <div className="text-xs text-slate-500 mt-1">Detected across Banaadir</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Duplicate Candidates</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {flags.filter((f) => f.flag_type === 'duplicate_candidate').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Requires independent approval to merge</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Accuracy / Invalid GNSS</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {flags.filter((f) => f.flag_type !== 'duplicate_candidate').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Exceeds 5.0m GNSS accuracy policy</div>
        </div>
      </div>

      {/* Quality Validation Queue */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Quality Flags & Correction Proposals</h2>
        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {flags.map((f) => (
            <div key={f.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="font-mono font-bold text-slate-900">
                  {f.id} · {f.flag_type} <span className="text-slate-500 font-normal">({f.district_name})</span>
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  Target: <span className="font-mono">{f.address_code}</span>
                  {f.candidate_code ? (
                    <> vs Candidate <span className="font-mono">{f.candidate_code}</span></>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{f.details}</div>
              </div>
              {f.status === 'open' ? (
                <button
                  onClick={() => handleProposeMerge(f.id)}
                  className="px-3.5 py-2 bg-[#0c243e] hover:bg-[#133860] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <GitMerge className="w-3.5 h-3.5" /> Propose Merge / Correction
                </button>
              ) : (
                <span className="font-mono text-[11px] font-semibold text-slate-600">{f.status} (Awaiting Independent Approval)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
};
