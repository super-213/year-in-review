export const MAX_DEMO_BYTES = 20 * 1024 * 1024;
export const DEMO_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ID_PATTERN = /^[a-f0-9]{32}$/;
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
const json = (value, status = 200) => Response.json(value, { status, headers });

async function authorized(request, secret) {
  if (!secret) return false;
  const provided = request.headers.get('Authorization') || '';
  const digest = value => crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const [a, b] = await Promise.all([digest(provided), digest(`Bearer ${secret}`)]);
  return new Uint8Array(a).reduce((diff, byte, i) => diff | (byte ^ new Uint8Array(b)[i]), 0) === 0;
}

async function readHtml(request) {
  if (!request.headers.get('Content-Type')?.startsWith('text/html')) throw new Error('请选择 HTML 作品。');
  if (Number(request.headers.get('Content-Length')) > MAX_DEMO_BYTES) throw new Error('临时部署最大支持 20 MB，请缩小照片后重试。');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('作品内容为空。');
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_DEMO_BYTES) {
      await reader.cancel();
      throw new Error('临时部署最大支持 20 MB，请缩小照片后重试。');
    }
    chunks.push(value);
  }
  const html = await new Blob(chunks).text();
  if (!html.startsWith('<!doctype html>') || !html.includes('id="year-in-review-work"')) throw new Error('请选择由本编辑器导出的 HTML 作品文件。');
  return html;
}

export async function createDemo(request, env, { requirePassword = true } = {}) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.DEMOS_KV || (requirePassword && !env.DEPLOY_PASSWORD)) return json({ error: '临时部署尚未配置，请先绑定 KV 并设置部署口令。' }, 503);
  if (requirePassword && !await authorized(request, env.DEPLOY_PASSWORD)) return json({ error: '部署口令不正确。' }, 401);
  let html;
  try { html = await readHtml(request); }
  catch (error) { return json({ error: error.message }, 400); }
  const id = crypto.randomUUID().replaceAll('-', '');
  const expiration = Math.floor((Date.now() + DEMO_TTL_MS) / 1000);
  const expiresAt = new Date(expiration * 1000).toISOString();
  try {
    await env.DEMOS_KV.put(`demos/${id}.html`, html, {
      expiration,
      metadata: { expiresAt },
    });
    return json({ id, path: `/demo/${id}`, expiresAt }, 201);
  } catch { return json({ error: '作品上传失败，请稍后重试。' }, 502); }
}

export async function readDemo(request, env, id) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers });
  if (!ID_PATTERN.test(id)) return new Response('作品不存在。', { status: 404, headers });
  if (!env.DEMOS_KV) return new Response('临时部署尚未配置。', { status: 503, headers });
  try {
    const key = `demos/${id}.html`;
    const { value, metadata } = await env.DEMOS_KV.getWithMetadata(key, { type: 'stream', cacheTtl: 30 });
    if (value === null) return new Response('作品不存在、已过期，或仍在同步中。刚部署的作品请稍后重试。', { status: 404, headers });
    const expiry = Date.parse(metadata?.expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      await value.cancel();
      return new Response('这个临时作品已过期，请联系作者重新部署。', { status: 410, headers });
    }
    if (request.method === 'HEAD') await value.cancel();
    return new Response(request.method === 'HEAD' ? null : value, {
      headers: {
        ...headers,
        'Content-Type': 'text/html; charset=utf-8',
        // Scripts can flip slides but cannot access the editor's cookies or localStorage.
        'Content-Security-Policy': "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https: http:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        'X-Frame-Options': 'DENY',
      },
    });
  } catch { return new Response('作品暂时无法读取，请稍后重试。', { status: 502, headers }); }
}
