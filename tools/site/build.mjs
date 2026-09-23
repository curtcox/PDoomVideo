// build.mjs: build the showcase site (the video plus its reference list) into _site/ for GitHub Pages.
//   node tools/site/build.mjs [--out=_site]          write the site
//   node tools/site/build.mjs --serve [--port=8080]  write it, then serve it locally (YouTube embeds need http, not file://)
// Everything on the page comes from REFERENCES.md (read by tools/refs/parse.mjs), references/shots.json and the README,
// so the site never needs editing by hand. It uses only Node built-ins, so CI needs no `npm install`.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { ROOT, MARKERS, readReferences, readLyrics, entryStarts, links, mmss } from '../refs/parse.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const OUT = resolve(ROOT, args.out || '_site');

const REPO = 'https://github.com/curtcox/PDoomVideo';
const SITE_URL = 'https://curtcox.github.io/PDoomVideo/';
const DUR = 156.6;
// Both uploads are the same 2:37 render, so one timeline serves both. The first is the default.
const VIDEOS = [
  { key: 'explained', id: 'vDrZikYytOw', label: 'Explained', note: 'The annotated cut, with a QR footnote for each moment' },
  { key: 'original', id: '8j-hR4fJywU', label: 'Original', note: 'The clean cut, as first uploaded' },
];
const LEVELS = { exact: '🎯', focused: '🔍', broad: '🌐', visual: '🎬', interpretation: '❓' };

// ---------- markdown, just enough for REFERENCES.md and the README ----------

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let siteIds = new Set();

// Where a markdown link should go on the site. `from` is the repo path of the file the link came from.
function href(url, from) {
  const yt = url.match(/^https:\/\/youtu\.be\/[\w-]+\?t=(\d+)$/);
  if (yt) return { href: `https://youtu.be/${VIDEOS[0].id}?t=${yt[1]}`, t: +yt[1] };
  if (url.startsWith('#')) return siteIds.has(url.slice(1)) && from === 'REFERENCES.md' ? { href: url } : { href: `${REPO}/blob/main/${from}${url}`, ext: true };
  if (/^[a-z]+:/i.test(url)) return { href: url, ext: true };
  const [path, hash = ''] = url.split('#'), p = posix.normalize(posix.join(posix.dirname(from), path));
  return { href: `${REPO}/${p.endsWith('/') || !extname(p) ? 'tree' : 'blob'}/main/${p.replace(/\/$/, '')}${hash && '#' + hash}`, ext: true };
}

function inline(s, from = 'REFERENCES.md') {
  const found = [];
  let text = '', last = 0;
  for (const l of links(s)) {
    text += s.slice(last, l.index) + `\u0000${found.length}\u0000`;
    found.push(l); last = l.index + l.text.length + l.url.length + 4;
  }
  text = esc(text + s.slice(last))
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(🎯|🔍|🌐|🎬|❓)/gu, m => `<span class="lv lv-${MARKERS[m]}" title="${MARKERS[m]}">${m}</span>`);
  return text.replace(/\u0000(\d+)\u0000/g, (_, i) => {
    const l = found[+i], h = href(l.url, from);
    const attrs = h.t != null ? ` class="ts" data-t="${h.t}"` : h.ext ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${esc(h.href)}"${attrs}>${inline(l.text, from)}</a>`;
  });
}

// Headings, paragraphs, lists and tables. Raw HTML, code blocks and rules are left out.
function blocks(md, from, shift = 0) {
  const out = [], lines = md.split('\n');
  let para = [], list = null, table = null, code = false;
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '), from)}</p>`);
    if (list) out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i, from)}</li>`).join('')}</${list.tag}>`);
    if (table) {
      const [head, , ...rows] = table, cells = r => r.replace(/^\||\|$/g, '').split(/\s\|\s?/).map(c => c.trim());
      out.push(`<div class="table"><table><thead><tr>${cells(head).map(c => `<th>${inline(c, from)}</th>`).join('')}</tr></thead><tbody>${
        rows.map(r => `<tr>${cells(r).map(c => `<td>${inline(c, from)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    }
    para = []; list = null; table = null;
  };
  for (const line of lines) {
    if (/^```/.test(line)) { flush(); code = !code; continue; }
    if (code) continue;
    const h = line.match(/^(#{1,6}) (.*)$/), li = line.match(/^(?:[-*]|(\d+)\.) (.*)$/);
    if (!line.trim() || /^---+$/.test(line) || /^\s*</.test(line)) flush();
    else if (h) { flush(); const n = Math.min(6, h[1].length + shift); out.push(`<h${n}>${inline(h[2], from)}</h${n}>`); }
    else if (/^\|/.test(line)) { if (!table) flush(); (table ||= []).push(line); }
    else if (li) { const tag = li[1] ? 'ol' : 'ul'; if (!list || list.tag !== tag) { flush(); list = { tag, items: [] }; } list.items.push(li[2]); }
    else if (list && /^\s+\S/.test(line)) list.items[list.items.length - 1] += ' ' + line.trim();
    else para.push(line.trim());
  }
  flush();
  return out.join('\n');
}

// The body of the section under the heading `title` (up to the next heading of the same or higher level).
function section(md, title) {
  const lines = md.split('\n'), i = lines.findIndex(l => l.replace(/^#+ /, '') === title && /^#+ /.test(l));
  if (i < 0) throw new Error(`no section "${title}"`);
  const level = lines[i].match(/^#+/)[0].length;
  const j = lines.findIndex((l, k) => k > i && (l.match(/^(#+) /)?.[1].length ?? 99) <= level);
  return lines.slice(i + 1, j < 0 ? undefined : j).join('\n');
}

// ---------- data ----------

const { md, lines, headings, entries } = readReferences();
const starts = entryStarts(entries);
const lyrics = readLyrics();
const shotsData = JSON.parse(readFileSync(resolve(ROOT, 'references/shots.json'), 'utf8'));
const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8');
siteIds = new Set(headings.map(h => h.anchor));

const chapters = headings.filter(h => h.level === 2).map(h => ({ h, c: h.text.match(/^(\d+) · (.*?) \((\d+:\d\d)(?:–(\d+:\d\d))?\)$/) }))
  .filter(x => x.c).map(({ h, c }) => ({ n: +c[1], name: c[2], range: c[4] ? `${c[3]}–${c[4]}` : c[3], anchor: h.anchor,
    start: starts[entries.findIndex(e => e.chapter === +c[1])] ?? 0 }));
chapters.forEach((c, i) => c.end = chapters[i + 1]?.start ?? DUR);

// The shots each entry covers, from the shot index.
const shotsFor = new Map();
for (const s of shotsData.shots) for (const a of [...s.entries.map(e => e.anchor), s.continues?.anchor].filter(Boolean))
  (shotsFor.get(a) || shotsFor.set(a, []).get(a)).push(s);

// An entry's body: its On screen line, its reference bullets and any other text, up to the next heading.
function body(e) {
  const out = { onScreen: '', bullets: [], other: [] };
  for (let i = e.line; i < lines.length && !/^#{1,6} /.test(lines[i]); i++) {
    const l = lines[i];
    if (/^\*On screen:\*/.test(l)) out.onScreen = l.replace(/^\*On screen:\*\s*/, '');
    else if (/^- /.test(l)) out.bullets.push(l.slice(2));
    else if (l.trim() && !/^---+$/.test(l)) out.other.push(l);
  }
  return out;
}

const levelsOf = s => [...new Set([...s.matchAll(/🎯|🔍|🌐|🎬|❓/gu)].map(m => MARKERS[m[0]]))];
const plain = s => s.replace(/\[((?:[^\[\]]|\[[^\]]*\])*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/🎯|🔍|🌐|🎬|❓/gu, '');

// ---------- page ----------

function strip(s, cls) {
  return `<button class="${cls}" type="button" data-times="${s.times.join(',')}" data-start="${s.start.toFixed(2)}" title="${mmss(s.start)} · ${s.fn}">`
    + `<img src="${s.image}" alt="Frames from ${esc(s.fn)} at ${s.times.map(t => mmss(t)).join(', ')}" loading="lazy" width="960" height="180"></button>`;
}

function entryHtml(e, i) {
  const b = body(e), visual = e.visual;
  const title = visual ? inline(e.title.replace(/^\*\(visual\)\*\s*/, '')) : inline(e.title);
  const search = plain([e.display, e.title, b.onScreen, ...b.bullets, ...b.other].join(' ')).toLowerCase();
  const shots = shotsFor.get(e.anchor) || [];
  return `<article class="entry${visual ? ' visual' : ''}" id="${e.anchor}" data-i="${i}" data-search="${esc(search)}">
  <header><a class="ts play" href="https://youtu.be/${VIDEOS[0].id}?t=${e.t}" data-t="${e.t}" aria-label="Play from ${e.display}">${e.display}</a>
  <h3>${visual ? '<span class="tag">visual</span> ' : ''}<span class="${e.lyric != null ? 'lyric' : 'what'}">${title}</span></h3>
  <a class="perma" href="#${e.anchor}" aria-label="Link to this moment">#</a></header>
  ${b.onScreen ? `<p class="onscreen"><span class="label">On screen</span> ${inline(b.onScreen)}</p>` : ''}
  ${shots.length ? `<div class="strips">${shots.map(s => strip(s, 'strip')).join('')}</div>` : ''}
  ${b.other.map(o => `<p>${inline(o)}</p>`).join('')}
  ${b.bullets.length ? `<ul class="refs">${b.bullets.map(x => `<li data-levels="${levelsOf(x).join(' ')}">${inline(x)}</li>`).join('')}</ul>` : ''}
</article>`;
}

function timelineHtml() {
  return chapters.map(c => {
    const es = entries.map((e, i) => [e, i]).filter(([e]) => e.chapter === c.n);
    return `<section class="chapter" id="${c.anchor}" data-ch="${c.n}">
  <h2><span class="ch-n">${c.n}</span> ${esc(c.name)} <span class="ch-range">${c.range}</span></h2>
  ${es.map(([e, i]) => entryHtml(e, i)).join('\n')}
</section>`;
  }).join('\n');
}

// Part 2 of REFERENCES.md: one table per topic group, then a list of whole-video background.
function topicsHtml() {
  const part2 = section(md, 'Part 2: By topic'), intro = part2.split('\n## ')[0];
  const groups = part2.split('\n## ').slice(1).map(g => ({ title: g.split('\n')[0], body: g.split('\n').slice(1) }));
  return `<p class="lede">${inline(intro.trim().split('\n').filter(l => l.trim())[0] || '')}</p>` + groups.map(g => {
    const rows = g.body.filter(l => /^\|/.test(l)).slice(2).map(r => r.replace(/^\||\|$/g, '').split(/\s\|\s?/).map(c => c.trim()));
    const other = g.body.filter(l => !/^\|/.test(l)).join('\n');
    const id = headings.find(h => h.level === 2 && h.text === g.title)?.anchor;
    return `<section class="topic-group"${id ? ` id="${id}"` : ''}><h2>${inline(g.title)}</h2>
  ${rows.length ? `<ul class="topics">${rows.map(([topic, times, start]) =>
      `<li class="topic" data-search="${esc(plain(`${topic} ${start}`).toLowerCase())}"><div class="topic-name">${inline(topic)}</div>
    <div class="topic-times">${inline(times).replace(/<\/a>,\s*/g, '</a> ')}</div><div class="topic-start"><span class="label">Start here</span> ${inline(start)}</div></li>`).join('')}</ul>` : ''}
  ${blocks(other, 'REFERENCES.md')}
</section>`;
  }).join('\n');
}

function aboutHtml() {
  const legend = section(md, 'How specific is each link?').split('\n').filter(l => /^\| \S+ \| \*\*/.test(l))
    .map(l => l.replace(/^\||\|$/g, '').split(' | ').map(c => c.trim()));
  return `<section><h2>The video</h2>
  <p>Claude Opus 5.5 made this music video for the song <em>I'm Upping My P(doom)</em>, entirely in
    <a href="${REPO}" target="_blank" rel="noopener">code</a>: every frame is painted with p5.js and p5.brush in headless Chrome.
    Every lyric and sight gag is annotated with sources. The <strong>Explained</strong> cut adds a QR footnote for each moment,
    and the <strong>Original</strong> cut is the clean upload.</p>
  <h3>Credits</h3>${blocks(section(readme, 'Credits'), 'README.md')}
  <h3>How it was made</h3>${blocks(section(readme, 'How it was made'), 'README.md')}
</section>
<section><h2>Reading the reference list</h2>
  <p>Every lyric and important sight gag has an entry with what's on screen and a list of sources. Each source is marked by how closely it matches:</p>
  <dl class="legend">${legend.map(([m, name, what]) => `<div><dt><span class="lv lv-${MARKERS[m]}">${m}</span> ${inline(name)}</dt><dd>${inline(what)}</dd></div>`).join('')}</dl>
  <h3>How this list was checked</h3>${blocks(section(md, 'How this list was checked'), 'REFERENCES.md')}
</section>
<section><h2>What's in the repository</h2>${blocks(section(readme, "What's here"), 'README.md')}
  <p>To render the video yourself, see <a href="${REPO}#rendering" target="_blank" rel="noopener">Rendering</a> in the README.</p>
</section>`;
}

function filmstripHtml() {
  return `<div class="track" aria-label="Chapters">${chapters.map(c =>
    `<button type="button" class="seg" data-start="${c.start}" style="flex-grow:${(c.end - c.start).toFixed(2)}" title="${c.n} · ${esc(c.name)} (${c.range})"><span>${c.end - c.start >= 5 ? c.n : ''}</span></button>`).join('')}
  <div class="playhead" aria-hidden="true"></div></div>
  <div class="filmstrip" aria-label="Shots">${shotsData.shots.map(s => strip(s, 'shot')).join('')}</div>`;
}

const levelChips = Object.entries(LEVELS).map(([k, m]) =>
  `<button type="button" class="chip lv-${k}" data-level="${k}" aria-pressed="false"><span aria-hidden="true">${m}</span> ${k}</button>`).join('');

const data = {
  dur: DUR, videos: VIDEOS,
  entries: entries.map((e, i) => ({ t: e.t, start: starts[i], anchor: e.anchor, chapter: e.chapter, display: e.display })),
  chapters: chapters.map(({ n, name, start, end }) => ({ n, name, start, end })),
  shots: shotsData.shots.map(s => ({ start: +s.start.toFixed(2), end: +s.end.toFixed(2) })),
  lyrics: lyrics.map(l => [l.start, l.end, l.text]),
};

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="#d97757" d="M3 3h10v2h2v3h-2v3H3V8H1V5h2z"/><path fill="#d97757" d="M4 11h1v3H4zm2 0h1v3H6zm3 0h1v3H9zm2 0h1v3h-1z"/><path fill="#1f1a17" d="M5 5h1v2H5zm5 0h1v2h-1z"/></svg>`;
const description = 'A music video made by Claude Opus 5.5, with a timestamped reading list for every lyric and sight gag.';

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>I'm Upping My P(doom)</title>
<meta name="description" content="${description}">
<meta property="og:title" content="I'm Upping My P(doom)">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:image" content="https://i.ytimg.com/vi/${VIDEOS[0].id}/maxresdefault.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip" href="#panel">Skip to the references</a>
<header class="masthead">
  <div class="brand">
    <h1>I'm Upping My <span class="pdoom">P(doom)</span></h1>
    <p>${description.replace('with a timestamped', 'and a timestamped')}</p>
  </div>
  <nav class="outlinks">
    <a href="https://youtu.be/${VIDEOS[0].id}" target="_blank" rel="noopener">YouTube</a>
    <a href="${REPO}" target="_blank" rel="noopener">Source</a>
    <a href="${REPO}/blob/main/REFERENCES.md" target="_blank" rel="noopener">REFERENCES.md</a>
  </nav>
</header>
<main class="layout">
  <section class="stage" aria-label="Video">
    <div class="player-wrap">
      <iframe id="player" src="https://www.youtube-nocookie.com/embed/${VIDEOS[0].id}?enablejsapi=1&amp;rel=0&amp;playsinline=1"
        title="I'm Upping My P(doom)" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </div>
    <div class="bar">
      <div class="seg-control" role="group" aria-label="Which cut">
        ${VIDEOS.map((v, i) => `<button type="button" data-video="${v.key}" aria-pressed="${i === 0}" title="${esc(v.note)}">${v.label}</button>`).join('')}
      </div>
      <span class="clock" aria-live="off"><span id="clock-now">0:00</span><span class="total"> / ${mmss(Math.ceil(DUR))}</span></span>
      <button type="button" id="follow" class="follow" aria-pressed="true" title="Scroll the references along with the video">Follow along</button>
    </div>
    <p class="now" id="now"><span class="now-ch">Press play</span> <span class="now-ly">The references follow the song.</span></p>
    ${filmstripHtml()}
  </section>

  <section class="panel" id="panel" aria-label="References">
    <div class="tabs" role="tablist">
      <button type="button" role="tab" id="tab-timeline" aria-controls="view-timeline" aria-selected="true">Timeline</button>
      <button type="button" role="tab" id="tab-topics" aria-controls="view-topics" aria-selected="false">Topics</button>
      <button type="button" role="tab" id="tab-about" aria-controls="view-about" aria-selected="false">About</button>
    </div>
    <div class="toolbar">
      <label class="search"><span class="visually-hidden">Search the references</span>
        <input type="search" id="q" placeholder="Search lyrics, sources, topics…  ( / )" autocomplete="off"></label>
      <div class="chips" role="group" aria-label="Show only these kinds of sources">${levelChips}</div>
      <p class="count" id="count" aria-live="polite"></p>
    </div>
    <div class="view" id="view-timeline" role="tabpanel" aria-labelledby="tab-timeline">
${timelineHtml()}
    </div>
    <div class="view" id="view-topics" role="tabpanel" aria-labelledby="tab-topics" hidden>
${topicsHtml()}
    </div>
    <div class="view prose" id="view-about" role="tabpanel" aria-labelledby="tab-about" hidden>
${aboutHtml()}
    </div>
    <footer class="foot">Built from <a href="${REPO}/blob/main/REFERENCES.md" target="_blank" rel="noopener">REFERENCES.md</a>
      and the <a href="${REPO}/blob/main/references/SHOTS.md" target="_blank" rel="noopener">shot index</a>. Everything here was generated by Claude Opus 5.5.</footer>
  </section>
</main>
<script>window.PDOOM = ${JSON.stringify(data)};</script>
<script src="app.js"></script>
</body>
</html>
`;

// ---------- write ----------

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'shots'), { recursive: true });
writeFileSync(join(OUT, 'index.html'), page);
for (const f of ['style.css', 'app.js']) copyFileSync(join(HERE, f), join(OUT, f));
const shotFiles = readdirSync(resolve(ROOT, 'references/shots')).filter(f => f.endsWith('.jpg'));
for (const f of shotFiles) copyFileSync(resolve(ROOT, 'references/shots', f), join(OUT, 'shots', f));
writeFileSync(join(OUT, '.nojekyll'), '');
const missing = shotsData.shots.filter(s => !existsSync(join(OUT, s.image)));
if (missing.length) { console.error(`missing shot images: ${missing.map(s => s.image).join(', ')}`); process.exit(1); }
console.log(`wrote ${OUT}: ${entries.length} entries in ${chapters.length} chapters, ${shotFiles.length} shot strips`);

if (args.serve) {
  const port = +(args.port || 8080);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg' };
  createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html');
    const f = join(OUT, posix.normalize(p));
    if (!f.startsWith(OUT) || !existsSync(f)) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream' }).end(readFileSync(f));
  }).listen(port, () => console.log(`serving http://localhost:${port}/`));
}
