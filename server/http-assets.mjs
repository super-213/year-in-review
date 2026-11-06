import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { createBrotliCompress, createGzip, constants } from 'node:zlib';

export async function fileResponse(request, file, type, cacheControl, extra = {}) {
  const info = await stat(file);
  if (!info.isFile()) return new Response('Not found', { status: 404 });
  const etag = `W/"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`;
  const headers = { 'Content-Type': type, 'Cache-Control': cacheControl, ETag: etag, 'X-Content-Type-Options': 'nosniff', ...extra };
  if (request.headers.get('If-None-Match')?.split(',').map(value => value.trim()).some(value => value === etag || value === '*')) return new Response(null, { status: 304, headers });
  headers['Content-Length'] = String(info.size);
  return new Response(request.method === 'HEAD' ? null : Readable.toWeb(createReadStream(file)), { headers });
}

export function compressedResponse(request, response) {
  const type = response.headers.get('Content-Type') || '';
  if (!/^(text\/|application\/(javascript|json)|image\/svg\+xml)/.test(type) || response.headers.has('Content-Encoding')) return response;
  const headers = new Headers(response.headers);
  headers.set('Vary', 'Accept-Encoding');
  const encodings = (request.headers.get('Accept-Encoding') || '').split(',').map(part => {
    const [name, ...options] = part.trim().split(';');
    const q = options.find(value => value.trim().startsWith('q='));
    return { name: name.toLowerCase(), quality: q ? Number(q.trim().slice(2)) : 1 };
  });
  const quality = name => encodings.find(item => item.name === name)?.quality ?? encodings.find(item => item.name === '*')?.quality ?? 0;
  const encoding = ['br', 'gzip'].filter(name => quality(name) > 0).sort((a, b) => quality(b) - quality(a))[0];
  if (!encoding) return new Response(response.body, { status: response.status, headers });
  headers.set('Content-Encoding', encoding);
  headers.delete('Content-Length');
  if (!response.body || request.method === 'HEAD') return new Response(null, { status: response.status, headers });
  const compressor = encoding === 'br' ? createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }) : createGzip({ level: 6 });
  const source = Readable.fromWeb(response.body);
  source.on('error', error => compressor.destroy(error));
  compressor.on('close', () => source.destroy());
  return new Response(Readable.toWeb(source.pipe(compressor)), { status: response.status, headers });
}
