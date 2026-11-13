import { chromium } from 'playwright';
import { ALL_ROLES } from '../src/data/rolesData.ts';
import { MODULE_ROUTES, rolePath } from '../src/routing/routeRegistry.ts';

const base = process.env.SDAS_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const record = (name, ok, detail = '') => results.push({ name, ok, detail });

try {
  for (const role of ALL_ROLES) {
    const page = await browser.newPage();
    page.setDefaultTimeout(8000);
    const suffix = ({ national_super_admin:'superadmin', national_authority_admin:'authority', director_general:'dg', department_admin:'dept', regional_admin:'regional', district_admin:'district', gis_officer:'gis', data_quality_officer:'quality', field_ops_supervisor:'supervisor', field_surveyor:'surveyor', address_verifier:'verifier', auditor:'auditor', public_citizen:'citizen', institutional_api_client:'api' })[role.id];
    const login = await page.request.post(`${base}/api/auth/login`, { data: { email: `r${String(role.order).padStart(2, '0')}.${suffix}@sdas.dev`, password: 'SdasDev!2026' } });
    if (!login.ok()) throw new Error(`${role.code} login failed: ${login.status()} ${await login.text()}`);
    const { token } = await login.json();
    await page.addInitScript((value) => sessionStorage.setItem('sdas_session_token', value), token);
    const target = rolePath(role.id);
    await page.goto(base + target, { waitUntil: 'commit' });
    await page.getByText(new RegExp(`${role.code}\\b`)).first().waitFor();
    const route = MODULE_ROUTES.find(r => r.role === role.id);
    await page.goto(base + route.path, { waitUntil: 'commit' });
    await page.locator('[aria-current="page"]:visible').filter({ hasText: route.module }).first().waitFor();
    const correctPath = new URL(page.url()).pathname === route.path;
    const active = await page.locator('[aria-current="page"]:visible').first().innerText().catch(() => '');
    const screen = route.implemented
      ? (role.id === 'field_surveyor'
        ? await page.getByText(route.module, { exact: true }).count() > 0
        : await page.locator('main').count() > 0)
      : await page.locator(`[data-module-screen="${route.slug}"] h1`).getByText(route.module, { exact: true }).count() === 1;
    record(`${role.code} direct module`, correctPath && active.includes(route.module) && screen, `path=${new URL(page.url()).pathname}; active=${active}; screen=${screen}; implemented=${route.implemented}`);
    await page.reload({ waitUntil: 'commit' });
    record(`${role.code} refresh`, new URL(page.url()).pathname === route.path);
    await page.close();
  }

  const page = await browser.newPage();
  for (const path of ['/','/search','/registry','/map','/request','/plates','/statistics','/services','/about','/resources','/ussd','/partners','/policies','/help','/contact']) {
    await page.goto(base + path, { waitUntil: 'commit' });
    await page.locator('main').waitFor();
    record(`public ${path}`, await page.locator('header').count() > 0 || path === '/');
  }
  await page.goto(base + '/role-preview', { waitUntil: 'commit' });
  await page.getByRole('button', { name: 'All 14 Roles', exact: true }).waitFor();
  record('role preview opens', await page.getByRole('button', { name: 'All 14 Roles', exact: true }).count() > 0);
  record('role preview lists roles', await page.getByText('R01').count() > 0 && await page.getByText('R14').count() > 0);
  await page.goto(base + '/workspace/unknown/not-a-module', { waitUntil: 'commit' });
  await page.getByText(/Page not found/i).waitFor();
  record('invalid route', await page.getByText(/Page not found/i).count() > 0);
  await page.close();
} finally {
  await browser.close();
}
console.log(JSON.stringify({ total: results.length, passed: results.filter(x => x.ok).length, failed: results.filter(x => !x.ok) }, null, 2));
if (results.some(x => !x.ok)) process.exitCode = 1;
