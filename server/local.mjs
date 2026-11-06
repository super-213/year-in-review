import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDemo, readDemo } from './demos.js';
import { FileDemoStore } from './file-store.mjs';
import { fileResponse, compressedResponse } from './http-assets.mjs';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8' };
const json = value => Response.json(value, { headers: { 'Cache-Control': 'no-store' } });

export async function createLocalServer({ dataDirectory = resolve(projectRoot, 'data'), distDirectory = resolve(projectRoot, 'dist'), instance = '' } = {}) {
  const store = new FileDemoStore(dataDirectory);
  const dist = await realpath(distDirectory);
  await readFile(resolve(dist, 'index.html')); // Fail before listening when the frontend is not built.
  await store.cleanup();
  const cleanup = setInterval(() => store.cleanup().catch(console.error), 60 * 60 * 1000);
  cleanup.unref();

  async function route(request) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') return json({ ok: true, instance });
    if (url.pathname === '/api/deployment') return json({ storage: 'local', requiresPassword: false });
    if (url.pathname === '/api/demos') {
      return createDemo(request, { DEMOS_KV: store }, { requirePassword: false });
    }
    const resource = /^\/s\/([A-Za-z0-9]{8})\/(?:assets\/([a-f0-9]{64}\.(?:png|jpg|gif|webp|avif|bmp))|(download))$/.exec(url.pathname);
    if (resource) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
      const file = await store.readResource(resource[1], resource[3] ? 'source.html' : resource[2]);
      if (!file) return new Response('作品不存在或已过期。', { status: 404, headers: { 'Cache-Control': 'no-store' } });
      const remaining = Math.max(0, Math.min(86400, Math.floor((file.metadata.expiration * 1000 - Date.now()) / 1000)));
      if (resource[3]) return new Response(request.method === 'HEAD' ? null : await store.portableHtml(file, resource[1]), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="index.html"', 'Content-Security-Policy': "sandbox; default-src 'none'" } });
      try {
        return await fileResponse(request, file.file, `image/${extname(file.file).slice(1).replace('jpg', 'jpeg')}`, `public, max-age=${remaining}, must-revalidate`, { 'Access-Control-Allow-Origin': '*' });
      } catch (error) {
        if (error.code === 'ENOENT') return new Response('Not found', { status: 404 });
        throw error;
      }
    }
    if (url.pathname.startsWith('/s/')) return readDemo(request, { DEMOS_KV: store }, url.pathname.slice(3).replace(/\/$/, ''));
    if (url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });

    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { return new Response('Bad request', { status: 400 }); }
    let file = resolve(dist, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(dist + sep)) return new Response('Forbidden', { status: 403 });
    try {
      file = await realpath(file);
      if (!file.startsWith(dist + sep)) return new Response('Forbidden', { status: 403 });
      const cache = /\/assets\/[^/]+-[a-zA-Z0-9_-]{8,}\.[^/]+$/.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache';
      return fileResponse(request, file, mime[extname(file)] || 'application/octet-stream', cache);
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code)) throw error;
      if (extname(pathname)) return new Response('Not found', { status: 404 });
      return fileResponse(request, resolve(dist, 'index.html'), mime['.html'], 'no-cache');
    }
  }

  const server = createServer(async (incoming, outgoing) => {
    try {
      const request = new Request(new URL(incoming.url, 'http://localhost'), {
        method: incoming.method,
        headers: incoming.headers,
        ...(!['GET', 'HEAD'].includes(incoming.method) ? { body: Readable.toWeb(incoming), duplex: 'half' } : {}),
      });
      const response = compressedResponse(request, await route(request));
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      if (response.body && incoming.method !== 'HEAD') await pipeline(Readable.fromWeb(response.body), outgoing);
      else outgoing.end();
    } catch (error) {
      if (outgoing.destroyed || ['ERR_STREAM_PREMATURE_CLOSE', 'ECONNRESET'].includes(error.code)) return;
      console.error(error);
      if (!outgoing.headersSent) outgoing.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      outgoing.end('服务器暂时无法处理请求。');
    }
  });
  server.on('close', () => clearInterval(cleanup));
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.argv[2] || process.env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('请指定端口（1–65535）：node server/local.mjs 8080');
    process.exit(1);
  }
  const server = await createLocalServer({ instance: process.env.LOCAL_SERVER_INSTANCE || '' });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; server.close(); });
  server.listen(port, '0.0.0.0', () => console.log(`本地服务已启动：http://localhost:${port}；作品目录：${resolve(projectRoot, 'data')}`));
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
    server.close();
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
