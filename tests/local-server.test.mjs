import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createLocalServer } from '../server/local.mjs';
import { MAX_DEMO_BYTES } from '../server/demos.js';

const html = '<!doctype html><script id="year-in-review-work" type="application/json">{}</script><h1>本地作品</h1>';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'review-local-'));
  const distDirectory = join(root, 'dist');
  const dataDirectory = join(root, 'data');
  await mkdir(distDirectory);
  await writeFile(join(distDirectory, 'index.html'), '<h1>editor</h1>');
  await writeFile(join(distDirectory, 'app.js'), 'console.log("editor")');
  const servers = [];
  t.after(async () => {
    for (const server of servers) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
    await rm(root, { recursive: true, force: true });
  });
  const start = async () => {
    const server = await createLocalServer({ distDirectory, dataDirectory, instance: 'test-instance' });
    servers.push(server);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    return `http://127.0.0.1:${server.address().port}`;
  };
  return { root, dataDirectory, start, url: await start() };
}

const publish = (url, body = html) => fetch(`${url}/api/demos`, { method: 'POST', headers: { 'Content-Type': 'text/html' }, body });

test('local publishing needs no password, persists HTML and metadata, and survives a new server', async t => {
  const { url, start, dataDirectory } = await fixture(t);
  assert.deepEqual(await (await fetch(`${url}/api/deployment`)).json(), { storage: 'local', requiresPassword: false });
  const response = await publish(url);
  assert.equal(response.status, 201);
  const work = await response.json();
  assert.equal(await readFile(join(dataDirectory, work.id, 'index.html'), 'utf8'), html);
  assert.equal(JSON.parse(await readFile(join(dataDirectory, work.id, 'metadata.json'), 'utf8')).expiresAt, work.expiresAt);
  const restarted = await start();
  const page = await fetch(`${restarted}${work.path}`);
  assert.equal(await page.text(), html);
  assert.match(page.headers.get('Content-Security-Policy'), /sandbox allow-scripts/);
  assert.equal(page.headers.get('Cache-Control'), 'no-store');
  const head = await fetch(`${url}${work.path}`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('expired files are refused and removed; startup cleans expired snapshots only', async t => {
  const { url, start, dataDirectory } = await fixture(t);
  const work = await (await publish(url)).json();
  await writeFile(join(dataDirectory, work.id, 'metadata.json'), JSON.stringify({ expiration: 1, expiresAt: new Date(1000).toISOString() }));
  assert.equal((await fetch(`${url}${work.path}`)).status, 404);
  assert.deepEqual(await readdir(dataDirectory), []);
  const expired = await (await publish(url)).json();
  const live = await (await publish(url)).json();
  await writeFile(join(dataDirectory, expired.id, 'metadata.json'), JSON.stringify({ expiration: 1 }));
  await writeFile(join(dataDirectory, 'keep.txt'), 'user file');
  await start();
  assert.deepEqual((await readdir(dataDirectory)).sort(), [live.id, 'keep.txt'].sort());
});

test('local server serves frontend, rejects invalid publishing and keeps data outside static routes', async t => {
  const { url } = await fixture(t);
  assert.equal(await (await fetch(url)).text(), '<h1>editor</h1>');
  assert.match((await fetch(`${url}/app.js`)).headers.get('Content-Type'), /javascript/);
  assert.equal(await (await fetch(`${url}/editor/route`)).text(), '<h1>editor</h1>');
  assert.equal((await fetch(`${url}/missing.js`)).status, 404);
  assert.equal((await fetch(`${url}/api/missing`)).status, 404);
  assert.equal((await fetch(`${url}/api/demos`)).status, 405);
  assert.equal((await fetch(`${url}/demo/bad`)).status, 404);
  assert.equal((await publish(url, 'invalid')).status, 400);
  const work = await (await publish(url)).json();
  assert.equal((await fetch(`${url}/data/${work.id}/index.html`)).status, 404);
  assert.equal((await fetch(`${url}/%2e%2e%2fdata/${work.id}/index.html`)).status, 403);
  const oversized = await publish(url, 'x'.repeat(MAX_DEMO_BYTES + 1));
  assert.equal(oversized.status, 400);
  assert.match((await oversized.json()).error, /20 MB/);
});

test('chunked uploads without Content-Length still enforce the size limit and return an error', async t => {
  const { url, dataDirectory } = await fixture(t);
  let chunks = 0;
  const response = await fetch(`${url}/api/demos`, {
    method: 'POST', headers: { 'Content-Type': 'text/html' }, duplex: 'half',
    body: new ReadableStream({
      pull(controller) {
        if (chunks++ < 21) controller.enqueue(new Uint8Array(1024 * 1024));
        else controller.close();
      },
    }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /20 MB/);
  assert.deepEqual(await readdir(dataDirectory), []);
});
