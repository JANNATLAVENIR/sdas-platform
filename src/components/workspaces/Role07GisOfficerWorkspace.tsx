import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { CheckCircle2, AlertTriangle, Layers, ShieldCheck } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role07GisOfficerWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'gis_officer')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'GIS Workspace');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'gis_officer') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [layers, setLayers] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [referenceCrs, setReferenceCrs] = useState('EPSG:32638');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const [gisRes, regRes] = await Promise.all([
        apiRequest('/api/gis/layers'),
        apiRequest('/api/registry/addresses')
      ]);
      setLayers(gisRes.layers || []);
      setReferenceCrs(gisRes.referenceCrs || 'EPSG:32638');
      setAddresses(regRes.addresses || []);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleValidateLayer = async (layerId: string) => {
    setNotice(null);
    try {
      const res = await apiRequest('/api/gis/validate', {
        method: 'POST',
        body: { layerId }
      });
      setNotice({
        type: 'ok',
        text: `Topology validated for ${res.layerId} (${res.crs}, ${res.overlaps} overlaps detected).`
      });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const handleToggleSensitivity = async (layerId: string, current: string) => {
    setNotice(null);
    const next = current === 'public' ? 'restricted' : 'public';
    try {
      await apiRequest(`/api/gis/layers/${layerId}/sensitivity`, {
        method: 'PATCH',
        body: { sensitivity: next }
      });
      setNotice({ type: 'ok', text: `Layer ${layerId} security classification updated to '${next}'.` });
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="Geospatial Infrastructure"
      roleTitle="GIS Officer"
      roleCode="R07"
      tierText="Geospatial Dept · EPSG:32638"
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
            Administrative boundary layers, street network geometry validation, coordinate checks, and sensitivity classification.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700">CRS: {referenceCrs} · Official Address Approval Disabled</span>
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

      {/* Map Layers & Topology Controls */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" /> Spatial Layers & Sensitivity Classification ({layers.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {layers.map((l) => (
            <div key={l.id} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="font-mono font-bold text-slate-900">
                  {l.id} <span className="font-sans font-semibold text-slate-700 ml-1">· {l.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  CRS: {l.crs} · Features: {Number(l.feature_count).toLocaleString()} · Sensitivity:{' '}
                  <span className="font-mono font-semibold text-slate-700">{l.sensitivity}</span> · Status: {l.validation_status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleValidateLayer(l.id)}
                  className="px-3 py-1.5 bg-[#0c243e] hover:bg-[#133860] text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Validate CRS & Topology
                </button>
                <button
                  onClick={() => handleToggleSensitivity(l.id, l.sensitivity)}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded font-medium cursor-pointer"
                >
                  Set {l.sensitivity === 'public' ? 'Restricted' : 'Public'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address Coordinates Table */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Registered Address Coordinates Verification</h2>
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Public Code</th>
                <th className="p-2.5">District</th>
                <th className="p-2.5">Latitude / Longitude</th>
                <th className="p-2.5">GNSS Accuracy</th>
                <th className="p-2.5">Layer Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums">
              {addresses.map((a) => (
                <tr key={a.id}>
                  <td className="p-2.5 font-mono font-semibold text-slate-900">{a.public_code}</td>
                  <td className="p-2.5">{a.district_name}</td>
                  <td className="p-2.5 font-mono text-[11px]">{a.lat}, {a.lon}</td>
                  <td className="p-2.5 font-mono text-[11px]">±{a.accuracy_meters}m</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-700">{a.layer_sensitivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceShell>
  );
};
