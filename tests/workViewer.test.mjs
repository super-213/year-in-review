import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { viewerScript, viewerStyles } from '../src/workViewer.js';

test('native scrolling updates progress, desktop navigation and orientation preserve page', () => {
  const slides = Array.from({ length: 5 }, () => ({ querySelectorAll: () => [] }));
  const progress = slides.map(() => ({ dataset: {} }));
  const controls = { page: {}, previous: {}, next: {} };
  const listeners = {};
  let resize;
  const frame = {
    clientWidth: 390, scrollLeft: 0,
    addEventListener: (name, fn) => { listeners[name] = fn; },
    scrollTo({ left }) { this.scrollLeft = left; listeners.scroll(); },
  };
  vm.runInNewContext(viewerScript, {
    matchMedia: () => ({ matches: true }),
    ResizeObserver: class { constructor(fn) { resize = fn; } observe() {} },
    document: {
      querySelectorAll: selector => selector === '.work-slide' ? slides : progress,
      querySelector: () => frame,
      getElementById: id => controls[id],
      addEventListener: () => {},
    },
  });
  assert.equal(controls.page.textContent, '1 / 5');
  frame.scrollLeft = 390; listeners.scroll();
  assert.equal(controls.page.textContent, '2 / 5');
  assert.equal(progress[1].dataset.active, 'true');
  frame.clientWidth = 844; resize();
  assert.equal(frame.scrollLeft, 844);
  assert.equal(controls.page.textContent, '2 / 5');
  controls.next.onclick();
  assert.equal(controls.page.textContent, '3 / 5');
  controls.previous.onclick();
  assert.equal(controls.page.textContent, '2 / 5');
});

test('native swipe layout does not depend on touch handlers or hidden slides', () => {
  assert.match(viewerStyles, /scroll-snap-type:x mandatory/);
  assert.match(viewerStyles, /overflow-x:auto/);
  assert.match(viewerStyles, /scroll-snap-align:start/);
  assert.doesNotMatch(viewerScript, /touchstart|touchend|preventDefault.*touch/);
  assert.doesNotMatch(viewerStyles, /work-slide\[hidden\]/);
});

test('viewer only attaches image sources to current and adjacent slides', () => {
  const images = Array.from({ length: 6 }, (_, i) => ({ dataset: { workImage: String(i) }, hasAttribute() { return Boolean(this.src); } }));
  const slides = images.map(img => ({ querySelectorAll: () => [img] }));
  const progress = slides.map(() => ({ dataset: {} }));
  const controls = { page: {}, previous: {}, next: {}, 'year-in-review-work': { textContent: JSON.stringify({ assets: Object.fromEntries(images.map((_, i) => [i, `/image-${i}.webp`])) }) } };
  let scroll;
  const frame = { clientWidth: 390, scrollLeft: 0, addEventListener: (_, fn) => { scroll = fn; }, scrollTo({ left }) { this.scrollLeft = left; scroll(); } };
  vm.runInNewContext(viewerScript, {
    matchMedia: () => ({ matches: true }), ResizeObserver: class { observe() {} },
    document: { querySelectorAll: selector => selector === '.work-slide' ? slides : progress, querySelector: () => frame, getElementById: id => controls[id], addEventListener() {} },
  });
  assert.equal(images[0].src, '/image-0.webp');
  assert.equal(images[1].src, '/image-1.webp');
  assert.equal(images[2].src, undefined);
  frame.scrollLeft = 390 * 4; scroll();
  assert.equal(images[2].src, undefined);
  assert.equal(images[3].src, '/image-3.webp');
  assert.equal(images[4].src, '/image-4.webp');
  assert.equal(images[5].src, '/image-5.webp');
});
