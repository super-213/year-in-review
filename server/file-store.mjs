import { mkdir, readFile, writeFile, rename, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { splitSnapshotImages } from './snapshot-images.mjs';

const idPattern = /^[A-Za-z0-9]{8}$/;

// Keep the existing publishing API while storing each snapshot as ordinary files.
export class FileDemoStore {
  constructor(directory) {
    this.directory = directory;
  }

  idFromKey(key) {
    const match = /^demos\/([A-Za-z0-9]{8})\.html$/.exec(key);
    if (!match) throw new Error('Invalid snapshot key');
    return match[1];
  }

  async put(key, html, { expiration, metadata }) {
    const id = this.idFromKey(key);
    await mkdir(this.directory, { recursive: true });
    const pending = join(this.directory, `.pending-${randomUUID()}`);
    await mkdir(pending);
    try {
      const snapshot = splitSnapshotImages(html, id);
      await mkdir(join(pending, 'assets'));
      for (const [name, bytes] of snapshot.assets) await writeFile(join(pending, 'assets', name), bytes);
      await writeFile(join(pending, 'index.html'), snapshot.html, 'utf8');
      await writeFile(join(pending, 'metadata.json'), JSON.stringify({ expiration, ...metadata }), 'utf8');
      // A completed snapshot becomes visible only after both files are ready.
      await rename(pending, join(this.directory, id));
    } finally {
      await rm(pending, { recursive: true, force: true });
    }
  }

  async readResource(id, name) {
    if (!idPattern.test(id) || !(name === 'source.html' || /^[a-f0-9]{64}\.(png|jpg|gif|webp|avif|bmp)$/.test(name))) return null;
    const directory = join(this.directory, id);
    try {
      const metadata = JSON.parse(await readFile(join(directory, 'metadata.json'), 'utf8'));
      const expiry = Date.parse(metadata.expiresAt);
      if (!Number.isFinite(metadata.expiration) || metadata.expiration * 1000 <= Date.now() || !Number.isFinite(expiry) || expiry <= Date.now()) return null;
      const file = join(directory, ...(name === 'source.html' ? ['index.html'] : ['assets', name]));
      return { file, metadata };
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  async portableHtml(resource, id) {
    let html = await readFile(resource.file, 'utf8');
    let names;
    try { names = await readdir(join(this.directory, id, 'assets')); }
    catch (error) { if (error.code === 'ENOENT') return html; throw error; }
    for (const name of names) {
      if (!/^[a-f0-9]{64}\.(png|jpg|gif|webp|avif|bmp)$/.test(name)) continue;
      const bytes = await readFile(join(this.directory, id, 'assets', name));
      const type = name.split('.').pop().replace('jpg', 'jpeg');
      html = html.split(`/s/${id}/assets/${name}`).join(`data:image/${type};base64,${bytes.toString('base64')}`);
    }
    return html;
  }

  async getWithMetadata(key) {
    const directory = join(this.directory, this.idFromKey(key));
    try {
      const metadata = JSON.parse(await readFile(join(directory, 'metadata.json'), 'utf8'));
      if (!Number.isFinite(metadata.expiration) || metadata.expiration * 1000 <= Date.now()) {
        await rm(directory, { recursive: true, force: true });
        return { value: null, metadata: null };
      }
      const html = await readFile(join(directory, 'index.html'));
      return { value: new Blob([html]).stream(), metadata };
    } catch (error) {
      if (error.code === 'ENOENT') return { value: null, metadata: null };
      throw error;
    }
  }

  async cleanup() {
    await mkdir(this.directory, { recursive: true });
    for (const entry of await readdir(this.directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || !idPattern.test(entry.name)) continue;
      try {
        const directory = join(this.directory, entry.name);
        const metadata = JSON.parse(await readFile(join(directory, 'metadata.json'), 'utf8'));
        if (Number.isFinite(metadata.expiration) && metadata.expiration * 1000 <= Date.now()) {
          await rm(directory, { recursive: true, force: true });
        }
      } catch (error) {
        if (error.code !== 'ENOENT') console.error(`Cannot clean snapshot ${entry.name}:`, error.message);
      }
    }
  }
}
