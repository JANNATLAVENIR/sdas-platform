import { MODULE_ROUTES, type ModuleRoute } from './routeRegistry';
import { ALL_ROLES } from '../data/rolesData';

export type ModuleScreenKind = 'geospatial' | 'analytics' | 'workflow' | 'administration' | 'field' | 'audit' | 'integration' | 'citizen' | 'records';
export interface ModuleScreenDefinition {
  route: ModuleRoute;
  kind: ModuleScreenKind;
  screenKey: string;
  purpose: string;
  action: string;
  readOnly: boolean;
  fields: Array<{ label: string; type: 'text' | 'email' | 'date' | 'number' }>;
  columns: Array<{ key: 'id' | 'title' | 'area' | 'status' | 'owner'; label: string }>;
  metrics: [string, string, string];
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
  const kind = kindFor(route);
  if (kind === 'analytics') return [{ label: 'Reporting period', type: 'text' }, { label: 'Start date', type: 'date' }, { label: 'End date', type: 'date' }];
  if (kind === 'geospatial') return [{ label: 'Layer or feature name', type: 'text' }, { label: 'Administrative area', type: 'text' }, { label: 'Map note', type: 'text' }];
  if (kind === 'field') return [{ label: 'Field task reference', type: 'text' }, { label: 'Assigned location', type: 'text' }, { label: 'Capture note', type: 'text' }];
  if (kind === 'citizen') return [{ label: 'Address code or search', type: 'text' }, { label: 'District / locality', type: 'text' }, { label: 'Request details', type: 'text' }];
  if (/api|credential|key/.test(slug)) return [{ label: 'Application name', type: 'text' }, { label: 'Contact email', type: 'email' }, { label: 'Requested scope', type: 'text' }];
  if (/staff|user|team|assignment/.test(slug)) return [{ label: 'Staff member', type: 'text' }, { label: 'Assigned district', type: 'text' }, { label: 'Due date', type: 'date' }];
  if (/address|request|application|correction|complaint/.test(slug)) return [{ label: 'Address code or reference', type: 'text' }, { label: 'District / locality', type: 'text' }, { label: 'Request details', type: 'text' }];
  if (/coordinate|gps|location/.test(slug)) return [{ label: 'Latitude', type: 'number' }, { label: 'Longitude', type: 'number' }, { label: 'Accuracy (metres)', type: 'number' }];
  if (/policy|standard|configuration|setting|permission/.test(slug)) return [{ label: 'Setting name', type: 'text' }, { label: 'Proposed value', type: 'text' }, { label: 'Justification', type: 'text' }];
  return [{ label: 'Reference', type: 'text' }, { label: 'Assigned area', type: 'text' }, { label: 'Notes', type: 'text' }];
};

const actionFor = (route: ModuleRoute, kind: ModuleScreenKind) => {
  const slug = route.slug;
  if (kind === 'audit') return /report/.test(slug) ? 'Build demo report' : 'Export demo log';
  if (kind === 'analytics') return /dashboard|overview/.test(slug) ? 'Choose reporting period' : 'Generate demo report';
  if (kind === 'integration') return /documentation/.test(slug) ? 'View sample request' : /usage|rate/.test(slug) ? 'Export usage sample' : 'Request demo credential';
  if (kind === 'geospatial') return /import/.test(slug) ? 'Select demo file' : /validation/.test(slug) ? 'Run sample validation' : 'Add demo map note';
  if (kind === 'field') return /photo|evidence/.test(slug) ? 'Add demo evidence' : /offline|sync/.test(slug) ? 'Review demo sync queue' : 'Start demo field task';
  if (kind === 'citizen') return /sharing/.test(slug) ? 'Copy sample address' : /qr/.test(slug) ? 'Verify sample code' : /correction|request|application/.test(slug) ? 'Start demo request' : 'Search public addresses';
  if (/staff|user|team|assignment/.test(slug)) return 'Create demo assignment';
  if (/request|application|address|correction|complaint/.test(slug)) return 'Start demo request';
  if (/permission|configuration|policy|standard/.test(slug)) return 'Review demo change';
  return `Open ${route.module.toLowerCase()}`;
};

const columnsFor = (kind: ModuleScreenKind): ModuleScreenDefinition['columns'] => {
  switch (kind) {
    case 'geospatial': return [{ key: 'id', label: 'Feature ID' }, { key: 'title', label: 'Map feature / layer' }, { key: 'area', label: 'Geographic area' }, { key: 'status', label: 'Review status' }, { key: 'owner', label: 'Data steward' }];
    case 'analytics': return [{ key: 'id', label: 'Report ID' }, { key: 'title', label: 'Measure / report' }, { key: 'area', label: 'Reporting period' }, { key: 'status', label: 'Availability' }, { key: 'owner', label: 'Responsible unit' }];
    case 'workflow': return [{ key: 'id', label: 'Case reference' }, { key: 'title', label: 'Request / task' }, { key: 'area', label: 'Assigned scope' }, { key: 'status', label: 'Workflow stage' }, { key: 'owner', label: 'Assigned unit' }];
    case 'administration': return [{ key: 'id', label: 'Record ID' }, { key: 'title', label: 'Staff / configuration item' }, { key: 'area', label: 'Administrative scope' }, { key: 'status', label: 'Current state' }, { key: 'owner', label: 'Responsible office' }];
    case 'field': return [{ key: 'id', label: 'Task / capture ID' }, { key: 'title', label: 'Field activity' }, { key: 'area', label: 'Assigned area' }, { key: 'status', label: 'Capture / sync state' }, { key: 'owner', label: 'Field team' }];
    case 'audit': return [{ key: 'id', label: 'Event ID' }, { key: 'title', label: 'Recorded event' }, { key: 'area', label: 'Scope / target' }, { key: 'status', label: 'Audit status' }, { key: 'owner', label: 'Actor' }];
    case 'integration': return [{ key: 'id', label: 'API reference' }, { key: 'title', label: 'Endpoint / integration' }, { key: 'area', label: 'Authorized scope' }, { key: 'status', label: 'Service state' }, { key: 'owner', label: 'Client / system' }];
    case 'citizen': return [{ key: 'id', label: 'Public reference' }, { key: 'title', label: 'Address / citizen request' }, { key: 'area', label: 'Public location' }, { key: 'status', label: 'Public status' }, { key: 'owner', label: 'Service desk' }];
    default: return [{ key: 'id', label: 'Reference' }, { key: 'title', label: 'Item' }, { key: 'area', label: 'Area / scope' }, { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' }];
  }
};

const metricsFor = (route: ModuleRoute, kind: ModuleScreenKind): ModuleScreenDefinition['metrics'] => {
  const scopeLabel = route.roleSlug === 'citizen' ? 'Public access' : route.roleSlug === 'field-surveyor' ? 'Assigned field area' : 'Role scope';
  if (kind === 'audit') return ['Events in view', '3 sample events', 'Read only'];
  if (kind === 'integration') return ['Service endpoints', '3 examples', 'Sandbox display'];
  if (kind === 'geospatial') return ['Map features', '3 sample features', 'Layer preview'];
  if (kind === 'field') return ['Field activities', '3 sample tasks', 'Offline UI preview'];
  if (kind === 'citizen') return ['Public examples', '3 sample records', 'Published fields only'];
  if (kind === 'analytics') return ['Reporting period', 'Sample period', 'Illustrative metrics'];
  if (kind === 'workflow') return ['Cases in queue', '3 sample cases', 'Workflow preview'];
  return [`${route.module} items`, '3 sample records', scopeLabel];
};

const definitions = MODULE_ROUTES.map(route => {
  const kind = kindFor(route);
  const role = ALL_ROLES.find(item => item.id === route.role);
  const purpose = `${route.module} for ${role?.name.en ?? route.role}: ${role?.summary.en ?? route.description}`;
  return { route, kind, screenKey: `${route.roleSlug}:${route.slug}`, purpose, action: actionFor(route, kind), readOnly: kind === 'audit', fields: fieldsFor(route), columns: columnsFor(kind), metrics: metricsFor(route, kind) } satisfies ModuleScreenDefinition;
});

const definitionsByPath = new Map(definitions.map(definition => [definition.route.path, definition]));

export const getModuleScreenDefinition = (route: ModuleRoute): ModuleScreenDefinition | undefined => definitionsByPath.get(route.path);
export const MODULE_SCREEN_DEFINITIONS = definitions;
export const MODULE_SCREEN_COVERAGE = {
  total: MODULE_ROUTES.length,
  covered: definitionsByPath.size,
  missingPaths: MODULE_ROUTES.filter(route => !definitionsByPath.has(route.path)).map(route => route.path),
  uniqueScreens: new Set(definitions.map(definition => definition.screenKey)).size,
  duplicateScreenKeys: definitions.map(definition => definition.screenKey).filter((key, index, keys) => keys.indexOf(key) !== index)
};
