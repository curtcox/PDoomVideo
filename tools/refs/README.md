# Reference-list tools

Tools for checking and extending [`REFERENCES.md`](../../REFERENCES.md), the timestamped reading list for the video. They need Node.js 18 or later. `shots.mjs` also needs Google Chrome and `npm install`.

| Command | What it does | Needs |
|---|---|---|
| `npm run refs:timeline` | Offline checks. Each timestamp link shows the time it jumps to. Every lyric in `src/lyrics.js` has one entry at the right second with the same words. Entries sit inside their chapter and run in time order. Every entry has an *On screen* line and marked references. Every `#anchor` and file link resolves. | nothing |
| `npm run refs:links` | Fetches every outside link and writes `out/refs/link-report.md` with the status, redirect and page title of each, plus which timestamps cite it. Soft 404s count as broken. Sites that block scripts (NYT, OpenAI, ACM, TV Tropes, Fandom, X) are listed as **blocked**, for checking by hand. | network |
| `npm run refs:shots` | Renders a strip of frames from inside every shot to `references/shots/`, then writes [`references/SHOTS.md`](../../references/SHOTS.md) and `references/shots.json`: every shot with its exact times, lyrics, frames, and the REFERENCES.md entries it contains. Takes about 1½ minutes. | Chrome |
| `npm run refs:index` | Rewrites `SHOTS.md` and `shots.json` without re-rendering. Run it after editing REFERENCES.md so the cross-links stay current. | Chrome |
| `npm run refs:check` | `refs:timeline` then `refs:links`. Exits non-zero if anything is broken. | network |

Options: `node tools/refs/shots.mjs --only=chorus3 --frames=5 --w=480` re-renders one chapter with more or bigger frames. `node tools/refs/check-links.mjs --only=arxiv.org` checks a subset. Pass `--chrome=<path>` if Chrome isn't in the default place for your OS.

## Looking at a moment

- **Scrub interactively:** open `studio.html?t=81.5` straight from disk in Chrome. The slider moves through the song. It has no audio, and it needs `npm install` first for p5.
- **Full-size stills:** `node render.mjs --stills=81.5,82,82.5 --out=out/stills`.
- **Quick contact sheet:** `node render.mjs --sheet=81,82,83,84 --cols=4 --w=480 --out=out/check.jpg`.
- **A short clip with sound:** `node render.mjs --clip=81:85 --out=out/turn.mp4`.
- **Finding the code:** every shot in `SHOTS.md` names its function (for example `road`). Search `src/ch/` for it. The comment above each shot function describes the staging, and props often have their own comments (for example `// a framed abacus portrait`).

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
- **After editing:** run `npm run refs:timeline`, then `npm run refs:index`, and `npm run refs:links` if you added links. Add a row to the right Part 2 table for any new topic.
- **If the video changes** (new shots, re-timed lyrics), run `npm run refs:shots` and `npm run refs:timeline`, then re-read the *On screen* notes against the new strips.
