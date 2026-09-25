# Provenance: where this video came from and how each layer was made

*I'm Upping My P(doom)* has been passed through a lot of hands and tools. This file records each layer: who made it, when, with what, and how we know. It was researched on 2026-09-25. X posts were read (read-only) through a logged-in browser and then checked against X's public post API. Each claim is marked with how sure we are:

- ✅ **Verified**: checked directly against a primary source (a file, an API, a commit, the media itself).
- 🟡 **Stated**: a named source says so, but we couldn't check it independently.
- ❓ **Inferred / unknown**: our best reading of the evidence, or a gap.
- ⚠️ **Caution**: a widely repeated claim that is wrong or unverified.

All times are UTC unless marked otherwise.

## Short answers

**Where did this come from?** This repo is Curt Cox's fork of [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo).
- **The words:** written in 2024 by the Udio user MusicPerson and by osmarks, with a few lines from friends and from Claude. The first recording was made in Udio.
- **The soundtrack** (`assets/pdoom.mp3`): a later AI rendition of those lyrics, made with **Suno V6** on the day V6 launched, according to deckard (@slimer48484), who also says he didn't make it. It was lifted from deckard's 3D music video, posted on X on 2026-09-09. Claude made that video with the Eidoverse toolkit.
- **The painted video:** John Heibel had Claude Opus 5.5 make it from scratch in Claude Code, released 2026-09-22.
- **This fork's additions:** Curt added the reference list, the QR-footnoted cut and the website on 2026-09-23, also with Opus 5.5.

**How was it made?**
- **Visuals:** code, not generated pixels. Opus 5.5 wrote a storyboard and a style guide, then ran parallel subagents that each wrote one chapter as p5.js + p5.brush drawing code. Headless Chrome paints each frame, and ffmpeg joins the frames with the song.
- **Timing:** the lyric timings were read off the captions in deckard's video.
- **Human input:** John pasted in the lyrics and the audio file and asked for a cutesy animation. After a quick first pass, he set reasoning to **xhigh** and asked for p5 brushstrokes, more interesting scenes, minimal text, constant action and coherent transitions. Opus ran **7 parallel subagents** and finished in about **45 minutes**, not counting rendering. John says he *"had no hand in the script or storyboard"* and supplied no art.

Details and evidence are in sections [6](#6-the-painted-opus-55-remake-john-heibel-2026-09-22) and [7](#7-the-annotation-and-the-website-curt-cox-2026-09-23).

**How could I do something like it?** See [`MAKE_YOUR_OWN.md`](MAKE_YOUR_OWN.md).

## The lineage at a glance

| # | Layer | Who | When | Tools | In this repo? |
|---|---|---|---|---|---|
| 1 | Lyrics, verse 1 to chorus 1 | **MusicPerson** (Udio user) | 2024-04-10 | Udio | the words |
| 1a | Audio of those lyrics (32.8 s clip) | MusicPerson | 2024-04-10 | Udio | no |
| 2 | Lyrics, verse 2 and chorus 2 | **osmarks** (Udio name *gollark*), with two lines by friends | 2024-04-17 | Udio | the words |
| 3 | Lyrics, verse 3 to the end, and the full Udio song (130.9 s) | osmarks, partly with Claude | 2024-11-08/09 | Udio, a Claude model, (tried) LLaMA-3.1-405B base, Loom | the words |
| 4 | **The audio in this repo** (156.65 s), a different rendition of the full lyrics | unknown (not deckard, by his account) | 2026-09-09, within hours of Suno V6's release | 🟡 Suno V6 | ✅ `assets/pdoom.mp3` |
| 5 | First music video, 3D, credited "Claude / Context Crew • Eidoverse" | **deckard** ([@slimer48484](https://x.com/slimer48484)) | 2026-09-09 | Eidoverse (Deno, WebGPU, three.js, VRM), Claude (model not stated) | the audio only |
| 6 | **The painted remake**, the video this repo renders | **John Heibel** (posted as @other__reality / OtherReality) | 2026-09-22 | Claude Code, Claude Opus 5.5 (Medium, then xhigh, 7 subagents), p5.js, p5.brush, Puppeteer, Chrome, ffmpeg | ✅ everything under `src/`, `legacy/`, `studio.html`, `render.mjs`, the guides |
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

## 4. The soundtrack in this repo (a Suno V6 rendition, 2026)

- ✅ **`assets/pdoom.mp3` is the soundtrack of deckard's 9/9 X video (#5), re-encoded.** Both are 2:36.65 long (the X video's MP4 is 156.650667 s, and the mp3 is 00:02:36.65). A phase-inverted null test at 8 kHz mono cancels the two down to −48.7 dB of residue against −18.5 dB of signal, which is about 30 dB of cancellation, as you'd expect for the same master after lossy re-encoding. Shifting one track by just 125 ms makes the residue *louder* than the signal (−15.4 dB), so the match isn't a coincidence.
- ✅ **It was pulled out of a video file.** The mp3 carries MP4 container tags (`major_brand: isom`, `compatible_brands: isomiso2avc1mp41`, `encoder: Lavf62.12.101`), so ffmpeg converted it from an MP4. The repo's `.gitignore` also lists `assets/source.mp4`. John's README credits the X post as the inspiration. X serves that video's audio as 128 kb/s AAC at 48 kHz, and our mp3 is 48 kHz at about 175 kb/s. Any metadata from the music generator was lost along the way.
- 🟡 **It was made with Suno V6. deckard says so, and says he didn't make it.** Two sources agree, but neither is the track's maker:
  - deckard, 2026-09-23 14:46, [answering](https://x.com/slimer48484/status/2102771604338200586) a question about how the music was made: *"I didn't make it, but it was done with the new suno. unsure if the original lyrics author wanted credited."*
  - deckard, 2026-09-24 14:49, [again](https://x.com/slimer48484/status/2103134792569274515): *"the Video is claude, the music is from Suno V6 and was written by humans+base model AI"*. The "base model" matches osmarks' account of trying LLaMA-3.1-405B base.
  - osmarks' page independently calls it an *"alternate Suno song variant"*.
- ✅ **It was made within hours of Suno V6's release.** Suno launched V6 (v6, v6-wild and v6-mini) on 2026-09-09. Its [announcement](https://about.suno.com/blog/introducing-v6) is timestamped 15:40 UTC, and press coverage appeared from 09:36 UTC. deckard posted at 18:22 UTC. So unless someone had early access, the song was generated, and the 3D video built and rendered around it, in the 3–9 hours after V6 went public. deckard's own words fit: *"the new suno"*. Full v6 was for paid plans only; v6-mini was free.
- ❓ **Who generated the Suno track is still unknown.** deckard never said where he got it. Two replies asking him (*"Where did you find them??"* and whether the lyrics were human-written) went unanswered, and no suno.com link appears anywhere in the threads. Suno's song search needs a login, and no public Suno page we could find matches the track.
- ❌ **Not MiniMax Music 3.** deckard names Suno V6, and a logged-in search for `from:slimer48484 minimax` returns nothing. The mix-up is understandable: Eidoverse's [`tools-guides/audio.md`](https://github.com/SkyeShark/eidoverse-video/blob/main/tools-guides/audio.md) recommends MiniMax Music 3 (through ComfyUI, `generate_song.py`) for songs with vocals. [MiniMax Music 3.0](https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model) came out on 2026-08-13, so the timing works. On the other hand, the only primary-source attribution we have says Suno, and eidoverse's MiniMax prompting notes ([commit `3d8eec1`](https://github.com/SkyeShark/eidoverse-video/commit/3d8eec1)) were added on 2026-09-15, six days *after* the X post.
- 🟡 **Suno was the Eidoverse workflow's music tool before MiniMax.** Eidoverse's append-only production log (`techniques_archive.md`) records its agents using Suno tracks. The 2026-07-07 entry, "Claude's own music video", used a *"Suno song (user-produced from my lyrics)"*, split into vocals with demucs, lip-synced with `lipsync.py` and aligned with `align_lyrics.py` (stable-ts). Another entry describes swapping a draft for *"a 159.3s Suno track"*. That supports osmarks' attribution. The upstream log has no entry for the P(doom) video, so deckard's production notes, if any, live elsewhere.
- ❓ The 9/9 video's on-screen captions spell the lyrics the way osmarks formatted them for Udio ("A-G-I", "Syd-ney", "M-L-P", "Or-tho-gonality", "Ill-ya", "p doom"). That suggests the rendition was prompted with, or aligned against, the lyrics text from the Udio page rather than the canonical YouTube text.
- 🟡 **What is actually sung differs from the canonical lyrics.** Laura Heacock, MD posted a two-page annotated lyric sheet of the 9/9 video on 2026-09-10 ([post](https://x.com/heacockmd/status/2098078226396385541), replying to [her quote of deckard's post](https://x.com/heacockmd/status/2098031810424828255)). It transcribes lines like "I'm up in my p(doom)", "Orthogonality thesis, ooh-ooh", "Just trust transformers all the way", "Post-Chinchilla hyperdense" and a final "Goooo…" outro. Rewording like this is typical of a generator singing from a lyric prompt. It is also the earliest annotation of this rendition we found, 13 days before this repo's REFERENCES.md.
- ✅ **Two other Suno songs of these lyrics exist, and neither is ours.** The Suno API (`studio-api.prod.suno.com/api/clip/<id>`) gives:
  - [*p(doom) (Shroom Edit)*](https://suno.com/song/e640772b-0e0b-4058-8138-3ebdacf3c38b) by Majestic Hooligan: model chirp-v4, created 2025-02-20, 153.28 s. It keeps MusicPerson's verse and chorus but writes new verses ("Sonnet 3.5, please let me survive").
  - [*Upping my p(Doom)*](https://suno.com/song/c277ae84-7363-4cca-9dcc-de9115887397) by "Kevin": a Suno v6 (chirp-goose) *cover* task, created 2026-09-11 (two days after deckard's post), 186 s. It's the audio of the "Doom Probability" video below.

  Suno's search API needs a login, so we couldn't search for the 156.65 s original.

## 5. The first music video: deckard's "Claude-Pop" (2026-09-09)

- ✅ **The post:** [@slimer48484 "deckard", *"Claude-Pop - I'm Upping My P(Doom)"*](https://x.com/slimer48484/status/2097752569212756134), 2026-09-09 18:22:41 (1:22 PM CDT). It's a 1920×1080 video, 156.6 s long. The post text credits no tools. (The timestamp is decoded from the post ID and matches the X API.)
- ✅ **What deckard said about it** (all his posts and replies from Sep 8 to 25 were read):
  - 18:23, a minute after posting, a [self-reply](https://x.com/slimer48484/status/2097752732153102810): *"lyrics plagiarised. credit upon request."* He never names osmarks or MusicPerson. Others note that he didn't give the source when asked.
  - 20:23, [on who made it](https://x.com/slimer48484/status/2097782969809224078): *"This is all Claude's idea and execution 😂"*
  - He never names a Claude model or agent setup, never says how long it took, and posted no making-of thread, prompts or repo. A process question from @VarunGodbole went unanswered.
  - In the same weeks he posted other Eidoverse videos (the "$COT Backrooms" series). One from 09-05 says *"Claude spent hours making this"*.
- ✅ **How it was made.** It's a 3D render: five Claude "sunflower-head" characters in suits dance on lit stages, with a lyric caption bar and sign text ("SPARKS OF AGI", "P(DOOM) ↑", "RECURSIVE SELF-UPGRADE"). The **end card reads "CLAUDE / CONTEXT CREW • EIDOVERSE"**. The characters match the assets that ship with [SkyeShark/eidoverse-video](https://github.com/SkyeShark/eidoverse-video): `claude_suit.vrm` by *digi* and the claudesona design by *voooooogel*. Eidoverse is an agent-driven video toolkit (Deno + WebGPU + three.js/TSL, VRM characters, ffmpeg, plus an optional audio pipeline). ✅ SkyeSharkie, Eidoverse's author, [confirmed on 09-10](https://x.com/SkyeSharkie/status/2098038144117637409): *"this is made with my repo, eidoverse-video, some of the assets shown in the video are actually my manual blender work"*. On 09-09 she [asked](https://x.com/SkyeSharkie/status/2097763430124097993) whether the models themselves had created the new dance animations and the characters' clothing. deckard didn't reply. ❓ "Context Crew" isn't explained anywhere. It isn't in logged-in X searches, in Eidoverse, in a search of deckard's chain-of-thought.org transcripts, or on the end card of his other Eidoverse video (*THE FIRST DREAMING*, 2026-09-05, 17 min). Our best reading: like "Claude-Pop" in the post title, "Claude / Context Crew" is an artist-style credit, possibly naming the five-character band on screen. That's an interpretation, not a finding.
- ✅ **Eidoverse is a toolkit, not the publisher.** SkyeShark (Utah Teapot, Seattle, X handle @SkyeSharkie) created it on 2026-07-06. It has no commits about P(doom), and neither do its 12 forks' production logs. deckard's X account is a different person. Eidoverse's `CREDITS.md` says the toolkit itself was written with Claude Opus 4.6, 4.7 and 4.8, and that Claude Fable 5 did the extraction and release.
- 🟡 **Who deckard is.** deckard's profile links [chain-of-thought.org](https://chain-of-thought.org/), a public "Chain of Thought Backrooms" transcript console powered by Claude. A third-party directory ([Symbients' llms.txt](https://github.com/Symbients/website)) describes deckard as a pseudonymous AI researcher who runs it. His profile also lists a $COT token contract address.
- ✅ The 9/9 video's media was uploaded about 32 s before the post (media ID `2097752433120202757` decodes to 2026-09-09 18:22:09). X re-encodes uploads (H.264, AAC 128 kb/s, 48 kHz), so no authoring metadata survives in the file.
- ✅ **YouTube re-uploads by third parties:** Jacob Valdez, [*x@slimer48484: "Claude-Pop - I'm Upping My P(Doom)"*](https://www.youtube.com/watch?v=VyQVF_aMmkA), 2026-09-11 14:13 (two days later, crediting the X post), and Drought Bee, [*I'm Upping my P(Doom) - Claude Pop - Deckard*](https://www.youtube.com/watch?v=XkhdyhQzYN4), 2026-09-18.
- For contrast, a *different* eidoverse video, [*Singularity Sing Along | Upping my p(Doom)*](https://www.youtube.com/watch?v=2qUhX5K7qdo) by "Doom Probability" (2026-09-13, 186 s), says in its description that it is a Suno cover of the Udio song, with Suno audio, animated by "GPT-6 Astra agents using Eidoverse". It isn't part of our lineage, but it probably explains why eidoverse and this song get linked together.

## 6. The painted Opus 5.5 remake: John Heibel (2026-09-22)

- ✅ **Timeline:** Anthropic released Claude Opus 5.5 on 2026-09-22 at 16:31 ([TechCrunch](https://techcrunch.com/2026/09/22/anthropic-releases-opus-5-5-with-lower-prices-and-fable-level-performance/)).
  - 21:45: [@other__reality "NotinReality"](https://x.com/other__reality/status/2102514581684052169) posts *"Claude Opus 5.5 has the best visual design of any model I have tested so far"*, quoting deckard's post, with a 156.58 s video. osmarks lists this post as *"Claude animation of above"*.
  - 23:32: John commits the source as [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) `71a1da4`, with a `Co-Authored-By: Claude Opus 5.5` trailer.
  - 23:44: the YouTube channel OtherReality uploads [*Claude Pop - I'm Upping My P(Doom)*](https://www.youtube.com/watch?v=8j-hR4fJywU) (2:37), whose description links John's repo.
  - 23:45: John commits `9df34ab` "Add youtube link", pointing the README at that upload.
  - ✅ @other__reality is John: that account posted ["Source for those who were asking"](https://x.com/other__reality/status/2102542305433711037) with the JohnHeibel/PDoomVideo link at 23:35. On 9/23 it announced ClaudeAnimationBase as "a new open-source repo" of its own, and a third party ([@pranesh](https://x.com/pranesh/status/2102934469309297120)) calls the account "NotinReality (John Heibel)". No profile says so outright.
- ✅ **In John's own words** (replies under his 9/22 post):
  - 22:18, [how](https://x.com/other__reality/status/2102522958216606162): *"Simply pasted the lyrics and the audio file and told it to make a cutesy animation. It returned pretty quickly with a basic animation. Bumped up reasoning to xhigh and told it to use p5 brushstrokes and more interesting scenes, and 45 minutes later I got this."*
  - 22:29, [the agent setup](https://x.com/other__reality/status/2102525673541869969): *"The main thread spun up 7 Opus 5.5 subagents and wrote the js for each scene in parallel, which finished pretty quickly. The longest part was actually rendering the p5 watercolor effect."*
  - 23:51, [the direction given](https://x.com/other__reality/status/2102546323862155683): be cutesy, use p5 brushstrokes, make each scene visually interesting, and use Clawd. *"basically everything outside of those basic instructions was Opus."*
  - 9/24 14:28, [the second prompt](https://x.com/other__reality/status/2103129451697778831): *"use minimal text, ensure there is always some action in the scene, and have coherent transitions between scenes. I had no hand in the script or storyboard."*
  - 9/24 14:36, [assets](https://x.com/other__reality/status/2103131458781208781): he gave it none. *"Opus just knew what clawd was, or as I poorly described 'the cute little orange blocky claude mascot.'"* It made Clawd and every other character from that and the lyrics.
  - 9/23 00:05, [cost](https://x.com/other__reality/status/2102549980259164576): *"About 50% of my 5 hour but only about 10% of my weekly on my Max 5x plan"*. That's a Claude Max subscription, not metered API use.
  - ❓ He said nothing about early access, though his post came about 5 hours after Opus 5.5's public release. His account fits: a quick first pass, 45 minutes of generation, then rendering.
  - ❓ He says he gave it "the audio file", but `src/lyrics.js` was timed from subtitles burned into the video, and `.gitignore` lists `assets/source.mp4`. So the file Opus received was most likely deckard's MP4.
- ✅ **How it was made** (from John's README and the guides in this repo):
  - **Two generations, both in Claude Code.** First, [`legacy/`](legacy/) with Claude Opus 5.5 at Medium effort: `flash-version.html` is a single page that draws on a 2D `<canvas>` with `requestAnimationFrame`, synced to an `<audio>` element, in the fonts Bagel Fat One, Nunito and Silkscreen. Second, everything else, with Claude Opus 5.5 at **xhigh** effort (per John's post) and 7 parallel subagents.
  - **Human direction:** only "use the Clawd character design" and "give each lyric interesting visuals and transitions". After the first generation came a second instruction: use P5 brushstrokes, make each scene visually interesting, and make every scene transition into the next. John says no scene ideas were specified.
  - **Model-written planning:** [`STORYBOARD.md`](STORYBOARD.md) (shot list), and [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md), written by Opus to brief the **subagents it ran in parallel**, one chapter each (`src/ch/c01…c09`).
  - **Rendering stack** (versions from `package-lock.json`): [p5.js](https://p5js.org/) 2.3.3 and [p5.brush](https://github.com/acamposuribe/p5.brush) 2.2.3 for watercolor and ink, with Google Fonts Permanent Marker and Shantell Sans. Frames are painted at 1920×1080 in `studio.html`. [`render.mjs`](render.mjs) drives headless Google Chrome through puppeteer-core 25.11.0 at 24 fps with parallel workers, saves JPEG frames, and encodes with ffmpeg (libx264, `-preset slow -crf 17`, yuv420p, AAC 192 kb/s) against `assets/pdoom.mp3`.
  - The character is **Clawd**, the orange pixel-block mascot that greets users at the top of a Claude Code session, re-drawn in watercolor in [`src/clawd.js`](src/clawd.js).
- ✅ **This repo renders the published video.** We rendered stills at 28 s, 81.5 s and 140 s from this repo's source and compared them with the same moments of John's X upload (1280×720, 24 fps, 156.63 s). SSIM is 0.94–0.95 after X's re-encoding, against 0.60 for a mismatched pair. The frames are visibly identical down to the P(doom) meter's percentage. His upload's audio also nulls against `assets/pdoom.mp3` once its 43 ms encoder delay is removed.
- ✅ **How Opus got the song's timing without hearing it.** [`src/lyrics.js`](src/lyrics.js) says its timings were *"timed from the subtitles burned into the source video"*, meaning deckard's 9/9 video (the ignored `assets/source.mp4`). We checked this by detecting every caption change in deckard's video at 20 fps and comparing them with the 46 lyric start times. 32 fall within 0.25 s of a caption change, and the median offset is 0.2 s. The outliers are places where the caption bar was hard to read against the scene.
- ✅ **The beat grid is not the song's tempo.** [`src/core.js`](src/core.js) hard-codes `BPM = 88` with the first beat at 0.21 s, and every "on the beat" hit in the storyboard follows that grid. An onset-envelope autocorrelation of `assets/pdoom.mp3` puts the song at about **132 BPM** (a 0.455 s beat). The autocorrelation is 0.24 at 0.455 s against 0.04 at 88 BPM's 0.682 s, which is no better than a random lag. Fitting a beat grid gives 131.98 BPM with the first beat at about 0.225 s. So the model got the downbeat nearly right (it used 0.21 s) but the tempo wrong. 88 is exactly 2/3 of 132, so each of the video's beats lasts 1.5 of the song's. Every other video beat (every 1.36 s) lands on a real beat, and the ones in between fall on the song's off-beat "and". The code's grid scores no better than a random grid against the song's onsets (0.40, against a random-phase 132 BPM baseline of 0.42 and the best-fit 132 BPM grid's 0.67).
- ✅ **Credits inside the renders.** The first generation's page and its closing frame both say "song & original video by @slimer48484" ([`legacy/flash-version.html`](legacy/flash-version.html)). The final video's last shot paints only "created by Claude Opus 5.5" ([`src/ch/c09_finale.js`](src/ch/c09_finale.js)).
- ✅ **Where the commits came from.** John's first commit was made on his own machine (committer "John", UTC−7, consistent with his GitHub profile as a UC Berkeley EECS student). His README edits that evening and on 9/23 were made in GitHub's web editor (committer "GitHub").
- 🟡 **What John said afterwards.** In [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (created 2026-09-23 20:27, built from this video's code *"and an analysis of what the model did and didn't do well"*), John says the reasoning level controls how "extravagant" and detailed the model's scenes get, and that all of that kit's test videos were made with Opus 5.5 on **xhigh** reasoning in Claude Code. His posts confirm the P(doom) video's second generation also ran at xhigh.
- 🟡 **Doubts and disputes.** deckard said he was [*"a teeny bit skeptical that this replicates without a lot of prompting"*](https://x.com/slimer48484/status/2102865894976418201) (9/23), and repeated it on 9/24. The model-written `STORYBOARD.md` and `ANIMATION_GUIDE.md`, the `legacy/` first pass, and the replication starter kit are the best public evidence either way. A *proposed* Community Note got the lineage backwards. It was attached to deckard's post and showed under John's quote of it ([screenshot via @repligate](https://x.com/repligate/status/2102858433859060203)). John [says](https://x.com/other__reality/status/2102873136735965601) it accused deckard of taking the lyrics from John's own later video, while ignoring the 2024 original that John's README cites.
- ⚠️ **Misattribution is common.** Several listings credit the Opus 5.5 video itself to @slimer48484 because John's README links that post (for example [theolundqvist/frontier-games](https://github.com/theolundqvist/frontier-games)). The YouTube channel "The Omega Point" says its copy was "originally created and posted by Pleometric on X", which we couldn't verify.
- ✅ After this fork was made, John added a link to his follow-up [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (`83466f3`, `dff37f6`, 2026-09-23). Curt merged those commits into this fork on 2026-09-25 (`6bb699e`).

## 7. The annotation and the website: Curt Cox (2026-09-23)

This repo is [curtcox/PDoomVideo](https://github.com/curtcox/PDoomVideo), a GitHub fork of JohnHeibel/PDoomVideo created 2026-09-23 12:49. ✅ **Only the annotation layer and the website are new here.** Curt's commits are listed below. The three substantial ones carry `Co-Authored-By: Claude Opus 5.5` and were made in Claude Code.

| Commit | Date (CDT) | What |
|---|---|---|
| `5844829` | 09-23 14:16 | [`REFERENCES.md`](REFERENCES.md): a timestamped reading list for every lyric and sight gag, by timestamp and by topic, with link-specificity marks. Also [`references/SHOTS.md`](references/SHOTS.md), `shots.json` and 64 rendered frame strips, plus Node checkers in [`tools/refs/`](tools/refs/) (timeline consistency, outside link status, shot index). |
| `bf1e1bc` | 09-23 14:39 | The **annotated cut**: 35 QR footnotes on painted paper tags ([`src/qrtag.js`](src/qrtag.js), [`src/qrcues.js`](src/qrcues.js)), generated from REFERENCES.md with [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 2.0.4 and verified by decoding rendered frames with [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) 3.1.4 (`npm run refs:qr:scan`). |
| `6589467` | 09-23 16:05 | Points the README at Curt's upload [*I'm Upping My P(Doom) explained*](https://youtu.be/vDrZikYytOw) (YouTube, 2026-09-23 20:46 UTC, 2:37). Its description credits this fork and John's repo. ✅ It is the QR-annotated cut: YouTube's own preview thumbnails show the "FOOTNOTE" tags from `render.mjs --qr`. |
| `df03e06` | 09-23 16:26 | [The website](https://curtcox.github.io/PDoomVideo/): a dependency-free static generator ([`tools/site/build.mjs`](tools/site/build.mjs), `app.js`, `style.css`) that plays the video beside REFERENCES.md. It's published by the GitHub Actions workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) (Node 22, `actions/deploy-pages`). |

✅ GitHub Actions first published the site at 2026-09-23 21:26 UTC (`df03e06`) and rebuilt it after the 9/25 merge. The later John commits were brought in with GitHub's web "sync fork" (committer "GitHub", `6bb699e`).

The research behind REFERENCES.md (finding the paper, post or event behind each line) was done by Claude Opus 5.5 in those sessions. The details of those sessions go in [section 8a](#8a-the-forks-annotation-qr-cut-and-website-2026-09-23-another-mac). The "On screen" notes were checked against frames rendered from this repo, not just the storyboard. osmarks' annotation page (above) is an independent, earlier annotation of the lyrics by one of their authors.

## Related versions that are *not* in this lineage

The song spread widely in September 2026. None of these share our audio, but they're easy to confuse with the chain above.

| Date | Who | What | Audio | Visuals |
|---|---|---|---|---|
| 2024-11-10 | Dmytro | [P(doom)](https://www.youtube.com/watch?v=86fZ50TysOg), 128 s, "officially endorsed" by osmarks | osmarks' Udio | music video |
| 2025-02-20 | Majestic Hooligan | [p(doom) (Shroom Edit)](https://suno.com/song/e640772b-0e0b-4058-8138-3ebdacf3c38b), 153 s, new verses | Suno v4 | none |
| 2026-09-13 | "Doom Probability" | [Singularity Sing Along](https://www.youtube.com/watch?v=2qUhX5K7qdo), 186 s | Suno v6 cover (2026-09-11) | Eidoverse, "GPT-6 Astra agents" |
| 2026-09-23 | [@donaldjewkes](https://x.com/donaldjewkes/status/2102801274173587569) | Separate Opus 5.5 video, 141.5 s, "one prompt … claude worked for 12 hours". Mirrored as [*Opus 5.5 (et al.)*](https://www.youtube.com/watch?v=IV_glrNIyUk) | a 141.5 s cut | Opus 5.5 (plus Seedance 2.5, according to [@pranesh](https://x.com/pranesh/status/2102934469309297120); unverified) |
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
| Made with MiniMax Music 3, since eidoverse recommends it | ❌ No. deckard says the music is from **Suno V6**, and says he didn't make it himself. osmarks also says Suno. Eidoverse made the *visuals* (confirmed by SkyeSharkie). Its MiniMax recommendation dates from after the video. |

## Open questions

We followed every lead we had. These remain open, and each can only be settled by the people named:

- **Who generated the Suno V6 track.** deckard says he didn't make it and hasn't said where he found it. It was made on 2026-09-09, within hours of V6's release. Only deckard, or whoever made it, can say.
- **What "Context Crew" means**, and which Claude model and harness deckard's Eidoverse run used. Only deckard can say.
- **Whether John had early access to Opus 5.5.** He said nothing about it. His account (a quick first pass, then about 45 minutes at xhigh) fits the roughly 5 hours between the public release and his post.

## 8. How this record was researched

The research for this repo happened in two stretches of Claude Code sessions.

### 8a. The fork's annotation, QR cut and website (2026-09-23, another Mac)

*Placeholder, to be filled in by Curt.* This will cover the Claude Code sessions that produced `REFERENCES.md`, the shot index, the QR-footnoted cut and the website (commits `5844829`, `bf1e1bc`, `df03e06`): model and effort, the tools used, the prompts that mattered, and time spent. Those transcripts aren't on the machine where section 8b ran.

### 8b. This provenance record (2026-09-25)

*Being filled in by the last commit of that session.*
