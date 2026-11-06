import { mkdir, readFile, writeFile, rename, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const idPattern = /^[a-f0-9]{32}$/;

// Keep the existing publishing API while storing each snapshot as ordinary files.
export class FileDemoStore {
  constructor(directory) {
    this.directory = directory;
  }

  idFromKey(key) {
    const match = /^demos\/([a-f0-9]{32})\.html$/.exec(key);
    if (!match) throw new Error('Invalid snapshot key');
    return match[1];
  }

  async put(key, html, { expiration, metadata }) {
    const id = this.idFromKey(key);
    await mkdir(this.directory, { recursive: true });
    const pending = join(this.directory, `.pending-${randomUUID()}`);
    await mkdir(pending);
    try {
      await writeFile(join(pending, 'index.html'), html, 'utf8');
      await writeFile(join(pending, 'metadata.json'), JSON.stringify({ expiration, ...metadata }), 'utf8');
      // A completed snapshot becomes visible only after both files are ready.
      await rename(pending, join(this.directory, id));
    } finally {
      await rm(pending, { recursive: true, force: true });
    }
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
