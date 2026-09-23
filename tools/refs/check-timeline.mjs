// check-timeline.mjs: offline consistency checks for REFERENCES.md.
//   node tools/refs/check-timeline.mjs [path/to/REFERENCES.md]
// Checks that
//   · every [m:ss](…?t=N) link shows the same time it jumps to, and stays inside the video;
//   · every lyric in src/lyrics.js has exactly one Part 1 entry, at floor(start), with the same words;
//   · every entry sits inside its chapter's range and entries run in time order;
//   · every entry has an On screen line and at least one reference (visual entries may skip references);
//   · every #anchor and relative file link resolves;
//   · every QR footnote in src/qrcues.js opens a heading that exists (published codes can't be changed).
// Exits 1 if anything fails.
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { resolve } from 'node:path';
import { ROOT, VIDEO_ID, readReferences, readLyrics, links, norm, mmss } from './parse.mjs';

const DUR = 157;
const { md, headings, entries } = readReferences(process.argv[2] && resolve(process.argv[2])), LY = readLyrics();
const problems = [], warnings = [];
const lineOf = idx => md.slice(0, idx).split('\n').length;

// 1 · every timestamp link
const ytRe = new RegExp(String.raw`\[(\d+:\d\d)(?:–\d+:\d\d)?\]\(https://youtu\.be/${VIDEO_ID}\?t=(\d+)\)`, 'g');
let nTs = 0;
for (const m of md.matchAll(ytRe)) {
  nTs++;
  const t = +m[2];
  if (mmss(t) !== m[1]) problems.push(`line ${lineOf(m.index)}: link text ${m[1]} but ?t=${t} (${mmss(t)})`);
  if (t < 0 || t > DUR) problems.push(`line ${lineOf(m.index)}: ?t=${t} is outside the ${DUR}s video`);
}

// 2 · lyrics ↔ entries
const lyricEntries = entries.filter(e => e.lyric != null);
for (const l of LY) {
  const hits = lyricEntries.filter(e => norm(e.lyric) === norm(l.text));
  if (!hits.length) { problems.push(`lyric at ${l.start}s has no entry: "${l.text}"`); continue; }
  if (hits.length > 1 && new Set(hits.map(h => h.t)).size !== hits.length) problems.push(`lyric "${l.text}" has duplicate entries at the same time`);
  // repeated lyrics (the chorus line) match whichever entry has the right time
  if (!hits.some(h => h.t === Math.floor(l.start))) problems.push(`lyric "${l.text}" starts at ${l.start}s but its entry says ?t=${hits.map(h => h.t).join('/')} (expected ${Math.floor(l.start)})`);
}
for (const e of lyricEntries) if (!LY.some(l => norm(l.text) === norm(e.lyric))) problems.push(`line ${e.line}: "${e.lyric}" is not a lyric in src/lyrics.js`);

// 3 · chapter ranges and order
entries.forEach((e, i) => {
  if (e.chapterRange && (e.t < e.chapterRange[0] || e.t > e.chapterRange[1])) problems.push(`line ${e.line}: ${e.display} is outside its chapter (${e.chapterRange.map(mmss).join('–')})`);
  if (i && e.t < entries[i - 1].t) problems.push(`line ${e.line}: ${e.display} comes after ${entries[i - 1].display}, out of order`);
  if (!e.onScreen) warnings.push(`line ${e.line}: ${e.display} has no *On screen:* line`);
  if (!e.visual && !e.refs.length && !/beat gag|see \[/i.test(e.onScreen)) warnings.push(`line ${e.line}: ${e.display} ${e.title} has no references`);
  // outside links need a level marker (production credits and cross-references are exempt)
  for (const r of e.refs) if (!r.levels.length && /^https?:/.test(r.url) && !/youtu\.be|p5js|p5\.brush|pptr|ffmpeg/.test(r.url)) warnings.push(`line ${e.line}: link "${r.text}" has no level marker before it`);
});

// 4 · internal links
const anchors = new Set(headings.map(h => h.anchor));
for (const l of links(md)) {
  if (l.url.startsWith('#')) { if (!anchors.has(l.url.slice(1))) problems.push(`line ${lineOf(l.index)}: anchor ${l.url} matches no heading`); }
  else if (!/^[a-z]+:/i.test(l.url) && !existsSync(resolve(ROOT, l.url.split('#')[0]))) problems.push(`line ${lineOf(l.index)}: file ${l.url} does not exist`);
}

// 5 · QR footnotes: a rendered code can't be edited, so the heading it opens has to keep existing
const qrFile = resolve(ROOT, 'src/qrcues.js'), qr = {};
if (existsSync(qrFile)) vm.runInNewContext(readFileSync(qrFile, 'utf8') + '\nthis.QR_CUES = QR_CUES;', qr);
for (const c of qr.QR_CUES || []) {
  const a = c.url.split('#')[1];
  if (!anchors.has(a)) problems.push(`src/qrcues.js: footnote ${c.n} (${c.time}) opens #${a}, which matches no heading. Restore the heading, or run npm run refs:qr and re-render`);
}

console.log(`${entries.length} entries (${lyricEntries.length} lyric, ${entries.length - lyricEntries.length} visual), ${LY.length} lyrics, ${nTs} timestamp links, ${entries.reduce((n, e) => n + e.refs.length, 0)} references in Part 1`);
for (const w of warnings) console.log('warn  ' + w);
for (const p of problems) console.log('FAIL  ' + p);
console.log(problems.length ? `${problems.length} problem(s)` : 'timeline OK');
process.exit(problems.length ? 1 : 0);
