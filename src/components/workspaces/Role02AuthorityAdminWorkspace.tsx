import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { Lock, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role02AuthorityAdminWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'national_authority_admin')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'National Overview');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'national_authority_admin') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [data, setData] = useState<{ proposals: any[]; districts: any[] }>({ proposals: [], districts: [] });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await apiRequest('/api/authority/overview');
      setData({ proposals: res.proposals || [], districts: res.districts || [] });
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    try {
      await apiRequest('/api/authority/proposals', {
        method: 'POST',
        body: { category: 'code_rule', title, description }
      });
      setTitle('');
      setDescription('');
      setNotice({ type: 'ok', text: 'Standard/Code proposal created. Second approver (Director General) required before activation.' });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const trySelfApprove = async (id: string) => {
    setNotice(null);
    try {
      await apiRequest(`/api/governance/proposals/${id}/countersign`, { method: 'POST' });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="National Registry Governance"
      roleTitle="National Authority Administrator"
      roleCode="R02"
      tierText="National Level · Standards & Policy"
      user={user}
      navItems={getLocalizedModules(roleDef, language)}
      activeSection={section}
      onSelectSection={setSection}
      restrictions={roleDef.restrictions}
      onBackToPublicPortal={onBackToPublicPortal}
      onLogout={onLogout}
    >
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <h1 className="text-lg font-serif font-bold text-slate-900">{section}</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          National addressing standards, public code grammar rules, regional coverage oversight, and dual-control proposals.
        </p>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-md border text-xs flex items-center gap-2 ${
          notice.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {notice.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* National Address Standards & Code Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 rounded-md p-4 space-y-1">
          <div className="text-slate-500">Canonical Public Code Format</div>
          <div className="font-mono font-bold text-sm text-[#0c243e]">SDAS-&#123;CITY&#125;-&#123;4-DIGIT&#125;</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 space-y-1">
          <div className="text-slate-500">Spatial Reference System</div>
          <div className="font-mono font-bold text-sm text-slate-900">EPSG:4326 / UTM Zone 38N</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 space-y-1">
          <div className="text-slate-500">Tracked Banaadir Districts</div>
          <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">{data.districts.length} Districts</div>
        </div>
      </div>

      {/* Regional Performance Table */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Regional & District Readiness Overview</h2>
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">District</th>
                <th className="p-2.5 text-right">Estimated Inventory</th>
                <th className="p-2.5 text-right">Mapped Buildings</th>
                <th className="p-2.5 text-right">Verified Entrances</th>
                <th className="p-2.5 text-right">Approved Designations</th>
                <th className="p-2.5">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {data.districts.map((d) => (
                <tr key={d.id}>
                  <td className="p-2.5 font-medium text-slate-900">{d.name}</td>
                  <td className="p-2.5 text-right font-mono">{Number(d.estimated_inventory).toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono">{Number(d.mapped_buildings).toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono">{Number(d.verified_entrances).toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono">{Number(d.approved_designations).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-600">{String(d.readiness_status).replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose Standard / Code Rule (Dual Control) */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
        <h2 className="font-semibold text-sm text-slate-900">Propose National Standard / Code Rule (Dual Control)</h2>
        <form onSubmit={handleCreateProposal} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal title..."
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Rule specification & impact summary..."
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-[#0c243e] hover:bg-[#133860] text-white rounded px-3 py-2 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Submit Proposal
          </button>
        </form>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {data.proposals.map((p) => (
            <div key={p.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="font-semibold text-slate-900">
                  <span className="font-mono text-slate-600 mr-2">{p.id}</span>
                  {p.title}
                </div>
                <div className="text-slate-500 mt-0.5">{p.description}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Proposed by: {p.proposer_name || p.proposed_by} · Status: {p.status}
                </div>
              </div>
              {p.status === 'countersigned' ? (
                <span className="text-emerald-800 font-semibold text-xs">Countersigned</span>
              ) : (
                <button
                  onClick={() => trySelfApprove(p.id)}
                  className="px-3 py-1.5 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" /> Self-Approval Blocked (Requires R03)
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
};
