import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { Lock, Unlock, UserPlus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
  onBreakGlassChanged?: (active: boolean) => void;
}

export const Role01SuperAdminWorkspace: React.FC<Props> = ({
  user,
  language = 'so',
  onLogout,
  onBackToPublicPortal,
  onBreakGlassChanged
}) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'national_super_admin')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Global System Overview');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'national_super_admin') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [overview, setOverview] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [ticketRef, setTicketRef] = useState('INC-2026-104');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('district_admin');
  const [newUserDept, setNewUserDept] = useState('District Office (Hodan)');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [ov, reg] = await Promise.all([
        apiRequest('/api/superadmin/overview'),
        apiRequest('/api/registry/addresses')
      ]);
      setOverview(ov);
      setAddresses(reg.addresses || []);
      if (onBreakGlassChanged) onBreakGlassChanged(Boolean(ov.platformHealth?.activeBreakGlass));
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBreakGlass = async (activate: boolean) => {
    setNotice(null);
    try {
      if (activate) {
        await apiRequest('/api/superadmin/break-glass', {
          method: 'POST',
          body: { reason: breakGlassReason, ticketRef }
        });
        setNotice({ type: 'ok', text: 'Break-Glass session activated for 15 minutes and logged to immutable audit trail.' });
      } else {
        await apiRequest('/api/superadmin/break-glass/close', { method: 'POST' });
        setNotice({ type: 'ok', text: 'Break-Glass session closed. Routine address masking restored.' });
      }
      await loadData();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    try {
      await apiRequest('/api/superadmin/users', {
        method: 'POST',
        body: { email: newUserEmail, fullName: newUserName, role: newUserRole, department: newUserDept }
      });
      setNewUserEmail('');
      setNewUserName('');
      setNotice({ type: 'ok', text: 'Administrative account created and recorded in audit log.' });
      await loadData();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const toggleUserStatus = async (id: string, currentlyActive: boolean) => {
    try {
      await apiRequest(`/api/superadmin/users/${id}/status`, {
        method: 'PATCH',
        body: { isActive: !currentlyActive }
      });
      await loadData();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const navItems = getLocalizedModules(roleDef, language);
  const health = overview?.platformHealth;

  return (
    <WorkspaceShell
      portalLabel="Platform Governance"
      roleTitle="National Super Administrator"
      roleCode="R01"
      tierText="Platform Level · Highest Technical Access"
      user={user}
      navItems={navItems}
      activeSection={section}
      onSelectSection={setSection}
      restrictions={roleDef.restrictions}
      onBackToPublicPortal={onBackToPublicPortal}
      onLogout={onLogout}
    >
      <div className="bg-white border border-slate-200 rounded-md p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-serif font-bold text-slate-900">{section}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Technical platform configuration, MFA enforcement, account management, and time-boxed emergency access.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-700 tabular-nums">
          {health?.activeBreakGlass ? 'BREAK-GLASS ACTIVE (15M)' : 'ROUTINE DATA MASKED'}
        </div>
      </div>

      {notice && (
        <div className={`p-3.5 rounded-md border text-xs flex items-center gap-2 ${
          notice.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          {notice.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Platform Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Database & Backup</div>
          <div className="text-sm font-bold text-slate-900 mt-1">{health?.databaseEngine || 'SQLite WAL'}</div>
          <div className="text-xs text-slate-500 mt-1">Immutability triggers active</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Authentication & MFA</div>
          <div className="text-sm font-bold text-slate-900 mt-1">{health?.mfaEnforcement || 'Hardware MFA Enforced'}</div>
          <div className="text-xs text-slate-500 mt-1">Scoped RBAC + Dual Control active</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <div className="text-xs text-slate-500">Official Address Approval</div>
          <div className="text-sm font-bold text-rose-800 mt-1">Permanently Prohibited</div>
          <div className="text-xs text-slate-500 mt-1">Cannot verify, approve, or publish</div>
        </div>
      </div>

      {/* Emergency Break-Glass & Masked Registry Preview */}
      {(section === 'Emergency Access Management' || section === 'Global System Overview' || section === 'Security Monitoring') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="font-semibold text-sm text-slate-900">Emergency Break-Glass & Routine Data Masking</h2>
              <p className="text-xs text-slate-500">
                Street names and coordinates are masked by backend policy unless a reasoned Break-Glass session is active.
              </p>
            </div>
            {health?.activeBreakGlass ? (
              <button
                onClick={() => handleBreakGlass(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Close Break-Glass Session
              </button>
            ) : null}
          </div>

          {!health?.activeBreakGlass && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={ticketRef}
                onChange={(e) => setTicketRef(e.target.value)}
                placeholder="Incident Ticket Ref"
                className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono"
              />
              <input
                type="text"
                value={breakGlassReason}
                onChange={(e) => setBreakGlassReason(e.target.value)}
                placeholder="Mandatory emergency justification (min 8 chars)..."
                className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs sm:col-span-1"
              />
              <button
                onClick={() => handleBreakGlass(true)}
                className="px-4 py-2 bg-[#0c243e] hover:bg-[#133860] text-white text-xs font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" /> Activate 15m Break-Glass
              </button>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Public Code</th>
                  <th className="p-2.5">District</th>
                  <th className="p-2.5">Locality & Street</th>
                  <th className="p-2.5">Coordinates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {addresses.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2.5 font-mono font-semibold text-slate-900">{a.public_code}</td>
                    <td className="p-2.5">{a.district_name}</td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-700">
                      {a.masked ? a.locality : `${a.locality} — ${a.street || '—'}`}
                    </td>
                    <td className="p-2.5 font-mono text-[11px] tabular-nums text-slate-600">
                      {a.masked ? '[MASKED]' : `${a.lat}, ${a.lon}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Accounts & Role Management */}
      {(section === 'User Accounts Management' || section === 'Role & Permission Management' || section === 'Global System Overview') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <h2 className="font-semibold text-sm text-slate-900 border-b border-slate-200 pb-2">
            Accounts & Role Permissions Directory ({overview?.users?.length || 0})
          </h2>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Official Full Name"
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-2"
              required
            />
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="email@sdas.gov.so"
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-2"
              required
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-2"
            >
              {ALL_ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.code} {r.name.en}</option>
              ))}
            </select>
            <input
              type="text"
              value={newUserDept}
              onChange={(e) => setNewUserDept(e.target.value)}
              placeholder="Department"
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-2"
              required
            />
            <button
              type="submit"
              className="bg-[#0c243e] hover:bg-[#133860] text-white rounded px-3 py-2 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Create Account
            </button>
          </form>

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Scope</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(overview?.users || []).map((u: any) => (
                  <tr key={u.id}>
                    <td className="p-2.5 font-medium text-slate-900">{u.full_name}</td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-600">{u.email}</td>
                    <td className="p-2.5 font-mono text-[11px]">{u.role}</td>
                    <td className="p-2.5 text-slate-600">{u.assigned_area}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id, Boolean(u.is_active))}
                        className="px-2.5 py-1 border border-slate-300 rounded text-[11px] font-medium hover:bg-slate-50 cursor-pointer"
                      >
                        {u.is_active ? 'Active (Disable)' : 'Disabled (Enable)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Logs */}
      {(section === 'System Logs' || section === 'Security Monitoring') && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
          <h2 className="font-semibold text-sm text-slate-900">Recent Platform Security & System Logs</h2>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Outcome</th>
                  <th className="p-2">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(overview?.recentLogs || []).map((l: any) => (
                  <tr key={l.id}>
                    <td className="p-2 font-mono text-[11px] tabular-nums text-slate-500">{l.timestamp}</td>
                    <td className="p-2 font-mono text-[11px]">{l.actor_role}</td>
                    <td className="p-2 font-mono text-[11px]">{l.action}</td>
                    <td className="p-2 text-[11px] font-medium">{l.outcome}</td>
                    <td className="p-2 text-slate-600">{l.detail}</td>
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
