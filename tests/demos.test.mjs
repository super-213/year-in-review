import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, readDemo, MAX_DEMO_BYTES, DEMO_TTL_MS } from '../server/demos.js';
import worker from '../server/worker.js';

const html = '<!doctype html><script id="year-in-review-work" type="application/json">{}</script><h1>测试</h1>';
function fixture() {
  const objects = new Map();
  return { objects, DEPLOY_PASSWORD: 'test-secret', DEMOS: {
    async put(key, body, metadata) { objects.set(key, { body, ...metadata }); },
    async get(key) { return objects.get(key); },
    async head(key) { return objects.get(key); },
  } };
}
const upload = (password = 'test-secret', body = html, extra = {}) => new Request('https://example.com/api/demos', {
  method: 'POST', headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'text/html', ...extra }, body,
});
const view = id => new Request(`https://example.com/demo/${id}`);

test('publish and read preserve HTML, create distinct same-domain links and isolate scripts', async () => {
  const env = fixture();
  const response = await createDemo(upload(), env);
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.match(result.path, /^\/demo\/[a-f0-9]{32}$/);
  assert.ok(Math.abs(Date.parse(result.expiresAt) - Date.now() - DEMO_TTL_MS) < 2000);
  const other = await (await createDemo(upload(), env)).json();
  assert.notEqual(result.id, other.id);
  const page = await worker.fetch(view(result.id), env);
  assert.equal(await page.text(), html);
  assert.match(page.headers.get('Content-Type'), /text\/html/);
  assert.equal(page.headers.get('Cache-Control'), 'no-store');
  assert.match(page.headers.get('Content-Security-Policy'), /sandbox allow-scripts;/);
  assert.ok(!page.headers.get('Content-Security-Policy').includes('allow-same-origin'));
  assert.equal(await (await readDemo(new Request(view(result.id), { method: 'HEAD' }), env, result.id)).text(), '');
});

test('unconfigured and unauthorized uploads do not write objects', async () => {
  const env = fixture();
  assert.equal((await createDemo(upload(), {})).status, 503);
  assert.equal((await createDemo(upload('wrong'), env)).status, 401);
  assert.equal((await createDemo(upload(''), env)).status, 401);
  assert.equal(env.objects.size, 0);
});

test('reject invalid content, oversized headers and oversized streamed bodies', async () => {
  const env = fixture();
  assert.equal((await createDemo(upload('test-secret', 'invalid'), env)).status, 400);
  assert.equal((await createDemo(upload('test-secret', html, { 'Content-Length': String(MAX_DEMO_BYTES + 1) }), env)).status, 400);
  assert.equal((await createDemo(upload('test-secret', 'x'.repeat(MAX_DEMO_BYTES + 1)), env)).status, 400);
  assert.equal(env.objects.size, 0);
});

test('expired or malformed expiry cannot be served; missing pages do not return editor', async () => {
  const env = fixture();
  const { id } = await (await createDemo(upload(), env)).json();
  for (const expiry of ['invalid', new Date(Date.now() - 1).toISOString()]) {
    env.objects.get(`demos/${id}.html`).customMetadata.expiresAt = expiry;
    assert.equal((await readDemo(view(id), env, id)).status, 410);
  }
  assert.equal((await readDemo(view('bad'), env, '../anything')).status, 404);
  assert.equal((await readDemo(view('a'.repeat(32)), env, 'a'.repeat(32))).status, 404);
});

test('storage errors have explicit failure responses and worker delegates editor assets', async () => {
  const env = fixture();
  env.DEMOS.put = async () => { throw new Error('private internal detail'); };
  assert.equal((await createDemo(upload(), env)).status, 502);
  env.ASSETS = { fetch: () => new Response('editor') };
  assert.equal(await (await worker.fetch(new Request('https://example.com/'), env)).text(), 'editor');
  assert.equal((await createDemo(new Request('https://example.com/api/demos'), env)).status, 405);
});
