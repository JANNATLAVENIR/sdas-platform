import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { Award, CheckCircle2, AlertTriangle, FileCheck2 } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role03DirectorGeneralWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'director_general')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Executive Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'director_general') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [data, setData] = useState<{ proposals: any[]; districts: any[]; pendingDesignations: any[] }>({
    proposals: [],
    districts: [],
    pendingDesignations: []
  });
  const [authorityRef, setAuthorityRef] = useState('TEST-DECREE-2026-EXEC-01');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await apiRequest('/api/authority/overview');
      setData(res);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDesignate = async (addressId: string) => {
    setNotice(null);
    try {
      const res = await apiRequest(`/api/addresses/${addressId}/designate-official`, {
        method: 'POST',
        body: { authorityReference: authorityRef }
      });
      setNotice({ type: 'ok', text: `${res.publicCode} designated official under reference ${res.authorityReference}.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const handleCountersign = async (proposalId: string) => {
    setNotice(null);
    try {
      await apiRequest(`/api/governance/proposals/${proposalId}/countersign`, { method: 'POST' });
      setNotice({ type: 'ok', text: `Dual-control proposal ${proposalId} countersigned by Director General.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="Executive Authority"
      roleTitle="Director General"
      roleCode="R03"
      tierText="National Level · Executive Authority"
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
            Official address designation authorization, dual-control countersignatures, and national executive oversight.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-600">Routine data-entry & field editing disabled</span>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-md border text-xs flex items-center gap-2 ${
          notice.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {notice.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Official Address Designation Queue */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">Official Address Designation Requests</h2>
            <p className="text-xs text-slate-500">Mandatory Authority Instrument Reference required for executive designation.</p>
          </div>
          <div className="w-full sm:w-72">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Authority Instrument Reference</label>
            <input
              type="text"
              value={authorityRef}
              onChange={(e) => setAuthorityRef(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 font-mono text-xs"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {data.pendingDesignations.map((addr) => (
            <div key={addr.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="font-mono font-bold text-slate-900">
                  {addr.public_code} <span className="font-sans font-normal text-slate-600">· {addr.district_name} — {addr.locality}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Verification: {addr.verification_status} · Approval: {addr.approval_status} · Designation: {addr.designation_status}
                </div>
              </div>
              {addr.designation_status === 'official' ? (
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Official ({addr.authority_reference})
                </span>
              ) : (
                <button
                  onClick={() => handleDesignate(addr.id)}
                  className="px-3.5 py-1.5 bg-[#0c243e] hover:bg-[#133860] text-white font-medium rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" /> Designate Official
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dual-Control Countersignatures */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Pending Dual-Control Countersignatures</h2>
        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {data.proposals.map((p) => (
            <div key={p.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="font-semibold text-slate-900">
                  <span className="font-mono text-slate-600 mr-2">{p.id}</span>
                  {p.title}
                </div>
                <div className="text-slate-500 mt-0.5">{p.description}</div>
              </div>
              {p.status === 'countersigned' ? (
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <FileCheck2 className="w-4 h-4" /> Countersigned
                </span>
              ) : (
                <button
                  onClick={() => handleCountersign(p.id)}
                  className="px-3.5 py-1.5 bg-[#0c243e] hover:bg-[#133860] text-white font-medium rounded cursor-pointer"
                >
                  Countersign Decision
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
};
