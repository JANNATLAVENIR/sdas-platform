import { chromium } from 'playwright';
import { ALL_ROLES } from '../src/data/rolesData.ts';
import { MODULE_ROUTES, PUBLIC_ROUTES, rolePreviewModulePath } from '../src/routing/routeRegistry.ts';

const base = process.env.SDAS_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  await page.goto(`${base}/role-preview`, { waitUntil: 'commit' });
  for (const role of ALL_ROLES) {
    const route = MODULE_ROUTES.find(item => item.role === role.id);
    const path = rolePreviewModulePath(route);
    await page.goto(base + path, { waitUntil: 'commit' });
    await page.locator(`[data-module-screen="${route.slug}"]`).waitFor();
    assert(new URL(page.url()).pathname === path, `${role.code}: preview URL mismatch`);
    assert(await page.locator('header').getByText(role.name.en).count() === 1, `${role.code}: identity missing`);
    assert(await page.locator('[aria-current="page"]').getByText(route.module).count() === 1, `${role.code}: module/sidebar mismatch`);
    assert(await page.locator(`[data-module-screen="${route.slug}"]`).count() === 1, `${role.code}: screen mismatch`);
    await page.reload({ waitUntil: 'commit' });
    assert(new URL(page.url()).pathname === path, `${role.code}: refresh did not preserve preview route`);
  }
  for (const path of Object.values(PUBLIC_ROUTES)) {
    await page.goto(base + path, { waitUntil: 'commit' });
    await page.locator('main').waitFor();
    assert(new URL(page.url()).pathname === path, `public route ${path} mismatch`);
    assert(await page.locator('main').count() > 0, `public route ${path} has no main content`);
  }
  await page.goto(base + '/role-preview/unknown/bad-module', { waitUntil: 'commit' });
  await page.getByText(/Page not found/i).waitFor();
  assert(await page.getByText(/Page not found/i).count() === 1, 'invalid preview route not rejected');
  await page.close();
} finally { await browser.close(); }
console.log(JSON.stringify({ rolesTested: ALL_ROLES.length, publicRoutesTested: Object.keys(PUBLIC_ROUTES).length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
