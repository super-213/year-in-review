import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MESSAGES, translate, translateDefaults } from '../src/i18n.js';
import { DEFAULT_LABELS, TEMPLATES, TRANSLATIONS } from '../src/locales.js';
import { defaultPages } from '../src/pages.js';
import { createWorkHtml, parseWorkHtml, validateWork, WORK_FORMAT } from '../src/workFile.js';

test('all three locales cover interface strings and icon labels', () => {
  for (const language of ['en', 'zh', 'id']) {
    assert.deepEqual(Object.keys(TRANSLATIONS[language]).sort(), Object.keys(TRANSLATIONS.en).sort());
    assert.deepEqual(Object.keys(DEFAULT_LABELS[language]).sort(), Object.keys(DEFAULT_LABELS.en).sort());
    for (const message of Object.values(MESSAGES)) assert.equal(typeof message[language], 'string');
    assert.ok(translate(language, '共 {n} 页', { n: 7 }).includes('7'));
  }
});

test('switching translates every default page while preserving custom content, numbers and IDs', () => {
  const pages = defaultPages(TEMPLATES.en);
  pages[1].content.stats[0].value = '999';
  pages[1].content.stats[1].label = '我的自定义数据';
  pages[2].content.highlights.reverse();
  pages[2].content.highlights[0].image = 'data:image/png;base64,AAAA';
  pages[5].content.chart.items[0].value = 123;
  pages[5].content.chart.items[1].label = '自定义分类';
  const translated = pages.map(page => ({ ...page, content: translateDefaults(page.content, TEMPLATES.en, TEMPLATES.zh) }));
  assert.deepEqual(translated.map(page => page.id), pages.map(page => page.id));
  assert.equal(translated[1].content.stats[0].value, '999');
  assert.equal(translated[1].content.stats[0].label, '读完的书');
  assert.equal(translated[1].content.stats[1].label, '我的自定义数据');
  assert.equal(translated[2].content.highlights[0].title, '新的爱好');
  assert.equal(translated[2].content.highlights[0].image, 'data:image/png;base64,AAAA');
  assert.equal(translated[5].content.chart.title, '年度轨迹');
  assert.equal(translated[5].content.chart.items[0].value, 123);
  assert.equal(translated[5].content.chart.items[1].label, '自定义分类');
  assert.deepEqual(translateDefaults(TEMPLATES.zh, TEMPLATES.zh, TEMPLATES.id), TEMPLATES.id);
});

test('Chinese works validate, export and import without losing language or pages', () => {
  const work = validateWork({ format: WORK_FORMAT, version: 2, theme: 'retro', language: 'zh', data: TEMPLATES.zh, pages: defaultPages(TEMPLATES.zh) });
  const html = createWorkHtml(work, work.pages.map(() => '<div>测试</div>'), '');
  assert.match(html, /lang="zh"/);
  assert.match(html, /aria-label="上一页"/);
  assert.deepEqual(parseWorkHtml(html), work);
});
