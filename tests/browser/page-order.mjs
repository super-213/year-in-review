const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createLocalServer } from '../../server/local.mjs';
import { TEMPLATES } from '../../src/locales.js';
import { defaultPages } from '../../src/pages.js';
import { parseWorkHtml } from '../../src/workFile.js';

const root = await mkdtemp(join(tmpdir(), 'review-order-'));
const server = await createLocalServer({ dataDirectory: root });
const work = { format: 'year-in-review', version: 2, theme: 'retro', language: 'zh', data: structuredClone(TEMPLATES.zh) };
work.data.photos.forEach(photo => { photo.url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII='; });
work.pages = defaultPages(work.data).map((page, i) => ({ ...page, id: `page-${i}` }));
let browser;
const order = page => page.locator('.editor-page-list>li').evaluateAll(rows => rows.map(row => row.dataset.pageId));
const waitForOrder = (page, expected) => page.waitForFunction(ids => JSON.stringify([...document.querySelectorAll('.editor-page-list>li')].map(row => row.dataset.pageId)) === JSON.stringify(ids), expected);
async function touchDrag(page, from, to, { hold = 0, cancel = false } = {}) {
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
  for (let i = 1; i <= 16; i++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 16, y: from.y + (to.y - from.y) * i / 16 }] });
    await page.waitForTimeout(20);
  }
  if (hold) await page.waitForTimeout(hold);
  await session.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  await session.detach();
}
try {
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true });
  async function open(options = {}, document = work) {
    const context = await browser.newContext(options);
    await context.addInitScript(value => { localStorage.setItem('hasOnboarded_v1', 'true'); localStorage.setItem('yearInReviewWork', JSON.stringify(value)); }, document);
    const page = await context.newPage();
    page.on('pageerror', error => { throw error; });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('.editor-page-list').scrollIntoViewIfNeeded();
    return { page, context };
  }
  const { page: desktop, context: desktopContext } = await open({ viewport: { width: 1440, height: 1000 } });
  await desktop.locator('[data-page-id="page-2"] .page-order-select').click();
  await desktop.evaluate(() => {
    window.orderTransitions = [];
    document.querySelector('.editor-page-list').addEventListener('transitionrun', event => {
      if (event.propertyName === 'transform') window.orderTransitions.push(event.target.dataset.pageId);
    });
  });
  await desktop.getByRole('button', { name: '上移第 3 页', exact: true }).click();
  let expected = ['page-0', 'page-2', 'page-1', 'page-3', 'page-4', 'page-5'];
  await waitForOrder(desktop, expected);
  await desktop.waitForFunction(() => window.orderTransitions.length >= 2);
  if (process.env.PAGE_ORDER_SCREENSHOTS) await desktop.screenshot({ path: join(process.env.PAGE_ORDER_SCREENSHOTS, 'page-order-desktop.png') });
  assert.equal(await desktop.locator('.page-order-select[aria-current="page"]').locator('..').getAttribute('data-page-id'), 'page-2');
  const handle = await desktop.locator('[data-page-id="page-0"] .page-order-handle').boundingBox();
  const target = await desktop.locator('[data-page-id="page-3"]').boundingBox();
  await desktop.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await desktop.mouse.down();
  await desktop.mouse.move(handle.x + handle.width / 2, target.y + target.height / 2, { steps: 20 });
  await desktop.locator('.page-order-overlay').waitFor();
  assert.ok(await desktop.locator('.editor-page-list>li').evaluateAll(rows => rows.some(row => getComputedStyle(row).transform !== 'none')));
  await desktop.mouse.up();
  expected = ['page-2', 'page-1', 'page-3', 'page-0', 'page-4', 'page-5'];
  await waitForOrder(desktop, expected);
  assert.equal(await desktop.locator('.page-order-select[aria-current="page"]').locator('..').getAttribute('data-page-id'), 'page-2');
  const keyboardHandle = desktop.locator('[data-page-id="page-4"] .page-order-handle');
  await keyboardHandle.focus(); await desktop.keyboard.press('Space');
  await desktop.locator('[data-page-id="page-4"].page-order-dragging').waitFor();
  await desktop.keyboard.press('ArrowDown');
  await desktop.waitForFunction(() => [...document.querySelectorAll('[aria-live]')].some(el => el.textContent.includes('目标位置：第 6 页。')));
  await desktop.keyboard.press('Space');
  expected = ['page-2', 'page-1', 'page-3', 'page-0', 'page-5', 'page-4'];
  await waitForOrder(desktop, expected);
  await keyboardHandle.focus(); await desktop.keyboard.press('Space');
  await desktop.locator('[data-page-id="page-4"].page-order-dragging').waitFor();
  await desktop.keyboard.press('ArrowUp'); await desktop.keyboard.press('Escape');
  assert.deepEqual(await order(desktop), expected);
  assert.equal(await desktop.getByRole('button', { name: '上移第 1 页', exact: true }).isDisabled(), true);
  assert.equal(await desktop.getByRole('button', { name: '下移第 6 页', exact: true }).isDisabled(), true);
  await desktop.waitForFunction(ids => JSON.stringify(JSON.parse(localStorage.getItem('yearInReviewWork')).pages.map(page => page.id)) === JSON.stringify(ids), expected);
  const [download] = await Promise.all([desktop.waitForEvent('download'), desktop.getByRole('button', { name: '导出可部署 HTML', exact: true }).click()]);
  assert.deepEqual(parseWorkHtml(await readFile(await download.path(), 'utf8')).pages.map(page => page.id), expected);
  await desktopContext.close();

  for (const width of [320, 390]) {
    const { page, context } = await open({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const source = await page.locator('[data-page-id="page-0"] .page-order-handle').boundingBox();
    const destination = await page.locator('[data-page-id="page-2"]').boundingBox();
    const from = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
    const to = { x: from.x, y: destination.y + destination.height / 2 };
    await touchDrag(page, from, to);
    await waitForOrder(page, ['page-1', 'page-2', 'page-0', 'page-3', 'page-4', 'page-5']);
    if (process.env.PAGE_ORDER_SCREENSHOTS) await page.screenshot({ path: join(process.env.PAGE_ORDER_SCREENSHOTS, `page-order-mobile-${width}.png`) });
    assert.equal(await page.locator('.page-order-select[aria-current="page"]').locator('..').getAttribute('data-page-id'), 'page-0');
    const before = await order(page);
    const label = await page.locator('.page-order-select').nth(2).boundingBox();
    const scrollBefore = await page.locator('#editor-panel').evaluate(el => el.scrollTop);
    await touchDrag(page, { x: label.x + label.width / 2, y: label.y + label.height / 2 }, { x: label.x + label.width / 2, y: label.y - 80 });
    assert.deepEqual(await order(page), before);
    assert.ok(await page.locator('#editor-panel').evaluate(el => el.scrollTop) > scrollBefore);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await context.close();
  }
  const longWork = structuredClone(work);
  longWork.pages = Array.from({ length: 24 }, (_, i) => ({ ...structuredClone(work.pages[i % 6]), id: `long-${i}` }));
  const { page: long, context: longContext } = await open({ viewport: { width: 390, height: 720 }, isMobile: true, hasTouch: true }, longWork);
  await long.locator('#editor-panel').evaluate(el => { el.scrollTop += document.querySelector('.editor-page-list').getBoundingClientRect().top - 120; });
  const start = await long.locator('.page-order-handle').first().boundingBox();
  const panel = await long.locator('#editor-panel').boundingBox();
  const beforeScroll = await long.locator('#editor-panel').evaluate(el => el.scrollTop);
  await touchDrag(long, { x: start.x + start.width / 2, y: start.y + start.height / 2 }, { x: start.x + start.width / 2, y: panel.y + panel.height - 24 }, { hold: 700 });
  assert.ok(await long.locator('#editor-panel').evaluate(el => el.scrollTop) > beforeScroll + 40);
  assert.ok((await order(long)).indexOf('long-0') >= 3);
  await longContext.close();

  const { page: reduced, context: reducedContext } = await open({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await reduced.getByRole('button', { name: '下移第 1 页', exact: true }).click();
  await waitForOrder(reduced, ['page-1', 'page-0', 'page-2', 'page-3', 'page-4', 'page-5']);
  assert.equal(await reduced.locator('.page-order-row').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  await reducedContext.close();
  const singleWork = { ...structuredClone(work), pages: [structuredClone(work.pages[0])] };
  const { page: single, context: singleContext } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, singleWork);
  assert.equal(await single.locator('.page-order-handle').isDisabled(), true);
  assert.equal(await single.locator('.page-order-actions button:disabled').count(), 3);
  await singleContext.close();
  console.log(JSON.stringify({ buttonAnimation: true, mouseDrag: true, touchWidths: [320, 390], keyboardSorting: true, cancel: true, touchScrollPreserved: true, autoScroll: true, selectedPagePreserved: true, savedAndExportedOrder: true, reducedMotion: true }));
} finally {
  await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true });
}
