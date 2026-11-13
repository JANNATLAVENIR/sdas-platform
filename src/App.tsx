/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Language, UserRole, AddressRecord } from './types/sdas';
import { MOCK_ADDRESSES } from './data/mockData';
import { PortalHeader } from './components/PortalHeader';
import { PortalFooter } from './components/PortalFooter';
import { HomePortalView } from './components/HomePortalView';
import { SearchVerifyView } from './components/SearchVerifyView';
import { AddressDirectoryView } from './components/AddressDirectoryView';
import { CityMapView } from './components/CityMapView';
import { AddressRequestView } from './components/AddressRequestView';
import { HousePlatesView } from './components/HousePlatesView';
import { StatisticsView } from './components/StatisticsView';
import {
  ServicesView,
  AboutView,
  ResourcesView,
  PoliciesView,
  HelpCenterView,
  ContactView
} from './components/PortalInformationViews';
import { UssdQuickLookupView } from './components/UssdQuickLookupView';
import { InstitutionalPartnersView } from './components/InstitutionalPartnersView';
import { SignInModal, LatestUpdateModal } from './components/PortalModals';
import { AuthenticatedWorkspaceRouter } from './components/workspaces/AuthenticatedWorkspaceRouter';
import { fetchCurrentSession, logoutSession } from './api/sdasClient';
import type { AuthUser } from './api/sdasClient';
import { ArrowLeft } from 'lucide-react';
import { MODULE_ROUTES, PUBLIC_ROUTES, publicRouteForPath, rolePath, rolePreviewPath, rolePreviewRouteForPath, rolePreviewModulePath, routeForPath } from './routing/routeRegistry';
import { RolePreviewWorkspace } from './components/RolePreviewWorkspace';
import { DemoRoleWorkspace } from './components/DemoRoleWorkspace';

type PortalView =
  | 'home'
  | 'search'
  | 'registry'
  | 'map'
  | 'request'
  | 'plates'
  | 'stats'
  | 'services'
  | 'about'
  | 'resources'
  | 'ussd'
  | 'partners'
  | 'policies'
  | 'help'
  | 'contact';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeNav, setActiveNav] = useState<string>('home');
  const [currentView, setCurrentView] = useState<PortalView>('home');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showWorkspace, setShowWorkspace] = useState<boolean>(false);
  const [pathname, setPathname] = useState(window.location.pathname);
  const [sessionReady, setSessionReady] = useState(false);
  const [breakGlassActive, setBreakGlassActive] = useState<boolean>(false);

  const [selectedAddressForInspect, setSelectedAddressForInspect] = useState<AddressRecord>(MOCK_ADDRESSES[0]);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLatestUpdateOpen, setIsLatestUpdateOpen] = useState(false);

  const activeRole: UserRole = authUser ? authUser.role : 'public_citizen';
  const isSignedIn = Boolean(authUser);

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const navigatePath = (path: string, replace = false) => {
    if (window.location.pathname !== path) {
      (replace ? window.history.replaceState : window.history.pushState).call(window.history, {}, '', path);
    }
    setPathname(path);
  };

  const moduleRoute = routeForPath(pathname);
  const publicKey = publicRouteForPath(pathname);
  const previewRoute = pathname === rolePreviewPath;
  const previewModule = rolePreviewRouteForPath(pathname);
  const unknownRoute = !moduleRoute && !publicKey && !previewRoute && !previewModule;

  useEffect(() => {
    fetchCurrentSession().then((sess) => {
      if (sess?.user) {
        setAuthUser(sess.user);
        setBreakGlassActive(sess.breakGlassActive);
        setShowWorkspace(true);
      }
      setSessionReady(true);
    });
  }, []);

  const handleNavigate = (view: string) => {
    if (view === 'desk') {
      if (authUser) {
        navigatePath(rolePath(authUser.role));
      } else {
        setIsSignInOpen(true);
      }
      return;
    }
    const typedView = view as PortalView;
    const publicPath = PUBLIC_ROUTES[typedView as keyof typeof PUBLIC_ROUTES];
    if (publicPath) navigatePath(publicPath);
    setCurrentView(typedView);
    if (['home', 'services', 'resources', 'about'].includes(view)) {
      setActiveNav(view);
    } else {
      setActiveNav('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (publicKey) setCurrentView(publicKey as PortalView);
  }, [pathname]);

  const handleSelectAddress = (addr: AddressRecord) => {
    setSelectedAddressForInspect(addr);
    handleNavigate('search');
  };

  const handleQuickVerify = (codeOrQuery: string) => {
    const cleaned = codeOrQuery.trim().toLowerCase();
    const matched = MOCK_ADDRESSES.find(
      (a) =>
        a.publicCode.toLowerCase().includes(cleaned) ||
        a.components.district.toLowerCase().includes(cleaned) ||
        a.components.locality.toLowerCase().includes(cleaned) ||
        (a.components.street && a.components.street.toLowerCase().includes(cleaned))
    );
    if (matched) {
      setSelectedAddressForInspect(matched);
    }
    handleNavigate('search');
  };

  const handleAuthenticated = (user: AuthUser, bgActive: boolean) => {
    setAuthUser(user);
    setBreakGlassActive(bgActive);
    setShowWorkspace(true);
    const requestedRoute = routeForPath(window.location.pathname);
    navigatePath(requestedRoute?.role === user.role ? requestedRoute.path : rolePath(user.role), true);
  };

  const handleSignOut = async () => {
    await logoutSession();
    setAuthUser(null);
    setBreakGlassActive(false);
    setShowWorkspace(false);
    handleNavigate('home');
  };

  useEffect(() => {
    if (moduleRoute && sessionReady && !authUser) setIsSignInOpen(true);
  }, [pathname, sessionReady, authUser]);

  // Dedicated authenticated role-specific workspace view (14 distinct workspaces)
  if (!sessionReady && moduleRoute) return <main className="min-h-screen grid place-items-center text-sm text-slate-600">Loading workspace session…</main>;
  if (authUser && moduleRoute && authUser.role === moduleRoute.role) {
    return (
      <AuthenticatedWorkspaceRouter
        user={authUser}
        language={language}
        onLogout={handleSignOut}
        onBackToPublicPortal={() => setShowWorkspace(false)}
        onBreakGlassChanged={setBreakGlassActive}
        route={moduleRoute}
      />
    );
  }
  if (moduleRoute && authUser && authUser.role !== moduleRoute.role) return <main className="min-h-screen p-10"><h1 className="text-2xl font-bold">Workspace unavailable</h1><p className="mt-2">Your signed-in role does not match this workspace.</p><button className="mt-5 underline" onClick={() => navigatePath(rolePath(authUser.role))}>Open your workspace</button></main>;
  if (moduleRoute && !authUser) return <main className="min-h-screen p-10"><h1 className="text-2xl font-bold">Sign in required</h1><p className="mt-2">Sign in with an account for this workspace to continue.</p><button className="mt-5 underline" onClick={() => setIsSignInOpen(true)}>Sign in</button><SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} language={language} onAuthenticated={handleAuthenticated} /></main>;

  if (previewModule) return <DemoRoleWorkspace route={previewModule} onNavigate={navigatePath} />;
  if (previewRoute) return <RolePreviewWorkspace language={language} activeRole={activeRole} onSelectRole={(role) => { const route = MODULE_ROUTES.find(item => item.role === role)!; navigatePath(rolePreviewModulePath(route)); }} onNavigate={handleNavigate} />;
  if (unknownRoute) return <main className="min-h-screen p-10 font-sans"><h1 className="text-2xl font-bold">Page not found</h1><p className="mt-2">The requested SDAS page or workspace module does not exist.</p><button className="mt-5 underline" onClick={() => navigatePath('/')}>Return to portal</button></main>;

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-[#0c2b4e] selection:text-white"
    >
      {/* Top Portal Header */}
      <PortalHeader
        language={language}
        setLanguage={setLanguage}
        activeNav={activeNav}
        setActiveNav={handleNavigate}
        activeRole={activeRole}
        authUser={authUser}
        isSignedIn={isSignedIn}
        breakGlassActive={breakGlassActive}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onOpenWorkspace={() => setShowWorkspace(true)}
        onSignOut={handleSignOut}
      />

      {/* Sub-view Breadcrumb Bar (when away from home) */}
      {currentView !== 'home' && (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 text-xs text-slate-600 flex items-center justify-between">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-1.5 font-semibold text-blue-900 hover:text-blue-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {language === 'so'
                ? 'Ku noqo Bogga Hore'
                : language === 'ar'
                ? 'العودة إلى الرئيسية'
                : 'Back to Home Portal'}
            </span>
          </button>
          <span className="font-mono text-[11px] text-slate-400 uppercase">
            SDAS Mogadishu | {currentView}
          </span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePortalView
            language={language}
            activeRole={activeRole}
            isSignedIn={isSignedIn}
            breakGlassActive={breakGlassActive}
            onNavigate={handleNavigate}
            onQuickVerify={handleQuickVerify}
            onOpenSignIn={() => setIsSignInOpen(true)}
            onOpenLatestUpdate={() => setIsLatestUpdateOpen(true)}
          />
        )}

        {currentView === 'search' && (
          <SearchVerifyView
            language={language}
            activeRole={activeRole}
            breakGlassActive={breakGlassActive}
            selectedAddress={selectedAddressForInspect}
            onNavigate={handleNavigate}
            onSelectAddress={handleSelectAddress}
          />
        )}

        {currentView === 'registry' && (
          <AddressDirectoryView
            language={language}
            activeRole={activeRole}
            breakGlassActive={breakGlassActive}
            onSelectAddress={handleSelectAddress}
          />
        )}

        {currentView === 'map' && (
          <CityMapView
            language={language}
            activeRole={activeRole}
            breakGlassActive={breakGlassActive}
            onSelectAddress={handleSelectAddress}
          />
        )}

        {currentView === 'request' && (
          <AddressRequestView
            language={language}
            activeRole={activeRole}
            onNavigate={handleNavigate}
            onOpenSignIn={() => setIsSignInOpen(true)}
          />
        )}

        {currentView === 'plates' && (
          <HousePlatesView
            language={language}
            activeRole={activeRole}
            onOpenSignIn={() => setIsSignInOpen(true)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'stats' && (
          <StatisticsView language={language} activeRole={activeRole} />
        )}

        {currentView === 'ussd' && <UssdQuickLookupView />}

        {currentView === 'partners' && <InstitutionalPartnersView />}

        {currentView === 'services' && <ServicesView onNavigate={handleNavigate} />}

        {currentView === 'about' && <AboutView />}

        {currentView === 'resources' && <ResourcesView />}

        {currentView === 'policies' && <PoliciesView />}

        {currentView === 'help' && <HelpCenterView onNavigate={handleNavigate} />}

        {currentView === 'contact' && <ContactView />}
      </main>

      {/* Official Government Footer */}
      <PortalFooter language={language} onNavigate={handleNavigate} />

      {/* Real Credential Authentication & Latest Update Modals */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        language={language}
        onAuthenticated={handleAuthenticated}
      />

      <LatestUpdateModal
        isOpen={isLatestUpdateOpen}
        onClose={() => setIsLatestUpdateOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
