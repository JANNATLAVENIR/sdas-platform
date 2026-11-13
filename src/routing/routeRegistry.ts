import { ALL_ROLES } from '../data/rolesData';
import type { UserRole } from '../types/sdas';

export interface ModuleRoute {
  role: UserRole;
  roleSlug: string;
  module: string;
  slug: string;
  path: string;
  implemented: boolean;
  description: string;
}

const ROLE_SLUGS: Record<UserRole, string> = {
  national_super_admin: 'super-admin', national_authority_admin: 'national', director_general: 'director-general',
  department_admin: 'department', regional_admin: 'regional', district_admin: 'district', gis_officer: 'gis',
  data_quality_officer: 'data-quality', field_ops_supervisor: 'field-supervisor', field_surveyor: 'field-surveyor',
  address_verifier: 'verifier', auditor: 'auditor', public_citizen: 'citizen', institutional_api_client: 'api-client'
};

const ROLE_IMPLEMENTED: Record<UserRole, string[]> = {
  national_super_admin: ['global-system-overview','user-accounts-management','security-monitoring','emergency-access-management'],
  national_authority_admin: ['national-overview'],
  director_general: ['executive-dashboard'],
  department_admin: ['department-dashboard'],
  regional_admin: ['regional-dashboard'],
  district_admin: ['district-dashboard'],
  gis_officer: ['gis-workspace'],
  data_quality_officer: ['data-quality-dashboard'],
  field_ops_supervisor: ['field-operations-dashboard'],
  field_surveyor: [],
  address_verifier: ['verification-dashboard'],
  auditor: ['audit-dashboard','complete-audit-logs','security-events'],
  public_citizen: ['search-address'],
  institutional_api_client: ['api-credentials']
};

export const slugifyModule = (label: string) => label.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const MODULE_ROUTES: ModuleRoute[] = ALL_ROLES.flatMap(role => {
  const roleSlug = ROLE_SLUGS[role.id];
  return role.visibleModules.map(module => {
    const slug = slugifyModule(module);
    return { role: role.id, roleSlug, module, slug, path: `/workspace/${roleSlug}/${slug}`, implemented: (ROLE_IMPLEMENTED[role.id] || []).includes(slug), description: `${module} workspace for ${role.name.en}.` };
  });
});

export const rolePath = (role: UserRole, module?: string) => {
  const routes = MODULE_ROUTES.filter(route => route.role === role);
  return (module ? routes.find(route => route.module === module) : routes[0])?.path || '/';
};

export const routeForPath = (path: string) => MODULE_ROUTES.find(route => route.path === path);
export const rolePreviewPath = '/role-preview';
export const PUBLIC_ROUTES = {
  home: '/', search: '/search', registry: '/registry', map: '/map', request: '/request', plates: '/plates',
  stats: '/statistics', services: '/services', about: '/about', resources: '/resources', ussd: '/ussd',
  partners: '/partners', policies: '/policies', help: '/help', contact: '/contact'
} as const;
export type PublicRouteKey = keyof typeof PUBLIC_ROUTES;
export const publicPath = (key: PublicRouteKey) => PUBLIC_ROUTES[key];
export const publicRouteForPath = (path: string): PublicRouteKey | undefined =>
  (Object.keys(PUBLIC_ROUTES) as PublicRouteKey[]).find(key => PUBLIC_ROUTES[key] === path);
export const roleForSlug = (slug: string): UserRole | undefined =>
  (Object.keys(ROLE_SLUGS) as UserRole[]).find(role => ROLE_SLUGS[role] === slug);

