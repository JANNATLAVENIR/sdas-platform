import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import {
  Wifi,
  WifiOff,
  MapPin,
  Camera,
  RefreshCw,
  LogOut,
  Globe,
  ClipboardList,
  PlusSquare,
  HardDrive,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

import type { Language } from '../../types/sdas';
import { WorkspaceRouteContext } from '../../routing/WorkspaceRouteContext';
import { MODULE_ROUTES, rolePath } from '../../routing/routeRegistry';
import { ModuleWorkspaceView } from './ModuleWorkspaceView';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

interface OfflineObservation {
  clientUuid: string;
  structureLabel: string;
  districtId: string;
  locality: string;
  street: string;
  buildingNumber: string;
  propertyType: string;
  lat: number;
  lon: number;
  accuracyMeters: number;
  photoRef: string;
  capturedAt: string;
}

const OFFLINE_STORAGE_KEY = 'sdas_field_offline_queue_v1';

export const Role10FieldSurveyorMobileWorkspace: React.FC<Props> = ({ user, onLogout, onBackToPublicPortal }) => {
  const route = React.useContext(WorkspaceRouteContext);
  const [tab, setTab] = useState<'tasks' | 'capture' | 'offline' | 'synced'>('tasks');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineObservation[]>(() => {
    try {
      const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Capture form (NO occupant PII collected by field surveyors)
  const [structureLabel, setStructureLabel] = useState('Commercial Shopfront Structure');
  const [locality, setLocality] = useState('Taleex Sector 4');
  const [street, setStreet] = useState('Wadada Taleex');
  const [buildingNumber, setBuildingNumber] = useState('420');
  const [propertyType, setPropertyType] = useState('residential');
  const [lat, setLat] = useState(2.0376);
  const [lon, setLon] = useState(45.3192);
  const [accuracyMeters, setAccuracyMeters] = useState(1.1);
  const [photoRef, setPhotoRef] = useState('GNSS-CAM-2026-01.jpg');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const navigateTab = (next: 'tasks' | 'capture' | 'offline' | 'synced') => {
    setTab(next);
    const module = next === 'tasks' ? 'My Assigned Tasks' : next === 'capture' ? 'GPS Capture' : next === 'offline' ? 'Offline Records' : 'Submission History';
    const path = rolePath('field_surveyor', module);
    if (path !== '/') window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineQueue));
    } catch {
      // ignore storage errors
    }
  }, [offlineQueue]);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const loadTasks = async () => {
    if (isOffline) return;
    try {
      const res = await apiRequest('/api/field/my-tasks');
      setTasks(res.tasks || []);
      setSubmissions(res.submissions || []);
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    loadTasks();
  }, [isOffline]);

  useEffect(() => {
    if (!route || route.role !== 'field_surveyor') return;
    if (/capture|registration|observation|entrance/.test(route.slug)) setTab('capture');
    else if (/offline|synchronization/.test(route.slug)) setTab('offline');
    else if (/history/.test(route.slug)) setTab('synced');
    else setTab('tasks');
  }, [route]);

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const obs: OfflineObservation = {
      clientUuid: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}`,
      structureLabel,
      districtId: user.districtId || 'dis-hodan',
      locality,
      street,
      buildingNumber,
      propertyType,
      lat: Number(lat),
      lon: Number(lon),
      accuracyMeters: Number(accuracyMeters),
      photoRef,
      capturedAt: new Date().toISOString()
    };

    if (isOffline) {
      setOfflineQueue((prev) => [obs, ...prev]);
      setNotice({
        type: 'ok',
        text: `Saved offline to device cache (${obs.clientUuid.slice(0, 8)}). Switch Online to sync idempotently.`
      });
      setTab('offline');
      return;
    }

    try {
      const res = await apiRequest('/api/field/sync', {
        method: 'POST',
        body: { observations: [obs] }
      });
      setNotice({ type: 'ok', text: `Submitted live observation (${res.syncedIds?.[0] || 'synced'}).` });
      await loadTasks();
      setTab('synced');
    } catch (err: any) {
      // Fall back to offline cache if request cannot complete
      setOfflineQueue((prev) => [obs, ...prev]);
      setNotice({ type: 'err', text: `Network sync unavailable (${err.message}); cached locally on device.` });
    }
  };

  const handleSyncOfflineQueue = async () => {
    if (isOffline) {
      setNotice({ type: 'err', text: 'Device is offline. Switch to Online before syncing queued records.' });
      return;
    }
    if (offlineQueue.length === 0) return;
    setNotice(null);
    try {
      const res = await apiRequest('/api/field/sync', {
        method: 'POST',
        body: { observations: offlineQueue }
      });
      setOfflineQueue([]);
      setNotice({
        type: 'ok',
        text: `Synced ${res.syncedIds?.length || 0} new (${res.deduplicatedIds?.length || 0} deduplicated) records.`
      });
      await loadTasks();
      setTab('synced');
    } catch (err: any) {
      setNotice({ type: 'err', text: err.message });
    }
  };

  const handleSampleGnssFix = () => {
    setLat(Number((2.037 + Math.random() * 0.002).toFixed(5)));
    setLon(Number((45.318 + Math.random() * 0.002).toFixed(5)));
    setAccuracyMeters(Number((0.7 + Math.random() * 0.8).toFixed(1)));
  };

  if (route?.role === 'field_surveyor' && !route.implemented) return <ModuleWorkspaceView route={route} roleName="Field Surveyor" scope={user.assignedArea} />;

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center sm:py-6">
      {/* Mobile-First Viewport Frame */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[820px] bg-white sm:border sm:border-slate-300 sm:rounded-lg flex flex-col justify-between overflow-hidden">
        {/* Compact Mobile Top Header */}
        <header className="bg-[#0c243e] text-white px-4 py-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-slate-300">R10 · FIELD SURVEYOR MOBILE</div>
            <div className="font-semibold text-sm truncate">{user.fullName}</div>
            <div className="text-[11px] text-slate-300 truncate">{user.assignedArea}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onBackToPublicPortal}
              title="Public Portal"
              className="p-2 border border-slate-600 rounded text-slate-200 hover:text-white cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 bg-[#133860] rounded text-white hover:bg-[#194778] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-3 py-2"><div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">R10 modules · {route?.module || 'My Assigned Tasks'}</div><nav aria-label="Field survey modules" className="flex gap-1 overflow-x-auto">{MODULE_ROUTES.filter(item=>item.role==='field_surveyor').map(item=><button key={item.path} aria-current={item.path===route?.path?'page':undefined} onClick={()=>{window.history.pushState({},'',item.path);window.dispatchEvent(new PopStateEvent('popstate'));}} className={`shrink-0 rounded px-2 py-1 text-[10px] ${item.path===route?.path?'bg-[#0c243e] text-white':'bg-slate-100 text-slate-700'}`}>{item.module}</button>)}</nav></div>

        {/* Connectivity & Sync Status Strip */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2.5 py-1 rounded border font-medium flex items-center gap-1.5 cursor-pointer ${
              isOffline
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Offline Mode (Tap to Go Online)' : 'Online (Tap to Test Offline)'}</span>
          </button>
          <span className="font-mono text-[11px] text-slate-600 tabular-nums">
            Queue: {offlineQueue.length}
          </span>
        </div>

        {/* Mobile Body */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {notice && (
            <div
              className={`p-3 rounded border text-xs flex items-start gap-2 ${
                notice.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {notice.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          {tab === 'tasks' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-slate-900">Assigned Survey Areas (Hodan Only)</h2>
              <p className="text-xs text-slate-500">
                Verification and official approval controls are hidden by policy. Field captures submit directly for independent review.
              </p>
              {tasks.length === 0 ? (
                <div className="p-4 border border-slate-200 rounded text-xs text-slate-500">
                  {isOffline ? 'Offline mode active — use Capture tab to queue observations locally.' : 'No active tasks found.'}
                </div>
              ) : (
                tasks.map((t) => (
                  <div key={t.id} className="p-3.5 border border-slate-200 rounded space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-slate-900">{t.id}</span>
                      <span className="font-mono text-slate-600 tabular-nums">
                        {t.completed_count}/{t.target_count} structures
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-900">{t.project_name}</div>
                    <div className="text-xs text-slate-500">{t.assigned_area}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'capture' && (
            <form onSubmit={handleSaveObservation} className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-slate-900">Building & Entrance Capture</h2>
                <button
                  type="button"
                  onClick={handleSampleGnssFix}
                  className="px-2.5 py-1 border border-slate-300 rounded font-medium flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" /> Read GNSS Fix
                </button>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                Privacy Policy: Zero occupant personal names, phones, or ID numbers collected on field devices.
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Structure Descriptor</label>
                <input
                  type="text"
                  value={structureLabel}
                  onChange={(e) => setStructureLabel(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Locality (Sector)</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Street Name</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Entrance Number</label>
                  <input
                    type="text"
                    value={buildingNumber}
                    onChange={(e) => setBuildingNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Structure Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="public_facility">Public Facility</option>
                    <option value="administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2 py-2 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lon}
                    onChange={(e) => setLon(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2 py-2 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Accuracy (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={accuracyMeters}
                    onChange={(e) => setAccuracyMeters(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2 py-2 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> Photo Evidence Reference
                </label>
                <input
                  type="text"
                  value={photoRef}
                  onChange={(e) => setPhotoRef(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0c243e] hover:bg-[#133860] text-white font-semibold rounded text-xs cursor-pointer"
              >
                {isOffline ? 'Save Observation Offline' : 'Submit Observation to Queue'}
              </button>
            </form>
          )}

          {tab === 'offline' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-slate-900">Offline Queue ({offlineQueue.length})</h2>
                <button
                  onClick={handleSyncOfflineQueue}
                  disabled={offlineQueue.length === 0 || isOffline}
                  className="px-3 py-1.5 bg-[#0c243e] disabled:bg-slate-300 text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync All
                </button>
              </div>
              {offlineQueue.length === 0 ? (
                <div className="p-4 border border-slate-200 rounded text-slate-500">
                  Device offline queue is empty. Toggle Offline Mode above to test persistent offline capture.
                </div>
              ) : (
                offlineQueue.map((item) => (
                  <div key={item.clientUuid} className="p-3 border border-slate-200 rounded space-y-1">
                    <div className="font-semibold text-slate-900">{item.structureLabel}</div>
                    <div className="text-[11px] text-slate-600">{item.locality}, {item.street} #{item.buildingNumber}</div>
                    <div className="font-mono text-[10px] text-slate-500">UUID: {item.clientUuid}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'synced' && (
            <div className="space-y-3 text-xs">
              <h2 className="font-semibold text-sm text-slate-900">My Field Submissions ({submissions.length})</h2>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded">
                {submissions.map((s) => (
                  <div key={s.id} className="p-3 space-y-0.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="font-bold text-slate-900">{s.id}</span>
                      <span className="text-slate-600">{s.workflow_state}</span>
                    </div>
                    <div className="font-medium text-slate-800">{s.applicant_name}</div>
                    <div className="text-[11px] text-slate-500">{s.locality}, {s.street}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Persistent Mobile Bottom Tab Bar */}
        <nav className="grid grid-cols-4 border-t border-slate-200 bg-white text-[11px]">
          <button
            onClick={() => navigateTab('tasks')}
            className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${
              tab === 'tasks' ? 'text-[#0c243e] font-bold bg-slate-50' : 'text-slate-500'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => navigateTab('capture')}
            className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${
              tab === 'capture' ? 'text-[#0c243e] font-bold bg-slate-50' : 'text-slate-500'
            }`}
          >
            <PlusSquare className="w-4 h-4" />
            <span>Capture</span>
          </button>
          <button
            onClick={() => navigateTab('offline')}
            className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${
              tab === 'offline' ? 'text-[#0c243e] font-bold bg-slate-50' : 'text-slate-500'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Offline ({offlineQueue.length})</span>
          </button>
          <button
            onClick={() => navigateTab('synced')}
            className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${
              tab === 'synced' ? 'text-[#0c243e] font-bold bg-slate-50' : 'text-slate-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Synced</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
