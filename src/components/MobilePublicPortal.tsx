import React, { useState } from 'react';
import { ArrowRight, Search, MapPin, Map, FilePlus2, ClipboardList, ShieldCheck, ChevronRight, Home } from 'lucide-react';
import type { Language } from '../types/sdas';

interface MobileHomeProps { language: Language; onNavigate: (view: string) => void; onQuickVerify: (query: string) => void; }
const copy = {
  so: { eyebrow: 'JAMHUURIYADDA FEDERAALKA SOOMAALIYA', title: 'Ciwaankaaga. Si fudud loo helo.', description: 'Raadi ciwaan dijitaal ah, hel goob sax ah, ama codso ciwaan cusub.', search: 'Geli koodka ciwaanka ama magaca goobta', searchButton: 'Raadi ciwaan', services: 'Maxaad rabtaa inaad qabato?', find: 'Raadi ciwaan', findDesc: 'Hubi ciwaan ama goob', map: 'Khariidadda', mapDesc: 'Ka hel goobta khariidadda', request: 'Codso ciwaan', requestDesc: 'Diiwaangeli guri ama ganacsi', track: 'La soco codsiga', trackDesc: 'Eeg halka uu marayo codsigaaga', trust: 'Diiwaanka rasmiga ah ee ciwaanada dadweynaha', trustDesc: 'Macluumaadka la soo bandhigo waa ciwaanada loo oggolaaday in dadweynuhu arkaan.', more: 'Adeegyada oo dhan' },
  en: { eyebrow: 'FEDERAL REPUBLIC OF SOMALIA', title: 'Your address. Easy to find.', description: 'Find a digital address, locate a place, or request a new address.', search: 'Enter an address code or place name', searchButton: 'Find address', services: 'What would you like to do?', find: 'Find an address', findDesc: 'Look up and verify an address', map: 'Explore the map', mapDesc: 'Find a place on the map', request: 'Request an address', requestDesc: 'Register a home or business', track: 'Track a request', trackDesc: 'Check the progress of your request', trust: 'Official public address registry', trustDesc: 'Only information approved for public access is shown.', more: 'All services' },
  ar: { eyebrow: 'جمهورية الصومال الفيدرالية', title: 'عنوانك. يسهل العثور عليه.', description: 'ابحث عن عنوان رقمي أو موقع أو اطلب عنواناً جديداً.', search: 'أدخل رمز العنوان أو اسم المكان', searchButton: 'ابحث عن عنوان', services: 'ماذا تريد أن تفعل؟', find: 'ابحث عن عنوان', findDesc: 'البحث عن عنوان والتحقق منه', map: 'استكشف الخريطة', mapDesc: 'اعثر على موقع على الخريطة', request: 'اطلب عنواناً', requestDesc: 'سجل منزلاً أو نشاطاً تجارياً', track: 'تتبع الطلب', trackDesc: 'تحقق من حالة طلبك', trust: 'السجل الرسمي للعناوين العامة', trustDesc: 'تظهر فقط المعلومات المسموح بعرضها للجمهور.', more: 'جميع الخدمات' }
};
export const MobileHomePortalView: React.FC<MobileHomeProps> = ({ language, onNavigate, onQuickVerify }) => {
  const [query, setQuery] = useState('');
  const t = copy[language];
  const submit = (event: React.FormEvent) => { event.preventDefault(); query.trim() ? onQuickVerify(query.trim()) : onNavigate('search'); };
  const actions = [
    { title: t.find, description: t.findDesc, icon: Search, action: () => onNavigate('search') },
    { title: t.map, description: t.mapDesc, icon: Map, action: () => onNavigate('map') },
    { title: t.request, description: t.requestDesc, icon: FilePlus2, action: () => onNavigate('request') },
    { title: t.track, description: t.trackDesc, icon: ClipboardList, action: () => onNavigate('desk') }
  ];
  return <div className="sdas-mobile-home sm:hidden">
    <section className="bg-white px-5 pt-7 pb-6 border-b border-slate-200">
      <div className="flex items-center gap-2 text-[10px] font-bold tracking-[.12em] text-slate-500"><span className="h-2 w-2 rounded-full bg-[#16815b]" />{t.eyebrow}</div>
      <h1 className="mt-4 max-w-sm text-[30px] leading-[1.15] font-semibold tracking-tight text-[#102d49]">{t.title}</h1>
      <p className="mt-3 max-w-md text-[14px] leading-6 text-slate-600">{t.description}</p>
      <form onSubmit={submit} className="mt-6 rounded-xl border border-slate-300 bg-white p-2 shadow-sm">
        <label htmlFor="sdas-mobile-search" className="sr-only">{t.search}</label>
        <div className="flex items-center gap-2 px-2"><Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" /><input id="sdas-mobile-search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t.search} className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0" /></div>
        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#123653] px-4 text-sm font-semibold text-white active:bg-[#0c243e]">{t.searchButton}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
      </form>
    </section>
    <section className="px-5 pt-7 pb-5"><h2 className="text-[17px] font-semibold text-slate-900">{t.services}</h2>
      <div className="mt-4 grid grid-cols-1 gap-3">{actions.map(({title,description,icon:Icon,action}) => <button key={title} onClick={action} className="flex min-h-[82px] items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 text-left shadow-[0_1px_2px_rgba(15,23,42,.04)] transition active:bg-slate-50"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#edf3f7] text-[#123653]"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-slate-900">{title}</span><span className="mt-1 block text-[12px] leading-5 text-slate-500">{description}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /></button>)}</div>
      <button onClick={() => onNavigate('services')} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-[#123653]">{t.more}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
    </section>
    <section className="mx-5 mb-7 rounded-xl border border-[#d7e3e9] bg-[#f3f7f9] p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#245c78]" aria-hidden="true" /><div><h2 className="text-[13px] font-semibold text-[#183b54]">{t.trust}</h2><p className="mt-1 text-[12px] leading-5 text-slate-600">{t.trustDesc}</p></div></div></section>
  </div>;
};
interface MobileNavProps { active: string; onNavigate: (view: string) => void; language: Language; }
export const PublicMobileNavigation: React.FC<MobileNavProps> = ({active,onNavigate,language}) => {
 const items = [
  {id:'home',label:language==='so'?'Hoyga':language==='ar'?'الرئيسية':'Home',icon:Home},
  {id:'search',label:language==='so'?'Raadi':language==='ar'?'بحث':'Search',icon:Search},
  {id:'map',label:language==='so'?'Khariidad':language==='ar'?'الخريطة':'Map',icon:MapPin},
  {id:'request',label:language==='so'?'Codso':language==='ar'?'طلب':'Request',icon:FilePlus2}
 ];
 return <nav aria-label="Main navigation" className="sdas-mobile-bottom-nav sm:hidden">{items.map(({id,label,icon:Icon})=><button key={id} onClick={()=>onNavigate(id)} aria-current={active===id?'page':undefined} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium ${active===id?'text-[#123653]':'text-slate-500'}`}><Icon className="h-5 w-5" aria-hidden="true"/><span>{label}</span></button>)}</nav>;
};
