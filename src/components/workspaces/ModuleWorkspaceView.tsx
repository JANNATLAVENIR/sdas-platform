import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BarChart3, ClipboardList, Download, Filter, MapPin, Plus, Search, Settings2, ShieldCheck, Users, Workflow, X } from 'lucide-react';
import type { ModuleRoute } from '../../routing/routeRegistry';

interface Props { route: ModuleRoute; roleName: string; scope: string; }
type RecordRow = { id: string; title: string; area: string; status: string; owner: string };

const recordsFor = (route: ModuleRoute, roleName: string): RecordRow[] => {
  const slug = route.slug;
  if (/map|gis|boundary|coordinate|street|footprint|layer|area|coverage/.test(slug)) return [
    { id: 'MAP-01', title: `${route.module} · Hodan`, area: 'Hodan', status: 'Review required', owner: 'GIS team' },
    { id: 'MAP-02', title: `${route.module} · Wadajir`, area: 'Wadajir', status: 'In progress', owner: 'Regional team' },
    { id: 'MAP-03', title: `${route.module} · Kaaraan`, area: 'Kaaraan', status: 'Updated recently', owner: 'District team' }
  ];
  if (/audit|log|history|compliance|security|activity/.test(slug)) return [
    { id: 'AUD-9041', title: 'address.designated_official', area: 'National office', status: 'Read only', owner: 'R03 Director General' },
    { id: 'AUD-9040', title: 'address.verified', area: 'Wadajir District', status: 'Read only', owner: 'R11 Address Verifier' },
    { id: 'AUD-9039', title: 'address.approved', area: 'Kaaraan District', status: 'Read only', owner: 'R06 District Administrator' }
  ];
  if (/api|endpoint|credential|rate|integration|error/.test(slug)) return [
    { id: 'API-01', title: 'Address lookup', area: 'Authorized scope', status: 'Enabled', owner: 'Institutional client' },
    { id: 'API-02', title: 'Address validation', area: 'Authorized scope', status: 'Enabled', owner: 'Institutional client' },
    { id: 'API-03', title: 'Geocoding', area: 'Restricted scope', status: 'Review required', owner: 'Institutional client' }
  ];
  if (/staff|user|team|surveyor|assignment|task|field|survey/.test(slug)) return [
    { id: 'TASK-104', title: 'Review Hodan address batch', area: 'Assigned team', status: 'In progress', owner: 'Field team A' },
    { id: 'TASK-105', title: 'Check field submission', area: 'Survey team', status: 'Pending', owner: 'Field team B' },
    { id: 'TASK-106', title: 'Review correction request', area: 'District office', status: 'Needs review', owner: 'Address team' }
  ];
  if (/request|application|approval|verification|correction|complaint|queue|address|registry|duplicate|quality/.test(slug)) return [
    { id: 'APP-4409', title: 'SDAS-MOG-7482', area: 'Hodan District', status: 'Awaiting review', owner: 'District office' },
    { id: 'APP-4410', title: 'SDAS-MOG-3091', area: 'Wadajir District', status: 'Verified', owner: 'Verification team' },
    { id: 'APP-4411', title: 'SDAS-MOG-1824', area: 'Kaaraan District', status: 'Correction requested', owner: 'Address team' }
  ];
  return [
    { id: 'RPT-01', title: `${route.module} · Current period`, area: route.module, status: 'Available', owner: roleName },
    { id: 'RPT-02', title: 'Operational summary', area: route.module, status: 'Available', owner: 'SDAS Operations' },
    { id: 'RPT-03', title: 'Recent activity', area: route.module, status: 'Available', owner: 'SDAS Operations' }
  ];
};

const primaryActionFor = (route: ModuleRoute) => /audit|log|history|security/.test(route.slug) ? 'Export report' : /report|statistics|performance/.test(route.slug) ? 'Generate report' : /staff|user|team|assignment/.test(route.slug) ? 'New assignment' : /api|credential|key/.test(route.slug) ? 'Request credential' : /request|application|address|correction/.test(route.slug) ? 'New request' : 'Create item';
const moduleVariant = (route: ModuleRoute) => {
  if (/map|gis|boundary|coordinate|street|footprint|layer|area|coverage/.test(route.slug)) return 'geospatial';
  if (/dashboard|overview|report|statistics|performance|analytics/.test(route.slug)) return 'analytics';
  if (/queue|task|request|application|approval|verification|correction|complaint|escalat/.test(route.slug)) return 'workflow';
  if (/staff|user|team|department|region|district|permission|configuration|standard|policy/.test(route.slug)) return 'administration';
  return 'records';
};
const formFieldsFor = (route: ModuleRoute) => {
  if (/staff|user|team|assignment/.test(route.slug)) return [['Staff member', 'text'], ['Assigned district', 'text'], ['Due date', 'date']];
  if (/api|credential|key/.test(route.slug)) return [['Application name', 'text'], ['Contact email', 'email'], ['Requested scope', 'text']];
  if (/address|request|application|correction|complaint/.test(route.slug)) return [['Address code or reference', 'text'], ['District / locality', 'text'], ['Request details', 'text']];
  if (/policy|standard|configuration|setting/.test(route.slug)) return [['Setting name', 'text'], ['Proposed value', 'text'], ['Change justification', 'text']];
  return [['Reference', 'text'], ['Assigned area', 'text'], ['Notes', 'text']];
};

export const ModuleWorkspaceView: React.FC<Props> = ({ route, roleName, scope }) => {
  const [records, setRecords] = useState(() => recordsFor(route, roleName));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<RecordRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftFields, setDraftFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const readOnly = /audit|log|history|security/.test(route.slug);
  const filtered = useMemo(() => records.filter(row =>
    row.status.toLowerCase().includes(statusFilter === 'all' ? '' : statusFilter) &&
    `${row.id} ${row.title} ${row.area} ${row.status} ${row.owner}`.toLowerCase().includes(query.toLowerCase())
  ), [records, query, statusFilter]);
  const statuses = Array.from(new Set(records.map(record => record.status)));
  const variant = moduleVariant(route);
  const formFields = formFieldsFor(route);

  useEffect(() => {
    setRecords(recordsFor(route, roleName));
    setQuery('');
    setStatusFilter('all');
    setSelected(null);
    setIsFormOpen(false);
    setDraftFields({});
    setNotice('');
  }, [route.slug, roleName]);

  const exportDemoCsv = () => {
    const csv = [['Reference', 'Item', 'Area', 'Status', 'Owner'], ...filtered.map(row => [row.id, row.title, row.area, row.status, row.owner])]
      .map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `${route.slug}-demo.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice('Demo CSV exported. It contains sample records only.');
  };

  const submitDemo = (event: React.FormEvent) => {
    event.preventDefault();
    const title = draftTitle.trim();
    if (!title) return;
    setRecords(current => [{ id: `DEMO-${Date.now().toString().slice(-5)}`, title, area: scope, status: 'Draft · demo only', owner: roleName }, ...current]);
    setDraftTitle('');
    setDraftFields({});
    setIsFormOpen(false);
    setNotice('Demo item added to this screen only. It was not sent or saved.');
  };

  return <div className="space-y-4" data-module-screen={route.slug}>
    <section className="rounded-md border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">DEMO DATA · UI ONLY</div><h1 className="mt-1 text-xl font-serif font-bold text-slate-900">{route.module}</h1><p className="mt-1 text-xs text-slate-500">{roleName} · {scope}</p><p className="mt-2 max-w-3xl text-sm text-slate-600">{route.description} This role-scoped screen demonstrates the intended interface. Records are sample data; actions stay in this browser view and are not submitted.</p></div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700"><ShieldCheck aria-hidden="true" className="h-3.5 w-3.5"/> Role scoped</span>
      </div>
    </section>
    <section aria-label="Module summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[[`Items in ${scope}`, String(records.length), 'Demo records'], ['Needs attention', String(records.filter(row => /pending|review|correction/i.test(row.status)).length), 'Sample review queue'], ['Module status', 'Preview', 'No live data']].map(([label, value, detail]) => <article key={label} className="rounded-md border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</div><div className="mt-1 text-[11px] text-slate-500">{detail}</div></article>)}
    </section>
    {variant === 'geospatial' && <section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3"><div><h2 className="text-sm font-semibold">Geographic coverage · {scope}</h2><p className="mt-1 text-[11px] text-slate-500">Illustrative map preview · sample locations only</p></div><span className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">Map layer: {route.module}</span></div><div className="relative h-56 overflow-hidden bg-[#eaf2ed] sm:h-72"><svg aria-label={`Demo map for ${scope}`} role="img" viewBox="0 0 900 340" className="h-full w-full"><path d="M0 240C130 200 155 285 280 235S440 210 500 145s170-5 210-80 140-20 190-65v340H0Z" fill="#d3e4d4"/><path d="M0 80c130 60 175-25 310 15s190 100 300 50 180-10 290 35" fill="none" stroke="#fff" strokeWidth="18"/><path d="M180 0c-10 100 90 110 40 190s0 110 10 150M540 0c-30 90 20 140 120 145s80 70 100 195" fill="none" stroke="#fff" strokeWidth="12"/><path d="M0 240C130 200 155 285 280 235S440 210 500 145s170-5 210-80 140-20 190-65" fill="none" stroke="#a7c4a7" strokeWidth="3"/>{[[240,162,'Hodan'],[454,198,'Wadajir'],[684,118,'Kaaraan']].map(([x,y,label])=><g key={label as string}><circle cx={x as number} cy={y as number} r="17" fill="#0c243e" opacity=".13"/><circle cx={x as number} cy={y as number} r="8" fill="#0c243e"/><text x={(x as number)+13} y={(y as number)+4} fontSize="13" fill="#0c243e" fontWeight="600">{label}</text></g>)}</svg><div className="absolute bottom-3 left-3 rounded bg-white/95 px-3 py-2 text-[10px] text-slate-600 shadow">3 sample locations · not survey data</div></div></section>}
    {variant === 'analytics' && <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-center gap-2"><BarChart3 aria-hidden="true" className="h-4 w-4 text-slate-600"/><h2 className="text-sm font-semibold">{route.module} trend</h2><span className="ml-auto text-[10px] text-slate-500">Illustrative · demo values</span></div><div className="mt-5 grid h-32 grid-cols-7 items-end gap-2 border-b border-l border-slate-200 px-3 sm:h-40">{[42,57,49,72,63,86,76].map((height,index)=><div key={index} className="flex h-full flex-col items-center justify-end gap-1"><div className="w-full max-w-12 rounded-t bg-[#1565c0]" style={{height:`${height}%`}} title={`Sample period ${index+1}: ${height}`}/><span className="text-[9px] text-slate-500">P{index+1}</span></div>)}</div><div className="mt-2 text-right text-[10px] text-slate-500">Sample periods · no live reporting data</div></section>}
    {variant === 'workflow' && <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-center gap-2"><Workflow aria-hidden="true" className="h-4 w-4 text-slate-600"/><h2 className="text-sm font-semibold">Workflow stages</h2><span className="ml-auto text-[10px] text-slate-500">{scope}</span></div><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">{[['Submitted',records.filter(row=>/await|pending/i.test(row.status)).length],['In review',records.filter(row=>/review|progress/i.test(row.status)).length],['Completed',records.filter(row=>/verified|complete|approved/i.test(row.status)).length]].map(([stage,count])=><div key={stage} className="rounded border border-slate-200 bg-slate-50 p-3"><div className="text-[11px] text-slate-600">{stage}</div><div className="mt-1 text-lg font-semibold">{count}</div><div className="text-[10px] text-slate-500">sample records</div></div>)}</div></section>}
    {variant === 'administration' && <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-5"><div className="flex items-center gap-2"><Users aria-hidden="true" className="h-4 w-4 text-slate-600"/><h2 className="text-sm font-semibold">Scope and administration</h2></div><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded border border-slate-200 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">Active scope</div><div className="mt-1 text-sm font-semibold">{scope}</div><p className="mt-1 text-[11px] text-slate-500">Sample workspace scope for {roleName}.</p></div><div className="rounded border border-slate-200 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">Module controls</div><div className="mt-1 flex items-center gap-2 text-sm font-semibold"><Settings2 aria-hidden="true" className="h-4 w-4"/>{route.module}</div><p className="mt-1 text-[11px] text-slate-500">Controls here are visual examples and do not change system policy.</p></div></div></section>}
    <section className="space-y-3 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><ClipboardList aria-hidden="true" className="h-4 w-4 text-slate-600"/><h2 className="text-sm font-semibold text-slate-900">{route.module} records</h2></div><div className="flex flex-wrap gap-2">
        <label className="relative"><span className="sr-only">Search {route.module} records</span><Search aria-hidden="true" className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400"/><input aria-label={`Search ${route.module} records`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search records" className="w-44 rounded border border-slate-300 py-1.5 pl-8 pr-2 text-xs focus:outline-2 focus:outline-blue-800"/></label>
        <label className="inline-flex items-center gap-1.5 rounded border border-slate-300 px-2"><Filter aria-hidden="true" className="h-3.5 w-3.5 text-slate-500"/><span className="sr-only">Filter by status</span><select aria-label="Filter by status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="bg-transparent py-1.5 text-xs focus:outline-2 focus:outline-blue-800"><option value="all">All statuses</option>{statuses.map(status => <option key={status} value={status.toLowerCase()}>{status}</option>)}</select></label>
        {readOnly ? <button onClick={exportDemoCsv} className="inline-flex items-center gap-1.5 rounded border border-slate-300 px-2.5 py-1.5 text-xs hover:bg-slate-50"><Download aria-hidden="true" className="h-3.5 w-3.5"/>Export demo</button> : <button onClick={() => setIsFormOpen(true)} className="inline-flex items-center gap-1.5 rounded bg-[#0c243e] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#133860]"><Plus aria-hidden="true" className="h-3.5 w-3.5"/>{primaryActionFor(route)}</button>}
      </div></div>
      <div className="overflow-x-auto rounded border border-slate-200"><table className="w-full min-w-[650px] text-left text-xs"><caption className="sr-only">{route.module} sample records for {scope}</caption><thead className="bg-slate-50 text-slate-600"><tr>{['Reference', 'Item', 'Area / scope', 'Status', 'Owner', ''].map(column => <th key={column || 'action'} scope="col" className="p-2.5 font-semibold">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{filtered.map(row => <tr key={row.id} className="hover:bg-slate-50"><td className="p-2.5 font-mono font-semibold">{row.id}</td><td className="p-2.5">{row.title}</td><td className="p-2.5">{(/map|gis|coordinate/.test(route.slug)) && <MapPin aria-hidden="true" className="mr-1 inline h-3 w-3"/>}{row.area}</td><td className="p-2.5"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px]">{row.status}</span></td><td className="p-2.5">{row.owner}</td><td className="p-2.5"><button onClick={() => setSelected(row)} aria-label={`Open details for ${row.id}`} className="inline-flex items-center gap-1 text-blue-900 underline">Details <ArrowUpRight aria-hidden="true" className="h-3 w-3"/></button></td></tr>)}{filtered.length === 0 && <tr><td className="p-5 text-center text-slate-500" colSpan={6}>No demo records match these filters.</td></tr>}</tbody></table></div>
      {notice && <div role="status" className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">{notice}</div>}
      <p className="text-[11px] text-slate-500">Demo interface only. Changes are temporary and are not sent to SDAS.</p>
    </section>

    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="record-detail-title" className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">Sample record detail</div><h2 id="record-detail-title" className="mt-1 text-lg font-bold">{selected.title}</h2></div><button aria-label="Close record details" onClick={() => setSelected(null)} className="rounded p-1 hover:bg-slate-100"><X aria-hidden="true" className="h-5 w-5"/></button></div><dl className="mt-5 space-y-4 text-sm">{[['Reference', selected.id], ['Area / scope', selected.area], ['Status', selected.status], ['Responsible', selected.owner], ['Role scope', scope]].map(([term, value]) => <div key={term}><dt className="text-xs text-slate-500">{term}</dt><dd className="mt-1 font-medium text-slate-900">{value}</dd></div>)}</dl><p className="mt-6 rounded bg-amber-50 p-3 text-xs text-amber-950">This is illustrative sample content and does not represent a live SDAS record.</p></section></div>}
    {isFormOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setIsFormOpen(false); }}><form onSubmit={submitDemo} role="dialog" aria-modal="true" aria-labelledby="demo-form-title" className="w-full max-w-md space-y-4 rounded-md bg-white p-5 shadow-xl"><div className="flex items-start justify-between"><div><div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">Demo form · no submission</div><h2 id="demo-form-title" className="mt-1 text-lg font-bold">{primaryActionFor(route)}</h2></div><button type="button" aria-label="Close demo form" onClick={() => setIsFormOpen(false)} className="rounded p-1 hover:bg-slate-100"><X aria-hidden="true" className="h-5 w-5"/></button></div><label className="block text-xs font-medium text-slate-700">Item title<input autoFocus required value={draftTitle} onChange={event => setDraftTitle(event.target.value)} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-blue-800" placeholder={`Enter ${route.module.toLowerCase()} title`}/></label>{formFields.map(([label, type]) => <label key={label} className="block text-xs font-medium text-slate-700">{label}<input type={type} value={draftFields[label] || ''} onChange={event => setDraftFields(current => ({ ...current, [label]: event.target.value }))} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-2 focus:outline-blue-800"/></label>)}<label className="block text-xs font-medium text-slate-700">Assigned scope<input readOnly value={scope} className="mt-1 block w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"/></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setIsFormOpen(false)} className="rounded border border-slate-300 px-3 py-2 text-xs">Cancel</button><button type="submit" className="rounded bg-[#0c243e] px-3 py-2 text-xs font-semibold text-white">Add demo item</button></div></form></div>}
  </div>;
};
