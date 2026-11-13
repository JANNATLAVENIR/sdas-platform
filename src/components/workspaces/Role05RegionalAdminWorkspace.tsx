import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { CheckCircle2, AlertTriangle, Globe, FileCheck } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role05RegionalAdminWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'regional_admin')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Regional Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'regional_admin') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [districts, setDistricts] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [fieldTasks, setFieldTasks] = useState<any[]>([]);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const [distRes, regRes, appRes, opsRes] = await Promise.all([
        apiRequest('/api/public/districts', { skipAuth: true }),
        apiRequest('/api/registry/addresses'),
        apiRequest('/api/applications'),
        apiRequest('/api/field-ops/tasks')
      ]);
      setDistricts(distRes.districts || []);
      setAddresses(regRes.addresses || []);
      setApplications(appRes.applications || []);
      setFieldTasks(opsRes.tasks || []);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApproveApp = async (appId: string) => {
    setNotice(null);
    try {
      const res = await apiRequest(`/api/applications/${appId}/approve`, { method: 'POST' });
      setNotice({ type: 'ok', text: `Application ${res.id} approved under Regional delegation.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const handlePublishAddress = async (addrId: string) => {
    setNotice(null);
    try {
      const res = await apiRequest(`/api/addresses/${addrId}/publish`, { method: 'POST' });
      setNotice({ type: 'ok', text: `${res.publicCode} published to the Banaadir public address registry.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const totalInventory = districts.reduce((sum, d) => sum + Number(d.estimated_inventory || 0), 0);
  const totalMapped = districts.reduce((sum, d) => sum + Number(d.mapped_buildings || 0), 0);
  const totalApproved = districts.reduce((sum, d) => sum + Number(d.approved_designations || 0), 0);

  return (
    <WorkspaceShell
      portalLabel="Regional Governance · Banaadir"
      roleTitle="Regional Administrator"
      roleCode="R05"
      tierText="Regional Level · BRA Coordination"
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
            Regional coordination across Banaadir districts, delegated address approvals, and public registry publication.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700 tabular-nums">
          Scope: Banaadir Region ({districts.length} Districts Seeded)
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

      {/* Regional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Regional Mapped Structures</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{totalMapped.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">of {totalInventory.toLocaleString()} estimated inventory</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Approved Designations</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{totalApproved.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Across operational districts</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Regional Application Queue</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{applications.length}</div>
          <div className="text-xs text-slate-500 mt-1">Verification & approval workflow tracked</div>
        </div>
      </div>

      {/* District Performance Breakdown */}
      {(section === 'Regional Dashboard' ||
        section === 'Districts Under Region' ||
        section === 'District Performance' ||
        section === 'Regional Reports') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <h2 className="font-semibold text-sm text-slate-900">District Coverage & Operational Performance</h2>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">District</th>
                  <th className="p-2.5">Mapped</th>
                  <th className="p-2.5">Verified Entrances</th>
                  <th className="p-2.5">Approved</th>
                  <th className="p-2.5">Readiness Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums">
                {districts.map((d) => (
                  <tr key={d.id}>
                    <td className="p-2.5 font-semibold text-slate-900">{d.name}</td>
                    <td className="p-2.5">{Number(d.mapped_buildings).toLocaleString()}</td>
                    <td className="p-2.5">{Number(d.verified_entrances).toLocaleString()}</td>
                    <td className="p-2.5">{Number(d.approved_designations).toLocaleString()}</td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-600">{d.readiness_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regional Approval Queue */}
      {(section === 'Regional Dashboard' ||
        section === 'Regional Address Requests' ||
        section === 'Regional Verification Queue' ||
        section === 'Escalations') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">Regional Application Approval Queue</h2>
            <p className="text-xs text-slate-500">Only independently verified applications can be approved (self-approval blocked).</p>
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
                </div>
                {app.workflow_state === 'verified' ? (
                  <button
                    onClick={() => handleApproveApp(app.id)}
                    className="px-3.5 py-1.5 bg-[#0c243e] hover:bg-[#133860] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Approve Application
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">
                    {app.workflow_state === 'approved' ? 'Approved' : 'Awaiting Verification'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Address Publication Queue */}
      {(section === 'Regional Dashboard' ||
        section === 'Regional Address Registry' ||
        section === 'Regional Coverage Map') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-sm text-slate-900">Regional Registry & Publication Control</h2>
            <p className="text-xs text-slate-500">Publish verified and approved addresses to the public registry.</p>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Public Code</th>
                  <th className="p-2.5">District</th>
                  <th className="p-2.5">Street & Locality</th>
                  <th className="p-2.5">Verification / Approval</th>
                  <th className="p-2.5 text-right">Publication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {addresses.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2.5 font-mono font-semibold text-slate-900">{a.public_code}</td>
                    <td className="p-2.5">{a.district_name}</td>
                    <td className="p-2.5 text-slate-700">{a.locality} — {a.street}</td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-600">
                      {a.verification_status} / {a.approval_status}
                    </td>
                    <td className="p-2.5 text-right">
                      {a.publication_status === 'unpublished' && a.approval_status === 'approved' ? (
                        <button
                          onClick={() => handlePublishAddress(a.id)}
                          className="px-3 py-1 bg-[#0c243e] hover:bg-[#133860] text-white rounded text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Globe className="w-3 h-3" /> Publish
                        </button>
                      ) : (
                        <span className="font-mono text-[11px] text-slate-600">{a.publication_status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Field Operations Summary */}
      {section === 'Field Operations' && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <h2 className="font-semibold text-sm text-slate-900">Regional Field Survey Operations ({fieldTasks.length})</h2>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
            {fieldTasks.map((t) => (
              <div key={t.id} className="p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900">{t.project_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {t.district_name} · {t.assigned_area} · Surveyor: {t.surveyor_name}
                  </div>
                </div>
                <div className="font-mono text-xs tabular-nums text-slate-700">
                  {t.completed_count}/{t.target_count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
};
