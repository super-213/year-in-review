export const PAGE_TYPES = ['cover', 'stats', 'highlights', 'photos', 'summary'];
export const PAGE_LABELS = { cover: '封面', stats: '年度数据', highlights: '高光时刻', photos: '照片墙', summary: '年度总结' };
export const PAGE_FIELDS = { cover: [], stats: ['stats'], highlights: ['highlights'], photos: ['photos'], summary: ['summary'] };
export const createPage = (type, data) => ({
  id: crypto.randomUUID(), type,
  content: structuredClone(Object.fromEntries(PAGE_FIELDS[type].map(field => [field, data[field]]))),
});
export const defaultPages = data => PAGE_TYPES.map(type => createPage(type, data));
export const pageData = (data, page) => ({ ...data, ...page.content });
export function movePage(pages, from, to) {
  if (from < 0 || to < 0 || from >= pages.length || to >= pages.length) return pages;
  const next = [...pages];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}
