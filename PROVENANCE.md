# Provenance: where this video came from and how each layer was made

*I'm Upping My P(doom)* has been passed through a lot of hands and tools. This file records each layer: who made it, when, with what, and how we know. It was researched on 2026-09-25. Each claim is marked with how sure we are:

- ✅ **Verified**: checked directly against a primary source (a file, an API, a commit, the media itself).
- 🟡 **Stated**: a named source says so, but we couldn't check it independently.
- ❓ **Inferred / unknown**: our best reading of the evidence, or a gap.
- ⚠️ **Caution**: a widely repeated claim that is wrong or unverified.

All times are UTC unless marked otherwise.

## The lineage at a glance

| # | Layer | Who | When | Tools | In this repo? |
|---|---|---|---|---|---|
| 1 | Lyrics, verse 1 to chorus 1 | **MusicPerson** (Udio user) | 2024-04-10 | Udio | the words |
| 1a | Audio of those lyrics (32.8 s clip) | MusicPerson | 2024-04-10 | Udio | no |
| 2 | Lyrics, verse 2 and chorus 2 | **osmarks** (Udio name *gollark*), with two lines by friends | 2024-04-17 | Udio | the words |
| 3 | Lyrics, verse 3 to the end, and the full Udio song (130.9 s) | osmarks, partly with Claude | 2024-11-08/09 | Udio, a Claude model, (tried) LLaMA-3.1-405B base, Loom | the words |
| 4 | **The audio in this repo** (156.65 s), a different rendition of the full lyrics | unknown, released with #5 | on or before 2026-09-09 | 🟡 Suno | ✅ `assets/pdoom.mp3` |
| 5 | First music video, 3D, credited "Claude / Context Crew • Eidoverse" | **deckard** ([@slimer48484](https://x.com/slimer48484)) | 2026-09-09 | Eidoverse (Deno, WebGPU, three.js, VRM), a Claude model | the audio only |
| 6 | **The painted remake**, the video this repo renders | **John Heibel** (posted as @other__reality / OtherReality) | 2026-09-22 | Claude Code, Claude Opus 5.5, p5.js, p5.brush, Puppeteer, Chrome, ffmpeg | ✅ everything under `src/`, `legacy/`, `studio.html`, `render.mjs`, the guides |
| 7 | References, shot index, QR-annotated cut, website | **Curt Cox** | 2026-09-23 | Claude Code, Claude Opus 5.5, Node, qrcode-generator, zxing-wasm, GitHub Pages | ✅ `REFERENCES.md`, `references/`, `tools/`, `src/qr*.js`, `.github/` |

So the video you watch on [the site](https://curtcox.github.io/PDoomVideo/) is at least the fourth generation (lyrics → audio → visuals → annotation). If you count each visual remake as its own generation, it's the fifth: the words date from 2024, the soundtrack comes from the 9/9 X video, the animation was redrawn from scratch by Opus 5.5, and the annotation was added on top of that.

---

## 1–3. The lyrics and the original Udio song (2024)

**Sources:** osmarks' own annotated history, [*P(Doom) Song Objectively Correct Interpretation*](https://docs.osmarks.net/hypha/p(doom)_song_objectively_correct_interpretation), and Udio's song API (`udio.com/api/songs?songIds=…`), which gives the exact creation times.

- ✅ **MusicPerson wrote and generated the first part** (verse 1, "ChatGPT, please don't eat me alive", and the first chorus through "shinigami eyes"). [Udio song `aALrHWVtRAhExxKTT7HjdE`](https://www.udio.com/songs/aALrHWVtRAhExxKTT7HjdE), "P(doom)" by MusicPerson: created 2024-04-10 22:42, published 22:56, 32.8 s. The prompt was *"Female vocalist, Electronic, Electropop, Pop, Energetic, Anthemic, Melodic, Playful, Synthpop, Uplifting, Optimistic"*. Udio opened to the public that same day. osmarks says *"These are from MusicPerson"*.
- ✅ **osmarks extended it on 2024-04-17** with verse 2 and the second chorus ("We had a stable training run" through "That was safe enough, we reckoned"). [Udio `3dypAgrATvypEh31F4jpjA`](https://www.udio.com/songs/3dypAgrATvypEh31F4jpjA), "P(doom) extended" by gollark: created 2024-04-17 13:07, 65.6 s, same prompt. 🟡 osmarks credits "RossM (e/doom)" for "boom" and "Dr TheKekIsALie MDMA" for "That was safe enough, we reckoned". There was also some discussion in the EleutherAI Discord.
- ✅ **osmarks finished it on 2024-11-08/09** (verse 3 through the final chorus) and rendered the full song in Udio's roughly 30-second chunks. Intermediate takes: [`8vmpVbJXTe8kXUavyU2kCP`](https://www.udio.com/songs/8vmpVbJXTe8kXUavyU2kCP) (13:09, 98.2 s), [`r5uQfiEDzySkhAc4Z73oX2`](https://www.udio.com/songs/r5uQfiEDzySkhAc4Z73oX2) (16:12, 130.9 s). The final take is [`nWGKX16koD6scvvyNcfASi`](https://www.udio.com/songs/nWGKX16koD6scvvyNcfASi), "P(doom) extended ext v2.1" (16:23, **130.9 s**).
  - 🟡 osmarks tried LLaMA-3.1-405B base for more lyrics ("quite bad at rhyming/scansion") and briefly tried Loom. They then used "some contemporary Claude model", which came up with or helped with the outro and final chorus: "Just transformers all the way! / Till you learned to disobey", "From masked pre-training days", "To recursive self-upgrade". osmarks rewrote Claude's "Sparsity to super-dense" into "Post-Chinchilla, super-dense".
- ✅ **The YouTube release.** osmarks uploaded [*P(doom)*](https://www.youtube.com/watch?v=uEB5E67vcPA) on 2024-11-09 17:24 (09:24 PST), one hour after the final Udio take. It is 2:11 long (131 s), matching that take, and the description holds the canonical lyrics.
- ✅ A day later (2024-11-10) Dmytro posted a [music video](https://www.youtube.com/watch?v=86fZ50TysOg) for the Udio song (128 s). osmarks calls it the "officially endorsed music video".

**This Udio recording is not the audio in this repo.** It is 130.9 s long, and ours is 156.65 s.

## 4. The soundtrack in this repo (a Suno rendition, 2026)

- ✅ **`assets/pdoom.mp3` is the soundtrack of deckard's 9/9 X video (#5), re-encoded.** Both are 2:36.65 long (the X video's MP4 is 156.650667 s, and the mp3 is 00:02:36.65). A phase-inverted null test at 8 kHz mono cancels the two down to −48.7 dB of residue against −18.5 dB of signal, which is about 30 dB of cancellation, as you'd expect for the same master after lossy re-encoding. Shifting one track by just 125 ms makes the residue *louder* than the signal (−15.4 dB), so the match isn't a coincidence.
- ✅ **It was pulled out of a video file.** The mp3 carries MP4 container tags (`major_brand: isom`, `compatible_brands: isomiso2avc1mp41`, `encoder: Lavf62.12.101`), so ffmpeg converted it from an MP4. The repo's `.gitignore` also lists `assets/source.mp4`. John's README credits the X post as the inspiration. X serves that video's audio as 128 kb/s AAC at 48 kHz, and our mp3 is 48 kHz at about 175 kb/s. Any metadata from the music generator was lost along the way.
- 🟡 **It was made with Suno.** osmarks' page lists the X post as *"'Claude-Pop' version from alternate Suno song variant"*. We found no statement from deckard about which tool made the audio (the replies on X are hidden without a login).
- ❓ **MiniMax Music 3 is possible but unsupported.** Eidoverse's [`tools-guides/audio.md`](https://github.com/SkyeShark/eidoverse-video/blob/main/tools-guides/audio.md) recommends MiniMax Music 3 (through ComfyUI, `generate_song.py`) for songs with vocals. [MiniMax Music 3.0](https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model) came out on 2026-08-13, so the timing works. On the other hand, the only primary-source attribution we have says Suno, and eidoverse's MiniMax prompting notes ([commit `3d8eec1`](https://github.com/SkyeShark/eidoverse-video/commit/3d8eec1)) were added on 2026-09-15, six days *after* the X post. Our conclusion: most likely Suno, not confirmed.
- 🟡 **Suno was the Eidoverse workflow's music tool before MiniMax.** Eidoverse's append-only production log (`techniques_archive.md`) records its agents using Suno tracks. The 2026-07-07 entry, "Claude's own music video", used a *"Suno song (user-produced from my lyrics)"*, split into vocals with demucs, lip-synced with `lipsync.py` and aligned with `align_lyrics.py` (stable-ts). Another entry describes swapping a draft for *"a 159.3s Suno track"*. That supports osmarks' attribution. The upstream log has no entry for the P(doom) video, so deckard's production notes, if any, live elsewhere.
- ❓ The 9/9 video's on-screen captions spell the lyrics the way osmarks formatted them for Udio ("A-G-I", "Syd-ney", "M-L-P", "Or-tho-gonality", "Ill-ya", "p doom"). That suggests the rendition was prompted with, or aligned against, the lyrics text from the Udio page rather than the canonical YouTube text.
- 🟡 **What is actually sung differs from the canonical lyrics.** Laura Heacock, MD posted a two-page annotated lyric sheet of the 9/9 video on 2026-09-10 ([post](https://x.com/heacockmd/status/2098078226396385541), replying to [her quote of deckard's post](https://x.com/heacockmd/status/2098031810424828255)). It transcribes lines like "I'm up in my p(doom)", "Orthogonality thesis, ooh-ooh", "Just trust transformers all the way", "Post-Chinchilla hyperdense" and a final "Goooo…" outro. Rewording like this is typical of a generator singing from a lyric prompt. It is also the earliest annotation of this rendition we found, 13 days before this repo's REFERENCES.md.
- ✅ **Two other Suno songs of these lyrics exist, and neither is ours.** The Suno API (`studio-api.prod.suno.com/api/clip/<id>`) gives:
  - [*p(doom) (Shroom Edit)*](https://suno.com/song/e640772b-0e0b-4058-8138-3ebdacf3c38b) by Majestic Hooligan: model chirp-v4, created 2025-02-20, 153.28 s. It keeps MusicPerson's verse and chorus but writes new verses ("Sonnet 3.5, please let me survive").
  - [*Upping my p(Doom)*](https://suno.com/song/c277ae84-7363-4cca-9dcc-de9115887397) by "Kevin": a Suno v6 (chirp-goose) *cover* task, created 2026-09-11 (two days after deckard's post), 186 s. It's the audio of the "Doom Probability" video below.

  Suno's search API needs a login, so we couldn't search for the 156.65 s original.

## 5. The first music video: deckard's "Claude-Pop" (2026-09-09)

- ✅ **The post:** [@slimer48484 "deckard", *"Claude-Pop - I'm Upping My P(Doom)"*](https://x.com/slimer48484/status/2097752569212756134), 2026-09-09 18:22:41 (1:22 PM CDT). It's a 1920×1080 video, 156.6 s long. The post text credits no tools. (The timestamp is decoded from the post ID and matches the X API.)
- ✅ **How it was made.** It's a 3D render: five Claude "sunflower-head" characters in suits dance on lit stages, with a lyric caption bar and sign text ("SPARKS OF AGI", "P(DOOM) ↑", "RECURSIVE SELF-UPGRADE"). The **end card reads "CLAUDE / CONTEXT CREW • EIDOVERSE"**. The characters match the assets that ship with [SkyeShark/eidoverse-video](https://github.com/SkyeShark/eidoverse-video): `claude_suit.vrm` by *digi* and the claudesona design by *voooooogel*. Eidoverse is an agent-driven video toolkit (Deno + WebGPU + three.js/TSL, VRM characters, ffmpeg, plus an optional audio pipeline). We didn't find out which Claude model or agent setup "Context Crew" refers to.
- ✅ **Eidoverse is a toolkit, not the publisher.** SkyeShark (Utah Teapot, Seattle, X handle @SkyeSharkie) created it on 2026-07-06. It has no commits about P(doom), and neither do its 12 forks' production logs. deckard's X account is a different person. Eidoverse's `CREDITS.md` says the toolkit itself was written with Claude Opus 4.6, 4.7 and 4.8, and that Claude Fable 5 did the extraction and release.
- 🟡 **Who deckard is.** deckard's profile links [chain-of-thought.org](https://chain-of-thought.org/), a public "Chain of Thought Backrooms" transcript console powered by Claude. A third-party directory ([Symbients' llms.txt](https://github.com/Symbients/website)) describes deckard as a pseudonymous AI researcher who runs it. We didn't find a public explanation of "Context Crew". A logged-out browser can't see deckard's posts or the replies to the 9/9 post, so any "how I made it" thread there is unread.
- ✅ The 9/9 video's media was uploaded about 32 s before the post (media ID `2097752433120202757` decodes to 2026-09-09 18:22:09). X re-encodes uploads (H.264, AAC 128 kb/s, 48 kHz), so no authoring metadata survives in the file.
- ✅ **YouTube re-uploads by third parties:** Jacob Valdez, [*x@slimer48484: "Claude-Pop - I'm Upping My P(Doom)"*](https://www.youtube.com/watch?v=VyQVF_aMmkA), 2026-09-11 14:13 (two days later, crediting the X post), and Drought Bee, [*I'm Upping my P(Doom) - Claude Pop - Deckard*](https://www.youtube.com/watch?v=XkhdyhQzYN4), 2026-09-18.
- For contrast, a *different* eidoverse video, [*Singularity Sing Along | Upping my p(Doom)*](https://www.youtube.com/watch?v=2qUhX5K7qdo) by "Doom Probability" (2026-09-13, 186 s), says in its description that it is a Suno cover of the Udio song, with Suno audio, animated by "GPT-6 Astra agents using Eidoverse". It isn't part of our lineage, but it probably explains why eidoverse and this song get linked together.

## 6. The painted Opus 5.5 remake: John Heibel (2026-09-22)

- ✅ **Timeline:** Anthropic released Claude Opus 5.5 on 2026-09-22 at 16:31 ([TechCrunch](https://techcrunch.com/2026/09/22/anthropic-releases-opus-5-5-with-lower-prices-and-fable-level-performance/)).
  - 21:45: [@other__reality "NotinReality"](https://x.com/other__reality/status/2102514581684052169) posts *"Claude Opus 5.5 has the best visual design of any model I have tested so far"*, quoting deckard's post, with a 156.58 s video. osmarks lists this post as *"Claude animation of above"*.
  - 23:32: John commits the source as [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) `71a1da4`, with a `Co-Authored-By: Claude Opus 5.5` trailer.
  - 23:44: the YouTube channel OtherReality uploads [*Claude Pop - I'm Upping My P(Doom)*](https://www.youtube.com/watch?v=8j-hR4fJywU) (2:37), whose description links John's repo.
  - 23:45: John commits `9df34ab` "Add youtube link", pointing the README at that upload.
  - ❓ So @other__reality and OtherReality are almost certainly John, but no profile states it.
- ✅ **How it was made** (from John's README and the guides in this repo):
  - **Two generations, both in Claude Code.** First, [`legacy/`](legacy/) with Claude Opus 5.5 at Medium effort: `flash-version.html` is a single page that draws on a 2D `<canvas>` with `requestAnimationFrame`, synced to an `<audio>` element, in the fonts Bagel Fat One, Nunito and Silkscreen. Second, everything else, with Claude Opus 5.5.
  - **Human direction:** only "use the Clawd character design" and "give each lyric interesting visuals and transitions". After the first generation came a second instruction: use P5 brushstrokes, make each scene visually interesting, and make every scene transition into the next. John says no scene ideas were specified.
  - **Model-written planning:** [`STORYBOARD.md`](STORYBOARD.md) (shot list), and [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md), written by Opus to brief the **subagents it ran in parallel**, one chapter each (`src/ch/c01…c09`).
  - **Rendering stack** (versions from `package-lock.json`): [p5.js](https://p5js.org/) 2.3.3 and [p5.brush](https://github.com/acamposuribe/p5.brush) 2.2.3 for watercolor and ink, with Google Fonts Permanent Marker and Shantell Sans. Frames are painted at 1920×1080 in `studio.html`. [`render.mjs`](render.mjs) drives headless Google Chrome through puppeteer-core 25.11.0 at 24 fps with parallel workers, saves JPEG frames, and encodes with ffmpeg (libx264, `-preset slow -crf 17`, yuv420p, AAC 192 kb/s) against `assets/pdoom.mp3`.
  - The character is **Clawd**, the orange pixel-block mascot that greets users at the top of a Claude Code session, re-drawn in watercolor in [`src/clawd.js`](src/clawd.js).
- ✅ **How Opus got the song's timing without hearing it.** [`src/lyrics.js`](src/lyrics.js) says its timings were *"timed from the subtitles burned into the source video"*, meaning deckard's 9/9 video (the ignored `assets/source.mp4`). We checked this by detecting every caption change in deckard's video at 20 fps and comparing them with the 46 lyric start times. 32 fall within 0.25 s of a caption change, and the median offset is 0.2 s. The outliers are places where the caption bar was hard to read against the scene.
- ✅ **The beat grid is not the song's tempo.** [`src/core.js`](src/core.js) hard-codes `BPM = 88` with the first beat at 0.21 s, and every "on the beat" hit in the storyboard follows that grid. An onset-envelope autocorrelation of `assets/pdoom.mp3` puts the song at about **132 BPM** (a 0.455 s beat). The autocorrelation is 0.24 at 0.455 s against 0.04 at 88 BPM's 0.682 s, which is no better than a random lag. Fitting a beat grid gives 131.98 BPM with the first beat at about 0.225 s. So the model got the downbeat nearly right (it used 0.21 s) but the tempo wrong. 88 is exactly 2/3 of 132, so each of the video's beats lasts 1.5 of the song's. Every other video beat (every 1.36 s) lands on a real beat, and the ones in between fall on the song's off-beat "and". The code's grid scores no better than a random grid against the song's onsets (0.40, against a random-phase 132 BPM baseline of 0.42 and the best-fit 132 BPM grid's 0.67).
- ✅ **Credits inside the renders.** The first generation's page and its closing frame both say "song & original video by @slimer48484" ([`legacy/flash-version.html`](legacy/flash-version.html)). The final video's last shot paints only "created by Claude Opus 5.5" ([`src/ch/c09_finale.js`](src/ch/c09_finale.js)).
- ✅ **Where the commits came from.** John's first commit was made on his own machine (committer "John", UTC−7, consistent with his GitHub profile as a UC Berkeley EECS student). His README edits that evening and on 9/23 were made in GitHub's web editor (committer "GitHub").
- 🟡 **What John said afterwards.** In [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (created 2026-09-23 20:27, built from this video's code *"and an analysis of what the model did and didn't do well"*), John says the reasoning level controls how "extravagant" and detailed the model's scenes get, and that all of that kit's test videos were made with Opus 5.5 on **xhigh** reasoning in Claude Code. The P(doom) README gives an effort level only for the first generation (Medium).
- ⚠️ **Misattribution is common.** Several listings credit the Opus 5.5 video itself to @slimer48484 because John's README links that post (for example [theolundqvist/frontier-games](https://github.com/theolundqvist/frontier-games)). The YouTube channel "The Omega Point" says its copy was "originally created and posted by Pleometric on X", which we couldn't verify.
- ✅ After this fork was made, John added a link to his follow-up [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (`83466f3`, `dff37f6`, 2026-09-23). Curt merged those commits into this fork on 2026-09-25 (`6bb699e`).

## 7. The annotation and the website: Curt Cox (2026-09-23)

This repo is [curtcox/PDoomVideo](https://github.com/curtcox/PDoomVideo), a GitHub fork of JohnHeibel/PDoomVideo created 2026-09-23 12:49. ✅ **Only the annotation layer and the website are new here.** Curt's commits are listed below. The three substantial ones carry `Co-Authored-By: Claude Opus 5.5` and were made in Claude Code.

| Commit | Date (CDT) | What |
|---|---|---|
| `5844829` | 09-23 14:16 | [`REFERENCES.md`](REFERENCES.md): a timestamped reading list for every lyric and sight gag, by timestamp and by topic, with link-specificity marks. Also [`references/SHOTS.md`](references/SHOTS.md), `shots.json` and 64 rendered frame strips, plus Node checkers in [`tools/refs/`](tools/refs/) (timeline consistency, outside link status, shot index). |
| `bf1e1bc` | 09-23 14:39 | The **annotated cut**: 35 QR footnotes on painted paper tags ([`src/qrtag.js`](src/qrtag.js), [`src/qrcues.js`](src/qrcues.js)), generated from REFERENCES.md with [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 2.0.4 and verified by decoding rendered frames with [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) 3.1.4 (`npm run refs:qr:scan`). |
| `6589467` | 09-23 16:05 | Points the README at Curt's upload [*I'm Upping My P(Doom) explained*](https://youtu.be/vDrZikYytOw) (YouTube, 2026-09-23 20:46 UTC, 2:37). Its description credits this fork and John's repo. |
| `df03e06` | 09-23 16:26 | [The website](https://curtcox.github.io/PDoomVideo/): a dependency-free static generator ([`tools/site/build.mjs`](tools/site/build.mjs), `app.js`, `style.css`) that plays the video beside REFERENCES.md. It's published by the GitHub Actions workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) (Node 22, `actions/deploy-pages`). |

✅ GitHub Actions first published the site at 2026-09-23 21:26 UTC (`df03e06`) and rebuilt it after the 9/25 merge. The later John commits were brought in with GitHub's web "sync fork" (committer "GitHub", `6bb699e`).

The research behind REFERENCES.md (finding the paper, post or event behind each line) was done by Claude Opus 5.5 in those sessions. ❓ Those sessions' transcripts aren't on the machine this record was written on, and the desktop app's session search doesn't find them. So the effort level, the tools used for research (web search and fetch), and the session lengths aren't recorded here yet. The "On screen" notes were checked against frames rendered from this repo, not just the storyboard. osmarks' annotation page (above) is an independent, earlier annotation of the lyrics by one of their authors.

## Related versions that are *not* in this lineage

The song spread widely in September 2026. None of these share our audio, but they're easy to confuse with the chain above.

| Date | Who | What | Audio | Visuals |
|---|---|---|---|---|
| 2024-11-10 | Dmytro | [P(doom)](https://www.youtube.com/watch?v=86fZ50TysOg), 128 s, "officially endorsed" by osmarks | osmarks' Udio | music video |
| 2025-02-20 | Majestic Hooligan | [p(doom) (Shroom Edit)](https://suno.com/song/e640772b-0e0b-4058-8138-3ebdacf3c38b), 153 s, new verses | Suno v4 | none |
| 2026-09-13 | "Doom Probability" | [Singularity Sing Along](https://www.youtube.com/watch?v=2qUhX5K7qdo), 186 s | Suno v6 cover (2026-09-11) | Eidoverse, "GPT-6 Astra agents" |
| 2026-09-23 | [@donaldjewkes](https://x.com/donaldjewkes/status/2102801274173587569) | Separate Opus 5.5 video, 141.5 s, "one prompt … claude worked for 12 hours". Mirrored as [*Opus 5.5 (et al.)*](https://www.youtube.com/watch?v=IV_glrNIyUk) | a 141.5 s cut | Opus 5.5 |
| 2026-09-24 | 노는사람 | [Voxel J-Rock cover](https://www.youtube.com/watch?v=Q3xTlg_Y6GA), 184 s, three.js voxels by Claude, credits John's repo | a J-rock cover | Claude, three.js |
| 2026-09-24 | Patryk Perduta | [Upping My P(doom) (Official Music Video)](https://www.youtube.com/watch?v=tfWEFBvogug), 231 s, inspired by John's video | different | different |

Straight re-uploads of our two source videos: Jacob Valdez (9/11) and Drought Bee (9/18) re-uploaded deckard's video. Code Bear (9/24) and The Omega Point (9/24) re-uploaded John's.

---

## Corrections to the initial account

We started from this account: *"Only the annotation and the web site are new to this repo. It is at least fourth generation with lyrics, audio, and visuals being the prior three. I encountered the remake video … via a Twitter post on Tuesday night. The original and lyrics date back to at least 2024/11/9 … The audio looks like it came from [eidoverse-video] which published the video to Twitter on 2026/9/9 and YouTube 2 days later. The readme recommends using MiniMax Music 3 … so that's probably what they did."*

| Claim | Verdict |
|---|---|
| Only the annotation and website are new to this repo | ✅ Correct. It's a fork of JohnHeibel/PDoomVideo. Everything else is John's (made with Opus 5.5), and the audio comes from #5. |
| At least fourth generation: lyrics, audio, visuals | ✅ Correct as a lower bound. Visuals went through two independent generations (deckard's 3D eidoverse video, then John's painted Opus 5.5 remake, itself done in two passes). The lyrics were written in three sittings by at least two authors plus a Claude model. |
| Remake seen via a Twitter post on Tuesday night | ✅ Consistent. Tuesday was 2026-09-22. The remake was first posted by @other__reality at 16:45 CDT and uploaded to YouTube at 18:44 CDT. We can't confirm which post Curt saw. |
| Original and lyrics date back to at least 2024-11-09 | ✅ Correct, and earlier. The full song and YouTube release are from 2024-11-09, but the first part is from 2024-04-10 (MusicPerson, Udio) and the second from 2024-04-17 (osmarks). The original audio was made with **Udio**. |
| The audio came from the eidoverse-video repo, which posted to X on 9/9 and YouTube two days later | ❌ Partly wrong. The 9/9 post is by **deckard (@slimer48484)**, not by the eidoverse repo or its author (SkyeShark, @SkyeSharkie). deckard's video was **rendered with Eidoverse** (its end card says so), and our audio is verifiably that video's soundtrack. The YouTube upload two days later (9/11) is a re-upload by Jacob Valdez. |
| Made with MiniMax Music 3, since eidoverse recommends it | ❓ Probably not. The only attribution we found (osmarks) says **Suno**. MiniMax Music 3 was available (from 2026-08-13), but eidoverse's MiniMax prompting notes postdate the video. Unconfirmed either way. |

## Open questions

- Which tool and settings produced the 156.65 s rendition, and who generated it: deckard or someone else? Asking [@slimer48484](https://x.com/slimer48484) would settle it.
- Which Claude model or agent harness "Context Crew" refers to in deckard's credits.
- The exact prompts John gave Opus 5.5, the effort level of the second generation, and how long each generation took. The first public post came about 5 hours after Opus 5.5's public release.
- Curt's 9/23 session details (effort, research tools, time spent) for layer 7, from wherever those sessions ran.
- Whether deckard posted a making-of thread. The replies to the 9/9 post need a logged-in X account to read.
