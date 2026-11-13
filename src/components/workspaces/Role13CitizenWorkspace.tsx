import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { Search, CheckCircle2, AlertTriangle, Send, QrCode } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role13CitizenWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'public_citizen')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Search Address');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'public_citizen') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [publicAddresses, setPublicAddresses] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState<any>(null);

  // New Address Request Form
  const [districtId, setDistrictId] = useState('dis-hodan');
  const [locality, setLocality] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [propertyType, setPropertyType] = useState('residential');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async (q = '') => {
    try {
      const [pubRes, distRes, reqRes] = await Promise.all([
        apiRequest(`/api/public/addresses${q ? `?q=${encodeURIComponent(q)}` : ''}`, { skipAuth: true }),
        apiRequest('/api/public/districts', { skipAuth: true }),
        apiRequest('/api/citizen/my-requests')
      ]);
      setPublicAddresses(pubRes.addresses || []);
      setDistricts(distRes.districts || []);
      setMyRequests(reqRes.requests || []);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    try {
      const res = await apiRequest('/api/citizen/requests', {
        method: 'POST',
        body: {
          applicantName: user.fullName,
          districtId,
          locality,
          street,
          buildingNumber,
          propertyType
        }
      });
      setLocality('');
      setStreet('');
      setBuildingNumber('');
      setNotice({ type: 'ok', text: `Submitted new address request ${res.id} (Status: ${res.workflowState}).` });
      await load();
      setSection('My Applications');
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  const inspectPublicCode = async (code: string) => {
    setNotice(null);
    try {
      const res = await apiRequest(`/api/public/addresses/${encodeURIComponent(code)}`, { skipAuth: true });
      setSelectedCode(res.address);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="Public Citizen Service Portal"
      roleTitle="Public Citizen"
      roleCode="R13"
      tierText="Citizen Access · Separated Surface"
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
            Verify published public address codes, submit new address registration requests, and track your own applications.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700">Public Published Registry Only</span>
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

      {/* Search Published Public Addresses */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search published SDAS code (e.g. SDAS-MOG-7482) or street..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded bg-slate-50"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#0c243e] text-white text-xs font-medium rounded cursor-pointer">
            Search Public Registry
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {publicAddresses.map((addr) => (
            <div key={addr.id} className="p-3.5 border border-slate-200 rounded flex justify-between items-start gap-2">
              <div>
                <div className="font-mono font-bold text-slate-900">{addr.public_code}</div>
                <div className="text-slate-700 mt-0.5">{addr.district_name} · {addr.locality}</div>
                <div className="text-[11px] text-slate-500">{addr.street} #{addr.building_number}</div>
              </div>
              <button
                onClick={() => inspectPublicCode(addr.public_code)}
                className="px-2.5 py-1 border border-slate-300 hover:bg-slate-50 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3 h-3" /> Verify Code
              </button>
            </div>
          ))}
        </div>

        {selectedCode && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
            <div className="font-mono font-bold text-slate-900">Verified Public Certificate: {selectedCode.public_code}</div>
            <div className="text-slate-700">
              {selectedCode.district_name}, {selectedCode.locality} — {selectedCode.street} #{selectedCode.building_number}
            </div>
            <div className="font-mono text-[11px] text-slate-500 tabular-nums">
              Coordinates: {selectedCode.lat}, {selectedCode.lon} · Designation: {selectedCode.designation_status}
            </div>
          </div>
        )}
      </div>

      {/* Submit New Address Request */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">Request New Address / Correction</h2>
        <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
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
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="Locality / Neighborhood"
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Street Name"
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            value={buildingNumber}
            onChange={(e) => setBuildingNumber(e.target.value)}
            placeholder="Building No."
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-[#0c243e] hover:bg-[#133860] text-white rounded px-3 py-2 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Submit Request
          </button>
        </form>
      </div>

      {/* My Submitted Applications (Strict Ownership Isolation) */}
      <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900">My Applications ({myRequests.length})</h2>
        <div className="divide-y divide-slate-200 border border-slate-200 rounded text-xs">
          {myRequests.map((r) => (
            <div key={r.id} className="p-3.5 flex justify-between items-center">
              <div>
                <div className="font-mono font-bold text-slate-900">{r.id}</div>
                <div className="text-slate-700">{r.district_name} · {r.locality}, {r.street} #{r.building_number || '—'}</div>
              </div>
              <span className="font-mono text-[11px] font-semibold text-slate-700">{r.workflow_state}</span>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
};
