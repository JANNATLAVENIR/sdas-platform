import React from 'react';
import { ALL_ROLES } from '../data/rolesData';
import { MODULE_ROUTES, rolePreviewModulePath, type ModuleRoute } from '../routing/routeRegistry';
import type { UserRole } from '../types/sdas';
import { ModuleWorkspaceView } from './workspaces/ModuleWorkspaceView';

export const DemoRoleWorkspace: React.FC<{ route: ModuleRoute; onNavigate: (path: string) => void }> = ({ route, onNavigate }) => {
  const role = ALL_ROLES.find(item => item.id === route.role)!;
  const modules = MODULE_ROUTES.filter(item => item.role === route.role);
  return <div className="min-h-screen bg-[#f4f6f9] text-slate-900">
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-[#0c243e] px-4 py-3 text-white sm:px-6">
      <div><div className="text-[10px] font-semibold tracking-widest text-amber-200">DEMO ROLE PREVIEW · NO LIVE PERMISSIONS</div><div className="font-serif font-bold">SDAS · {role.name.en}</div></div>
      <button onClick={() => onNavigate('/role-preview')} className="rounded border border-slate-500 px-3 py-1.5 text-xs">All role previews</button>
    </header>
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 p-3 sm:p-6 lg:grid-cols-12">
      <aside className="rounded border border-slate-200 bg-white p-3 lg:col-span-3"><div className="mb-2 border-b border-slate-200 p-2"><div className="font-mono text-xs font-bold">{role.code} · {role.name.en}</div><p className="mt-1 text-[11px] text-slate-500">{role.assignedArea}</p></div><nav aria-label="Demo role modules" className="flex gap-1 overflow-x-auto lg:flex-col">{modules.map(item=><button key={item.path} aria-current={item.path===route.path?'page':undefined} onClick={()=>onNavigate(rolePreviewModulePath(item))} className={`shrink-0 rounded px-3 py-2 text-left text-xs ${item.path===route.path?'bg-[#0c243e] font-semibold text-white':'text-slate-700 hover:bg-slate-100'}`}>{item.module}</button>)}</nav><div className="mt-4 border-t border-slate-200 pt-3 text-[11px] text-slate-600"><div className="font-semibold">Role responsibilities</div><p className="mt-1">{role.summary.en}</p><div className="mt-3 font-semibold">Restrictions</div><ul className="mt-1 list-disc space-y-1 pl-4">{role.restrictions.map(item=><li key={item}>{item}</li>)}</ul></div><select aria-label="Switch demo role" value={role.id} onChange={event=>{const next=MODULE_ROUTES.find(item=>item.role===event.target.value as UserRole);if(next)onNavigate(rolePreviewModulePath(next));}} className="mt-4 w-full rounded border border-slate-300 bg-white p-2 text-xs">{ALL_ROLES.map(item=><option key={item.id} value={item.id}>{item.code} · {item.name.en}</option>)}</select></aside>
      <main className="lg:col-span-9"><ModuleWorkspaceView route={route} roleName={role.name.en} scope={role.assignedArea}/></main>
    </div>
  </div>;
};
