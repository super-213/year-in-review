import { createDemo, readDemo } from './demos.js';
export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/deployment') return Response.json({ storage: 'cloudflare', requiresPassword: true }, { headers: { 'Cache-Control': 'no-store' } });
    if (path === '/api/demos') return createDemo(request, env);
    if (path.startsWith('/demo/')) return readDemo(request, env, path.slice(6).replace(/\/$/, ''));
    return env.ASSETS.fetch(request);
  },
};
