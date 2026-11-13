import React, { useState } from 'react';
import { Language, UserRole } from '../types/sdas';
import { MOCK_DISTRICTS, UI_STRINGS } from '../data/mockData';
import { filterDistrictsByRole, getRoleExperience } from '../utils/rolePolicy';
import { CheckCircle2, Lock } from 'lucide-react';

interface AddressRequestViewProps {
  language: Language;
  activeRole: UserRole;
  onNavigate: (tab: any) => void;
  onOpenSignIn?: () => void;
}

export const AddressRequestView: React.FC<AddressRequestViewProps> = ({
  language,
  activeRole,
  onNavigate,
  onOpenSignIn
}) => {
  const t = UI_STRINGS[language];
  const exp = getRoleExperience(activeRole);
  const scopedDistricts = filterDistrictsByRole(MOCK_DISTRICTS, activeRole);

  const [step, setStep] = useState(1);
  const [district, setDistrict] = useState(scopedDistricts[0]?.name || 'Hodan');
  const [locality, setLocality] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [propertyType, setPropertyType] = useState('residential');
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');

  if (!exp.canSubmitAddressRequest) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white p-8 rounded-lg border border-amber-300 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Action Restricted for {exp.role.code}: {exp.role.name[language]}
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Under SDAS Separation of Duties, <strong>{exp.role.name[language]}</strong> cannot create or submit new address registration applications.
            {exp.role.restrictions[0] ? ` (${exp.role.restrictions[0]})` : ''}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {onOpenSignIn && (
              <button
                onClick={onOpenSignIn}
                className="bg-[#0c243e] hover:bg-blue-900 text-white font-semibold px-5 py-2 rounded text-xs cursor-pointer transition"
              >
                Switch Role (e.g. Public Citizen or District Admin)
              </button>
            )}
            <button
              onClick={() => onNavigate('desk')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-5 py-2 rounded text-xs cursor-pointer transition"
            >
              Open {exp.role.code} Role Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = 'REQ-MOG-' + Math.floor(10000 + Math.random() * 90000);
    setReferenceId(ref);
    setStep(3);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          {t.navRequest} — Gobolka Banaadir
        </h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Foomka rasmiga ah ee muwaadinka ama ganacsiga uu ku codsan karo diiwaangelin ciwaan cusub oo dijitaal ah.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-xs flex justify-between items-center text-[11px] sm:text-xs font-semibold text-slate-600 gap-1">
        <div className={`flex items-center gap-1.5 min-w-0 ${step >= 1 ? 'text-blue-900 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${step >= 1 ? 'bg-[#0B2545] text-white' : 'bg-slate-200'}`}>1</span>
          <span className="truncate">Goobta</span>
        </div>
        <div className="h-0.5 flex-1 bg-slate-200 mx-1 sm:mx-4"></div>
        <div className={`flex items-center gap-1.5 min-w-0 ${step >= 2 ? 'text-blue-900 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${step >= 2 ? 'bg-[#0B2545] text-white' : 'bg-slate-200'}`}>2</span>
          <span className="truncate">Codsadaha</span>
        </div>
        <div className="h-0.5 flex-1 bg-slate-200 mx-1 sm:mx-4"></div>
        <div className={`flex items-center gap-1.5 min-w-0 ${step === 3 ? 'text-emerald-700 font-bold' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>3</span>
          <span className="truncate">Xaqiijinta</span>
        </div>
      </div>

      {/* Step 1: Location & Property Info */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
            Tallaabada 1: Goobta Guriga ama Ganacsiga
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degmada (Banaadir)</label>
              <select
                aria-label="Degmada (Banaadir)"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
              >
                {MOCK_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.name}>Degmada {d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Xaafadda (Locality)</label>
              <input
                type="text"
                aria-label="Xaafadda (Locality)"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Tusaale: Xaafadda Taleex ama KPP..."
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wadada ama Jidka u dhow</label>
                <input
                  type="text"
                  aria-label="Wadada ama Jidka u dhow"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Tusaale: Wadada 30ka..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lambarka Guriga (haddii uu jiro)</label>
                <input
                  type="text"
                  aria-label="Lambarka Guriga"
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  placeholder="Tusaale: 412..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nooca Hantida</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setPropertyType('residential')}
                  className={`p-3 rounded border text-center transition cursor-pointer ${
                    propertyType === 'residential' ? 'bg-blue-50 border-[#0B2545] font-bold text-[#0B2545]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Guri Deegaan
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('commercial')}
                  className={`p-3 rounded border text-center transition cursor-pointer ${
                    propertyType === 'commercial' ? 'bg-blue-50 border-[#0B2545] font-bold text-[#0B2545]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Goob Ganacsi
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('public_facility')}
                  className={`p-3 rounded border text-center transition cursor-pointer ${
                    propertyType === 'public_facility' ? 'bg-blue-50 border-[#0B2545] font-bold text-[#0B2545]' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Xarun Dadweyne
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#0B2545] hover:bg-[#13315C] text-white font-semibold px-6 py-2.5 rounded text-xs transition cursor-pointer"
              >
                U Gudub Tallaabada 2aad →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Contact Info */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
            Tallaabada 2: Xogta Codsadaha (Ogeysiinta Rasmiga ah)
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Magaca Buuxa ee Codsadaha</label>
              <input
                type="text"
                aria-label="Magaca Buuxa ee Codsadaha"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Magaca saddexan..."
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lambarka Taleefanka (SMS loogu soo diri doono koodhka)</label>
              <input
                type="tel"
                aria-label="Lambarka Taleefanka"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+252 61 XXXXXXX"
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                required
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <strong>Ilaalinta Xogta:</strong> Lambarkaaga taleefanka iyo magacaaga shakhsiga ah looma adeegsan doono diiwaanka guud ee dadweynaha, waxaana kaliya loogu talagalay in laguula socodsiiyo xaaladda codsigaaga.
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded text-xs transition cursor-pointer"
              >
                ← Dib u noqo
              </button>
              <button
                type="submit"
                className="bg-[#0B2545] hover:bg-[#13315C] text-white font-semibold px-6 py-2.5 rounded text-xs transition cursor-pointer"
              >
                Gudbi Codsiga Rasmiga ah
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-lg border-2 border-emerald-300 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Foomka demo-ga waa la diyaariyey
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Tixraac demo ah: {referenceId}. Xogtan browser-kan keliya ayay ku jirtaa; looma dirin xafiis ama nidaam kale.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 max-w-sm mx-auto">
            <span className="text-[11px] text-slate-500 block uppercase font-mono">Lambarka Tixraaca Codsiga</span>
            <span className="text-xl font-mono font-bold text-blue-900 block mt-1">{referenceId}</span>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('search')}
              className="bg-[#0B2545] hover:bg-[#13315C] text-white font-semibold px-6 py-2.5 rounded text-xs transition cursor-pointer"
            >
              Ku laabo Baadhitaanka Ciwaanka
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
