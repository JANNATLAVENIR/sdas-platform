import React from 'react';
import type { AuthUser } from '../../api/sdasClient';
import { Role01SuperAdminWorkspace } from './Role01SuperAdminWorkspace';
import { Role02AuthorityAdminWorkspace } from './Role02AuthorityAdminWorkspace';
import { Role03DirectorGeneralWorkspace } from './Role03DirectorGeneralWorkspace';
import { Role04DepartmentAdminWorkspace } from './Role04DepartmentAdminWorkspace';
import { Role05RegionalAdminWorkspace } from './Role05RegionalAdminWorkspace';
import { Role06DistrictAdminWorkspace } from './Role06DistrictAdminWorkspace';
import { Role07GisOfficerWorkspace } from './Role07GisOfficerWorkspace';
import { Role08DataQualityWorkspace } from './Role08DataQualityWorkspace';
import { Role09FieldSupervisorWorkspace } from './Role09FieldSupervisorWorkspace';
import { Role10FieldSurveyorMobileWorkspace } from './Role10FieldSurveyorMobileWorkspace';
import { Role11AddressVerifierWorkspace } from './Role11AddressVerifierWorkspace';
import { Role12AuditorWorkspace } from './Role12AuditorWorkspace';
import { Role13CitizenWorkspace } from './Role13CitizenWorkspace';
import { Role14InstitutionalApiWorkspace } from './Role14InstitutionalApiWorkspace';

import type { Language } from '../../types/sdas';
import type { ModuleRoute } from '../../routing/routeRegistry';
import { rolePath } from '../../routing/routeRegistry';
import { WorkspaceRouteContext } from '../../routing/WorkspaceRouteContext';

interface Props {
  user: AuthUser;
  language: Language;
  onLogout: () => void;
  onBackToPublicPortal: () => void;
  onBreakGlassChanged?: (active: boolean) => void;
  route: ModuleRoute;
}

const WorkspaceRouteView: React.FC<Props> = ({
  user,
  language,
  onLogout,
  onBackToPublicPortal,
  onBreakGlassChanged
  , route
}) => {
  if (route.role !== user.role) return <main className="min-h-screen p-10"><h1 className="text-2xl font-bold">Unauthorized workspace</h1><p>Your account cannot open this role workspace.</p><a className="underline" href={rolePath(user.role)}>Open your workspace</a></main>;
  switch (user.role) {
    case 'national_super_admin':
      return (
        <Role01SuperAdminWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
          onBreakGlassChanged={onBreakGlassChanged}
        />
      );
    case 'national_authority_admin':
      return (
        <Role02AuthorityAdminWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'director_general':
      return (
        <Role03DirectorGeneralWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'department_admin':
      return (
        <Role04DepartmentAdminWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'regional_admin':
      return (
        <Role05RegionalAdminWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'district_admin':
      return (
        <Role06DistrictAdminWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'gis_officer':
      return (
        <Role07GisOfficerWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'data_quality_officer':
      return (
        <Role08DataQualityWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'field_ops_supervisor':
      return (
        <Role09FieldSupervisorWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'field_surveyor':
      return (
        <Role10FieldSurveyorMobileWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'address_verifier':
      return (
        <Role11AddressVerifierWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'auditor':
      return (
        <Role12AuditorWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'public_citizen':
      return (
        <Role13CitizenWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
    case 'institutional_api_client':
      return (
        <Role14InstitutionalApiWorkspace
          user={user}
          language={language}
          onLogout={onLogout}
          onBackToPublicPortal={onBackToPublicPortal}
        />
      );
  }
};

export const AuthenticatedWorkspaceRouter: React.FC<Props> = (props) => (
  <WorkspaceRouteContext.Provider value={props.route}>
    <WorkspaceRouteView {...props} />
  </WorkspaceRouteContext.Provider>
);
