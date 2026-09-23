// check-links.mjs: fetch every outside link in REFERENCES.md and report what it points to.
//   node tools/refs/check-links.mjs [--out=out/refs/link-report.md] [--only=substring] [--concurrency=12]
// For each URL: HTTP status, final URL after redirects, and the page <title> (read it to confirm the link still
// points at the right thing). Soft 404s ("Page Not Found" with a 200) count as broken. Sites that turn away
// scripted requests are listed as BLOCKED, to check by hand. Exits 1 if any link is broken.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { ROOT, readReferences, links } from './parse.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const OUT = resolve(ROOT, args.out || 'out/refs/link-report.md'), CONC = +(args.concurrency || 12);
// These answer scripted requests with 403 or a bot check even when the page exists.
const BOT_WALLS = ['nytimes.com', 'openai.com', 'dl.acm.org', 'tvtropes.org', 'fandom.com', 'x.com', 'twitter.com'];
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const { md, entries } = readReferences();
const usedAt = new Map();                                         // url → timestamps that cite it
for (const e of entries) for (const r of e.refs) { if (!usedAt.has(r.url)) usedAt.set(r.url, new Set()); usedAt.get(r.url).add(e.display); }
// every outside link once; the video's own ?t= links collapse to the video itself
const urls = [...new Set(['https://youtu.be/8j-hR4fJywU', ...links(md).map(l => l.url).filter(u => /^https?:/.test(u) && !/youtu\.be\/8j-hR4fJywU\?t=/.test(u))])]
  .filter(u => !args.only || u.includes(args.only));

async function check(url) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const res = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA, 'accept-language': 'en' } });
    let title = '';
    if (/html/.test(res.headers.get('content-type') || '')) {
      // read just enough to find the <title>
      const reader = res.body.getReader(), dec = new TextDecoder(); let buf = '';
      while (buf.length < 3e6 && !/<\/title>/i.test(buf)) { const { done, value } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); }
      reader.cancel().catch(() => {});
      title = (buf.match(/<title[^>]*>([^<]*)/i) || [])[1] || '';
      title = title.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    } else { res.body?.cancel().catch(() => {}); title = `(${(res.headers.get('content-type') || '?').split(';')[0]})`; }
    const host = new URL(url).hostname, walled = BOT_WALLS.some(d => host === d || host.endsWith('.' + d));
    let verdict = res.ok ? 'ok' : walled && [401, 403, 429, 503].includes(res.status) ? 'blocked' : 'broken';
    if (res.ok && /page not found|\b404\b|doesn.t exist|no such page/i.test(title)) verdict = 'broken';
    if (res.ok && /^\s*-\s*YouTube$/.test(title)) verdict = 'broken';            // YouTube serves removed videos as a bare "- YouTube"
    if (res.ok && /just a moment|attention required|are you a robot/i.test(title)) verdict = 'blocked';
    return { url, status: res.status, final: res.url !== url ? res.url : '', title, verdict };
  } catch (e) {
    return { url, status: 0, final: '', title: e.name === 'AbortError' ? 'timed out' : e.message, verdict: 'broken' };
  } finally { clearTimeout(timer); }
}

const results = []; let next = 0;
await Promise.all(Array.from({ length: CONC }, async () => { while (next < urls.length) { const u = urls[next++]; results.push(await check(u)); process.stdout.write('.'); } }));
process.stdout.write('\n');
results.sort((a, b) => ['broken', 'blocked', 'ok'].indexOf(a.verdict) - ['broken', 'blocked', 'ok'].indexOf(b.verdict) || a.url.localeCompare(b.url));

const count = v => results.filter(r => r.verdict === v).length, cell = s => String(s).replace(/\|/g, '\\|');
const report = [
  `# Link report for REFERENCES.md`, '',
  `${new Date().toISOString()} · ${results.length} URLs · ${count('ok')} ok · ${count('blocked')} blocked (check by hand) · ${count('broken')} broken`, '',
  '| Verdict | Status | URL | Page title | Redirected to | Cited at |', '|---|---|---|---|---|---|',
  ...results.map(r => `| ${r.verdict} | ${r.status || '—'} | ${cell(r.url)} | ${cell(r.title)} | ${cell(r.final)} | ${[...(usedAt.get(r.url) || [])].join(', ')} |`), ''
].join('\n');
mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, report);

for (const r of results.filter(r => r.verdict !== 'ok')) console.log(`${r.verdict.toUpperCase().padEnd(7)} ${r.status || '—'}  ${r.url}${r.title ? '  — ' + r.title : ''}`);
console.log(`${results.length} URLs: ${count('ok')} ok, ${count('blocked')} blocked, ${count('broken')} broken → ${OUT}`);
process.exit(count('broken') ? 1 : 0);
