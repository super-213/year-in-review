import { createHash } from 'node:crypto';

export function splitSnapshotImages(source, id) {
  const assets = new Map();
  const replaceImage = value => {
    if (typeof value !== 'string') return value;
    const match = /^data:image\/(png|jpe?g|gif|webp|avif|bmp);base64,([a-z\d+/=\s]+)$/i.exec(value);
    if (!match) return value;
    const bytes = Buffer.from(match[2], 'base64');
    const extension = match[1].toLowerCase().replace('jpeg', 'jpg');
    const name = `${createHash('sha256').update(bytes).digest('hex')}.${extension}`;
    assets.set(name, bytes);
    return `/s/${id}/assets/${name}`;
  };
  let html = source.replace(/\bsrc="(data:image\/[^"<>]+)"/gi, (_, image) => `src="${replaceImage(image)}" loading="lazy" decoding="async"`);
  html = html.replace(/(<script type="application\/json" id="year-in-review-work">)([\s\S]*?)(<\/script>)/, (_, start, json, end) => {
    const data = JSON.parse(json);
    const packed = JSON.stringify(data, (key, value) => replaceImage(value)).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    return start + packed + end;
  });
  return { html, assets };
}
