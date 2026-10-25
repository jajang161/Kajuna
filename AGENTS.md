# Brew Production — Codex / AI agent instructions

This file applies automatically when an agent works from the root of this repository.
For any What If Labs request (including exactly "Buat episode What If Labs baru"):

1. Read `SKILL.md`, `docs/what-if-labs-creative-director.md`, `docs/what-if-labs-elevenlabs.md`, and `data/what-if-labs-episodes.json` before planning.
2. Choose or verify a genuinely distinct topic. Diversify space, human biology, technology, nature, physics, evolution, alternate history, and exobiology. Never mistake category rotation for originality.
3. Research the scientific claim. Cite factual primary or reputable sources; separate established facts, assumptions, and speculation. Avoid fabricated certainty.
4. Write an episode-specific hook, learning objective, visual mechanisms, narration, and conclusion. Do not recycle stock scripts with nouns swapped. Do not impose a fixed hook/explanation/consequence/reveal order in every clip.
5. Preserve 3 clips × 10 seconds, 4 scenes per clip, 12 scenes, 30 seconds, 9:16. This is a technical timeline, not a creative template. Use original 12-scene storyboard, bilingual scripts, SFX, timestamp plan.
6. Choose the mix of Higgsfield video and deterministic Bang Motion based on real value of each scene. Do not force a fixed ratio. Get explicit authorization before spending Higgsfield or ElevenLabs credits. Never imply that Higgsfield calls are performed by the JSON-only video pipeline.
7. For hybrid media, read `docs/what-if-labs-hybrid-production.md`, mark scenes with `medium`, and validate files using `node scripts/validate-what-if-labs-hybrid.mjs <manifest.json> <episode-dir>`. Do not attempt TTS or rendering for a referenced-but-missing Higgsfield clip.
8. Run `node scripts/what-if-labs-history.mjs check path/to/episode.json` and `node scripts/validate-what-if-labs-plan.mjs path/to/episode.json`. Resolve blocking errors before paid generation. Editorial warnings require contextual judgment, not cosmetic rephrasing.
9. Check YouTube's current policies, rights to all audio/visuals, and the altered/synthetic disclosure decision. YouTube makes monetization decisions; automation cannot guarantee approval.
10. Build original `index.html`, composite authorized footage, add English ElevenLabs speech and Indonesian text translation, render real MP4 and review actual first/middle/last frames, continuity, sound, and factual accuracy. Never label unrendered work final.
11. After human acceptance/publishing, set `publication_status` to `approved` or `published`, run `node scripts/what-if-labs-history.mjs register path/to/episode.json`, commit the updated `data/what-if-labs-episodes.json` to this repository. Do not register unfinished speculative tests as published.
12. Package verified MP4, editable source, SRT, title, description, tags, thumbnail copy, sourced research notes and clear AI disclosure recommendation.
13. For ordinary Bang Motion projects, the What If Labs rules do not apply.

Do not commit API keys, secrets, third-party copyrighted assets without appropriate rights, or pretend passing a lexical similarity check proves content is original.
