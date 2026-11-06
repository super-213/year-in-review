export const onRequest = () => Response.json({ storage: 'cloudflare', requiresPassword: true }, { headers: { 'Cache-Control': 'no-store' } });
