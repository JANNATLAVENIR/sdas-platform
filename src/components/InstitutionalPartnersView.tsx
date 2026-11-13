import React, { useState } from 'react';
import { Shield, Ambulance, Truck, Building2, Search, CheckCircle2, ArrowRight, Layers, Key } from 'lucide-react';
import { MOCK_ADDRESSES } from '../data/mockData';

export const InstitutionalPartnersView: React.FC = () => {
  const [partnerType, setPartnerType] = useState<'emergency' | 'postal' | 'utility'>('emergency');
  const [codeQuery, setCodeQuery] = useState('SDAS-MOG-7482');
  const [dispatchResult, setDispatchResult] = useState<any>(MOCK_ADDRESSES[0]);
  const [dispatchedNotice, setDispatchedNotice] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_ADDRESSES.find((a) => a.publicCode.toLowerCase() === codeQuery.trim().toLowerCase());
    setDispatchResult(found || null);
    setDispatchedNotice('');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
            Iridda Hay'adaha & Adeegyada Gurmadka (Institutional & Emergency Gateway)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Xiriirka Booliska (888), Ambalaasta (999), Boostada Qaranka (Somali Post), iyo shirkadaha korontada/biyaha.
          </p>
        </div>
      </div>

      {/* Partner Agency Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setPartnerType('emergency')}
          className={`p-4 rounded-lg border text-left transition flex items-center gap-3 cursor-pointer ${
            partnerType === 'emergency'
              ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Gurmadka Degdegga ah</div>
            <div className="text-[11px] text-slate-500">Ambalaasta & Booliska (888 / 999)</div>
          </div>
        </button>

        <button
          onClick={() => setPartnerType('postal')}
          className={`p-4 rounded-lg border text-left transition flex items-center gap-3 cursor-pointer ${
            partnerType === 'postal'
              ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Boostada Qaranka (Somali Post)</div>
            <div className="text-[11px] text-slate-500">Gaarsiinta xirmooyinka & waraaqaha</div>
          </div>
        </button>

        <button
          onClick={() => setPartnerType('utility')}
          className={`p-4 rounded-lg border text-left transition flex items-center gap-3 cursor-pointer ${
            partnerType === 'utility'
              ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Adeegyada Biyaha & Korontada</div>
            <div className="text-[11px] text-slate-500">Xaqiijinta goobta mitirka & dhismaha</div>
          </div>
        </button>
      </div>

      {/* Instant Geocoding Dispatch Tool */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Raadinta Tooska ah ee Goobta (High-Speed Geocoding Dispatch)
            </h3>
            <span className="text-xs text-slate-500">Geli koodka ciwaanka si aad degdeg ugu hesho jidka ugu dhow iyo iskudhafka ambalaasta.</span>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200 font-bold shrink-0">
            Priority SLA: 12ms
          </span>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={codeQuery}
            onChange={(e) => setCodeQuery(e.target.value)}
            placeholder="SDAS-MOG-7482..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
          <button
            type="submit"
            className="bg-[#0c243e] hover:bg-blue-900 text-white font-semibold px-6 py-2.5 rounded text-xs transition cursor-pointer shrink-0"
          >
            Raadi Goobta Gurmadka
          </button>
        </form>

        {dispatchResult ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4 text-xs">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-900">{dispatchResult.publicCode}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  La Xaqiijiyay
                </span>
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                Iskudhafka GPS: {dispatchResult.location.coordinates[1]}° N, {dispatchResult.location.coordinates[0]}° E
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Degmada:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{dispatchResult.components.district}</span>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Xaafadda & Wadada:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {dispatchResult.components.locality}, {dispatchResult.components.street || 'Wadada Weyn'}
                </span>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Irridda Soo Gelitaanka:</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  Albaabka #{dispatchResult.components.buildingNumber || '1'} (Saxnaanta: 1.2m)
                </span>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-900 p-3 rounded border border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span>Waddada ugu dhow ambalaasta: <strong>Wadada Makka Al-Mukarrama (Jidka 30ka)</strong></span>
              <button
                onClick={() =>
                  setDispatchedNotice(
                    `Iskudhafka GPS-ka (${dispatchResult.publicCode}) waxaa loo gudbiyay nidaamka xiriirka gurmadka.`
                  )
                }
                className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
              >
                U Dir Ambalaasta Goobta
              </button>
            </div>

            {dispatchedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dispatchedNotice}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded border border-slate-200">
            Koodhka lama helin. Fadlan hubi koodka rasmiga ah.
          </div>
        )}
      </div>
    </div>
  );
};
