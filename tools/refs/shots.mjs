// shots.mjs: render a thumbnail strip for every shot and write a shot index cross-linked to REFERENCES.md.
//   node tools/refs/shots.mjs [--frames=3] [--w=320] [--only=chorus3] [--out=references] [--chrome=<path>]
//   node tools/refs/shots.mjs --no-render      only rewrite SHOTS.md / shots.json (after editing REFERENCES.md)
// Reads the chapter/shot registry straight from studio.html (the same code that paints the video), so shot times
// are exact. Writes:
//   references/shots/NN-chapter-MM-shot.jpg   frames at evenly spaced points inside each shot, time-stamped
//   references/shots.json                     chapters, shots, lyrics and the REFERENCES.md entries in each shot
//   references/SHOTS.md                       the same as a browsable page
// Rendering needs Google Chrome (see render.mjs); the rest of the refs tools don't.
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, readReferences, ytLink, mmss } from './parse.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const OUT = resolve(ROOT, args.out || 'references'), SHOTS = resolve(OUT, 'shots');
const NF = +(args.frames || 3), CW = +(args.w || 320);
const CHROME = args.chrome || {
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}[process.platform] || '/usr/bin/google-chrome';
if (!existsSync(CHROME)) { console.error(`Chrome not found at ${CHROME}; pass --chrome=<path>`); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--allow-file-access-from-files', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : []), '--enable-gpu-rasterization', '--window-size=1920,1080']
});
const page = await browser.newPage();
page.on('pageerror', e => console.log('[page error]', e.message));
await page.goto(pathToFileURL(resolve(ROOT, 'studio.html')).href + '?render', { waitUntil: 'networkidle0' });
await page.waitForFunction('window.ready === true', { timeout: 60000 });

// the registry: CH (chapters with [t0, fn] shots), LY (lyrics), DUR
const { chapters, lyrics, dur } = await page.evaluate(() => ({
  chapters: CH.map(c => ({ name: c.name, start: c.start, end: c.end, shots: c.shots.map(([t0, fn]) => ({ t0, fn: fn.name })) })),
  lyrics: LY.map(([start, end, text]) => ({ start, end, text })), dur: DUR
}));
const { entries } = readReferences();

const index = [];
chapters.forEach((c, ci) => {
  c.end = Math.min(c.end, dur);
  c.shots.forEach((s, si) => {
    const t1 = si + 1 < c.shots.length ? c.shots[si + 1].t0 : c.end;
    const times = Array.from({ length: NF }, (_, k) => +(s.t0 + (t1 - s.t0) * (k + .5) / NF).toFixed(2));
    const file = `${String(ci + 1).padStart(2, '0')}-${c.name}-${String(si + 1).padStart(2, '0')}-${s.fn || 'shot'}.jpg`;
    index.push({
      chapter: c.name, chapterIndex: ci + 1, shot: si + 1, fn: s.fn, start: s.t0, end: t1, times, image: `shots/${file}`,
      lyrics: lyrics.filter(l => l.start < t1 && l.end > s.t0).map(l => l.text),
      // entries whose second [t, t+1) overlaps this shot (links round down, so an entry can touch two shots)
      entries: entries.filter(e => e.t < t1 && e.t + 1 > s.t0).map(e => ({ t: e.t, title: e.title, anchor: e.anchor })),
      // otherwise the entry still running from before (a long lyric can span several shots)
      continues: null
    });
    const last = index[index.length - 1];
    if (!last.entries.length) { const e = entries.filter(e => e.t <= s.t0).pop(); if (e) last.continues = { t: e.t, title: e.title, anchor: e.anchor }; }
  });
});

const render = !args['no-render'];
if (render && !args.only) rmSync(SHOTS, { recursive: true, force: true });
mkdirSync(SHOTS, { recursive: true });
const start = Date.now();
for (const s of index) {
  if (!render || (args.only && !s.chapter.includes(args.only))) continue;
  const { url } = await page.evaluate((ts, cols, w) => window.renderSheet(ts, cols, w), s.times, NF, CW);
  writeFileSync(resolve(OUT, s.image), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  process.stdout.write(`${s.image}\n`);
}
await browser.close();
if (render) console.log(`${index.length} shots in ${((Date.now() - start) / 1000).toFixed(0)} s`);

// ---------- index files ----------
writeFileSync(resolve(OUT, 'shots.json'), JSON.stringify({ video: ytLink(0).replace(/\?t=0$/, ''), duration: dur, chapters: chapters.map(c => ({ name: c.name, start: c.start, end: c.end })), shots: index }, null, 1) + '\n');

const refs = relative(OUT, resolve(ROOT, 'REFERENCES.md')).replace(/\\/g, '/');
const md = ['# Shot index', '',
  `Every shot in the video, in order, with ${NF} frames from inside it (each frame is stamped with its song time). Generated by`,
  '[`tools/refs/shots.mjs`](../tools/refs/shots.mjs) from the chapter registry in `src/ch/*.js`. Regenerate it after changing the video;',
  `don't edit it by hand. Use it to check the *On screen* notes in [REFERENCES.md](${refs}), or to find a moment worth a new entry.`, '',
  'Each shot lists its lyrics and the REFERENCES.md entries that fall inside it. To look at any moment full size, open',
  '`studio.html?t=<seconds>` in a browser, or run `node render.mjs --stills=<seconds>`.', ''];
for (const c of chapters) {
  const ci = chapters.indexOf(c);
  md.push(`## ${ci + 1} · ${c.name} (${mmss(c.start)}–${mmss(c.end)})`, '');
  for (const s of index.filter(s => s.chapterIndex === ci + 1)) {
    md.push(`### [${mmss(s.start)}](${ytLink(s.start)}) · \`${s.fn}\` · ${s.start.toFixed(2)}–${s.end.toFixed(2)} s`, '');
    if (s.lyrics.length) md.push(`Lyrics: ${s.lyrics.map(l => `"${l}"`).join(' · ')}  `);
    const link = e => `[${mmss(e.t)} ${e.title.replace(/\*\(visual\)\*\s*/, '').replace(/\[|\]/g, '')}](${refs}#${e.anchor})`;
    md.push(`References: ${s.entries.length ? s.entries.map(link).join(' · ') : s.continues ? `continues ${link(s.continues)}` : '—'}`, '');
    md.push(`![${s.fn} at ${s.times.join(', ')} s](${s.image})`, '');
  }
}
writeFileSync(resolve(OUT, 'SHOTS.md'), md.join('\n'));
console.log(`wrote ${relative(ROOT, resolve(OUT, 'SHOTS.md'))} and shots.json`);
