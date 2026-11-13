import { chromium } from 'playwright';
import { ALL_ROLES } from '../src/data/rolesData.ts';
import { MODULE_ROUTES, PUBLIC_ROUTES, rolePreviewModulePath } from '../src/routing/routeRegistry.ts';
import { getModuleScreenDefinition, MODULE_SCREEN_COVERAGE } from '../src/routing/moduleScreenCatalog.ts';

const base = process.env.SDAS_BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
assert(MODULE_SCREEN_COVERAGE.covered === MODULE_ROUTES.length && MODULE_SCREEN_COVERAGE.missingPaths.length === 0 && MODULE_SCREEN_COVERAGE.uniqueScreens === MODULE_ROUTES.length && MODULE_SCREEN_COVERAGE.duplicateScreenKeys.length === 0, 'module screen catalog does not uniquely cover every module route');
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
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${role.code}: mobile preview overflows viewport`);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.reload({ waitUntil: 'commit' });
    assert(new URL(page.url()).pathname === path, `${role.code}: refresh did not preserve preview route`);
  }
  const formRoute = MODULE_ROUTES.find(item => {
    const definition = getModuleScreenDefinition(item);
    return definition && !definition.readOnly && !['Copy sample address', 'Search public addresses', 'Verify sample code'].includes(definition.action);
  });
  const formDefinition = getModuleScreenDefinition(formRoute);
  await page.goto(base + rolePreviewModulePath(formRoute), { waitUntil: 'commit' });
  const formAction = page.getByRole('button', { name: formDefinition.action, exact: true });
  await formAction.click();
  await page.getByRole('dialog').waitFor();
  await page.waitForFunction(() => { const dialog = document.querySelector('[role="dialog"]'); return Boolean(dialog && dialog.contains(document.activeElement)); });
  assert(await page.getByRole('dialog').evaluate(element => element.contains(document.activeElement)), 'demo form did not move keyboard focus into dialog');
  await page.getByRole('dialog').getByRole('button', { name: 'Close demo form' }).focus();
  await page.keyboard.press('Shift+Tab');
  assert(await page.getByRole('dialog').getByRole('button', { name: 'Add demo item' }).evaluate(element => element === document.activeElement), 'dialog focus did not wrap with Shift+Tab');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.waitForFunction(action => document.activeElement?.textContent?.includes(action), formDefinition.action);
  assert(await formAction.evaluate(element => element === document.activeElement), 'Escape did not restore focus to the form trigger');
  await formAction.click();
  await page.getByRole('dialog').getByLabel('Item title').fill('Browser acceptance demo');
  await page.getByRole('dialog').getByRole('button', { name: 'Add demo item' }).click();
  await page.getByRole('status').getByText(/not sent or saved/i).waitFor();
  assert(await page.getByText('Browser acceptance demo').count() === 1, 'demo form did not add a temporary record');
  await page.locator('button[aria-label^="Open details for"]').first().click();
  await page.getByRole('dialog', { name: /Browser acceptance demo/ }).waitFor();
  assert(await page.getByText(/does not represent a live SDAS record/i).count() === 1, 'record details lack demo notice');
  const detailTrigger = page.locator('button[aria-label^="Open details for"]').first();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label')?.startsWith('Open details for'));
  assert(await detailTrigger.evaluate(element => element === document.activeElement), 'detail Escape did not restore focus to its trigger');
  for (const role of ALL_ROLES) {
    const route = MODULE_ROUTES.find(item => item.role === role.id);
    await page.getByLabel('Switch demo role').selectOption(role.id);
    await page.waitForURL(`**${rolePreviewModulePath(route)}`);
    assert(await page.locator('header').getByText(role.name.en).count() === 1, `${role.code}: switching preview role did not update role identity`);
  }
  await page.getByRole('button', { name: 'All role previews' }).click();
  await page.waitForURL('**/role-preview');
  assert(new URL(page.url()).pathname === '/role-preview', 'exit preview did not return to role selection');
  for (const route of MODULE_ROUTES) {
    const path = rolePreviewModulePath(route);
    await page.goto(base + path, { waitUntil: 'commit' });
    const screen = page.locator(`[data-module-screen="${route.slug}"]`);
    await screen.waitFor();
    assert(await screen.getAttribute('data-module-kind') !== null, `${route.roleSlug}/${route.slug}: no screen type is assigned`);
    assert(await screen.getAttribute('data-module-screen-key') === `${route.roleSlug}:${route.slug}`, `${route.roleSlug}/${route.slug}: screen key is not unique to the module`);
    assert(new URL(page.url()).pathname === path, `${route.roleSlug}/${route.slug}: URL mismatch`);
    assert(await screen.getByRole('heading', { level: 1, name: route.module, exact: true }).count() === 1, `${route.roleSlug}/${route.slug}: screen title mismatch`);
    assert(await page.locator('[aria-current="page"]').getByText(route.module, { exact: true }).count() === 1, `${route.roleSlug}/${route.slug}: active module mismatch`);
    const unnamed = await screen.evaluate(element => Array.from(element.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]')).filter(control => {
      const node = control;
      const name = node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent?.trim();
      return !name && !(node.id && document.querySelector(`label[for="${CSS.escape(node.id)}"]`)) && !node.closest('label');
    }).length);
    assert(unnamed === 0, `${route.roleSlug}/${route.slug}: ${unnamed} controls lack accessible names`);
    for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 900 }]) {
      await page.setViewportSize(viewport);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${route.roleSlug}/${route.slug}: layout overflow at ${viewport.width}px`);
    }
  }
  for (const path of Object.values(PUBLIC_ROUTES)) {
    await page.goto(base + path, { waitUntil: 'commit' });
    await page.locator('main').waitFor();
    assert(new URL(page.url()).pathname === path, `public route ${path} mismatch`);
    assert(await page.locator('main').count() > 0, `public route ${path} has no main content`);
    const unnamedControls = await page.evaluate(() => Array.from(document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, [role="button"]')).filter(element => {
      const node = element;
      const text = node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent?.trim();
      const hasLabel = node.id ? document.querySelector(`label[for="${CSS.escape(node.id)}"]`) : node.closest('label');
      const hasImageAlt = Boolean(node.querySelector('img[alt]'));
      return !text && !hasLabel && !hasImageAlt;
    }).map(element => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`).slice(0, 5));
    assert(unnamedControls.length === 0, `public route ${path} has unnamed controls: ${unnamedControls.join(', ')}`);
    for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 900 }]) {
      await page.setViewportSize(viewport);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `public route ${path} overflows ${viewport.width}px viewport`);
    }
  }
  await page.goto(base + '/', { waitUntil: 'commit' });
  const registryCard = page.getByRole('button', { name: 'Address Registry' });
  await registryCard.focus();
  await registryCard.press('Enter');
  await page.waitForURL('**/registry');
  assert(new URL(page.url()).pathname === '/registry', 'keyboard activation did not open public registry');
  await page.goto(base + '/', { waitUntil: 'commit' });
  await page.getByRole('button', { name: 'Services', exact: true }).click();
  await page.waitForURL('**/services');
  assert(new URL(page.url()).pathname === '/services', 'public navigation did not move to Services route');
  await page.goto(base + '/role-preview/unknown/bad-module', { waitUntil: 'commit' });
  await page.getByText(/Page not found/i).waitFor();
  assert(await page.getByText(/Page not found/i).count() === 1, 'invalid preview route not rejected');
  await page.close();
} finally { await browser.close(); }
console.log(JSON.stringify({ rolesTested: ALL_ROLES.length, moduleRoutesTested: MODULE_ROUTES.length, publicRoutesTested: Object.keys(PUBLIC_ROUTES).length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
