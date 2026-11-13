import { MODULE_ROUTES, type ModuleRoute } from './routeRegistry';

export type ModuleScreenKind = 'geospatial' | 'analytics' | 'workflow' | 'administration' | 'field' | 'audit' | 'integration' | 'citizen' | 'records';
export interface ModuleScreenDefinition {
  route: ModuleRoute;
  kind: ModuleScreenKind;
  action: string;
  readOnly: boolean;
  fields: Array<{ label: string; type: 'text' | 'email' | 'date' | 'number' }>;
}

const kindFor = (route: ModuleRoute): ModuleScreenKind => {
  const slug = route.slug;
  if (/audit|log|history|compliance|security|activity/.test(slug)) return 'audit';
  if (/api|endpoint|credential|rate|integration|error/.test(slug)) return 'integration';
  if (/map|gis|boundary|coordinate|street|footprint|layer|area|coverage/.test(slug)) return 'geospatial';
  if (/field|survey|gps|offline|synchronization|evidence|entrance-capture/.test(slug)) return 'field';
  if (/citizen|public-homepage|address-sharing|qr-verification|explore-somalia/.test(slug)) return 'citizen';
  if (/dashboard|overview|report|statistics|performance|analytics/.test(slug)) return 'analytics';
  if (/queue|task|request|application|approval|verification|correction|complaint|escalat/.test(slug)) return 'workflow';
  if (/staff|user|team|department|region|district|permission|configuration|standard|policy|code-management/.test(slug)) return 'administration';
  return 'records';
};

const fieldsFor = (route: ModuleRoute): ModuleScreenDefinition['fields'] => {
  const slug = route.slug;
  if (/api|credential|key/.test(slug)) return [{ label: 'Application name', type: 'text' }, { label: 'Contact email', type: 'email' }, { label: 'Requested scope', type: 'text' }];
  if (/staff|user|team|assignment/.test(slug)) return [{ label: 'Staff member', type: 'text' }, { label: 'Assigned district', type: 'text' }, { label: 'Due date', type: 'date' }];
  if (/address|request|application|correction|complaint/.test(slug)) return [{ label: 'Address code or reference', type: 'text' }, { label: 'District / locality', type: 'text' }, { label: 'Request details', type: 'text' }];
  if (/coordinate|gps|location/.test(slug)) return [{ label: 'Latitude', type: 'number' }, { label: 'Longitude', type: 'number' }, { label: 'Accuracy (metres)', type: 'number' }];
  if (/policy|standard|configuration|setting|permission/.test(slug)) return [{ label: 'Setting name', type: 'text' }, { label: 'Proposed value', type: 'text' }, { label: 'Justification', type: 'text' }];
  return [{ label: 'Reference', type: 'text' }, { label: 'Assigned area', type: 'text' }, { label: 'Notes', type: 'text' }];
};

const actionFor = (route: ModuleRoute, kind: ModuleScreenKind) => {
  if (kind === 'audit') return 'Export report';
  if (kind === 'analytics') return 'Generate report';
  if (kind === 'integration') return 'Request credential';
  if (/staff|user|team|assignment/.test(route.slug)) return 'New assignment';
  if (/request|application|address|correction|complaint/.test(route.slug)) return 'New request';
  if (kind === 'geospatial') return 'Add map note';
  if (kind === 'field') return 'New field observation';
  if (kind === 'citizen') return 'Start address request';
  return 'Create item';
};

const definitions = MODULE_ROUTES.map(route => {
  const kind = kindFor(route);
  return { route, kind, action: actionFor(route, kind), readOnly: kind === 'audit', fields: fieldsFor(route) } satisfies ModuleScreenDefinition;
});

const definitionsByPath = new Map(definitions.map(definition => [definition.route.path, definition]));

export const getModuleScreenDefinition = (route: ModuleRoute): ModuleScreenDefinition | undefined => definitionsByPath.get(route.path);
export const MODULE_SCREEN_DEFINITIONS = definitions;
export const MODULE_SCREEN_COVERAGE = {
  total: MODULE_ROUTES.length,
  covered: definitionsByPath.size,
  missingPaths: MODULE_ROUTES.filter(route => !definitionsByPath.has(route.path)).map(route => route.path)
};
