import React, { useState } from 'react';
import { LogOut, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import type { AuthUser } from '../../api/sdasClient';
import { rolePath, routeForPath } from '../../routing/routeRegistry';
import type { ModuleRoute } from '../../routing/routeRegistry';
import { WorkspaceRouteContext } from '../../routing/WorkspaceRouteContext';
import { ModuleWorkspaceView } from './ModuleWorkspaceView';

export interface WorkspaceNavItem {
  id: string;
  label: string;
}

interface WorkspaceShellProps {
  portalLabel: string;
  roleTitle: string;
  roleCode: string;
  tierText: string;
  user: AuthUser;
  navItems: WorkspaceNavItem[];
  activeSection: string;
  onSelectSection: (id: string) => void;
  restrictions: string[];
  onBackToPublicPortal?: () => void;
  onLogout: () => void;
  children: React.ReactNode;
  selectedModule?: ModuleRoute;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  portalLabel,
  roleTitle,
  roleCode,
  tierText,
  user,
  navItems,
  activeSection,
  onSelectSection,
  restrictions,
  onBackToPublicPortal,
  onLogout,
  children
  , selectedModule
}) => {
  const routedModule = React.useContext(WorkspaceRouteContext);
  const [showMobileBoundaries, setShowMobileBoundaries] = useState(false);
  const [locationKey, setLocationKey] = useState(window.location.pathname);
  React.useEffect(() => {
    const update = () => setLocationKey(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  const activeRoute = routedModule || routeForPath(locationKey);
  const selectedSection = selectedModule?.module || activeRoute?.module || activeSection;
  const selectModule = (label: string) => {
    const target = rolePath(user.role, label);
    if (target !== '/') window.history.pushState({}, '', target);
    onSelectSection(label);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900 flex flex-col">
      {/* Top Institutional Bar */}
      <header className="bg-[#0c243e] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/assets/aistudio/somalia_coat_of_arms.png"
              alt="Somalia Coat of Arms"
              className="h-6 sm:h-7 w-auto object-contain shrink-0"
            />
            <span className="font-serif font-bold text-xs sm:text-base tracking-tight truncate">
              SDAS · {portalLabel}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 truncate">
            <span className="font-mono font-semibold text-white">{roleCode}</span>
            <span aria-hidden="true">·</span>
            <span>{roleTitle}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[240px]">{user.assignedArea}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onBackToPublicPortal && (
              <button
                onClick={onBackToPublicPortal}
                className="px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium text-slate-200 hover:text-white border border-slate-600 rounded transition whitespace-nowrap cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Public Portal</span>
                <span className="sm:hidden">Portal</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium bg-[#133860] hover:bg-[#194778] text-white rounded transition whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Identity & Horizontal Section Bar (< lg) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-slate-500 truncate">{roleCode} · {tierText}</div>
            <div className="font-semibold text-xs text-slate-900 truncate">{user.fullName}</div>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileBoundaries(!showMobileBoundaries)}
            className="px-2 py-1 border border-slate-200 bg-slate-50 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Scope</span>
            {showMobileBoundaries ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showMobileBoundaries && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">{user.assignedArea}</div>
            {restrictions.map((r, i) => (
              <div key={i}>• {r}</div>
            ))}
          </div>
        )}

        <div className="flex overflow-x-auto gap-1.5 pb-0.5">
          {navItems.map((item) => {
            const isActive = item.label === selectedSection;
            return (
              <button
                key={item.id}
                onClick={() => selectModule(item.label)}
                aria-current={activeRoute?.module === item.label ? 'page' : undefined}
                className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#0c243e] text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Desktop Left Navigation Sidebar (Hidden on < lg so content comes first on phones) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-md overflow-hidden">
          <div className="p-4 border-b border-slate-200 space-y-1">
            <div className="text-[11px] font-mono text-slate-500">{roleCode} · {tierText}</div>
            <div className="font-semibold text-sm text-slate-900">{user.fullName}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>

          <nav className="divide-y divide-slate-100">
            {navItems.map((item, idx) => {
            const isActive = item.label === selectedSection;
              return (
                <button
                  key={item.id}
                  onClick={() => selectModule(item.label)}
                  aria-current={activeRoute?.module === item.label ? 'page' : undefined}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#0c243e] text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className={`font-mono text-[11px] tabular-nums ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Enforced Policy Constraints */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
            <div className="text-[11px] font-semibold text-slate-700">Enforced Role Boundaries</div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              {restrictions.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="lg:col-span-9 space-y-4 sm:space-y-5 min-w-0">
          {activeRoute && activeRoute.role === user.role && !activeRoute.implemented ? (
            <ModuleWorkspaceView route={activeRoute} roleName={roleTitle} scope={user.assignedArea} />
          ) : children}
        </main>
      </div>
    </div>
  );
};
