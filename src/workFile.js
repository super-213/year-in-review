import { PAGE_TYPES, PAGE_FIELDS, pageData } from './pages.js';
import { viewerStyles, viewerScript } from './workViewer.js';

export const WORK_FORMAT = 'year-in-review';
export const THEME_IDS = ['retro', 'swiss', 'lofi', 'neon', 'minimal', 'journal', 'glass', 'brutal', 'vapor', 'academia', 'pop', 'blueprint'];

const ICON_IDS = ["coffee", "book", "activity", "zap", "heart", "work", "music", "globe", "terminal", "feather", "phone", "camera", "star", "disc", "duolingo", "language", "strava_cycle", "strava_run", "gym", "travel", "gaming", "coding", "git", "design", "finance", "spotify", "youtube", "food", "sleep", "location", "social_x", "social_insta", "social_linked"];

const isImageUrl = value => typeof value === 'string' && /^(data:image\/(png|jpe?g|gif|webp|avif|bmp);base64,[a-z\d+/=\s]+|https?:\/\/[^\s]+)$/i.test(value);

// Only extract known data fields. Imported HTML is never inserted or executed.
export function validateWork(work) {
  const fail = () => { throw new Error('作品文件格式不正确，或版本暂不支持。'); };
  if (!work || work.format !== WORK_FORMAT || ![1, 2].includes(work.version) || !THEME_IDS.includes(work.theme) || !['en', 'id'].includes(work.language)) fail();
  const text = (value) => {
    if (typeof value !== 'string' || value.length > 20000) fail();
    return value;
  };
  const rows = (value, max, fields) => {
    if (!Array.isArray(value) || value.length < 2 || value.length > max) fail();
    return value.map((row, i) => {
      if (!row || typeof row !== 'object') fail();
      return Object.fromEntries([['id', i + 1], ...fields.map(field => [field, text(row[field])])]);
    });
  };
  const input = work.data;
  if (!input || typeof input !== 'object') fail();
  const data = Object.fromEntries(['year', 'title', 'subtitle', 'summary'].map(field => [field, text(input[field])]));
  data.stats = rows(input.stats, 6, ['label', 'value', 'icon']);
  if (data.stats.some(stat => !ICON_IDS.includes(stat.icon))) fail();
  data.highlights = rows(input.highlights, 4, ['title', 'desc', 'emoji']).map((item, i) => {
    const image = input.highlights[i].image;
    if (image === undefined || image === '') return item;
    if (!isImageUrl(image)) fail();
    return { ...item, image };
  });
  if (!Array.isArray(input.photos) || input.photos.length < 2 || input.photos.length > 6) fail();
  data.photos = input.photos.map((photo, i) => {
    if (!photo || !isImageUrl(photo.url)) fail();
    return { id: i + 1, url: photo.url, caption: text(photo.caption) };
  });
  const result = { format: WORK_FORMAT, version: work.version, theme: work.theme, language: work.language, data };
  if (work.version === 2) {
    if (!Array.isArray(work.pages) || !work.pages.length) fail();
    const ids = new Set();
    result.pages = work.pages.map(page => {
      if (!page || !PAGE_TYPES.includes(page.type) || typeof page.id !== 'string' || !page.id || page.id.length > 200 || ids.has(page.id) || !page.content || typeof page.content !== 'object') fail();
      ids.add(page.id);
      const fields = PAGE_FIELDS[page.type];
      if (fields.some(field => !(field in page.content))) fail();
      const content = Object.fromEntries(fields.map(field => [field, page.content[field]]));
      const validated = validateWork({ ...result, version: 1, data: { ...data, ...content } }).data;
      return { id: page.id, type: page.type, content: Object.fromEntries(fields.map(field => [field, validated[field]])) };
    });
  }
  return result;
}

export function parseWorkHtml(source) {
  // No DOM parsing: even resource elements in untrusted files must stay inert.
  const match = source.match(/<script type="application\/json" id="year-in-review-work">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('请选择由本编辑器导出的 HTML 作品文件。');
  return validateWork(JSON.parse(match[1]));
}

export const serializeWork = work => JSON.stringify(work).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export async function embedPhotos(work) {
  const embedPhoto = async photo => {
    if (photo.url.startsWith('data:')) return photo;
    try {
      const response = await fetch(photo.url, { signal: AbortSignal.timeout(30000), credentials: 'omit' });
      if (!response.ok) throw new Error('HTTP error');
      const blob = await response.blob();
      if (!/^image\/(png|jpe?g|gif|webp|avif|bmp)$/i.test(blob.type)) throw new Error('Unsupported image');
      const url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return { ...photo, url };
    } catch {
      throw new Error(`无法打包照片「${photo.caption}」。请将该照片上传为本地图片后重新导出。`);
    }
  };
  if (work.pages) {
    const pages = await Promise.all(work.pages.map(async page => {
      const content = { ...page.content };
      if (page.type === 'photos') content.photos = await Promise.all(content.photos.map(embedPhoto));
      if (page.type === 'highlights') content.highlights = await Promise.all(content.highlights.map(async item => item.image ? { ...item, image: (await embedPhoto({ url: item.image, caption: item.title })).url } : item));
      return { ...page, content };
    }));
    return { ...work, pages };
  }
  const [photos, highlights] = await Promise.all([
    Promise.all(work.data.photos.map(embedPhoto)),
    Promise.all(work.data.highlights.map(async item => {
      if (!item.image) return item;
      const embedded = await embedPhoto({ url: item.image, caption: item.title });
      return { ...item, image: embedded.url };
    })),
  ]);
  return { ...work, data: { ...work.data, photos, highlights } };
}

export function createWorkHtml(work, slides, css) {
  const title = `${work.data.year} · ${work.data.title}`.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const renderedSlides = slides.map((slide, i) => {
    const page = work.pages?.[i];
    const data = pageData(work.data, page || { content: {} });
    const type = page?.type || PAGE_TYPES[i];
    const layout = `--stat-columns:${data.stats.length <= 4 ? 2 : 3};--photo-columns:${Math.min(data.photos.length, 3)};--photo-rows:${Math.ceil(data.photos.length / 3)}`;
    return `<section class="work-slide" aria-label="${i + 1} / ${slides.length}" data-slide="${i}" data-page-type="${type}" style="${layout}">${slide}</section>`;
  }).join('');
  return `<!doctype html>
<html lang="${work.language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${title}</title>
<link rel="stylesheet" media="print" onload="this.media='all'" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&amp;family=Merriweather:ital,wght@0,300;0,700;1,300&amp;family=Patrick+Hand&amp;family=Space+Mono:wght@400;700&amp;display=swap">
<style>${css.replace(/<\/style/gi, '<\\/style')}
${viewerStyles}
</style></head><body>
<main class="work-viewer" aria-label="${title}" style="--stat-columns:${(work.data.stats.length <= 4 ? 2 : 3)};--photo-columns:${Math.min(work.data.photos.length, 3)};--photo-rows:${Math.ceil(work.data.photos.length / 3)}"><div class="work-frame">${renderedSlides}</div>
<div class="work-progress" aria-hidden="true">${slides.map((_, i) => `<span data-active="${i === 0}"></span>`).join('')}</div>
<nav class="work-nav" aria-label="Slides"><button id="previous" aria-label="Previous slide">←</button><span id="page" aria-live="polite">1 / ${slides.length}</span><button id="next" aria-label="Next slide">→</button></nav></main>
<script type="application/json" id="year-in-review-work">${serializeWork(work)}</script>
<script>${viewerScript}</script>
</body></html>`;
}
