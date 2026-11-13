import { createContext } from 'react';
import type { ModuleRoute } from './routeRegistry';
export const WorkspaceRouteContext = createContext<ModuleRoute | null>(null);
