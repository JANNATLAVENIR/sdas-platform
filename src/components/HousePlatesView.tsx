import React, { useState, useEffect } from 'react';
import { Language, UserRole } from '../types/sdas';
import { MOCK_DISTRICTS } from '../data/mockData';
import { getRoleExperience, filterDistrictsByRole } from '../utils/rolePolicy';
import { QrCode, Plus, Check, Lock, ShieldAlert } from 'lucide-react';

interface HousePlatesViewProps {
  language: Language;
  activeRole: UserRole;
  onOpenSignIn?: () => void;
  onNavigate?: (view: string) => void;
}

export const HousePlatesView: React.FC<HousePlatesViewProps> = ({
  language,
  activeRole,
  onOpenSignIn,
  onNavigate
}) => {
  const exp = getRoleExperience(activeRole);
  const scopedDistricts = filterDistrictsByRole(MOCK_DISTRICTS, activeRole);
  const [district, setDistrict] = useState(scopedDistricts[0]?.name || 'Hodan');
  const [streetNumber, setStreetNumber] = useState('412');
  const [plateCode, setPlateCode] = useState('SDAS-MOG-7482');
  const [plateMaterial, setPlateMaterial] = useState<'metal' | 'reflective'>('reflective');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (scopedDistricts.length > 0 && !scopedDistricts.some((d) => d.name === district)) {
      setDistrict(scopedDistricts[0].name);
    }
  }, [activeRole, scopedDistricts, district]);

  const [orders, setOrders] = useState([
    {
      id: 'PLT-2026-081',
      code: 'SDAS-MOG-7482',
      district: 'Hodan',
      districtId: 'dis-hodan',
      buildingNo: '412',
      type: 'Taariko Bir ah (Reflective Blue)',
      status: 'La Rakibay'
    },
    {
      id: 'PLT-2026-082',
      code: 'SDAS-MOG-3091',
      district: 'Wadajir',
      districtId: 'dis-wadajir',
      buildingNo: '108',
      type: 'Taariko Bir ah (Reflective Blue)',
      status: 'Warshadda Diyaarka ku ah'
    },
    {
      id: 'PLT-2026-083',
      code: 'SDAS-MOG-9124',
      district: 'Shangaani',
      districtId: 'dis-shangaani',
      buildingNo: '014',
      type: 'Calaamad Wadaad ah',
      status: 'La Dalbaday'
    }
  ]);

  const visibleOrders =
    exp.allowedDistrictIds === 'all'
      ? orders
      : orders.filter((o) => exp.allowedDistrictIds.includes(o.districtId));

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exp.canOrderPlates) return;
    const matchedDistrict = MOCK_DISTRICTS.find((d) => d.name === district);
    const newOrd = {
      id: 'PLT-2026-' + Math.floor(100 + Math.random() * 900),
      code: plateCode,
      district: district,
      districtId: matchedDistrict?.id || 'dis-hodan',
      buildingNo: streetNumber,
      type: plateMaterial === 'reflective' ? 'Taariko Bir ah (Reflective Blue)' : 'Taariko Caadi ah',
      status: 'La Dalbaday'
    };
    setOrders([newOrd, ...orders]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            {language === 'ar'
              ? 'اللوحات الرسمية للمنازل والشوارع — مقديشو'
              : language === 'so'
              ? 'Taarikada Rasmiga ah ee Guryaha & Jidadka Muqdisho'
              : 'Official House & Street Address Plates — Mogadishu'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'الخدمة الرسمية لإقليم بنادر لطلب لوحات الألومنيوم العاكسة المزودة برمز الاستجابة السريعة (QR).'
              : language === 'so'
              ? 'Adeegga rasmiga ah ee maamulka Gobolka Banaadir ee lagu dalbado taarikooyinka birta ah ee lambarka guriga iyo koodka QR-ka.'
              : 'Official Banaadir Regional service to request reflective aluminum address plates with building numbers and QR verification codes.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {exp.role.code}: {exp.role.name[language]}
          </span>
          {!exp.canOrderPlates && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {language === 'so' ? 'Dalbashadu way Xiran tahay' : 'Ordering Restricted'}
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Physical Plate Visual Preview */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Muuqaalka Taarikada Rasmiga ah (Official Plate Specification)
          </span>

          {/* High-Grade Metal Address Plate Rendering */}
          <div className="bg-[#0B2545] border-4 border-slate-400 text-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col justify-between min-h-[200px] sm:min-h-[220px] relative overflow-hidden">
            {/* Screw holes simulation */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-600 flex items-center justify-center text-[7px] text-slate-600 font-bold">✕</div>
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-600 flex items-center justify-center text-[7px] text-slate-600 font-bold">✕</div>
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-600 flex items-center justify-center text-[7px] text-slate-600 font-bold">✕</div>
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-600 flex items-center justify-center text-[7px] text-slate-600 font-bold">✕</div>

            {/* Top header */}
            <div className="border-b border-blue-400/30 pb-2 flex flex-wrap justify-between items-center gap-2 px-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/assets/aistudio/somalia_coat_of_arms.png"
                  alt="Coat of Arms"
                  className="h-6 sm:h-7 w-auto object-contain shrink-0"
                />
                <span className="font-serif font-bold text-[10px] sm:text-xs tracking-wider uppercase text-blue-100 truncate">
                  GOBOLKA BANAADIR — DEGMADA {district.toUpperCase()}
                </span>
              </div>
              <span className="font-mono text-[10px] text-amber-300 font-bold">SDAS-2026</span>
            </div>

            {/* Middle Main Building Number & QR */}
            <div className="flex justify-between items-center px-2 sm:px-4 py-3 gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-blue-200 block uppercase">LAMBARKA GURIGA</span>
                <span className="text-3xl sm:text-5xl font-mono font-black tracking-tight text-white block">
                  {streetNumber || '412'}
                </span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border-2 border-slate-300 shadow-sm flex flex-col items-center shrink-0">
                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-slate-900" />
                <span className="font-mono text-[7px] text-slate-800 font-bold mt-0.5">{plateCode}</span>
              </div>
            </div>

            {/* Bottom Official Identifier */}
            <div className="border-t border-blue-400/30 pt-2 px-2 flex justify-between items-center text-[11px] font-mono">
              <span className="text-amber-300 font-bold tracking-widest">{plateCode}</span>
              <span className="text-blue-200 text-[10px]">DAWANGALINTA QARANKA</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
            Taarikooyinkan waxaa laga sameeyaa aluminium bir adag ah oo u adkaysata kuleylka iyo badda, waxayna leedahay xariir ka muuqda habeenkii (reflective coating).
          </div>
        </div>

        {/* Plate Order Form OR Policy Restriction Panel */}
        {!exp.canOrderPlates ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-amber-200 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase text-amber-800 block">
                  {exp.role.code} — {exp.role.name[language]}
                </span>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  {language === 'so'
                    ? 'Dalabka Taarikada Cusub wuu Xiran yahay Doorkan'
                    : language === 'ar'
                    ? 'طلب اللوحات مقيد لهذا الدور'
                    : 'Plate Ordering Restricted Under Active Role Policy'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {exp.isReadOnly
                    ? language === 'so'
                      ? 'Doorka Hanti-dhowrka (R12) waa Akhris Keliya (Read-Only). Waad kormeeri kartaa dalabaadka jira balse ma abuuri kartid dalab taariko cusub.'
                      : 'Auditor (R12) operates in strictly Read-Only compliance mode. You may inspect existing plate records, but creating new orders is blocked.'
                    : activeRole === 'national_super_admin'
                    ? language === 'so'
                      ? 'Sare-Maamulaha Qaranka (R01) ma dalban karo taarikooyinka guryaha si looga hortago isku-dhaca awoodaha; beddel doorkaaga haddii aad tijaabinayso.'
                      : 'National Super Admin (R01) is blocked from municipal plate ordering under platform governance isolation.'
                    : language === 'so'
                    ? 'Hay’adaha API-ga (R14) waxay leeyihiin gelitaan xog oo keliya (dispatch & geocoding), ma dalban karaan taarikooyin guryo.'
                    : 'Institutional API Clients (R14) have dispatch and geocoding read access only and cannot place physical plate orders.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100">
              {onOpenSignIn && (
                <button
                  onClick={onOpenSignIn}
                  className="px-4 py-2 bg-[#0c243e] hover:bg-[#133860] text-white font-semibold rounded text-xs transition cursor-pointer"
                >
                  {language === 'so' ? 'Beddel Doorka (Switch Role)' : 'Switch Role'}
                </button>
              )}
              {onNavigate && (
                <button
                  onClick={() => onNavigate('desk')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs transition cursor-pointer"
                >
                  {language === 'so' ? 'Fur Shaqada Doorka' : 'Open Role Workspace'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              {language === 'so' ? 'Dalbo Taariko Cusub' : language === 'ar' ? 'طلب لوحة جديدة' : 'Order New Address Plate'}
            </h3>
            <form onSubmit={handleOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Koodka Ciwaanka Dijitaalka ah</label>
                <input
                  type="text"
                  value={plateCode}
                  onChange={(e) => setPlateCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Degmada</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                  >
                    {scopedDistricts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lambarka Guriga</label>
                  <input
                    type="text"
                    value={streetNumber}
                    onChange={(e) => setStreetNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tayada Birta & Midabka</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPlateMaterial('reflective')}
                    className={`p-2.5 rounded border text-center transition cursor-pointer ${
                      plateMaterial === 'reflective'
                        ? 'bg-blue-50 border-[#0B2545] font-bold text-[#0B2545]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Bir Ka Muuqata Habeenkii (Reflective)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlateMaterial('metal')}
                    className={`p-2.5 rounded border text-center transition cursor-pointer ${
                      plateMaterial === 'metal'
                        ? 'bg-blue-50 border-[#0B2545] font-bold text-[#0B2545]'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Bir Caadi ah (Standard Metal)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B2545] hover:bg-[#13315C] text-white font-semibold py-2.5 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Dalbo Taarikada Guriga
              </button>

              {submitted && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-center font-semibold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Dalabkaaga si guul leh ayaa loo diiwaangeliyay!
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Existing Orders Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex justify-between items-center">
          <span>Dalabaadkii Ugu Dambeeyay ee Taarikada ({visibleOrders.length})</span>
          {exp.allowedDistrictIds !== 'all' && (
            <span className="text-[11px] font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Scoped: {exp.role.assignedArea}
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-200 text-xs">
          {visibleOrders.map((ord) => (
            <div key={ord.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                  <span className="font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{ord.code}</span>
                  <span className="font-semibold text-slate-700">Guri #{ord.buildingNo}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Degmada {ord.district} | {ord.type}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {ord.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
