import React, { useEffect, useState } from 'react';
import { AddressRecord, Language, UserRole } from '../types/sdas';
import { MOCK_ADDRESSES, MOCK_DISTRICTS, UI_STRINGS } from '../data/mockData';
import { filterAddressesByRole, filterDistrictsByRole, getRoleExperience } from '../utils/rolePolicy';
import { MapPin, Lock, ShieldAlert } from 'lucide-react';

interface CityMapViewProps {
  language: Language;
  activeRole: UserRole;
  breakGlassActive?: boolean;
  onSelectAddress: (addr: AddressRecord) => void;
}

export const CityMapView: React.FC<CityMapViewProps> = ({
  language,
  activeRole,
  breakGlassActive = false,
  onSelectAddress
}) => {
  const t = UI_STRINGS[language];
  const exp = getRoleExperience(activeRole, breakGlassActive);
  const scopedDistricts = filterDistrictsByRole(MOCK_DISTRICTS, activeRole);
  const scopedAddresses = filterAddressesByRole(MOCK_ADDRESSES, activeRole);

  const [activeDistrictId, setActiveDistrictId] = useState(scopedDistricts[0]?.id || 'dis-hodan');
  const [selectedPin, setSelectedPin] = useState<AddressRecord>(scopedAddresses[0] || MOCK_ADDRESSES[0]);

  useEffect(() => {
    if (!scopedDistricts.some((d) => d.id === activeDistrictId)) {
      setActiveDistrictId(scopedDistricts[0]?.id || 'dis-hodan');
    }
    if (scopedAddresses.length > 0 && !scopedAddresses.some((a) => a.id === selectedPin.id)) {
      setSelectedPin(scopedAddresses[0]);
    }
  }, [activeRole]);

  const currentDistrict = scopedDistricts.find((d) => d.id === activeDistrictId) || scopedDistricts[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            {t.navMap} — Khariidadda Gobolka Banaadir
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {exp.allowedDistrictIds !== 'all'
              ? `Scoped GIS View (${exp.role.code}): ${exp.role.assignedArea}`
              : 'Muuqaalka juqraafi ee degmooyinka, jidadka waaweyn, iyo goobaha la diiwaangeliyay.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exp.isReadOnly && (
            <span className="text-[11px] font-bold bg-slate-800 text-white px-2.5 py-1.5 rounded flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          )}
          <select
            value={activeDistrictId}
            onChange={(e) => setActiveDistrictId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
          >
            {scopedDistricts.map((d) => (
              <option key={d.id} value={d.id}>Degmada {d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {exp.maskCoordinatesAndStreets && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-950 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>R01 Privacy Policy:</strong> Individual street pins and GPS coordinates are masked for National Super Administrator unless Break-Glass is activated.
          </span>
        </div>
      )}

      {/* Main Map Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* District Overview Panel */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Degmada La Doortay</span>
            <h3 className="text-lg font-bold text-slate-900 font-serif">{currentDistrict.name}</h3>
            <p className="text-xs text-slate-500">{currentDistrict.region}, Muqdisho</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">Guryaha Diiwaangashan:</span>
              <span className="font-bold text-slate-900">{currentDistrict.mappedBuildings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">Irridaha La Hubiyay:</span>
              <span className="font-bold text-slate-900">{currentDistrict.verifiedEntrances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">Ciwaanada Rasmiga ah:</span>
              <span className="font-bold text-emerald-800">{currentDistrict.approvedDesignations.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick List of Addresses in this sector */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 block">Goobaha Aaggan ({scopedAddresses.length}):</span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {scopedAddresses.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedPin(item)}
                  className={`w-full text-left p-2 rounded border text-xs transition cursor-pointer flex items-center justify-between ${
                    selectedPin.id === item.id
                      ? 'bg-blue-50 border-blue-900 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono text-[11px]">{item.publicCode}</span>
                  <span className="text-slate-500 text-[10px]">
                    {exp.maskCoordinatesAndStreets ? '[MASKED]' : item.components.locality}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Map Visual Stage */}
        <div className="lg:col-span-3 bg-slate-900 rounded-lg border border-slate-800 shadow-sm relative overflow-hidden flex flex-col min-h-[420px] sm:min-h-[500px]">
          {/* Top Map HUD */}
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:top-4 sm:left-4 z-10 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded text-white text-xs flex items-center justify-between sm:justify-start gap-3 sm:gap-4 shadow-sm">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="truncate">Khariidadda Muqdisho (GIS)</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">Qaybta: {currentDistrict.name}</span>
            <span className="text-slate-400 hidden md:inline">
              {activeRole === 'gis_officer' ? 'CRS: EPSG:32638' : '2.04° N, 45.32° E'}
            </span>
          </div>

          {/* Graphical Map Representation */}
          <div className="flex-1 relative flex items-center justify-center p-3 pt-16 sm:p-8 sm:pt-16 bg-[#091524]">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>

            <div className="relative w-full h-full max-w-2xl sm:max-h-96 border border-slate-700/80 rounded-xl bg-slate-950/40 p-3.5 sm:p-6 flex flex-col justify-between gap-3">
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-serif font-bold text-white uppercase tracking-wider text-[11px] sm:text-xs">
                  Banaadir Regional Addressing Grid — {currentDistrict.name}
                </span>
                <span className="font-mono text-emerald-400 text-[11px]">
                  {exp.maskCoordinatesAndStreets ? 'Masked Layer (R01)' : 'Active Layer'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 my-auto py-2 sm:py-4">
                {scopedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedPin(addr)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex flex-col gap-1 ${
                      selectedPin.id === addr.id
                        ? 'bg-blue-900/80 border-blue-400 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{addr.publicCode}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-200 truncate">
                      {exp.maskCoordinatesAndStreets ? '[MASKED BY R01]' : addr.components.locality}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {exp.maskCoordinatesAndStreets
                        ? addr.components.district
                        : (addr.components.street || addr.components.district)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Selected Pin Inspector HUD */}
              <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-xs text-white flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400">{selectedPin.publicCode}</span>
                  <span className="text-slate-400">|</span>
                  <span>
                    {exp.maskCoordinatesAndStreets
                      ? `${selectedPin.components.district} (Coordinates Masked)`
                      : `${selectedPin.components.locality}, ${selectedPin.components.district}`}
                  </span>
                </div>
                <button
                  onClick={() => onSelectAddress(selectedPin)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs transition cursor-pointer"
                >
                  Fiiri Shahaadada Ciwaanka
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
