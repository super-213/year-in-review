// Uses the same optional Playwright installation as test:mobile.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createLocalServer } from '../../server/local.mjs';
import { createSharePoster, POSTER_THEMES, svgDataUrl } from '../../src/sharePoster.js';
import { TEMPLATES } from '../../src/locales.js';
import { defaultPages } from '../../src/pages.js';

const require = createRequire(import.meta.url);
const root = await mkdtemp(join(tmpdir(), 'review-share-'));
const server = await createLocalServer({ dataDirectory: root });
const snapshot = { url: 'https://review.example.com/s/Ab12Cd34', year: '2026', title: '把这一年，留给未来', subtitle: '那些闪闪发光的日常，都值得被记住。', language: 'zh', expiresAt: '2026-11-13T12:00:00Z' };
const expectedQrUrl = 'https://year-in-review.zhihaojiang.com/s/Ab12Cd34';
let browser;
try {
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true });
  const scan = await browser.newPage();
  await scan.addScriptTag({ path: require.resolve('jsqr') });
  const posters = Object.keys(POSTER_THEMES).map(theme => ({ theme, ...createSharePoster({ ...snapshot, theme }) }));
  await scan.setViewportSize({ width: 1440, height: 1900 });
  await scan.setContent(`<style>body{margin:0;padding:28px;background:#e2e8f0;font:16px system-ui}.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}img{width:100%;display:block}p{margin:8px 0 0}</style><div class="gallery">${posters.map(poster => `<div><img src="${svgDataUrl(poster.svg)}"><p>${poster.theme}</p></div>`).join('')}</div>`);
  await scan.locator('.gallery').screenshot({ path: process.env.SHARE_GALLERY_PATH || join(root, 'theme-gallery.png') });
  for (const poster of posters) {
    const decoded = await scan.evaluate(async ({ imageUrl }) => {
      const image = new Image(); image.src = imageUrl; await image.decode();
      return [1080, 360].map(width => {
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = width * 4 / 3;
        const context = canvas.getContext('2d'); context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return window.jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)?.data;
      });
    }, { imageUrl: svgDataUrl(poster.svg) });
    assert.deepEqual(decoded, [expectedQrUrl, expectedQrUrl], `${poster.theme}: full and mobile-size PNG must decode`);
  }


  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, permissions: ['clipboard-read', 'clipboard-write'] });
  const work = { format: 'year-in-review', version: 2, theme: 'neon', language: 'zh', data: structuredClone(TEMPLATES.zh) };
  work.data.title = snapshot.title;
  work.data.photos.forEach(photo => { photo.url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII='; });
  work.pages = defaultPages(work.data);
  await context.addInitScript(value => { localStorage.setItem('hasOnboarded_v1', 'true'); localStorage.setItem('yearInReviewWork', JSON.stringify(value)); }, work);
  const page = await context.newPage();
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto(url, { waitUntil: 'networkidle' });
  assert.equal(requests.filter(value => /\/ShareCard-/.test(value)).length, 0);
  await page.getByRole('button', { name: '临时部署', exact: true }).click();
  const published = page.waitForResponse(response => response.url().endsWith('/api/demos') && response.request().method() === 'POST');
  await page.getByRole('button', { name: '上传并生成链接', exact: true }).click();
  const response = await published; assert.equal(response.status(), 201);
  const result = await response.json(); assert.match(result.path, /^\/s\/[A-Za-z0-9]{8}$/);
  const target = url + result.path;
  await page.getByRole('button', { name: '保存宣传卡 PNG', exact: true }).waitFor();
  assert.equal(await page.locator('.share-card-heading select').inputValue(), 'neon');
  assert.equal(await page.locator('.share-result-link a').getAttribute('href'), target);
  assert.equal((await page.locator('.share-result-link a').innerText()).includes('http://'), false);
  await page.getByRole('button', { name: '复制链接', exact: true }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), target);
  await page.evaluate(() => {
    window.readClipboard = navigator.clipboard.readText.bind(navigator.clipboard);
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });
  await page.getByRole('button', { name: '复制链接', exact: true }).click();
  assert.equal(await page.evaluate(() => window.readClipboard()), target);
  await page.locator('.share-card-heading select').selectOption('brutal');
  await page.getByRole('button', { name: '保存宣传卡 PNG', exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('.share-card-image')?.src.startsWith('blob:'));
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '保存宣传卡 PNG', exact: true }).click()]);
  assert.match(download.suggestedFilename(), /^year-in-review-brutal-[A-Za-z0-9]{8}\.png$/);
  const png = await readFile(await download.path());
  const decodedPng = await scan.evaluate(async imageUrl => {
    const image = new Image(); image.src = imageUrl; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
    return { width: canvas.width, height: canvas.height, url: window.jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)?.data };
  }, `data:image/png;base64,${png.toString('base64')}`);
  assert.deepEqual(decodedPng, { width: 1080, height: 1440, url: `https://year-in-review.zhihaojiang.com${result.path}` });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.equal((await fetch(target)).status, 200);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ themesDecoded: 12, testedWidths: [1080, 360], shortLink: true, clipboard: true, downloadedPng: decodedPng, lazyQrBundle: true }));
} finally {
  await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true });
}
