import React, { useEffect, useState } from 'react';
import { AddressRecord, Language, UserRole } from '../types/sdas';
import { MOCK_ADDRESSES, UI_STRINGS } from '../data/mockData';
import { getRoleExperience } from '../utils/rolePolicy';
import { Search, MapPin, QrCode, Printer, Share2, CheckCircle2, ShieldCheck, ArrowRight, Home, Building2, Check, X, Send, Lock } from 'lucide-react';

interface SearchVerifyViewProps {
  language: Language;
  activeRole: UserRole;
  breakGlassActive?: boolean;
  selectedAddress?: AddressRecord;
  onNavigate: (tab: any) => void;
  onSelectAddress: (addr: AddressRecord) => void;
}

export const SearchVerifyView: React.FC<SearchVerifyViewProps> = ({
  language,
  activeRole,
  breakGlassActive = false,
  selectedAddress,
  onNavigate,
  onSelectAddress
}) => {
  const t = UI_STRINGS[language];
  const exp = getRoleExperience(activeRole, breakGlassActive);
  const [query, setQuery] = useState(selectedAddress?.publicCode || '');
  const [selectedResult, setSelectedResult] = useState<AddressRecord>(selectedAddress || MOCK_ADDRESSES[0]);
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (selectedAddress) {
      setSelectedResult(selectedAddress);
      setQuery(selectedAddress.publicCode);
    }
  }, [selectedAddress]);

  // Correction / Dispute Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [corrCategory, setCorrCategory] = useState('spelling');
  const [corrNotes, setCorrNotes] = useState('');
  const [corrSubmitted, setCorrSubmitted] = useState(false);
  const [corrCaseId, setCorrCaseId] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = query.trim().toLowerCase();
    if (!cleaned) return;

    const found = MOCK_ADDRESSES.find(
      (a) =>
        a.publicCode.toLowerCase().includes(cleaned) ||
        a.components.district.toLowerCase().includes(cleaned) ||
        a.components.locality.toLowerCase().includes(cleaned) ||
        (a.components.street && a.components.street.toLowerCase().includes(cleaned))
    );

    if (found) {
      setSelectedResult(found);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedResult.publicCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const caseId = 'CASE-CORR-' + Math.floor(1000 + Math.random() * 9000);
    setCorrCaseId(caseId);
    setCorrSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero Search Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-10 shadow-xs text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>{t.portalTitle} — {exp.role.code}: {exp.role.name[language]}</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            {t.searchTitle}
          </h2>
          <p className="text-slate-600 text-sm">
            {t.searchSubtitle}
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SDAS-MOG-7482 ama Wadada Makka Al-Mukarrama..."
              className="w-full bg-slate-50 border border-slate-300 rounded-md pl-11 pr-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            className="bg-[#0B2545] hover:bg-[#13315C] text-white px-6 py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{t.searchBtn}</span>
          </button>
        </form>

        {/* Quick Sample Address Codes */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1">
          <span>Koodadka tusaalaha ah:</span>
          {MOCK_ADDRESSES.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setQuery(item.publicCode);
                setSelectedResult(item);
                setHasSearched(true);
              }}
              className="font-mono font-medium text-blue-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-300 transition cursor-pointer"
            >
              {item.publicCode}
            </button>
          ))}
        </div>
      </div>

      {/* Official Digital Address Certificate Card */}
      {selectedResult && (
        <div className="bg-white rounded-lg border-2 border-slate-300 shadow-sm overflow-hidden">
          {/* Card Top National Crest Bar */}
          <div className="bg-[#0B2545] text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/assets/aistudio/somalia_coat_of_arms.png"
                alt="Somalia Coat of Arms"
                className="h-12 w-auto object-contain shrink-0"
              />
              <div>
                <h3 className="font-serif font-bold text-base tracking-wide uppercase">
                  {t.verifiedCardTitle}
                </h3>
                <p className="text-[11px] text-blue-200">
                  Dowladda Federaalka Soomaaliya — Maamulka Gobolka Banaadir
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs px-3 py-1 rounded font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.officialBadge}
              </span>
            </div>
          </div>

          {/* Certificate Main Body */}
          <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Left 2 Cols: Details */}
            <div className="md:col-span-2 space-y-5 sm:space-y-6">
              {/* Big Public Code */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 sm:p-4 rounded-md flex flex-wrap justify-between items-center gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                    {t.code}
                  </span>
                  <span className="text-xl sm:text-3xl font-mono font-extrabold text-slate-900 tracking-tight break-all">
                    {selectedResult.publicCode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={copyCode}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Waa la guuriyay' : t.shareAddress}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-[#0B2545] hover:bg-[#13315C] rounded text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.downloadCert}</span>
                  </button>
                </div>
              </div>

              {/* Grid of Address Components */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t.district}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedResult.components.district}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t.locality}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {exp.maskCoordinatesAndStreets ? '[MASKED BY R01]' : selectedResult.components.locality}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t.street}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {exp.maskCoordinatesAndStreets ? '[MASKED BY R01]' : (selectedResult.components.street || '—')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t.building}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {exp.maskCoordinatesAndStreets ? '[MASKED]' : `#${selectedResult.components.buildingNumber || '—'}`}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t.filterType}</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block capitalize">{selectedResult.addressType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Lambarka Rasmiga ah</span>
                  <span className="font-mono font-bold text-blue-900 text-[11px] mt-0.5 block truncate">
                    {selectedResult.authorityReference || 'BRA/MOG/2026/REG'}
                  </span>
                </div>
              </div>

              {selectedResult.components.landmark && !exp.maskCoordinatesAndStreets && (
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">{t.landmark}: </span>
                    <span>{selectedResult.components.landmark}</span>
                  </div>
                </div>
              )}

              {/* Correction / Dispute Reporting Action */}
              <div className="flex items-center justify-between text-xs pt-1">
                {exp.canSubmitCorrections ? (
                  <>
                    <span className="text-slate-500">Miyaad aragtay khalad xagga higgaada ama goobta ah?</span>
                    <button
                      onClick={() => setShowCorrectionModal(true)}
                      className="text-blue-900 hover:text-blue-700 font-semibold underline cursor-pointer"
                    >
                      Gudbi Saxid / Khilaaf (Correction Request)
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                    Record mutation / correction requests disabled under {exp.role.code} ({exp.role.name[language]}).
                  </span>
                )}
              </div>
            </div>

            {/* Right Col: Official QR Stamp & GPS */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-36 h-36 bg-white p-3 border-2 border-slate-300 rounded shadow-xs flex flex-col items-center justify-center">
                <QrCode className="w-28 h-28 text-slate-900" />
                <span className="font-mono text-[9px] text-slate-600 mt-1 font-bold">{selectedResult.publicCode}</span>
              </div>
              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-900 block">{t.coordinates}</span>
                <span className="font-mono text-slate-600 text-[11px] block">
                  {exp.maskCoordinatesAndStreets
                    ? '[MASKED — BREAK-GLASS REQUIRED]'
                    : `${selectedResult.location.coordinates[1].toFixed(4)}° N, ${selectedResult.location.coordinates[0].toFixed(4)}° E`}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  Xaqiijinta Goobta: Saxnaanta {selectedResult.location.accuracyMeters}m
                </span>
              </div>
            </div>
          </div>

          {/* Legal Notice Footer */}
          <div className="bg-slate-100 border-t border-slate-200 px-4 sm:px-6 py-3 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
            <span>{t.legalDisclaimer}</span>
            <span className="font-mono text-[11px] text-slate-500">Nidaamka SDAS Muqdisho</span>
          </div>
        </div>
      )}

      {/* Action Banners for Citizens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div
          onClick={() => onNavigate('request')}
          className="bg-white hover:bg-slate-50 p-6 rounded-lg border border-slate-300 shadow-xs cursor-pointer transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="w-9 h-9 rounded bg-blue-50 text-blue-900 flex items-center justify-center font-bold mb-2">
              <Home className="w-5 h-5 text-[#0B2545]" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{t.requestBtn}</h4>
            <p className="text-xs text-slate-500">Diwaangeli guri cusub, goob ganacsi ama dhisme si aad u hesho koodh rasmi ah.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition" />
        </div>

        <div
          onClick={() => onNavigate('plates')}
          className="bg-white hover:bg-slate-50 p-6 rounded-lg border border-slate-300 shadow-xs cursor-pointer transition flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold mb-2">
              <Building2 className="w-5 h-5 text-emerald-800" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{t.plateBtn}</h4>
            <p className="text-xs text-slate-500">Dalbo taarikada birta ah ee rasmiga ah oo leh astaanta qaranka iyo koodka QR-ka.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition" />
        </div>
      </div>

      {/* Correction / Dispute Modal (Blueprint Section 10D) */}
      {showCorrectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-sm">Gudbinta Saxid ama Khilaaf (Section 10D)</h3>
                <span className="font-mono text-xs text-blue-900">{selectedResult.publicCode}</span>
              </div>
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setCorrSubmitted(false);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {corrSubmitted ? (
              <div className="p-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Codsiga Saxidda Waa la Diiwaangeliyay</h4>
                  <p className="text-xs text-slate-500">
                    Sida ku qeexan qorshaha SDAS, diiwaanka rasmiga ahi ma isbeddelayo ilaa sarkaalka madaxa-bannaan uu dib u eego caddeynta.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs text-blue-900 font-bold">
                  Lambarka Dacwada: {corrCaseId} (Target SLA: 2 Maalmood)
                </div>
                <button
                  onClick={() => {
                    setShowCorrectionModal(false);
                    setCorrSubmitted(false);
                  }}
                  className="bg-[#0c243e] hover:bg-blue-900 text-white font-semibold px-4 py-2 rounded text-xs"
                >
                  Xidh
                </button>
              </div>
            ) : (
              <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nooca Saxidda ama Khilaafka</label>
                  <select
                    value={corrCategory}
                    onChange={(e) => setCorrCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                  >
                    <option value="spelling">Khalad Higgaadda Xaafadda / Wadada (Spelling error)</option>
                    <option value="entrance">Beddelidda Irridda ama Goobta GPS-ka (Entrance relocation)</option>
                    <option value="boundary">Xudduud Degmo oo Qaldan (District boundary dispute)</option>
                    <option value="landmark">Calaamad u dhow oo Isbeddeshay (Landmark change)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faahfaahinta Saxidda & Sababta</label>
                  <textarea
                    rows={3}
                    value={corrNotes}
                    onChange={(e) => setCorrNotes(e.target.value)}
                    placeholder="Qor magaca saxda ah ama sababta saxidda loogu baahan yahay..."
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                    required
                  ></textarea>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] leading-relaxed">
                  <strong>Sharciga SDAS v3.0:</strong> Dacwada waxaa dib u eegi doona sarkaal madax-bannaan oo aan ahayn kii horey u ansixiyay ciwaankan, si loo dhowro hufnaanta qaranka.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded font-semibold"
                  >
                    Kansal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0c243e] hover:bg-blue-900 text-white rounded font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gudbi Dacwada / Saxidda</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
