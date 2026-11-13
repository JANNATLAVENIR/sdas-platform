import React, { useMemo, useState } from 'react';
import { Search, Filter, ArrowUpRight, ClipboardList, MapPin, ShieldCheck } from 'lucide-react';
import type { ModuleRoute } from '../../routing/routeRegistry';

interface Props { route: ModuleRoute; roleName: string; scope: string; }

const rowsFor = (route: ModuleRoute) => {
  const slug = route.slug;
  if (/map|gis|boundary|coordinate|street|footprint|layer|area|coverage/.test(slug)) return [
    ['MAP-01', route.module, 'Hodan', 'Review required'], ['MAP-02', route.module, 'Wadajir', 'In progress'], ['MAP-03', route.module, 'Kaaraan', 'Updated recently']
  ];
  if (/audit|log|history|compliance|security|activity/.test(slug)) return [
    ['AUD-9041', 'address.designated_official', 'R03 Director General', 'Read only'], ['AUD-9040', 'address.verified', 'R11 Address Verifier', 'Read only'], ['AUD-9039', 'address.approved', 'R06 District Administrator', 'Read only']
  ];
  if (/api|endpoint|credential|rate|integration|error/.test(slug)) return [
    ['API-01', 'Address lookup', 'Enabled scope', 'Demo data'], ['API-02', 'Address validation', 'Enabled scope', 'Demo data'], ['API-03', 'Geocoding', 'Restricted scope', 'Demo data']
  ];
  if (/staff|user|team|surveyor|assignment|task|field|survey/.test(slug)) return [
    ['TASK-104', 'Review Hodan address batch', 'Assigned team', 'In progress'], ['TASK-105', 'Check field submission', 'Survey team', 'Pending'], ['TASK-106', 'Review correction request', 'District office', 'Needs review']
  ];
  if (/request|application|approval|verification|correction|complaint|queue|address|registry|duplicate|quality/.test(slug)) return [
    ['APP-2026-4409', 'SDAS-MOG-7482', 'Hodan District', 'Awaiting review'], ['APP-2026-4410', 'SDAS-MOG-3091', 'Wadajir District', 'Verified'], ['APP-2026-4411', 'SDAS-MOG-1824', 'Kaaraan District', 'Correction requested']
  ];
  return [['RPT-01', 'Operational overview', route.module, 'Available'], ['RPT-02', 'Current period summary', route.module, 'Available'], ['RPT-03', 'Recent activity', route.module, 'Available']];
};

export const ModuleWorkspaceView: React.FC<Props> = ({ route, roleName, scope }) => {
  const rows = useMemo(() => rowsFor(route), [route]);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const filtered = rows.filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase()));
  const columns = /audit|log|history|compliance/.test(route.slug) ? ['Event ID', 'Event', 'Actor', 'Access'] : ['Reference', 'Item', 'Area / Type', 'Status'];

  return <div className="space-y-4" data-module-screen={route.slug}>
    <section className="bg-white border border-slate-200 rounded-md p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="text-[10px] font-semibold tracking-wider text-amber-800 uppercase">DEMO DATA · UI ONLY</div><h1 className="mt-1 text-xl font-serif font-bold text-slate-900">{route.module}</h1><p className="mt-1 text-xs text-slate-500">{roleName} · {scope}</p><p className="mt-2 max-w-3xl text-sm text-slate-600">{route.description} This screen demonstrates the intended workspace layout; displayed records are fixtures and actions are not submitted.</p></div>
        <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700"><ShieldCheck className="h-3.5 w-3.5"/> Role scoped</span>
      </div>
    </section>
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[['Items in view', String(rows.length), 'Demo records'], ['Needs attention', String(rows.filter(r => /pending|review|correction/i.test(r[3])).length), 'Review queue'], ['Current scope', 'Assigned', scope]].map(([label,value,detail])=><article key={label} className="bg-white border border-slate-200 rounded-md p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</div><div className="mt-1 text-[11px] text-slate-500">{detail}</div></article>)}
    </section>
    <section className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-slate-600"/><h2 className="text-sm font-semibold text-slate-900">{route.module} records</h2></div><div className="flex gap-2"><label className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400"/><input aria-label="Search module records" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search records" className="w-44 rounded border border-slate-300 py-1.5 pl-8 pr-2 text-xs"/></label><button onClick={()=>setNotice('Filters are shown for interface preview only.')} className="inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1.5 text-xs"><Filter className="h-3.5 w-3.5"/>Filters</button></div></div>
      <div className="overflow-x-auto border border-slate-200 rounded"><table className="w-full min-w-[560px] text-left text-xs"><thead className="bg-slate-50 text-slate-600"><tr>{columns.map(c=><th key={c} className="p-2.5 font-semibold">{c}</th>)}<th className="p-2.5">Action</th></tr></thead><tbody className="divide-y divide-slate-200">{filtered.map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={i} className={`p-2.5 ${i===0?'font-mono font-semibold':''}`}>{i===2&&/map|gis|coordinate/.test(route.slug)&&<MapPin className="mr-1 inline h-3 w-3"/>}{cell}</td>)}<td className="p-2.5"><button onClick={()=>setNotice(`${row[0]} opened in demo preview. No data was changed.`)} className="inline-flex items-center gap-1 text-blue-900 underline">Open <ArrowUpRight className="h-3 w-3"/></button></td></tr>)}{filtered.length===0&&<tr><td className="p-5 text-center text-slate-500" colSpan={5}>No demo records match this search.</td></tr>}</tbody></table></div>
      {notice&&<div role="status" className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">{notice}</div>}
      <p className="text-[11px] text-slate-500">Demo interface only. No live records are changed by these controls.</p>
    </section>
  </div>;
};
