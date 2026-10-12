# Hyperframes Composition Brief: Zubair Hussain — Portfolio

## Objective
Create a short launch-style brag video for the Zubair Hussain portfolio — a
developer portfolio that is also a working product (edge AI assistant, verified
hire flow, six-language article reader) running as one Cloudflare Worker.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 19.5 seconds

## Source Material
- Project root: `C:/Users/Zubair Hussain/Desktop/Zubair-portfolio/Zubair-Hussain-portfolio-`
- Primary files read: `src/styles/globals.css`, `src/components/sections/HeroContent.tsx`,
  `src/messages/en.json`, `src/components/ui/HireMeModal.tsx`,
  `src/app/api/chat/route.ts`, `src/app/api/suggest-timeline/route.ts`,
  `src/lib/zubair-profile.ts`, `README.md`
- Product name: Zubair Hussain — Portfolio
- Tagline / strongest claim: `Building digital experiences that convert.`
- Key UI or visual moments to recreate:
  1. The hero: giant italic serif H1 on pure black with a red bloom, mono
     `AVAILABLE FOR HIRE` badge with a pulsing red dot.
  2. The "Zubair AI" chatbox answering a question with real link chips.
  3. The Hire Me modal completing: AI timeline chip, verified email, human check,
     success line.
  4. The scroll-linked avatar frame sequence (`public/frames`, 197 JPEGs; a
     sampled GIF exists at `docs/assets/hero-avatar-sequence.gif`).
- Copy that must appear verbatim:
  - `AVAILABLE FOR HIRE`
  - `FULL STACK DEVELOPER`
  - `Building digital experiences that convert.`
  - `Can you build a Next.js store?`
  - `4-7 weeks (based on store complexity)`
  - `Message sent! I'll reply within 24 hours.`
  - `Zubair Hussain`

## Creative Direction
- Tone preset: `polished`, with `cinematic` scale on the hook and outro
- Creative direction: a premium product film cut in the site's own black-and-crimson editorial style
- Interpretation: five scenes, long confident holds, slow crossfades, very large
  type. Restraint is the style — nothing bounces, nothing spins. Energy comes
  from scale, contrast and the red bloom, not from speed. UI recreations must
  read as the real interface, not as slides.
- Angle: most developer portfolios are a résumé with a gradient; this one is a
  product. Show it working — the AI answering, the hire flow completing — rather
  than listing sections.
- Hook: black, pulsing red dot, `AVAILABLE FOR HIRE`, then the real H1
  `FULL STACK DEVELOPER` slams in and holds.
- Outro / punchline: avatar resolves from black, `Zubair Hussain`, then
  `Building digital experiences that convert.` and the URL.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign — do not invent a new brand
  - Waveform/equalizer graphics or particle systems

## Visual Identity
- Background: `hsl(0 0% 0%)` — pure black (`--background`)
- Text: `#f5f4f0` cool white; muted `rgba(245,244,240,0.45)`
- Accent: `#c8141e` (`--brand-solid`); bright `rgb(220,40,50)`; glow `rgb(239,68,68)`
- Border: `hsl(45 30% 12%)` — gold-tinted hairline
- Display font: Instrument Serif italic (hero H1, `letter-spacing: -0.04em`,
  `line-height: 0.83`, uppercase); Cormorant Garamond for secondary display
- Body font: DM Sans; labels in JetBrains Mono, uppercase, `letter-spacing`
  `0.2em`–`0.4em`, very small sizes (9–12px at site scale — scale up for 1080p)
- Visual references from the project: hero H1 text-shadow
  `0 0 80px rgba(200,20,30,0.18)`; hairline cards
  `1px solid rgba(255,255,255,0.07)` over `rgba(255,255,255,0.03)` with
  `backdrop-filter: blur(8px)`; red status dot with
  `box-shadow: 0 0 6px rgba(220,40,50,0.9), 0 0 14px rgba(200,20,30,0.5)`

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Signal — 3.0s — red dot + `AVAILABLE FOR HIRE`, then `FULL STACK DEVELOPER` slams in and holds; mono subtitle under it.
2. Ask Zubair AI — 4.5s — chatbox: question types out, thinking dots, assistant answer, two chips (article link, `Schedule a Call`).
3. Hire flow — 4.5s — category `E-commerce`, timeline chip `4-7 weeks (based on store complexity)`, `DOMAIN VERIFIED` tick, human check, `Message sent! I'll reply within 24 hours.`
4. What it runs on — 4.0s — three hairline cards one by one (~1.0s apart), then held together: `6 languages · full RTL`, `Static at the edge · Cloudflare Workers`, `63 tests · CSP · Firestore rules`.
5. Outro — 3.5s — avatar resolves from black, `Zubair Hussain`, subtitle, URL, red dot still pulsing; fade to black.

Reading-time floor: short mono labels hold ~0.8s settled; sentences ~0.3s/word
(minimum 1.2s). The H1 and the success line get the longest holds. Entrances stay
fast (0.3–0.6s) — fast in, then hold.

## Audio
- Audio role: warm low bed with cinematic support; sparse, motion-matched accents
- Audio arc: near-silence under the hook with one dry impact → precise interface
  sounds as the product demonstrates itself → peak on the hire confirmation →
  release to near-silence under the outro
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (163.96s, 120.19 BPM),
  staged at `brag-output/composition/assets/music/`
- Music treatment: low bed throughout (it supports, never drives); slight lift
  into Scene 3; fade out across the final ~1.2s so the last frame is silent
- Music cue guidance: bundled preset at
  `skills/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`.
  Strong cues at 16.02, 17.02, 17.52, 18.02, 18.52, 20.02, 21.01, 22.01, 23.02, 23.52s;
  beat grid every ~0.50s from 3.02s. Choose a music start offset so up to three
  major moments land on strong cues: the H1 slam, the `Message sent!`
  confirmation, and the final name set. Lock no more than 3.
- Audio-reactive treatment: subtle — RMS/bass may breathe the red bloom behind
  the H1 and the avatar rim glow only. No bars, no meters, no strobing. If
  extraction is unavailable (helper or ffmpeg missing), skip it and do not block
  the render.
- Audio-coupled moments:
  - Scene 1 H1 landing — single dry impact, beat-locked
  - Scene 2 question + assistant reply — typing with subtle key ticks; one soft click per chip
  - Scene 3 verified / human-check ticks — short interface clicks at the same timestamp as each tick
  - Scene 3 success line — one warm confirm, the loudest cue in the video
  - Scene 4 three cards — one soft card sound per arrival, decreasing volume, snapped to every other beat
  - Scene 5 — no SFX after the name; bed fades alone
- SFX selection guidance: match sound to visible motion only. Sequential reveals
  get one sound per arrival at the same timestamp as the visual. Nothing on cuts
  that have no motion. If the edit already feels busy, drop cues rather than add.
- SFX analysis guidance: use
  `skills/brag/assets/sfx/sfx-analysis.md` (and `.json`); prefer low
  high-frequency-risk files — this is a polished tone with repeated ticks.
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density and volume
  after the visual animation exists.
- Audio files: copy the chosen music and any selected SFX into
  `brag-output/composition/assets/`.

## Hyperframes Instructions
Load the composition-building Hyperframes skills bundled with the installed
package (`dist/skills/hyperframes`, `dist/skills/hyperframes-cli`, plus
`dist/docs/compositions.md`, `data-attributes.md`, `gsap.md`, `rendering.md`).
Note: this brag skill expects the older split skills (`hyperframes-core`,
`-animation`, `-creative`, `-keyframes`); the installed package (0.8.78) ships a
consolidated `hyperframes` skill instead — use what is installed. Do not enter
the entry-point intent interview and do not route into the generic
promo / launch-video workflow; `/brag` owns the product angle and storyboard.

Requirements:
- Show real UI, copy and visual elements from the source project (scenes 1-3 and 5 all do).
- Keep all text readable in the final render; honour the reading-time floor above.
- Keep the video within 15-25 seconds (target 19.5s).
- Include the planned music and SFX layer.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet; pick SFX after the animation exists.
- Treat cue metadata as optional timing hints: major reveals within ~0.15s of a
  strong cue, smaller entrances within ~0.10s of a beat, 1-3 strong locks total.
  Ignore any cue that hurts readability or pacing.
- Use local assets for audio and any runtime/media dependencies.
- Run `npx hyperframes check` before render — it is brag's single gate.
