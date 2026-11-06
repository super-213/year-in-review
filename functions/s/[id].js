import { readDemo } from '../../server/demos.js';
export const onRequest = ({ request, env, params }) => readDemo(request, env, params.id);
