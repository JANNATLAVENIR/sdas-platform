import React, { useState } from 'react';
import { Globe, User, ChevronDown, ShieldCheck, LogOut, Lock, Menu, X } from 'lucide-react';
import { Language, UserRole } from '../types/sdas';
import { ALL_ROLES } from '../data/rolesData';
import type { AuthUser } from '../api/sdasClient';

interface PortalHeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  activeRole: UserRole;
  authUser: AuthUser | null;
  isSignedIn: boolean;
  breakGlassActive?: boolean;
  onOpenSignIn: () => void;
  onOpenWorkspace: () => void;
  onSignOut: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  language,
  setLanguage,
  activeNav,
  setActiveNav,
  activeRole,
  authUser,
  isSignedIn,
  breakGlassActive = false,
  onOpenSignIn,
  onOpenWorkspace,
  onSignOut
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langLabels = {
    en: 'EN',
    so: 'SO',
    ar: 'AR'
  };

  const navCopy = {
    en: {
      gov: 'Federal Republic of Somalia',
      ministry: 'Ministry of Communications and Technology',
      sys1: 'Somali Digital',
      sys2: 'Addressing System',
      home: 'Home',
      services: 'Services',
      resources: 'Resources',
      about: 'About SDAS',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      openWorkspace: 'Open Role Workspace'
    },
    so: {
      gov: 'Jamhuuriyadda Federaalka Soomaaliya',
      ministry: 'Wasaaradda Isgaarsiinta iyo Teknolojiyadda',
      sys1: 'Nidaamka Ciwaangelinta',
      sys2: 'Dijitaalka ah ee Soomaaliya',
      home: 'Bogga Hore',
      services: 'Adeegyada',
      resources: 'Dukumeentiyada',
      about: 'Ku saabsan SDAS',
      signIn: 'Gal',
      signOut: 'Ka Bax',
      openWorkspace: 'Fur Xafiiska Doorka'
    },
    ar: {
      gov: 'جمهورية الصومال الفيدرالية',
      ministry: 'وزارة الاتصالات والتكنولوجيا',
      sys1: 'نظام العنونة',
      sys2: 'الرقمية الصومالي',
      home: 'الرئيسية',
      services: 'الخدمات',
      resources: 'المصادر',
      about: 'عن النظام',
      signIn: 'تسجيل الدخول',
      signOut: 'تسجيل الخروج',
      openWorkspace: 'فتح مساحة العمل'
    }
  }[language];

  const currentRoleDef = ALL_ROLES.find((r) => r.id === activeRole) || ALL_ROLES[12];

  const handleMobileNav = (view: string) => {
    setActiveNav(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#0c243e] text-white border-b border-blue-900/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center gap-2 sm:gap-4">
        {/* Left Branding */}
        <div
          className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 cursor-pointer"
          onClick={() => handleMobileNav('home')}
        >
          <img
            src="/assets/aistudio/somalia_coat_of_arms.png"
            alt="Somalia Coat of Arms"
            className="h-8 sm:h-10 w-auto object-contain shrink-0"
          />
          <div className="leading-tight min-w-0">
            <div className="text-white font-semibold text-[11px] sm:text-sm tracking-tight truncate">
              {navCopy.gov}
            </div>
            <div className="text-slate-300 text-[10px] sm:text-[11px] truncate">
              {navCopy.ministry}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-600/60 mx-1 hidden sm:block shrink-0"></div>

          {/* SDAS Brand */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
              SDAS
            </span>
            <div className="text-[10px] sm:text-[11px] leading-tight text-slate-200 hidden lg:block">
              <div>{navCopy.sys1}</div>
              <div>{navCopy.sys2}</div>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-5 text-xs sm:text-sm shrink-0">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 font-medium">
            <button
              onClick={() => setActiveNav('home')}
              className={`transition pb-1 cursor-pointer whitespace-nowrap ${
                activeNav === 'home'
                  ? 'text-white border-b-2 border-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {navCopy.home}
            </button>
            <button
              onClick={() => setActiveNav('services')}
              className={`transition pb-1 cursor-pointer whitespace-nowrap ${
                activeNav === 'services'
                  ? 'text-white border-b-2 border-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {navCopy.services}
            </button>
            <button
              onClick={() => setActiveNav('resources')}
              className={`transition pb-1 cursor-pointer whitespace-nowrap ${
                activeNav === 'resources'
                  ? 'text-white border-b-2 border-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {navCopy.resources}
            </button>
            <button
              onClick={() => setActiveNav('about')}
              className={`transition pb-1 cursor-pointer whitespace-nowrap ${
                activeNav === 'about'
                  ? 'text-white border-b-2 border-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {navCopy.about}
            </button>
          </nav>

          <div className="h-5 w-px bg-slate-600/80 hidden md:block"></div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-slate-200 hover:text-white text-[11px] sm:text-xs font-semibold px-1.5 sm:px-2 py-1.5 rounded transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{langLabels[language]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#0c243e] border border-blue-800 rounded-md shadow-lg py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-900 transition flex items-center justify-between cursor-pointer ${
                    language === 'en' ? 'text-white font-bold bg-blue-900/60' : 'text-slate-300'
                  }`}
                >
                  English <span>(EN)</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('so');
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-900 transition flex items-center justify-between cursor-pointer ${
                    language === 'so' ? 'text-white font-bold bg-blue-900/60' : 'text-slate-300'
                  }`}
                >
                  Soomaali <span>(SO)</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-900 transition flex items-center justify-between cursor-pointer ${
                    language === 'ar' ? 'text-white font-bold bg-blue-900/60' : 'text-slate-300'
                  }`}
                >
                  العربية <span>(AR)</span>
                </button>
              </div>
            )}
          </div>

          {/* Sign In / Open Workspace */}
          {isSignedIn ? (
            <button
              onClick={onOpenWorkspace}
              className="bg-[#0b1f35] hover:bg-blue-900/80 text-white border border-blue-400/40 px-2.5 sm:px-3.5 py-1.5 rounded-md text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="max-w-[110px] sm:max-w-none truncate">
                {currentRoleDef.code} · {currentRoleDef.name[language]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="bg-[#0b1f35] hover:bg-blue-900/80 text-white border border-blue-400/40 px-2.5 sm:px-3.5 py-1.5 rounded-md text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{navCopy.signIn}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 rounded border border-blue-400/30 text-slate-200 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[#091c31] border-t border-blue-900/70 px-3 py-2.5 grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'home', label: navCopy.home },
            { id: 'services', label: navCopy.services },
            { id: 'resources', label: navCopy.resources },
            { id: 'about', label: navCopy.about }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileNav(item.id)}
              className={`px-3 py-2 rounded text-left font-medium transition cursor-pointer ${
                activeNav === item.id ? 'bg-[#133860] text-white font-semibold' : 'text-slate-300 hover:bg-[#102d4d]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* Authenticated Session Bar (Visible when viewing Public Portal while signed in) */}
      {isSignedIn && authUser && (
        <div className="bg-[#081a2d] border-t border-blue-900/80 text-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-mono font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                {currentRoleDef.code}: {currentRoleDef.name[language]}
              </span>
              <span className="text-white text-[11px] font-medium truncate max-w-[180px] sm:max-w-none">
                {authUser.fullName}
              </span>
              <span className="text-slate-300 text-[11px] hidden md:inline">· {authUser.assignedArea}</span>
              {activeRole === 'auditor' && (
                <span className="inline-flex items-center gap-1 bg-slate-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  <Lock className="w-3 h-3" /> READ-ONLY
                </span>
              )}
              {activeRole === 'national_super_admin' && (
                <span className="text-[10px] font-mono text-slate-300">
                  {breakGlassActive ? 'BREAK-GLASS ACTIVE' : 'ROUTINE DATA MASKED'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={onOpenWorkspace}
                className="px-2.5 py-1 bg-[#133860] hover:bg-[#194778] text-white rounded font-semibold transition cursor-pointer"
              >
                {navCopy.openWorkspace}
              </button>
              <button
                onClick={onSignOut}
                className="px-2.5 py-1 bg-slate-900 hover:bg-rose-900/80 text-slate-200 border border-slate-700 rounded font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>{navCopy.signOut}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
