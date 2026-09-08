import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPage, defaultPages, pageData, movePage, PAGE_TYPES } from '../src/pages.js';

test('default pages preserve legacy order; repeated pages have independent content', () => {
  const data = { year: '2026', stats: [{ value: '10' }], highlights: [], photos: [], summary: 'Original' };
  const pages = defaultPages(data);
  assert.deepEqual(pages.map(page => page.type), PAGE_TYPES);
  const duplicate = createPage('stats', pageData(data, pages[1]));
  duplicate.content.stats[0].value = '20';
  assert.equal(pages[1].content.stats[0].value, '10');
  assert.equal(data.stats[0].value, '10');
  assert.equal(pageData({ ...data, year: '2027' }, duplicate).year, '2027');
  assert.notEqual(duplicate.id, pages[1].id);
});

test('reordering preserves IDs and content without changing input', () => {
  const pages = [{id:'a'}, {id:'b'}, {id:'c'}];
  assert.deepEqual(movePage(pages, 2, 0).map(page => page.id), ['c', 'a', 'b']);
  assert.deepEqual(pages.map(page => page.id), ['a', 'b', 'c']);
  assert.equal(movePage(pages, 0, -1), pages);
  assert.equal(movePage(pages, 2, 3), pages);
});
