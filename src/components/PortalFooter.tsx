import React from 'react';
import { Language } from '../types/sdas';

interface PortalFooterProps {
  language?: Language;
  onNavigate: (view: string) => void;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({ language = 'en', onNavigate }) => {
  const copy = {
    en: {
      gov: 'Federal Republic of Somalia',
      ministry: 'Ministry of Communications and Technology',
      sys1: 'Somali Digital',
      sys2: 'Addressing System',
      about: 'About SDAS',
      policies: 'Policies',
      help: 'Help Center',
      contact: 'Contact',
      rights: '© 2026 Federal Republic of Somalia. All rights reserved.'
    },
    so: {
      gov: 'Jamhuuriyadda Federaalka Soomaaliya',
      ministry: 'Wasaaradda Isgaarsiinta iyo Teknolojiyadda',
      sys1: 'Nidaamka Ciwaangelinta',
      sys2: 'Dijitaalka ah ee Soomaaliya',
      about: 'Ku saabsan SDAS',
      policies: 'Siyaasadaha',
      help: 'Xarunta Caawinta',
      contact: 'La Xiriir',
      rights: '© 2026 Jamhuuriyadda Federaalka Soomaaliya. Xuquuqda oo dhan way dhowran tahay.'
    },
    ar: {
      gov: 'جمهورية الصومال الفيدرالية',
      ministry: 'وزارة الاتصالات والتكنولوجيا',
      sys1: 'نظام العنونة',
      sys2: 'الرقمية الصومالي',
      about: 'عن النظام',
      policies: 'السياسات',
      help: 'مركز المساعدة',
      contact: 'اتصل بنا',
      rights: '© 2026 جمهورية الصومال الفيدرالية. جميع الحقوق محفوظة.'
    }
  }[language];

  return (
    <footer className="bg-[#0c243e] text-white border-t border-blue-900/60 mt-auto">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Branding */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-3.5 text-center sm:text-left">
          <img
            src="/assets/aistudio/somalia_coat_of_arms.png"
            alt="Somalia Coat of Arms"
            className="h-9 sm:h-10 w-auto object-contain shrink-0"
          />
          <div className="leading-tight">
            <div className="text-white font-semibold text-xs sm:text-sm tracking-tight">
              {copy.gov}
            </div>
            <div className="text-slate-300 text-[10px] sm:text-[11px]">
              {copy.ministry}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-600/60 mx-1 hidden sm:block"></div>

          {/* SDAS Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
              SDAS
            </span>
            <div className="text-[10px] sm:text-[11px] leading-tight text-slate-200 hidden md:block">
              <div>{copy.sys1}</div>
              <div>{copy.sys2}</div>
            </div>
          </div>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
          <button onClick={() => onNavigate('about')} className="hover:text-white transition cursor-pointer">
            {copy.about}
          </button>
          <button onClick={() => onNavigate('policies')} className="hover:text-white transition cursor-pointer">
            {copy.policies}
          </button>
          <button onClick={() => onNavigate('help')} className="hover:text-white transition cursor-pointer">
            {copy.help}
          </button>
          <button onClick={() => onNavigate('contact')} className="hover:text-white transition cursor-pointer">
            {copy.contact}
          </button>
        </div>

        {/* Right Social Icons */}
        <div className="flex items-center gap-4 text-slate-300">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition text-slate-200 hover:text-white text-xs font-bold"
            title="X (Twitter)"
          >
            𝕏
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition text-slate-200 hover:text-white text-xs font-bold font-serif"
            title="Facebook"
          >
            f
          </a>

          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition text-slate-200 hover:text-white text-xs font-bold"
            title="YouTube"
          >
            ▶
          </a>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-700/60 bg-[#091b2c] py-3 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-2 text-center sm:text-left">
          <span>{copy.rights}</span>
          <span className="font-mono text-slate-400 text-[11px]">SDAS v1.0</span>
        </div>
      </div>
    </footer>
  );
};
