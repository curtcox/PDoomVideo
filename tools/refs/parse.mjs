// parse.mjs: read REFERENCES.md (and src/lyrics.js) into plain data for the other refs tools.
//
// REFERENCES.md conventions this relies on (keep them when extending the list):
//   ## N · Chapter name (m:ss–m:ss)                         a chapter in Part 1
//   #### [m:ss](https://youtu.be/<ID>?t=N): "lyric"         an entry for a lyric line
//   #### [m:ss](https://youtu.be/<ID>?t=N): *(visual)* what   an entry for a moment between lyrics
//   *On screen:* …                                           what the frame shows
//   - 🎯 [title](url) · 🔍 [title](url) …                     references; a marker applies to the links after it
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const VIDEO_ID = '8j-hR4fJywU';
export const MARKERS = { '🎯': 'exact', '🔍': 'focused', '🌐': 'broad', '🎬': 'visual', '❓': 'interpretation' };

export const ytLink = t => `https://youtu.be/${VIDEO_ID}?t=${Math.floor(t)}`;
export const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const secs = s => { const [m, ss] = s.split(':').map(Number); return m * 60 + ss; };

// GitHub's heading anchors: lowercase, drop markdown link targets and punctuation, spaces → hyphens, dedupe with -1, -2…
export function slugger() {
  const seen = new Map();
  return text => {
    const base = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim().toLowerCase()
      .replace(/[^\p{L}\p{N}\- ]/gu, '').replace(/ /g, '-');
    const n = seen.get(base) || 0; seen.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };
}

// Markdown links, allowing one level of balanced parentheses inside the URL (Wikipedia titles).
const LINK_RE = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;
export function links(text) {
  return [...text.matchAll(LINK_RE)].map(m => ({ text: m[1], url: m[2], index: m.index }));
}

export function readReferences(file = resolve(ROOT, 'REFERENCES.md')) {
  const md = readFileSync(file, 'utf8'), lines = md.split('\n');
  const slug = slugger(), headings = [], entries = [];
  let part = 0, chapter = null, entry = null;
  lines.forEach((line, i) => {
    const h = line.match(/^(#{1,6}) (.*)$/);
    if (h) {
      const anchor = slug(h[2]);
      headings.push({ level: h[1].length, text: h[2], anchor, line: i + 1 });
      if (h[1] === '#') { part = /Part 1/.test(h[2]) ? 1 : /Part 2/.test(h[2]) ? 2 : 0; chapter = null; entry = null; return; }
      if (part !== 1) return;
      const c = h[1] === '##' && h[2].match(/^(\d+) · (.*?) \((\d+:\d\d)(?:–(\d+:\d\d))?\)$/);
      if (c) { chapter = { n: +c[1], name: c[2], start: secs(c[3]), end: c[4] ? secs(c[4]) : secs(c[3]), anchor }; entry = null; return; }
      const e = h[1] === '####' && h[2].match(/^\[(\d+:\d\d)\]\(([^)]*)\):\s*(.*)$/);
      if (e) {
        const t = +(new URL(e[2]).searchParams.get('t'));
        const visual = /^\*\(visual\)\*/.test(e[3]);
        const lyric = visual ? null : (e[3].match(/^"(.*)"$/) || [])[1] ?? null;
        entry = { line: i + 1, display: e[1], t, url: e[2], title: e[3], lyric, visual, chapter: chapter && chapter.n, chapterRange: chapter && [chapter.start, chapter.end], anchor, onScreen: '', refs: [] };
        entries.push(entry);
      }
      return;
    }
    if (!entry) return;
    const os = line.match(/^\*On screen:\*\s*(.*)$/);
    if (os) { entry.onScreen = os[1]; return; }
    if (/^- /.test(line)) {
      // each link takes the last marker that appears before it on the bullet
      const marks = [...line.matchAll(/(🎯|🔍|🌐|🎬|❓)+/gu)].map(m => ({ index: m.index, levels: [...m[0].matchAll(/🎯|🔍|🌐|🎬|❓/gu)].map(x => MARKERS[x[0]]) }));
      for (const l of links(line)) {
        const mk = marks.filter(m => m.index < l.index).pop();
        entry.refs.push({ text: l.text, url: l.url, levels: mk ? mk.levels : [] });
      }
    }
  });
  return { md, lines, headings, entries };
}

// src/lyrics.js is a browser script (const LY = [...]); evaluate it in a sandbox.
export function readLyrics(file = resolve(ROOT, 'src/lyrics.js')) {
  const ctx = {};
  vm.runInNewContext(readFileSync(file, 'utf8') + '\nthis.LY = LY;', ctx);
  return ctx.LY.map(([start, end, text]) => ({ start, end, text }));
}

// For comparing lyric text across files: ignore case, quotes and punctuation.
export const norm = s => s.toLowerCase().replace(/[“”"‘’'.,!?]/g, '').replace(/\s+/g, ' ').trim();
