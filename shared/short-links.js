export const SHORT_CODE_PATTERN = /^[A-Za-z0-9]{8}$/;
export const SHORT_PATH_PATTERN = /^\/s\/[A-Za-z0-9]{8}$/;
export const PUBLIC_SITE_ORIGIN = 'https://year-in-review.zhihaojiang.com';

export function publicWorkUrl(value) {
  const { pathname } = new URL(value, PUBLIC_SITE_ORIGIN);
  if (!SHORT_PATH_PATTERN.test(pathname)) throw new Error('Invalid work path');
  return PUBLIC_SITE_ORIGIN + pathname;
}
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function createShortCode() {
  let code = '';
  // Rejection sampling keeps all 62 characters equally likely.
  while (code.length < 8) {
    for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
      if (byte < 248) code += alphabet[byte % 62];
      if (code.length === 8) break;
    }
  }
  return code;
}
