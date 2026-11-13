import React, { useState } from 'react';
import { MapPin, Map, BarChart3, Layers, Info, ArrowRight, ChevronRight, Search, PhoneCall, Ambulance, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';
import { Language, UserRole } from '../types/sdas';
import { getRoleExperience } from '../utils/rolePolicy';

interface HomePortalViewProps {
  language: Language;
  activeRole: UserRole;
  isSignedIn: boolean;
  breakGlassActive?: boolean;
  onNavigate: (view: string) => void;
  onQuickVerify?: (codeOrQuery: string) => void;
  onOpenSignIn: () => void;
  onOpenLatestUpdate: () => void;
}

export const HomePortalView: React.FC<HomePortalViewProps> = ({
  language,
  activeRole,
  isSignedIn,
  breakGlassActive = false,
  onNavigate,
  onQuickVerify,
  onOpenSignIn,
  onOpenLatestUpdate
}) => {
  const [quickCode, setQuickCode] = useState('SDAS-MOG-7482');
  const exp = getRoleExperience(activeRole, breakGlassActive);
  const activateCardOnKey = (event: React.KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const copy = {
    en: {
      heroTitle1: 'Somali Digital',
      heroTitle2: 'Addressing System (SDAS)',
      card1Title: 'Address Registry',
      card2Title: 'Map Explorer',
      card3Title: 'Analytics & Reports',
      updateTag: 'Latest Update',
      updateText: 'SDAS Phase II – City-wide rollout in Mogadishu is now in progress.',
      learnMore: 'Learn More',
      quickTitle: 'Quick Public Address Verification',
      quickDesc: 'Verify any official Mogadishu address code or check its administrative status.',
      openViewer: 'Open Full Certificate Viewer',
      placeholder: 'Enter public code (e.g. SDAS-MOG-7482, SDAS-MOG-3091)...',
      verifyNow: 'Verify Now',
      ussdTitle: 'SMS & USSD Mobile Gateway (*282#)',
      ussdDesc: 'Lookup addresses instantly on basic feature phones via Hormuud & Somtel.',
      dispatchTitle: 'Emergency & Institutional Dispatch',
      dispatchDesc: 'High-speed geocoding for Police (888), Ambulance (999), and Postal logistics.',
      switchRoleBtn: 'Switch Role'
    },
    so: {
      heroTitle1: 'Nidaamka Ciwaangelinta',
      heroTitle2: 'Dijitaalka ah ee Soomaaliya (SDAS)',
      card1Title: 'Diiwaanka Ciwaanada',
      card2Title: 'Baadhaha Khariidadda',
      card3Title: 'Falanqaynta & Warbixinada',
      updateTag: 'Warkii Ugu Dambeeyay',
      updateText: 'SDAS Wejiga II – Hirgelinta guud ee magaalada Muqdisho ayaa socota.',
      learnMore: 'Faahfaahin',
      quickTitle: 'Hubinta Degdegga ah ee Ciwaanka',
      quickDesc: 'Hubi kood kasta oo rasmi ah oo Muqdisho ah ama ka eeg kaarkiisa rasmiga ah.',
      openViewer: 'Fur Kaarka Ciwaanka oo Buuxa',
      placeholder: 'Geli koodka rasmiga ah (tusaale SDAS-MOG-7482)...',
      verifyNow: 'Hubi Hadda',
      ussdTitle: 'Adeegga SMS & USSD (*282#)',
      ussdDesc: 'Ka raadi ciwaanada telefoonka caadiga ah iyadoo la adeegsanayo Hormuud & Somtel.',
      dispatchTitle: 'Gurmadka & Hay’adaha Dowladda',
      dispatchDesc: 'Helitaanka degdegga ah ee Booliska (888), Ambalaasta (999), iyo Boostada.',
      switchRoleBtn: 'Beddel Doorka'
    },
    ar: {
      heroTitle1: 'نظام العنونة الرقمية',
      heroTitle2: 'الوطني الصومالي (SDAS)',
      card1Title: 'سجل العناوين',
      card2Title: 'مستكشف الخريطة',
      card3Title: 'التحليلات والتقارير',
      updateTag: 'آخر تحديث',
      updateText: 'المرحلة الثانية من SDAS – الإطلاق الشامل في مدينة مقديشو جارٍ الآن.',
      learnMore: 'اعرف المزيد',
      quickTitle: 'التحقق السريع من العنوان العام',
      quickDesc: 'تحقق من أي رمز عنوان رسمي في مقديشو أو راجع حالته الإدارية.',
      openViewer: 'فتح عارض الشهادة الكامل',
      placeholder: 'أدخل الرمز العام (مثال: SDAS-MOG-7482)...',
      verifyNow: 'تحقق الآن',
      ussdTitle: 'بوابة الرسائل و USSD (*282#)',
      ussdDesc: 'الاستعلام الفوري عن العناوين عبر الهواتف العادية.',
      dispatchTitle: 'الطوارئ والإرسال المؤسسي',
      dispatchDesc: 'تحديد المواقع السريع للشرطة (888) والإسعاف (999) والبريد.',
      switchRoleBtn: 'تغيير الدور'
    }
  }[language];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onQuickVerify) {
      onQuickVerify(quickCode);
    } else {
      onNavigate('search');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient-to-b from-[#0d3b68] via-[#15528d] to-[#1b5a96] overflow-hidden sm:min-h-[300px] md:min-h-[350px] lg:min-h-[420px] xl:min-h-[460px] sm:flex sm:items-center">
        {/* Tablet & Desktop Full-Bleed Background Image (>= 640px) */}
        <img
          src="/assets/aistudio/mogadishu_fort_flag_4k.png"
          alt="Mogadishu Coastline, Historic Fort, and Somali Flag"
          className="hidden sm:block absolute inset-0 w-full h-full object-cover object-[center_35%] z-0 pointer-events-none select-none"
        />

        {/* Tablet & Desktop Left Readability Scrim (keeps coast, fort & flag clear on the right) */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#0d3b68]/92 via-[#15528d]/60 via-45% to-transparent lg:via-[#15528d]/45 lg:via-42% z-10 pointer-events-none"></div>

        {/* Hero Content Left */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4 sm:py-12 lg:py-16 w-full">
          <div className="max-w-xl text-white space-y-2.5 sm:space-y-3">
            {isSignedIn ? (
              <div className="inline-flex items-center gap-2 bg-[#0c243e]/80 border border-sky-400/40 px-2.5 py-1 rounded text-[11px] sm:text-xs font-semibold text-sky-200 max-w-full">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span className="truncate">
                  {exp.role.code} — {exp.role.name[language]} ({exp.role.scope[language]})
                </span>
              </div>
            ) : (
              <div className="w-10 h-1 bg-sky-400 rounded-full"></div>
            )}

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              {copy.heroTitle1}<br />
              {copy.heroTitle2}
            </h1>

            <p className="text-slate-100 text-xs sm:text-base font-normal max-w-md pt-0.5 pb-2 leading-relaxed">
              {exp.defaultHomeHeroSubtitle[language]}
            </p>

            {/* Action Buttons (Dynamically tailored to signed-in role!) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
              <button
                onClick={() => onNavigate(exp.primaryAction.view)}
                className="bg-white hover:bg-slate-100 text-[#0c2b4e] font-semibold px-4 sm:px-5 py-2.5 rounded-md text-xs sm:text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>{exp.primaryAction.label[language]}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate(exp.secondaryAction.view)}
                className="border border-white/80 bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white font-medium px-4 sm:px-5 py-2.5 rounded-md text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Map className="w-4 h-4" />
                <span>{exp.secondaryAction.label[language]}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Uncropped Full-Width Panorama (< 640px): shows 100% of coast, minaret, fort & flag */}
        <div className="relative w-full sm:hidden -mt-2">
          <img
            src="/assets/aistudio/mogadishu_fort_flag_4k.png"
            alt="Mogadishu Coastline, Historic Fort, and Somali Flag"
            className="w-full h-auto block select-none"
          />
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#195793] via-[#195793]/55 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Role-Aware System Preview Banner (shown when signed in) */}
        {isSignedIn && (
          <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold bg-[#0c243e] text-white px-2 py-0.5 rounded">
                  {exp.role.code}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {exp.role.name[language]} — {exp.role.assignedArea}
                </span>
                {exp.isReadOnly && (
                  <span className="inline-flex items-center gap-1 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" /> READ-ONLY MODE
                  </span>
                )}
                {exp.maskCoordinatesAndStreets && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200">
                    ADDRESS DATA MASKED
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                {exp.role.restrictions.map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-amber-900">
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onOpenSignIn}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded text-xs font-semibold shrink-0 cursor-pointer transition"
            >
              {copy.switchRoleBtn} (14)
            </button>
          </div>
        )}

        {/* 4 Feature Cards (Dynamic per signed-in role) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Address Registry */}
          <div
            onClick={() => onNavigate('registry')}
            onKeyDown={event => activateCardOnKey(event, () => onNavigate('registry'))}
            role="button" tabIndex={0} aria-label={copy.card1Title}
            className="bg-white hover:bg-slate-50/80 focus-visible:outline-2 focus-visible:outline-blue-900 p-5 rounded-lg border border-slate-200 shadow-xs hover:shadow-sm transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#1565C0]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-900 transition">
                  {copy.card1Title}
                </h3>
                <p className="text-xs text-slate-500 leading-snug mt-0.5">
                  {exp.cardOverrides.card1Desc[language]}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
          </div>

          {/* Card 2: Map Explorer */}
          <div
            onClick={() => onNavigate('map')}
            onKeyDown={event => activateCardOnKey(event, () => onNavigate('map'))}
            role="button" tabIndex={0} aria-label={copy.card2Title}
            className="bg-white hover:bg-slate-50/80 focus-visible:outline-2 focus-visible:outline-blue-900 p-5 rounded-lg border border-slate-200 shadow-xs hover:shadow-sm transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                <Map className="w-6 h-6 text-[#1565C0]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-900 transition">
                  {copy.card2Title}
                </h3>
                <p className="text-xs text-slate-500 leading-snug mt-0.5">
                  {exp.cardOverrides.card2Desc[language]}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
          </div>

          {/* Card 3: Analytics & Reports */}
          <div
            onClick={() => onNavigate('stats')}
            onKeyDown={event => activateCardOnKey(event, () => onNavigate('stats'))}
            role="button" tabIndex={0} aria-label={copy.card3Title}
            className="bg-white hover:bg-slate-50/80 focus-visible:outline-2 focus-visible:outline-blue-900 p-5 rounded-lg border border-slate-200 shadow-xs hover:shadow-sm transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 text-[#1565C0]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-900 transition">
                  {copy.card3Title}
                </h3>
                <p className="text-xs text-slate-500 leading-snug mt-0.5">
                  {exp.cardOverrides.card3Desc[language]}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
          </div>

          {/* Card 4: Role Workspace / System Administration */}
          <div
            onClick={() => onNavigate('desk')}
            onKeyDown={event => activateCardOnKey(event, () => onNavigate('desk'))}
            role="button" tabIndex={0} aria-label={exp.cardOverrides.card4Title[language]}
            className="bg-white hover:bg-slate-50/80 focus-visible:outline-2 focus-visible:outline-blue-900 p-5 rounded-lg border border-slate-200 shadow-xs hover:shadow-sm transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 text-[#1565C0]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-900 transition">
                  {exp.cardOverrides.card4Title[language]}
                </h3>
                <p className="text-xs text-slate-500 leading-snug mt-0.5 line-clamp-2">
                  {exp.cardOverrides.card4Desc[language]}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
          </div>
        </div>

        {/* Latest Update Notification Banner */}
        <div className="bg-[#edf5fd] border border-blue-200/80 rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <div className="w-6 h-6 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900">{copy.updateTag}</span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-slate-700">{copy.updateText}</span>
            </div>
          </div>

          <button
            onClick={onOpenLatestUpdate}
            className="text-[#1565C0] hover:text-blue-950 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ml-9 sm:ml-0"
          >
            <span>{copy.learnMore}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Search & Public Verification Tool Embedded */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{copy.quickTitle}</h2>
              <p className="text-xs text-slate-500">{copy.quickDesc}</p>
            </div>
            <button
              onClick={() => onNavigate('search')}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{copy.openViewer}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              aria-label={copy.quickTitle}
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value)}
              placeholder={copy.placeholder}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-md px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
            <button
              type="submit"
              className="bg-[#0c243e] hover:bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-md text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{copy.verifyNow}</span>
            </button>
          </form>
        </div>

        {/* Specialized Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onNavigate('ussd')}
            onKeyDown={event => activateCardOnKey(event, () => onNavigate('ussd'))}
            role="button" tabIndex={0} aria-label={copy.ussdTitle}
            className="p-5 bg-white hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-900 border border-slate-200 rounded-lg shadow-xs cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-900">
                  {copy.ussdTitle}
                </h4>
                <p className="text-[11px] text-slate-500">{copy.ussdDesc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition shrink-0 ml-2" />
          </div>

          <div
            onClick={() => onNavigate('partners')}
            onKeyDown={event => activateCardOnKey(event, () => onNavigate('partners'))}
            role="button" tabIndex={0} aria-label={copy.dispatchTitle}
            className="p-5 bg-white hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-900 border border-slate-200 rounded-lg shadow-xs cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-900">
                  {copy.dispatchTitle}
                </h4>
                <p className="text-[11px] text-slate-500">{copy.dispatchDesc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 transition shrink-0 ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
