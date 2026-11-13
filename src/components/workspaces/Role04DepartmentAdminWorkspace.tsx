import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role04DepartmentAdminWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'department_admin')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Department Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'department_admin') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [tasks, setTasks] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [departmentName, setDepartmentName] = useState(user.department);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await apiRequest('/api/department/tasks');
      setTasks(res.tasks || []);
      setStaff(res.staff || []);
      setDepartmentName(res.department || user.department);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reassignTask = async (taskId: string, assignedTo: string) => {
    setNotice(null);
    try {
      await apiRequest(`/api/department/tasks/${taskId}/assign`, {
        method: 'PATCH',
        body: { assignedTo }
      });
      setNotice({ type: 'ok', text: `Task ${taskId} reassigned to ${assignedTo}.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const escalateTask = async (taskId: string) => {
    setNotice(null);
    try {
      await apiRequest(`/api/department/tasks/${taskId}/escalate`, { method: 'POST' });
      setNotice({ type: 'ok', text: `Task ${taskId} escalated to senior regional/executive authority.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="Department Operations"
      roleTitle="Department Administrator"
      roleCode="R04"
      tierText="Department Level · Scoped"
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
            Scoped strictly to {departmentName}. Cross-department tasks are isolated by backend authorization.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700 tabular-nums">{tasks.length} Departmental Tasks</span>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-md border text-xs flex items-center gap-2 ${
          notice.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {notice.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Department Work Queue */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Department Work Queue & Staff Assignments</h2>
        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {tasks.map((t) => (
            <div key={t.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="font-semibold text-slate-900">
                  <span className="font-mono text-slate-600 mr-2">{t.id}</span>
                  {t.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  Assignee: {t.assigned_to} · Status: {t.status} · SLA Due: {t.sla_due}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={t.assigned_to}
                  onChange={(e) => reassignTask(t.id, e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                >
                  <option value="Khadra Cabdi Maxamed">Khadra Cabdi Maxamed</option>
                  <option value="Saciid Cabdi Faarax">Saciid Cabdi Faarax</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.full_name}>{s.full_name}</option>
                  ))}
                </select>
                {t.status !== 'escalated' && (
                  <button
                    onClick={() => escalateTask(t.id)}
                    className="px-3 py-1.5 bg-[#0c243e] hover:bg-[#133860] text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Escalate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Staff Directory */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Department Staff ({staff.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {staff.map((s) => (
            <div key={s.id} className="p-3.5 border border-slate-200 rounded bg-slate-50">
              <div className="font-semibold text-slate-900">{s.full_name}</div>
              <div className="font-mono text-[11px] text-slate-600 mt-0.5">{s.role}</div>
              <div className="text-[11px] text-slate-500 mt-1">{s.assigned_area}</div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
};
