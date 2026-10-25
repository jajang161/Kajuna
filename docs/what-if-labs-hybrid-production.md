# What If Labs — Hybrid Higgsfield + Bang Motion

## Recommended flow
1. Research and approve an original 12-scene episode, sources, science assumptions and license status.
2. Decide scene-by-scene which footage *benefits* from Higgsfield realism and which is best explained by original Bang Motion diagrams. There is no mandatory 10/20 seconds ratio.
3. For a generated clip, use the Higgsfield model's **cost estimate first**, then request permission before generating. Do not charge credits during planning.
4. Place licensed generated video files inside the episode's local project folder. Mark the storyboard scene with `"medium": "higgsfield", "asset": "assets/scene-01.mp4", "asset_start": 0`. The asset must contain at least 2.5 s after the selected trim start. All other scenes use `"medium": "bang-motion"`.
5. Run `node scripts/validate-what-if-labs-hybrid.mjs episode/storyboard.json episode/` to verify existing asset paths, media streams, and duration **without any paid calls**. Reject missing assets and references outside the project folder.
6. Have an AI coding agent author unique, non-template Bang Motion `index.html` with GSAP/HTML/SVG, composite Higgsfield footage at the correct scene times, and implement `window.OPENER` timeline plus `seekFrame()` support for video frame accurate export.
7. Use `node scripts/what-if-labs-auto.mjs --manifest episode/storyboard.json --project episode --out episode/output` for no-cost draft validation. When the HTML timeline and source assets are ready, explicitly approve paid TTS before supplying `--generate`.
8. Inspect the real exported 1080×1920 MP4 for compositing, glitching, factual graphics, transitions, English narration sync, licensing and AI disclosure.

## What is implemented
- Static editorial/originality checks, 12-scene timings, ElevenLabs optional audio and MP4 export scripts.
- Local video asset readiness checker: missing/out-of-bounds/nonvideo/too-short clips block paid generation.
- Existing Bang Motion engine supports animations and embedding videos authored in HTML.

## What is not implemented
- No direct call to Higgsfield generation from the JSON manifest; authorized footage must already exist locally.
- No automatic, visually intelligent design of `index.html` from manifest alone.
- No final-video semantic, frame glitch or YouTube monetization certification.
- Actual 30-second 1080p real-video render requires a configured Chromium/Puppeteer/FFmpeg environment and a real episode project.

Make agent instructions obey these limits, preserve MIT copyright and prior original user references, and never imply the resulting HTML/manifest constitutes a completed MP4.
