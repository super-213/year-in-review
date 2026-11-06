import QRCode from 'qrcode';

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1440;
export const POSTER_THEMES = {
  retro: { name: '8-Bit Retro', paper: '#d1fae5', ink: '#064e3b', accent: '#047857', font: 'monospace', qr: '#064e3b', x: 260, y: 670, size: 560, shape: 'square' },
  swiss: { name: 'Swiss Grid', paper: '#f4f1eb', ink: '#171717', accent: '#dc2626', font: 'sans-serif', qr: '#171717', x: 450, y: 690, size: 530, shape: 'square' },
  lofi: { name: 'Lo-Fi Scrapbook', paper: '#e8e1d5', ink: '#514438', accent: '#9a5b43', font: 'serif', qr: '#514438', x: 280, y: 670, size: 520, shape: 'soft' },
  neon: { name: 'Cyberpunk Neon', paper: '#090b1b', ink: '#e0faff', accent: '#22d3ee', font: 'monospace', qr: '#101c3c', x: 260, y: 670, size: 560, shape: 'dots' },
  minimal: { name: 'Modern Minimalist', paper: '#faf9f6', ink: '#1c2423', accent: '#737d71', font: 'sans-serif', qr: '#1c2423', x: 290, y: 700, size: 500, shape: 'soft' },
  journal: { name: 'Hand-Drawn', paper: '#fff8df', ink: '#713f12', accent: '#b45309', font: 'cursive', qr: '#713f12', x: 270, y: 680, size: 540, shape: 'soft' },
  glass: { name: 'Glassmorphism', paper: '#353697', ink: '#ffffff', accent: '#a5f3fc', font: 'sans-serif', qr: '#312e81', x: 270, y: 680, size: 540, shape: 'dots' },
  brutal: { name: 'Neo-Brutalism', paper: '#facc15', ink: '#111111', accent: '#e11d48', font: 'sans-serif', qr: '#111111', x: 95, y: 680, size: 550, shape: 'square' },
  vapor: { name: 'Vaporwave', paper: '#fce7f3', ink: '#701a75', accent: '#a21caf', font: 'monospace', qr: '#581c87', x: 270, y: 680, size: 540, shape: 'soft' },
  academia: { name: 'Dark Academia', paper: '#292524', ink: '#e7d9b9', accent: '#baa079', font: 'serif', qr: '#3d2f26', x: 285, y: 690, size: 510, shape: 'square' },
  pop: { name: 'Pop Art', paper: '#67e8f9', ink: '#171717', accent: '#e11d48', font: 'sans-serif', qr: '#171717', x: 280, y: 680, size: 520, shape: 'dots' },
  blueprint: { name: 'Blueprint', paper: '#103a83', ink: '#ffffff', accent: '#93c5fd', font: 'monospace', qr: '#103a83', x: 270, y: 680, size: 540, shape: 'square' },
};

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, color, width = 2, extra = '') => `<path d="M${x1} ${y1}H${x2}" transform="translate(0 ${y2 - y1})" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const text = (x, y, value, size, color, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escape(value)}</text>`;

function wrap(value, maxUnits, maxLines = 3) {
  const chars = Array.from(String(value).replace(/\s+/g, ' ').trim());
  const lines = [];
  let row = '', width = 0;
  for (const char of chars) {
    const units = char.codePointAt(0) <= 255 ? 0.58 : 1;
    if (width + units > maxUnits) { lines.push(row); row = ''; width = 0; }
    if (lines.length === maxLines) { lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…'; return lines; }
    row += char;
    width += units;
  }
  if (row) lines.push(row);
  return lines;
}

function background(theme, p) {
  const { ink, accent } = p;
  switch (theme) {
    case 'retro': return `<pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse">${rect(0, 0, 6, 2, ink, 'opacity=".045"')}</pattern>${rect(0, 0, 1080, 1440, 'url(#scan)')}${rect(46, 46, 988, 1348, 'none', `stroke="${ink}" stroke-width="6"`)}${rect(60, 60, 960, 1320, 'none', `stroke="${ink}" stroke-width="2"`)}${rect(83, 80, 914, 46, ink)}${text(103, 112, 'SYSTEM / MEMORIES.EXE', 23, p.paper)}${rect(238, 648, 604, 604, 'none', `stroke="${ink}" stroke-width="6"`)}`;
    case 'swiss': return `${rect(780, 0, 300, 600, accent)}${text(1024, 267, '↗', 220, '#ffffff', 'text-anchor="end"')}${line(80, 300, 1000, 300, ink, 12)}${text(90, 795, '01', 160, accent, 'font-weight="900"')}${text(90, 850, 'OPEN', 42, ink, 'font-weight="800"')}${text(90, 903, 'THE YEAR.', 36, ink, 'font-weight="800"')}${rect(80, 965, 240, 240, accent)}`;
    case 'lofi': return `<pattern id="grain" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1" fill="#514438" opacity=".12"/></pattern>${rect(0, 0, 1080, 1440, 'url(#grain)')}${rect(64, 48, 952, 1344, '#fffdf5', 'transform="rotate(-1 540 720)"')}${rect(240, 630, 600, 630, '#fffefa', 'stroke="#d6cbb9" stroke-width="2" transform="rotate(2 540 945)"')}${rect(390, 616, 300, 58, '#c6b393', 'opacity=".65" transform="rotate(-6 540 645)"')}${text(860, 150, '✳', 96, accent)}`;
    case 'neon': return `<pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#22d3ee" stroke-opacity=".13"/></pattern>${rect(0, 0, 1080, 1440, 'url(#grid)')}<path d="M80 160V80H280 M800 80H1000V280 M1000 1180V1360H800 M280 1360H80V1180" fill="none" stroke="${accent}" stroke-width="4"/>${rect(232, 642, 616, 616, 'none', 'rx="28" stroke="#e879f9" stroke-width="5"')}${rect(218, 628, 644, 644, 'none', 'rx="34" stroke="#22d3ee" stroke-opacity=".4" stroke-width="2"')}`;
    case 'minimal': return `${line(90, 128, 990, 128, ink)}${line(90, 620, 990, 620, '#d5d8cf')}${text(990, 95, 'A PERSONAL ARCHIVE', 20, accent, 'text-anchor="end" letter-spacing="3"')}<circle cx="990" cy="1300" r="18" fill="${accent}"/>`;
    case 'journal': return `<pattern id="paper" width="1080" height="54" patternUnits="userSpaceOnUse"><path d="M0 53H1080" stroke="#b45309" stroke-opacity=".1"/></pattern>${rect(0, 0, 1080, 1440, 'url(#paper)')}<path d="M65 0V1440" stroke="#e7b784" stroke-width="2"/><path d="M100 295Q300 322 660 292 M245 650Q540 625 840 650L848 1240Q540 1260 240 1235Z" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>${text(900, 210, '✧', 120, accent)}${text(100, 1230, '♡', 88, accent)}`;
    case 'glass': return `<defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="#743fc5"/><stop offset=".55" stop-color="#414caa"/><stop offset="1" stop-color="#0e7490"/></linearGradient><radialGradient id="orb"><stop stop-color="#e9a8ff"/><stop offset="1" stop-color="#e9a8ff" stop-opacity="0"/></radialGradient></defs>${rect(0, 0, 1080, 1440, 'url(#sky)')}<circle cx="850" cy="180" r="600" fill="url(#orb)"/>${rect(52, 52, 976, 1336, '#ffffff', 'rx="58" fill-opacity=".09" stroke="#ffffff" stroke-opacity=".3" stroke-width="2"')}${rect(240, 650, 600, 600, '#ffffff', 'rx="32" fill-opacity=".14" stroke="#ffffff" stroke-opacity=".5" stroke-width="2"')}`;
    case 'brutal': return `${rect(770, -80, 360, 460, accent, 'transform="rotate(12 900 150)"')}${rect(80, 320, 920, 250, '#ffffff', `stroke="${ink}" stroke-width="8"`)}${rect(112, 697, 550, 550, ink)}${rect(75, 660, 590, 590, '#ffffff', `stroke="${ink}" stroke-width="8"`)}${text(970, 940, '↙', 240, ink, 'text-anchor="end" font-weight="900"')}${text(800, 1175, 'GO!', 100, ink, 'font-weight="900" transform="rotate(-8 800 1175)"')}`;
    case 'vapor': return `<defs><linearGradient id="sun" x2="0" y2="1"><stop stop-color="#fef08a"/><stop offset="1" stop-color="#f9a8d4"/></linearGradient></defs><circle cx="850" cy="200" r="250" fill="url(#sun)"/><path d="M0 590H1080 M0 1280H1080" stroke="#c084fc" stroke-width="2"/>${Array.from({ length: 9 }, (_, i) => `<path d="M540 1280L${i * 160 - 100} 1440" stroke="#a78bfa" stroke-opacity=".5"/>`).join('')}${rect(244, 654, 592, 592, '#67e8f9', 'stroke="#a21caf" stroke-width="3"')}${rect(230, 640, 592, 592, '#fff7fc', 'stroke="#a21caf" stroke-width="3"')}${text(940, 1270, '✦', 110, accent)}`;
    case 'academia': return `${rect(35, 35, 1010, 1370, 'none', `stroke="${accent}" stroke-width="2"`)}${rect(49, 49, 982, 1342, 'none', `stroke="${accent}" stroke-opacity=".55"`)}<path d="M100 310H450M630 310H980 M100 1250H450M630 1250H980" stroke="${accent}"/><path d="M540 290L557 310L540 330L523 310Z M540 1230L557 1250L540 1270L523 1250Z" fill="${accent}"/>${rect(260, 665, 560, 560, 'none', `stroke="${accent}" stroke-width="2"`)}${text(540, 630, 'EX LIBRIS · MEMORIA', 23, accent, 'text-anchor="middle" letter-spacing="5"')}`;
    case 'pop': return `<pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="3" fill="#0f172a" opacity=".13"/></pattern>${rect(0, 0, 1080, 1440, 'url(#dots)')}${rect(70, 330, 940, 244, '#ffffff', `stroke="${ink}" stroke-width="7" transform="rotate(-2 540 450)"`)}${rect(255, 655, 580, 580, '#facc15', `stroke="${ink}" stroke-width="7"`)}<path d="M950 620L977 674L1030 662L1003 712L1040 760L980 753L950 810L930 752L870 750L910 707L890 650L943 675Z" fill="#e11d48" stroke="#171717" stroke-width="5"/>${text(540, 1285, '↗', 64, accent, 'text-anchor="middle"')}`;
    case 'blueprint': return `<pattern id="blue-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="#ffffff" stroke-opacity=".12" fill="none"/></pattern>${rect(0, 0, 1080, 1440, 'url(#blue-grid)')}${rect(38, 38, 1004, 1364, 'none', 'stroke="#ffffff" stroke-width="2"')}<path d="M240 650H840V1250H240Z M220 650V1250 M860 650V1250 M240 630H840" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="8 5"/>${text(105, 625, 'FIG. 01 / MEMORY ACCESS', 23, accent, 'letter-spacing="3"')}${text(990, 104, 'REV. 01', 23, accent, 'text-anchor="end"')}`;
    default: return '';
  }
}

export function createQrSvg(url, { size = 540, ink = '#111111', shape = 'square' } = {}) {
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Invalid URL');
  const { modules } = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const n = modules.size;
  const quiet = 4;
  const finders = [[0, 0], [n - 7, 0], [0, n - 7]];
  let marks = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!modules.get(y, x) || finders.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)) continue;
    const dataShape = modules.isReserved(y, x) ? 'square' : shape;
    marks += dataShape === 'dots' ? `<circle cx="${x + quiet + .5}" cy="${y + quiet + .5}" r=".5"/>` : rect(x + quiet, y + quiet, 1, 1, ink, dataShape === 'soft' ? 'rx=".16"' : '');
  }
  const radius = shape === 'square' ? 0 : .7;
  for (const [x, y] of finders) {
    marks += rect(x + quiet, y + quiet, 7, 7, ink, `rx="${radius}"`);
    marks += rect(x + quiet + 1, y + quiet + 1, 5, 5, '#ffffff', `rx="${radius * .7}"`);
    marks += rect(x + quiet + 2, y + quiet + 2, 3, 3, ink, `rx="${radius * .5}"`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${n + quiet * 2} ${n + quiet * 2}" shape-rendering="geometricPrecision">${rect(0, 0, n + quiet * 2, n + quiet * 2, '#ffffff')}<g fill="${ink}">${marks}</g></svg>`;
}

export function createSharePoster({ url, theme = 'retro', title, subtitle = '', year, expiresAt, language = 'zh' }) {
  const p = POSTER_THEMES[theme] || POSTER_THEMES.retro;
  const qr = createQrSvg(url, { ink: p.qr, shape: p.shape, size: p.size });
  const labels = {
    zh: ['我的年度故事', '扫码，打开我的年度故事', '有效期至'],
    en: ['My year in stories', 'SCAN TO OPEN MY YEAR', 'Available until'],
    id: ['Cerita tahunku', 'PINDAI UNTUK MELIHAT CERITAKU', 'Tersedia hingga'],
  }[language] || ['我的年度故事', '扫码，打开我的年度故事', '有效期至'];
  const titleLines = wrap(title || labels[0], 12, 3);
  const yearText = Array.from(String(year)).slice(0, 10).join('');
  const yearSize = Math.min(176, 810 / Math.max(4, yearText.length) / .65);
  const date = new Intl.DateTimeFormat(language, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(expiresAt));
  const displayUrl = new URL(url).host + new URL(url).pathname;
  const mono = 'ui-monospace,Consolas,monospace';
  const family = p.font === 'serif' ? 'Georgia,Songti SC,serif' : p.font === 'monospace' ? mono : p.font === 'cursive' ? 'Comic Sans MS,Kaiti SC,KaiTi,cursive' : 'system-ui,-apple-system,Segoe UI,sans-serif';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440" viewBox="0 0 1080 1440" role="img" aria-label="${escape(title || labels[0])}">
${rect(0, 0, 1080, 1440, p.paper)}${background(theme, p)}
<g font-family="${family}">
${theme === 'retro' ? '' : text(90, 108, 'YEAR IN REVIEW', 23, p.ink, 'letter-spacing="5" font-weight="700"')}
${text(84, 275, yearText, yearSize, p.ink, `font-weight="${theme === 'academia' ? 400 : 900}" letter-spacing="-7"`)}
${titleLines.map((row, i) => text(90, 390 + i * 78, row, 66, theme === 'pop' || theme === 'brutal' ? '#171717' : p.ink, 'font-weight="700"')).join('')}
${wrap(subtitle, 30, 1).map(row => text(90, 588, row, 27, p.ink, 'opacity=".8"')).join('')}
${text(540, 1306, labels[1], language === 'id' ? 26 : 30, p.ink, 'text-anchor="middle" font-weight="700"')}
${text(540, 1347, `${labels[2]} ${date}`, 20, p.ink, 'text-anchor="middle" opacity=".8"')}
${text(540, 1373, wrap(displayUrl, 53, 1)[0], 18, p.ink, `text-anchor="middle" font-family="${mono}"`)}
</g>
<svg x="${p.x}" y="${p.y}" width="${p.size}" height="${p.size}">${qr}</svg>
</svg>`;
  return { svg, qr, width: POSTER_WIDTH, height: POSTER_HEIGHT };
}

export const svgDataUrl = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export async function svgToPng(svg, width = POSTER_WIDTH, height = POSTER_HEIGHT) {
  const image = new Image();
  image.src = svgDataUrl(svg);
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('PNG unavailable');
  return blob;
}
