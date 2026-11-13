import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { CheckCircle2, AlertTriangle, Plus, RotateCcw } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role09FieldSupervisorWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'field_ops_supervisor')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Field Operations Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'field_ops_supervisor') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [tasks, setTasks] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [districtId, setDistrictId] = useState('dis-hodan');
  const [assignedArea, setAssignedArea] = useState('');
  const [targetCount, setTargetCount] = useState(30);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const [taskRes, distRes] = await Promise.all([
        apiRequest('/api/field-ops/tasks'),
        apiRequest('/api/public/districts', { skipAuth: true })
      ]);
      setTasks(taskRes.tasks || []);
      setDistricts(distRes.districts || []);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    try {
      const res = await apiRequest('/api/field-ops/tasks', {
        method: 'POST',
        body: { projectName, districtId, assignedArea, targetCount: Number(targetCount) }
      });
      setProjectName('');
      setAssignedArea('');
      setNotice({ type: 'ok', text: `Survey project ${res.id} assigned to field team.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const handleFlagQa = async (taskId: string) => {
    setNotice(null);
    try {
      await apiRequest(`/api/field-ops/tasks/${taskId}/qa-recheck`, { method: 'POST' });
      setNotice({ type: 'ok', text: `Task ${taskId} flagged for field QA recheck.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="Field Operations Supervision"
      roleTitle="Field Operations Supervisor"
      roleCode="R09"
      tierText="Field Supervision · Regional / District"
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
            Create field survey projects, assign sectors to field surveyors, monitor GNSS progress, and flag packages for QA recheck.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700">Verification & Final Approval Disabled</span>
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

      {/* Create Survey Project */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Assign New Field Survey Project</h2>
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Survey Project Title"
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2 sm:col-span-2"
            required
          />
          <select
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={assignedArea}
            onChange={(e) => setAssignedArea(e.target.value)}
            placeholder="Sector / Block Name"
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-[#0c243e] hover:bg-[#133860] text-white rounded px-3 py-2 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Assign ({targetCount})
          </button>
        </form>
      </div>

      {/* Survey Tasks List */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Active Survey Teams & Sync Monitoring ({tasks.length})</h2>
        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {tasks.map((t) => (
            <div key={t.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="font-semibold text-slate-900">
                  <span className="font-mono text-slate-600 mr-2">{t.id}</span>
                  {t.project_name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  {t.district_name} · {t.assigned_area} · Surveyor: {t.surveyor_name} · Progress: {t.completed_count}/{t.target_count}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {t.qa_recheck ? (
                  <span className="font-mono text-[11px] text-amber-800 font-semibold">QA RECHECK FLAGGED</span>
                ) : (
                  <button
                    onClick={() => handleFlagQa(t.id)}
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Flag QA Recheck
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
};
