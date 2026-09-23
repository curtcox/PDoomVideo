// check-qr.mjs: render the annotated cut (studio.html?qr) and scan every QR footnote back out of the frames.
//   node tools/refs/check-qr.mjs [--only=7,8] [--chrome=<path>]
// For each footnote in src/qrcues.js it renders a frame just after the tag lands and one in the middle of its hold, then
// decodes the whole frame with ZXing (zxing-wasm, the engine behind most Android scanners) three ways: the 1080p frame as
// rendered, a 720p JPEG (roughly a paused YouTube stream) and a 480p JPEG (reported, not required). A footnote fails if
// a 1080p or 720p scan misses or opens the wrong URL.
// Exits 1 on any failure. Needs Google Chrome and `npm install`.
import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { readBarcodes } from 'zxing-wasm/reader';
import { ROOT } from './parse.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const CHROME = args.chrome || {
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}[process.platform] || '/usr/bin/google-chrome';
if (!existsSync(CHROME)) { console.error(`Chrome not found at ${CHROME}; pass --chrome=<path>`); process.exit(1); }

const ctx = {};
vm.runInNewContext(readFileSync(resolve(ROOT, 'src/qrcues.js'), 'utf8') + '\nthis.QR_CUES = QR_CUES;', ctx);
const only = args.only ? String(args.only).split(',').map(Number) : null;
const cues = ctx.QR_CUES.filter(c => !only || only.includes(c.n));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--allow-file-access-from-files', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : []), '--enable-gpu-rasterization', '--window-size=1920,1080']
});
const page = await browser.newPage();
page.on('pageerror', e => console.log('[page error]', e.message));
await page.goto(pathToFileURL(resolve(ROOT, 'studio.html')).href + '?render&qr', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.ready === true', { timeout: 60000 });

// Render t and encode it at each size (w, JPEG quality or null for PNG), then decode each image. Returns the text per size.
async function scan(t, sizes) {
  const images = await page.evaluate(async (t, sizes) => {
    await window.renderAt(t, 'image/png');
    const src = document.getElementById('out');
    return sizes.map(([w, q]) => {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = Math.round(w * 9 / 16);
      const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(src, 0, 0, cv.width, cv.height);
      const url = cv.toDataURL(q ? 'image/jpeg' : 'image/png', q || undefined); return url.slice(url.indexOf(',') + 1);
    });
  }, t, sizes);
  const out = [];
  for (const b64 of images) {
    const found = await readBarcodes(Buffer.from(b64, 'base64'), { formats: ['QRCode'], maxNumberOfSymbols: 4 });
    out.push(found.length ? found[0].text : null);
  }
  return out;
}

const SIZES = [[1920, null], [1280, .7], [854, .7]], REQUIRED = 2;
let fails = 0;
console.log(' #   time   frame     1080p  720p  480p');
for (const c of cues) {
  for (const t of [c.a + .5, (c.a + c.b) / 2].map(x => +x.toFixed(2))) {
    const got = await scan(t, SIZES), ok = got.map(g => g === c.url);
    const bad = ok.slice(0, REQUIRED).some(x => !x);
    if (bad) fails++;
    const mark = g => g === c.url ? ' ok  ' : g ? ' WRONG' : ' miss ';
    console.log(`${String(c.n).padStart(2)}  ${c.time.padStart(5)}  ${t.toFixed(2).padStart(6)}  ${got.map(mark).join(' ')}${bad ? '   FAIL' : ''}`);
    for (const g of got) if (g && g !== c.url) console.log(`      decoded ${g}\n      expected ${c.url}`);
  }
}
await browser.close();
console.log(fails ? `${fails} frame(s) failed to scan` : `all ${cues.length} footnotes scan at 1080p and 720p`);
process.exit(fails ? 1 : 0);
