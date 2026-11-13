import { routeForPath } from '../../routing/routeRegistry';
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../api/sdasClient';
import type { AuthUser } from '../../api/sdasClient';
import { WorkspaceShell } from './WorkspaceShell';
import { ALL_ROLES } from '../../data/rolesData';
import { getLocalizedModules } from '../../utils/rolePolicy';
import type { Language } from '../../types/sdas';
import { CheckCircle2, AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';

interface Props {
  user: AuthUser;
  language?: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
}

export const Role11AddressVerifierWorkspace: React.FC<Props> = ({ user, language = 'so', onLogout, onBackToPublicPortal }) => {
  const roleDef = ALL_ROLES.find((r) => r.id === 'address_verifier')!;
  const [section, setSection] = useState(routeForPath(window.location.pathname)?.module || 'Verification Dashboard');
  useEffect(() => { const syncRoute = () => { const route = routeForPath(window.location.pathname); if (route?.role === 'address_verifier') setSection(route.module); }; window.addEventListener('popstate', syncRoute); return () => window.removeEventListener('popstate', syncRoute); }, []);
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [returnNotes, setReturnNotes] = useState('');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await apiRequest('/api/verification/queue');
      const items = res.queue || [];
      setQueue(items);
      if (items.length > 0 && !selectedId) {
        setSelectedId(items[0].id);
      }
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedItem = queue.find((q) => q.id === selectedId) || queue[0] || null;

  const handleDecision = async (decision: 'verified' | 'correction_requested') => {
    if (!selectedItem) return;
    setNotice(null);
    try {
      const res = await apiRequest(`/api/verification/${selectedItem.id}/decide`, {
        method: 'POST',
        body: { decision, notes: decision === 'correction_requested' ? returnNotes : 'GNSS & evidence verified' }
      });
      setNotice({ type: 'ok', text: `${res.id} updated to '${res.workflowState}'.` });
      setReturnNotes('');
      await load();
    } catch (e: any) {
      setNotice({ type: 'err', text: e.message });
    }
  };

  return (
    <WorkspaceShell
      portalLabel="Independent Address Verification"
      roleTitle="Address Verifier"
      roleCode="R11"
      tierText="Verification Level · Hodan & Warta"
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
            Verify building existence, GNSS horizontal precision, and storefront photo evidence. Self-submitted items are blocked.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-700 tabular-nums">
          {queue.length} Scoped Records · Final Approval Disabled
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Queue List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 font-semibold text-xs text-slate-900">
            Pending Verification Queue
          </div>
          <div className="divide-y divide-slate-200 text-xs">
            {queue.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-3.5 transition cursor-pointer ${
                    isSelected ? 'bg-[#0c243e] text-white' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="font-bold">{item.id}</span>
                    <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>{item.workflow_state}</span>
                  </div>
                  <div className="font-semibold mt-1">{item.applicant_name}</div>
                  <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {item.district_name} · {item.locality}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Evidence Inspector */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-4">
          {selectedItem ? (
            <>
              <div className="border-b border-slate-200 pb-3">
                <div className="text-xs font-mono text-slate-500">{selectedItem.id} · State: {selectedItem.workflow_state}</div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedItem.applicant_name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-slate-500">District & Street</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {selectedItem.district_name} — {selectedItem.street} #{selectedItem.building_number || '—'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-slate-500">GNSS Coordinates</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {selectedItem.lat ?? '—'}, {selectedItem.lon ?? '—'} (±{selectedItem.accuracy_meters ?? '—'}m)
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-slate-500">Photo Evidence File</div>
                  <div className="font-mono text-slate-900 mt-0.5">{selectedItem.photo_evidence_ref || 'None attached'}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="text-slate-500">Submitted By User ID</div>
                  <div className="font-mono text-slate-900 mt-0.5">
                    {selectedItem.submitted_by}
                    {selectedItem.submitted_by === user.id ? ' (Self — SoD Blocked)' : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block font-medium text-slate-700">
                  Correction Notes (Mandatory min 5 characters when returning for correction)
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={2}
                  placeholder="Describe coordinate discrepancy, blurry entrance photo, or duplicate warning..."
                  className="w-full border border-slate-300 rounded p-2.5 bg-slate-50"
                />
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => handleDecision('verified')}
                  className="px-4 py-2 bg-[#0c243e] hover:bg-[#133860] text-white text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" /> Verify Evidence
                </button>
                <button
                  onClick={() => handleDecision('correction_requested')}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Return for Correction
                </button>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">Select an item from the verification queue to inspect evidence.</div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
};
