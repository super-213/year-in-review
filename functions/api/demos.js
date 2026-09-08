import { createDemo } from '../../server/demos.js';
export const onRequest = ({ request, env }) => createDemo(request, env);
