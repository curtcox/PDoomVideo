// qr.mjs: build the QR footnote cues for the annotated render (studio.html?qr, render.mjs --qr).
//   node tools/refs/qr.mjs [--hold=3] [--ecc=M] [--base=<url of REFERENCES.md>]   write src/qrcues.js
//   node tools/refs/qr.mjs --check                                            exit 1 if src/qrcues.js is out of date
// Every Part 1 entry of REFERENCES.md with references becomes a footnote, on screen from its exact start (the lyric's start
// from src/lyrics.js, or the shot's start from references/shots.json) to the next entry's. Footnotes shorter than --hold
// seconds are merged into a neighbour (same chapter first, then the shorter one) so each code stays up long enough to scan.
// Entries without references extend the footnote before them, or leave a gap with no tag if that one is already long enough.
// A footnote's code opens the heading of its first entry on GitHub; the rest of its entries follow right under it.
// All codes use one QR version (the smallest that fits the longest URL), so every tag is the same size.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import qrcode from 'qrcode-generator';
import { ROOT, readReferences, entryStarts } from './parse.mjs';

export const REFS_URL = 'https://github.com/curtcox/PDoomVideo/blob/main/REFERENCES.md';
export const CUES_FILE = resolve(ROOT, 'src/qrcues.js');
const DUR = 156.6;

export function buildCues({ hold = 3, ecc = 'M', base = REFS_URL } = {}) {
  const { entries } = readReferences(), starts = entryStarts(entries);
  // one cue per entry with references; null marks a gap
  const spans = [];
  entries.forEach((e, i) => {
    const a = starts[i], b = i + 1 < entries.length ? starts[i + 1] : DUR;
    const prev = spans[spans.length - 1];
    if (e.refs.length) spans.push({ a, b, chapter: e.chapter, entries: [e] });
    else if (prev && prev.b - prev.a < hold) prev.b = b;
    else spans.push(null);
  });
  // merge the shortest too-short cue into a neighbour until none can be merged
  for (;;) {
    const short = spans.map((s, i) => [s, i]).filter(([s, i]) => s && s.b - s.a < hold && (spans[i - 1] || spans[i + 1]))
      .sort(([p], [q]) => (p.b - p.a) - (q.b - q.a));
    if (!short.length) break;
    const [s, i] = short[0];
    const nb = [i - 1, i + 1].filter(j => spans[j])
      .sort((j, k) => (spans[k].chapter === s.chapter) - (spans[j].chapter === s.chapter) || (spans[j].b - spans[j].a) - (spans[k].b - spans[k].a))[0];
    const [p, q] = nb < i ? [nb, i] : [i, nb];
    spans.splice(p, 2, { a: spans[p].a, b: spans[q].b, chapter: spans[p].chapter, entries: [...spans[p].entries, ...spans[q].entries] });
  }
  const cues = spans.filter(Boolean).map((s, i) => ({
    n: i + 1, a: +s.a.toFixed(2), b: +s.b.toFixed(2), time: s.entries[0].display,
    refs: s.entries.reduce((n, e) => n + e.refs.length, 0),
    url: `${base}#${s.entries[0].anchor}`, anchor: s.entries[0].anchor, entries: s.entries.map(e => e.display)
  }));
  // the smallest QR version that fits every URL
  const type = Math.max(...cues.map(c => { const q = qrcode(0, ecc); q.addData(c.url); q.make(); return (q.getModuleCount() - 17) / 4; }));
  return { cues, type, ecc, hold };
}

export function cuesSource({ cues, type, ecc, hold }) {
  const row = c => `  { n: ${c.n}, a: ${c.a}, b: ${c.b}, time: '${c.time}', refs: ${c.refs}, entries: ${JSON.stringify(c.entries).replace(/"/g, "'")},\n    url: '${c.url}' }`;
  return `// qrcues.js: generated from REFERENCES.md by \`npm run refs:qr\` (tools/refs/qr.mjs); don't edit by hand.
// The QR footnotes of the annotated render (studio.html?qr, render.mjs --qr): footnote n is on screen from a to b seconds
// and its code opens url, the REFERENCES.md heading of the first of its entries. Footnotes hold for at least ${hold} s.
// Once a video with these codes is published, the anchors in it are permanent: keep those headings' text unchanged.
const QR_TYPE = ${type}, QR_ECC = '${ecc}';
const QR_CUES = [
${cues.map(row).join(',\n')}
];
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
  const built = buildCues({ hold: +(args.hold || 3), ecc: args.ecc || 'M', base: args.base || REFS_URL }), src = cuesSource(built);
  const { cues, type, ecc } = built, size = 17 + 4 * type;
  if (args.check) {
    const ok = existsSync(CUES_FILE) && readFileSync(CUES_FILE, 'utf8') === src;
    console.log(ok ? `qrcues.js is up to date (${cues.length} footnotes)` : 'FAIL  src/qrcues.js is out of date with REFERENCES.md: run npm run refs:qr');
    process.exit(ok ? 0 : 1);
  }
  writeFileSync(CUES_FILE, src);
  const lens = cues.map(c => c.b - c.a);
  console.log(`${cues.length} footnotes, QR version ${type}-${ecc} (${size}×${size} modules), hold ${Math.min(...lens).toFixed(1)}–${Math.max(...lens).toFixed(1)} s`);
  for (const c of cues) console.log(`  ${String(c.n).padStart(2)}  ${c.a.toFixed(2).padStart(6)}–${c.b.toFixed(2).padEnd(6)}  ${c.entries.join(' + ').padEnd(22)} ${c.refs} refs`);
  console.log('wrote src/qrcues.js');
}
