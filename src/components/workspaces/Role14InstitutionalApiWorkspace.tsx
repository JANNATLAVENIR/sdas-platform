import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { KeyRound, Play, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role14InstitutionalApiWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'institutional_api_client')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'API Credentials');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'institutional_api_client') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [credential, setCredential] = useState<any>(null);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [lookupCode, setLookupCode] = useState('SDAS-MOG-7482');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await apiRequest('/api/partner/overview');
      setCredential(res.credential || null);
      setUsageLogs(res.usageLogs || []);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRotateKey = async () => {
    setNotice(null);
    try {
      const res = await apiRequest('/api/partner/credentials/rotate', { method: 'POST' });
      setNotice({ type: 'ok', text: `API key rotated. Previous key immediately invalidated (${res.apiKey.slice(0, 18)}...).` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const handleTestEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setApiResponse('');
    try {
      const res = await apiRequest(`/api/v1/addresses/${encodeURIComponent(lookupCode)}`, {
        apiKey: credential?.api_key,
        skipAuth: true
      });
      setApiResponse(JSON.stringify(res, null, 2));
      await load();
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
      await load();
    }
  };

  return (
    <WorkspaceShell
      portalLabel="Institutional API Integration Console"
      roleTitle="Institutional API Client"
      roleCode="R14"
      tierText="Partner Integration · Scoped Read API"
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
            Scoped institutional read-only API access for postal dispatch, telecom, utility, and emergency 888/999 integration.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700">Registry Writes Blocked · Restricted Sites Excluded</span>
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

      {/* Credential & Rate Limit Panel */}
      {credential && (
        <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs text-slate-500">Authorized Partner Organization</div>
              <div className="font-bold text-sm text-slate-900">{credential.org_name}</div>
            </div>
            <button
              onClick={handleRotateKey}
              className="px-3.5 py-2 bg-[#0c243e] hover:bg-[#133860] text-white text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rotate API Key
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <div className="text-slate-500 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Active X-API-Key
              </div>
              <div className="font-mono font-bold text-slate-900 mt-1 break-all">{credential.api_key}</div>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <div className="text-slate-500">Daily Rate Quota</div>
              <div className="font-mono font-bold text-slate-900 mt-1 tabular-nums">
                {Number(credential.requests_today).toLocaleString()} / {Number(credential.rate_limit_per_day).toLocaleString()} requests
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <div className="text-slate-500">Granted Scopes</div>
              <div className="font-mono text-[11px] text-slate-800 mt-1">{credential.scopes}</div>
            </div>
          </div>
        </div>
      )}

      {/* Live Scoped Endpoint Tester */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Address Lookup API Tester (GET /api/v1/addresses/:code)</h2>
        <p className="text-xs text-slate-500">
          Executes a real X-API-Key call. Try <span className="font-mono">SDAS-MOG-7482</span> (published) vs{' '}
          <span className="font-mono">SDAS-MOG-8801</span> (restricted substation — automatically excluded).
        </p>
        <form onSubmit={handleTestEndpoint} className="flex gap-2 text-xs">
          <input
            type="text"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 font-mono"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#0c243e] hover:bg-[#133860] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> Execute GET
          </button>
        </form>

        {apiResponse && (
          <pre className="p-3.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto">
            {apiResponse}
          </pre>
        )}
      </div>

      {/* Integration Request Logs */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Integration Usage Logs ({usageLogs.length})</h2>
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Correlation ID</th>
                <th className="p-2.5">Endpoint</th>
                <th className="p-2.5">HTTP Status</th>
                <th className="p-2.5">Latency</th>
                <th className="p-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px] tabular-nums">
              {usageLogs.map((u) => (
                <tr key={u.id}>
                  <td className="p-2.5 font-semibold text-slate-900">{u.correlation_id}</td>
                  <td className="p-2.5">{u.endpoint}</td>
                  <td className={`p-2.5 font-bold ${u.status_code === 200 ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {u.status_code}
                  </td>
                  <td className="p-2.5">{u.latency_ms}ms</td>
                  <td className="p-2.5 text-slate-500">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceShell>
  );
};
