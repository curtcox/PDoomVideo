# Make your own

This guide covers how to make something like this video: an AI song, an animated music video painted by code, and an annotated version with a website. Each step names the tool the people in this repo's history actually used (see [`PROVENANCE.md`](PROVENANCE.md)) and the alternatives they tried.

The whole chain is four layers, and you can start at any of them:

1. **Words** (write them yourself, or with a model's help)
2. **A song** (an AI music generator)
3. **A video** (a coding agent writes drawing code, and a headless browser paints the frames)
4. **An annotation** (a reference list, QR footnotes, a website)

## 0. What you need

- **Claude Code** with a Claude model. Both the video and the annotation here were made with Claude Opus 5.5.
- **Node.js** 18+ (this repo was tested with 22), **Google Chrome** and **ffmpeg**.
- A music generator account, or a local GPU for an open-weights model.
- A GPU helps rendering. p5.brush's watercolor fills are the slow part. Measured on an Apple M1 laptop:
  - about 0.9 s per frame with 1 worker;
  - 0.35 s per frame with `--workers=4`.

  The full 156.6 s video (3,758 frames at 24 fps) takes about 22 minutes and 2.7 GB of JPEG frames.

## 1. Words

osmarks wrote most of the P(doom) lyrics by hand, building on MusicPerson's first verse. They tried an LLM (LLaMA-3.1-405B base) for more lines and found it weak at rhyme and scansion. Then they used Claude for a few outro lines and edited what it gave them ("Sparsity to super-dense" became "Post-Chinchilla, super-dense"). A good split of work: you write the hooks, and a model suggests rhymes and bridges that you choose from and rewrite.

Two tips from this song's history:
- **Write for the generator's ear.** osmarks spelled "A-G-I" with hyphens in the Udio prompt so it would be sung as letters. The captions in deckard's video keep that trick ("M-L-P", "Syd-ney").
- **Use section tags.** `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Outro]` and `[Final Chorus]` shape the song's structure in Udio, Suno and MiniMax alike.

## 2. A song

This song has been made three ways:

| Tool | Who used it | How |
|---|---|---|
| [Udio](https://www.udio.com/) (web) | MusicPerson and osmarks, 2024 | Style prompt *"Female vocalist, Electronic, Electropop, Pop, Energetic, Anthemic, Melodic, Playful, Synthpop, Uplifting, Optimistic"* plus the lyrics. Udio generated in about 30 s chunks, so the song was built by repeatedly extending it (32.8 s → 65.6 s → 98.2 s → 130.9 s), with many rejected takes. |
| [Suno](https://suno.com/) (web) | most likely the 2026 rendition in this repo | Lyrics with section tags plus a style prompt. Suno writes a whole song in one go and can "cover" an existing one. It may reword lines slightly when it sings (compare the canonical lyrics with [what's sung](PROVENANCE.md#4-the-soundtrack-in-this-repo-a-suno-rendition-2026)). |
| [MiniMax Music 3](https://www.minimax.io/blog/minimax-music-3-0-next-generation-open-weights-production-ready-versatile-music-model) (open weights, local) | recommended by [Eidoverse](https://github.com/SkyeShark/eidoverse-video/blob/main/tools-guides/audio.md) | Runs in a local ComfyUI. See below. |

For the local route with Eidoverse's driver:

```bash
python generate_song.py --probe     # checks ComfyUI and the three MiniMax model files
python generate_song.py "Female-vocal electropop, energetic, anthemic, playful synthpop" "$(cat lyrics.txt)" --max-duration 180 --seed 1 --out song.mp3
```

Eidoverse's notes: the text encoder plans the song's length from the caption. The same caption can come back 28 s long on one seed and 90 s on another, so generate several seeds and pick by measured length (`ffprobe`).

**Keep the lyrics text you used.** The next step needs it.

## 3. A video

### The approach that made this repo

John Heibel's process, from his README and the guides Opus wrote:

1. **Direction, briefly.** Open an empty folder in Claude Code with the song file and ask for a music video. John's only direction was *"use the Clawd character design"* and *"give each lyric interesting visuals and transitions"*. He specified no scene ideas.
2. **A first pass.** Opus 5.5 at Medium effort produced a single-page canvas version ([`legacy/`](legacy/)).
3. **Feedback, then a second pass.** He asked it to *use p5 brushstrokes, make each scene visually interesting, and make every scene transition into the next*. Opus then wrote [`STORYBOARD.md`](STORYBOARD.md) (a shot-by-shot plan) and [`ANIMATION_GUIDE.md`](ANIMATION_GUIDE.md) (rules and shared API). It ran **parallel subagents**, one per chapter, each writing one file in [`src/ch/`](src/ch/) against the shared helpers.
4. **Rendering.** [`render.mjs`](render.mjs) opens [`studio.html`](studio.html) in headless Chrome, paints each frame at time *t*, saves JPEGs from parallel workers, and joins them with the song in ffmpeg.

The key design rule is that **every frame is a pure function of time**. No state carries between frames and there's no `Math.random()`, only seeded hashes. That's what lets frames render in parallel and out of order, and what lets the model check any moment as a still.

### The easiest way to start: John's starter kit

[JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (MIT licensed) packages this repo's engine, a reusable Clawd with 31 emotions, and a model-facing guide that fixes what went wrong here:

```bash
git clone https://github.com/JohnHeibel/ClaudeAnimationBase my-video && cd my-video && npm install
```

Then, in Claude Code:

> Read ANIMATION_GUIDE.md, then make a 15-second video of Clawd trying to catch a butterfly.

For a music video, put the song in `assets/`, then set `duration`, `bpm` and the first-downbeat `offset` in `src/config.js`. John reports that higher reasoning effort gives more extravagant, detailed scenes. His kit's test videos were all made at **xhigh**. He suggests asking for a storyboard before any code, and trying both very broad and very specific prompts.

### Get the timing right

The model can't listen to your song, so give it the timing as data:

- **Lyric times.** This repo's [`src/lyrics.js`](src/lyrics.js) was read off the captions burned into deckard's video. If you have no captioned video, align the lyrics yourself. Eidoverse separates the vocals with demucs and aligns them with stable-ts:

  ```bash
  python -m demucs --two-stems=vocals -o stems song.mp3
  python align_lyrics.py stems/htdemucs/song/vocals.wav "$(cat lyrics.txt)" --output lyrics_aligned.json
  ```

  Any word-level aligner (WhisperX, stable-ts) works. Give the model a table of `[start, end, text]`.
- **Tempo and downbeat.** Measure them. Don't let the model guess. This repo's code assumes 88 BPM, but the song measures about 132 BPM, so most "on the beat" hits land between beats. One way to measure:

  ```bash
  pip install librosa
  python -c "import librosa; y,sr=librosa.load('song.mp3'); t,b=librosa.beat.beat_track(y=y,sr=sr); print(t, librosa.frames_to_time(b[:4],sr=sr))"
  ```

  Beat trackers often report half or double the true tempo, so check the result by tapping along.

### The other approach: 3D with Eidoverse

deckard's 9/9 video was rendered with [Eidoverse](https://github.com/SkyeShark/eidoverse-video) (AGPL-3.0). It's a Deno + WebGPU + three.js toolkit built for agents, with VRM characters (including the Claude-in-a-suit model by digi), dance animation clips, sets, lighting, a lyric caption bar, and helpers for lip sync and audio. Follow its `docs/SETUP.md` and `AGENTS.md`, and let your agent drive it. It needs a capable GPU.

## 4. An annotation

This fork's additions were made in Claude Code with Opus 5.5, and you can reuse the tools on any video with a timeline:

1. **A reference list.** Ask the model to research every lyric and sight gag and write [`REFERENCES.md`](REFERENCES.md): a timestamped entry per line, the *On screen* description, and sources marked by how directly they explain the reference (🎯 exact, 🔍 focused, 🌐 broad, 🎬 visual, ❓ interpretation). Have it check the visuals against rendered frames, not just the storyboard. The storyboard and the render differ in places.
2. **Checks.** Run `npm run refs:timeline` (consistency with `src/lyrics.js` and the shot lists) and `npm run refs:links` (fetches every source). `npm run refs:shots` renders a frame index for every shot. See [`tools/refs/README.md`](tools/refs/README.md).
3. **A QR-footnoted cut.** Run `npm run refs:qr`, then `node render.mjs --qr …`. This paints a scannable tag for each footnote (at least 3 s each), and `npm run refs:qr:scan` decodes them back out of the frames to prove they scan at 1080p and 720p.
4. **A website.** `npm run site:serve` builds a static page that plays the video beside the list, and [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes it to GitHub Pages on every push.

## 5. Credit and permissions

This isn't legal advice. It's what we could determine:

- **This repo has no license file, and neither does John's original.** Without one, you can read and fork the code on GitHub, but you have no explicit permission to reuse it elsewhere. For your own project, start from [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (MIT), or ask John.
- **The lyrics** belong to MusicPerson and osmarks, and no license is stated. **The recording in `assets/pdoom.mp3`** came from deckard's video. Its generator's terms (Suno's differ by plan) and its maker's wishes govern reuse. Credit all of them, as the uploads in this history did, and ask before commercial use.
- **Clawd** is Anthropic's Claude Code mascot, and Anthropic treats its name and look as its own. A third-party project called "Clawdbot" renamed itself after a trademark request. Fan videos like this one are common, but check before using it commercially. **Eidoverse** is AGPL-3.0, and its bundled `claude_suit.vrm` is CC-BY (credit digi).
- **Say what made it.** Every layer here credited its tools. That's why this history could be traced at all.
