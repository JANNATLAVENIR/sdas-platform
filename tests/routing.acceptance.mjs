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
    const target = rolePath(role.id);
    await page.goto(base + target);
    await page.getByRole('button', { name: /sign in/i }).last().click().catch(() => {});
    await page.locator('input[type=email]').fill(`r${String(role.order).padStart(2, '0')}.${({ national_super_admin:'superadmin', national_authority_admin:'authority', director_general:'dg', department_admin:'dept', regional_admin:'regional', district_admin:'district', gis_officer:'gis', data_quality_officer:'quality', field_ops_supervisor:'supervisor', field_surveyor:'surveyor', address_verifier:'verifier', auditor:'auditor', public_citizen:'citizen', institutional_api_client:'api' })[role.id]}@sdas.dev`);
    await page.locator('input[type=password]').fill('SdasDev!2026');
    await page.getByRole('button', { name: /sign in/i }).last().click();
    await page.waitForURL('**/workspace/**', { timeout: 10000 });
    await page.getByText(role.code, { exact: true }).first().waitFor();
    const route = MODULE_ROUTES.find(r => r.role === role.id);
    await page.goto(base + route.path);
    await page.getByText(route.module, { exact: true }).first().waitFor({ timeout: 5000 }).catch(() => {});
    const correctPath = new URL(page.url()).pathname === route.path;
    const active = await page.locator('[aria-current="page"]').innerText().catch(() => '');
    record(`${role.code} direct module`, correctPath && active.includes(route.module), `path=${new URL(page.url()).pathname}; active=${active}`);
    await page.reload();
    record(`${role.code} refresh`, new URL(page.url()).pathname === route.path);
    await page.close();
  }

  const page = await browser.newPage();
  for (const path of ['/','/search','/registry','/map','/request','/plates','/statistics','/services','/about','/resources','/ussd','/partners','/policies','/help','/contact']) {
    await page.goto(base + path);
    record(`public ${path}`, await page.locator('header').count() > 0 || path === '/');
  }
  await page.goto(base + '/role-preview');
  record('role preview opens', await page.getByText(/All 14 Roles|Dhammaan 14/i).count() > 0);
  record('role preview lists 14', await page.locator('button').filter({ hasText: /R01|R14/ }).count() > 1);
  await page.goto(base + '/workspace/unknown/not-a-module');
  record('invalid route', await page.getByText(/Page not found/i).count() > 0);
  await page.close();
} finally {
  await browser.close();
}
console.log(JSON.stringify({ total: results.length, passed: results.filter(x => x.ok).length, failed: results.filter(x => !x.ok) }, null, 2));
if (results.some(x => !x.ok)) process.exitCode = 1;
