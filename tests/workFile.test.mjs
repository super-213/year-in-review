import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorkHtml, parseWorkHtml, validateWork, embedPhotos, THEME_IDS } from '../src/workFile.js';

const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
const fixture = () => ({
  format: 'year-in-review', version: 1, theme: 'retro', language: 'en',
  data: { year: '2026', title: '我的年度总结 </script><script>alert(1)</script>', subtitle: '中文 & emoji 🎉', summary: 'A year to remember.',
    stats: [1,2].map(id => ({id, label:'Books', value:'12', icon:'book'})),
    highlights: [1,2].map(id => ({id, title:'Milestone', desc:'Done!', emoji:'🎉'})),
    photos: [1,2].map(id => ({id, url:photo, caption:'Memory'})) }
});

test('all themes round-trip through deployable HTML without script injection', () => {
  for (const theme of THEME_IDS) {
    const work = {...fixture(), theme};
    const html = createWorkHtml(work, ['<div>One</div>', '<div>Two</div>'], '.demo{color:red}');
    assert.deepEqual(parseWorkHtml(html), work);
    assert.equal((html.match(/<script/g) || []).length, 2);
    assert.ok(html.includes('&lt;/script&gt;'));
    assert.ok(html.includes('class="work-slide" aria-label="2 / 2" data-slide="1"'));
    assert.ok(!html.includes('src="/src/'));
  }
});

test('reject invalid versions, missing fields, unsafe photos and excessive rows', () => {
  for (const change of [w => w.version = 2, w => w.theme = 'unknown', w => w.data.stats = [], w => w.data.photos[0].url = 'javascript:alert(1)', w => delete w.data.title, w => w.data.highlights = Array(5).fill(w.data.highlights[0])]) {
    const work = fixture(); change(work);
    assert.throws(() => validateWork(work));
  }
  assert.throws(() => parseWorkHtml('<html>Unrelated page</html>'));
  assert.throws(() => parseWorkHtml('<script type="application/json" id="year-in-review-work">invalid</script>'));
});

test('uploaded photos remain embedded and intact', async () => {
  assert.deepEqual(await embedPhotos(fixture()), fixture());
});

test('failed remote photos prevent incomplete exports', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Network unavailable'); };
  try {
    const work = fixture(); work.data.photos[0].url = 'https://example.com/photo.png';
    await assert.rejects(embedPhotos(work), /无法打包照片/);
  } finally { globalThis.fetch = originalFetch; }
});

test('memory images survive embedding and HTML round-trip with every theme', async () => {
  for (const theme of THEME_IDS) {
    const work = fixture();
    work.theme = theme;
    work.data.highlights[0].image = photo;
    const embedded = await embedPhotos(validateWork(work));
    assert.equal(embedded.data.highlights[0].image, photo);
    const html = createWorkHtml(embedded, ['<div>Memory</div>'], '');
    assert.deepEqual(parseWorkHtml(html), work);
    assert.equal(parseWorkHtml(html).data.highlights[0].emoji, '🎉');
  }
});

test('memory image validation rejects unsafe URLs and keeps old emoji-only works compatible', () => {
  const work = fixture();
  assert.deepEqual(validateWork(work), work);
  work.data.highlights[0].image = 'javascript:alert(1)';
  assert.throws(() => validateWork(work));
  work.data.highlights[0].image = { src: photo };
  assert.throws(() => validateWork(work));
  work.data.highlights[0].image = '';
  assert.ok(!('image' in validateWork(work).data.highlights[0]));
});

test('unavailable remote memory images fail export instead of being silently lost', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Network unavailable'); };
  try {
    const work = fixture();
    work.data.highlights[0].image = 'https://example.com/memory.png';
    await assert.rejects(embedPhotos(work), /Milestone/);
  } finally { globalThis.fetch = originalFetch; }
});

test('custom pages round-trip with order, duplicates, independent content and all themes', async () => {
  const { defaultPages, createPage } = await import('../src/pages.js');
  for (const theme of THEME_IDS) {
    const work = { ...fixture(), version: 2, theme };
    const defaults = defaultPages(work.data);
    work.pages = [defaults[4], defaults[3], defaults[0], defaults[1], defaults[2], createPage('summary', work.data)];
    work.pages[5].content.summary = 'Independent ending';
    const saved = validateWork(work);
    const html = createWorkHtml(await embedPhotos(saved), saved.pages.map(page => `<div>${page.type}</div>`), '');
    assert.deepEqual(parseWorkHtml(html), saved);
    assert.match(html, /data-slide="0" data-page-type="summary"/);
    assert.match(html, /data-slide="1" data-page-type="photos"/);
    assert.match(html, /6 \/ 6/);
    assert.notEqual(saved.pages[0].content.summary, saved.pages[5].content.summary);
  }
});

test('custom page validation accepts one page and rejects missing, invalid or unsafe content', async () => {
  const { createPage } = await import('../src/pages.js');
  const work = { ...fixture(), version: 2 };
  work.pages = [createPage('photos', work.data)];
  assert.equal(validateWork(work).pages.length, 1);
  for (const mutate of [w => w.pages = [], w => delete w.pages, w => w.pages[0].type = 'unknown', w => w.pages.push(w.pages[0]), w => delete w.pages[0].content.photos, w => w.pages[0].content.photos[0].url = 'javascript:alert(1)', w => w.version = 3]) {
    const invalid = structuredClone(work); mutate(invalid);
    assert.throws(() => validateWork(invalid));
  }
});

test('export embeds selected page images without fetching omitted default photos', async () => {
  const { createPage } = await import('../src/pages.js');
  const work = { ...fixture(), version: 2 };
  work.pages = [createPage('photos', work.data), createPage('highlights', work.data)];
  work.data.photos[0].url = 'https://example.com/unused.png';
  work.pages[0].content.photos[0].url = 'https://example.com/selected.png';
  work.pages[1].content.highlights[0].image = 'https://example.com/highlight.png';
  const originalFetch = globalThis.fetch;
  const originalReader = globalThis.FileReader;
  const fetched = [];
  globalThis.fetch = async url => { fetched.push(url); return { ok: true, blob: async () => ({type:'image/png'}) }; };
  globalThis.FileReader = class { readAsDataURL() { this.result = photo; this.onload(); } };
  try {
    const saved = await embedPhotos(validateWork(work));
    assert.deepEqual(fetched.sort(), ['https://example.com/highlight.png', 'https://example.com/selected.png']);
    assert.equal(saved.pages[0].content.photos[0].url, photo);
    assert.equal(saved.pages[1].content.highlights[0].image, photo);
  } finally { globalThis.fetch = originalFetch; globalThis.FileReader = originalReader; }
});

test('all five charts round-trip as independent pages across all themes', async () => {
  const { CHART_TYPES, DEFAULT_CHART } = await import('../src/charts.js');
  const { createPage } = await import('../src/pages.js');
  for (const theme of THEME_IDS) {
    const work = { ...fixture(), version: 2, theme };
    work.pages = Object.keys(CHART_TYPES).map(type => createPage('charts', { chart: { ...DEFAULT_CHART, type } }));
    work.pages[0].content.chart.items[0].value = 0;
    assert.equal(work.pages[1].content.chart.items[0].value, 72);
    const html = createWorkHtml(work, work.pages.map(() => '<svg></svg>'), '');
    assert.deepEqual(parseWorkHtml(html), work);
  }
});

test('chart validation handles zeroes and rejects unsafe numbers and missing configuration', async () => {
  const { DEFAULT_CHART, validateChart } = await import('../src/charts.js');
  const zeros = { ...DEFAULT_CHART, items: DEFAULT_CHART.items.map(item => ({ ...item, value: 0 })) };
  assert.deepEqual(validateChart(zeros), zeros);
  for (const patch of [{ type: 'pie' }, { max: 0 }, { max: Infinity }, { items: [] }, { items: [{ label: 'x', value: -1 }, ...zeros.items] }, { items: [{ label: 'x', value: NaN }, ...zeros.items] }]) {
    assert.throws(() => validateChart({ ...zeros, ...patch }));
  }
  const work = { ...fixture(), version: 2, pages: [{ id: 'chart', type: 'charts', content: {} }] };
  assert.throws(() => validateWork(work));
});
