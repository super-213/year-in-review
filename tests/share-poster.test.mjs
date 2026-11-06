import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSharePoster, createQrSvg, POSTER_THEMES } from '../src/sharePoster.js';
import { THEME_IDS } from '../src/workFile.js';
import { publicWorkUrl } from '../shared/short-links.js';

const snapshot = { url: 'https://example.com/s/Ab12Cd34', year: '2026', title: '我的年度故事', subtitle: '记录值得珍藏的瞬间', language: 'zh', expiresAt: '2026-11-13T12:00:00Z' };

test('every work theme has a distinctive, portable share poster and readable QR sizing', () => {
  assert.deepEqual(Object.keys(POSTER_THEMES).sort(), [...THEME_IDS].sort());
  const posters = new Set();
  for (const theme of THEME_IDS) {
    const poster = createSharePoster({ ...snapshot, theme });
    assert.equal(poster.width, 1080);
    assert.equal(poster.height, 1440);
    assert.match(poster.svg, /width="1080" height="1440"/);
    assert.match(poster.svg, /我的年度故事/);
    assert.match(poster.svg, /year-in-review.zhihaojiang.com\/s\/Ab12Cd34/);
    assert.doesNotMatch(poster.svg, /example\.com/);
    assert.doesNotMatch(poster.svg, /<script|<foreignObject|<image|fonts\.google/);
    assert.ok(POSTER_THEMES[theme].size >= 500);
    posters.add(poster.svg);
  }
  assert.equal(posters.size, 12);
});

test('QR cards always use the public HTTPS domain and preserve the individual short code', () => {
  for (const input of ['http://localhost:8080/s/Ab12Cd34', 'http://192.168.1.10:5173/s/Ab12Cd34', '/s/Ab12Cd34', 'https://preview.example.com/s/Ab12Cd34?preview=1#top']) {
    assert.equal(publicWorkUrl(input), 'https://year-in-review.zhihaojiang.com/s/Ab12Cd34');
    const card = createSharePoster({ ...snapshot, url: input });
    assert.equal(card.qr, createQrSvg('https://year-in-review.zhihaojiang.com/s/Ab12Cd34', { ink: POSTER_THEMES.retro.qr, shape: POSTER_THEMES.retro.shape, size: POSTER_THEMES.retro.size }));
    assert.doesNotMatch(card.svg, /localhost|192\.168|preview\.example/);
  }
  assert.throws(() => publicWorkUrl('/'), /Invalid work path/);
});

test('poster content is XML-escaped, constrained and uses a valid web URL', () => {
  const poster = createSharePoster({ ...snapshot, title: '<script>alert("x")</script>', subtitle: 'A & B' });
  assert.doesNotMatch(poster.svg, /<script>/);
  assert.match(poster.svg, /A &amp; B/);
  const long = createSharePoster({ ...snapshot, title: '超长标题'.repeat(2000), subtitle: '长副标题'.repeat(2000) });
  assert.ok(long.svg.length < 100000);
  assert.match(long.svg, /…/);
  assert.throws(() => createQrSvg('javascript:alert(1)'), /Invalid URL/);
});
