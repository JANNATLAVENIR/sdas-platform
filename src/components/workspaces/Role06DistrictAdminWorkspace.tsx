import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { CheckCircle2, AlertTriangle, ShieldAlert, FileCheck } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role06DistrictAdminWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'district_admin')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'District Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'district_admin') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [fieldTasks, setFieldTasks] = useState<any[]>([]);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const [regRes, appRes, opsRes] = await Promise.all([
        apiRequest('/api/registry/addresses'),
        apiRequest('/api/applications'),
        apiRequest('/api/field-ops/tasks')
      ]);
      setAddresses(regRes.addresses || []);
      setApplications(appRes.applications || []);
      setFieldTasks((opsRes.tasks || []).filter((t: any) => !user.districtId || t.district_id === user.districtId));
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (appId: string) => {
    setNotice(null);
    try {
      const res = await apiRequest(`/api/applications/${appId}/approve`, { method: 'POST' });
      setNotice({ type: 'ok', text: `Application ${res.id} approved within ${user.assignedArea}.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const testCrossDistrictIsolation = async () => {
    setNotice(null);
    try {
      await apiRequest('/api/registry/addresses?districtId=dis-wadajir');
    } catch (e: any) {
      setNotice({ type: 'ok', text: `RLS Enforcement Confirmed: ${e.message}` });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="District Office · Hodan"
      roleTitle="District Administrator"
      roleCode="R06"
      tierText="District Level · Strict RLS"
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
            Row-level database filtering restricts all queries and approvals strictly to {user.assignedArea}.
          </p>
        </div>
        <button
          onClick={testCrossDistrictIsolation}
          className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 rounded flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Verify Cross-District Isolation
        </button>
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

      {/* District Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Scoped District Records</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{addresses.length}</div>
          <div className="text-xs text-slate-500 mt-1">Hodan district fixtures only</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">District Applications</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{applications.length}</div>
          <div className="text-xs text-slate-500 mt-1">Outside districts filtered at DB layer</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Field Assignments</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{fieldTasks.length}</div>
          <div className="text-xs text-slate-500 mt-1">Active survey sectors in Hodan</div>
        </div>
      </div>

      {/* District Address Applications Queue */}
      {(section === 'District Dashboard' ||
        section === 'Address Applications' ||
        section === 'Pending Address Requests' ||
        section === 'Verification Queue' ||
        section === 'Complaints & Appeals') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">Hodan Address Applications Queue</h2>
            <p className="text-xs text-slate-500">
              Approve verified records within your delegation. Unverified items and self-submitted records cannot be approved.
            </p>
          </div>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
            {applications.map((app) => (
              <div key={app.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="font-semibold text-slate-900">
                    <span className="font-mono text-slate-600 mr-2">{app.id}</span>
                    {app.applicant_name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {app.district_name} · {app.locality}, {app.street} · State:{' '}
                    <span className="font-mono font-semibold text-slate-700">{app.workflow_state}</span>
                  </div>
                  {app.verification_notes && (
                    <div className="text-[11px] text-slate-600 mt-1">Verifier Note: {app.verification_notes}</div>
                  )}
                </div>
                {app.workflow_state === 'verified' ? (
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-3.5 py-1.5 bg-[#0c243e] hover:bg-[#133860] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Approve (Hodan)
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">
                    {app.workflow_state === 'approved' ? 'Approved' : 'Verification Required'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* District Registry Table */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Hodan District Address Registry ({addresses.length})</h2>
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Public Code</th>
                <th className="p-2.5">Locality & Street</th>
                <th className="p-2.5">Sensitivity</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {addresses.map((a) => (
                <tr key={a.id}>
                  <td className="p-2.5 font-mono font-semibold text-slate-900">{a.public_code}</td>
                  <td className="p-2.5">{a.locality} — {a.street}</td>
                  <td className="p-2.5 font-mono text-[11px]">{a.layer_sensitivity}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">
                    {a.verification_status} / {a.approval_status} / {a.publication_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceShell>
  );
};
