# Reference-list tools

Tools for checking and extending [`REFERENCES.md`](../../REFERENCES.md), the timestamped reading list for the video. They need Node.js 18 or later. `shots.mjs` also needs Google Chrome and `npm install`.

| Command | What it does | Needs |
|---|---|---|
| `npm run refs:timeline` | Offline checks. Each timestamp link shows the time it jumps to. Every lyric in `src/lyrics.js` has one entry at the right second with the same words. Entries sit inside their chapter and run in time order. Every entry has an *On screen* line and marked references. Every `#anchor` and file link resolves. | nothing |
| `npm run refs:links` | Fetches every outside link and writes `out/refs/link-report.md` with the status, redirect and page title of each, plus which timestamps cite it. Soft 404s count as broken. Sites that block scripts (NYT, OpenAI, ACM, TV Tropes, Fandom, X) are listed as **blocked**, for checking by hand. | network |
| `npm run refs:shots` | Renders a strip of frames from inside every shot to `references/shots/`, then writes [`references/SHOTS.md`](../../references/SHOTS.md) and `references/shots.json`: every shot with its exact times, lyrics, frames, and the REFERENCES.md entries it contains. Takes about 1½ minutes. | Chrome |
| `npm run refs:index` | Rewrites `SHOTS.md` and `shots.json` without re-rendering. Run it after editing REFERENCES.md so the cross-links stay current. | Chrome |
| `npm run refs:qr` | Groups the entries into QR footnotes and writes [`src/qrcues.js`](../../src/qrcues.js) for the annotated cut (`render.mjs --qr`). Run it after editing REFERENCES.md. `--check` only reports whether the file is out of date. | `npm install` |
| `npm run refs:qr:scan` | Renders two frames of every footnote in the annotated cut and decodes the codes with ZXing, at 1080p, as a 720p JPEG and as a 480p JPEG. It fails if a 1080p or 720p scan misses or opens the wrong page. Takes about a minute. | Chrome |
| `npm run refs:check` | `refs:timeline`, then `refs:qr --check`, then `refs:links`. Exits non-zero if anything is broken. | network |

Options: `node tools/refs/shots.mjs --only=chorus3 --frames=5 --w=480` re-renders one chapter with more or bigger frames. `node tools/refs/check-links.mjs --only=arxiv.org` checks a subset. Pass `--chrome=<path>` if Chrome isn't in the default place for your OS.

## Looking at a moment

- **Scrub interactively:** open `studio.html?t=81.5` straight from disk in Chrome. The slider moves through the song. It has no audio, and it needs `npm install` first for p5.
- **Full-size stills:** `node render.mjs --stills=81.5,82,82.5 --out=out/stills`.
- **Quick contact sheet:** `node render.mjs --sheet=81,82,83,84 --cols=4 --w=480 --out=out/check.jpg`.
- **A short clip with sound:** `node render.mjs --clip=81:85 --out=out/turn.mp4`.
- **Finding the code:** every shot in `SHOTS.md` names its function (for example `road`). Search `src/ch/` for it. The comment above each shot function describes the staging, and props often have their own comments (for example `// a framed abacus portrait`).

## QR footnotes

The annotated cut (`node render.mjs --qr …`, or `studio.html?qr` to preview) puts a QR code on screen for each moment in the list. [`qr.mjs`](qr.mjs) builds the cues and [`src/qrtag.js`](../../src/qrtag.js) paints them.

- **What a code opens:** the GitHub page of REFERENCES.md, scrolled to the entry's heading (`…/blob/main/REFERENCES.md#028-with-a-bag-of-shrooms`). One code covers every source for that moment, and the page stays current as links are fixed.
- **Timing:** each entry with references runs from its exact start (the lyric's start in `src/lyrics.js`, or the shot's start in `shots.json`) to the next entry's. A footnote shorter than 3 s (`--hold`) is merged into a neighbor, preferring one in the same chapter and then the shorter one, and its code opens the first of its entries. Entries without references (CHOMP, the fall, the darkness, the bows) extend the previous footnote. If that one is already long enough, they leave a gap with no tag instead. The result is 35 footnotes, each 3–6.5 s long.
- **Look:** a cream card with a watercolor edge, a strip of rose washi tape and a clay label reading "FOOTNOTE 7 · 0:26 · 6 sources". It drops in with an overshoot, nods on the beat, and slides off to the right at the end of its footnote. It sits on the right edge, below the corner P(doom) meter and clear of the karaoke bar and YouTube's paused controls. The card is painted with p5.brush like everything else. The code itself is drawn crisp, ink on cream, after the paper grain, and every code uses the same QR version (7-M, 5 px per module), so all tags are the same size.
- **Published codes are permanent.** Once a video with codes is out, its anchors can't be changed. `refs:timeline` fails if a heading a code opens is renamed or removed. Keep the old heading text, or regenerate the cues and re-render.

## Adding or changing an entry

The tools read REFERENCES.md by its structure, so keep to this format (see [`parse.mjs`](parse.mjs)):

```markdown
## 5 · Obsolete (1:13–1:35)                                        ← chapter: number · name (start–end)

#### [1:21](https://youtu.be/8j-hR4fJywU?t=81): "Sharp left turn and there you are"   ← a lyric entry
*On screen:* what the frames actually show (check against SHOTS.md).
- 🎯 [Exact source](https://…) · [another](https://…)
- 🔍 [Explainer](https://…)
- 🌐 [Background](https://…) · 🎬 [Visual gag source](https://…)

#### [1:34](https://youtu.be/8j-hR4fJywU?t=94): *(visual)* the fall     ← a moment between lyrics
```

- **The `?t=` value** is the lyric's start from `src/lyrics.js`, or the shot's start from `SHOTS.md`, rounded down. The link text must match it (`?t=81` → `1:21`).
- **A level marker** (🎯 exact, 🔍 focused, 🌐 broad, 🎬 visual, ❓ interpretation) applies to every link after it on the same bullet until the next marker.
- **After editing:** run `npm run refs:timeline`, then `npm run refs:index` and `npm run refs:qr`, and `npm run refs:links` if you added links. Add a row to the right Part 2 table for any new topic.
- **If the video changes** (new shots, re-timed lyrics), run `npm run refs:shots` and `npm run refs:timeline`, then re-read the *On screen* notes against the new strips.
