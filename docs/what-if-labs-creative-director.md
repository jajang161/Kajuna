# What If Labs — Intelligent Creative Director

## Production principle
**Consistent channel identity; episode-specific editorial substance.** Fixed 30-second / 12-scene production structure is compatible with different questions, hook types, explanations, diagrams, camera behavior, and endings. Avoid mass-production that only changes nouns and titles.

### Editorial steps
- Read `data/what-if-labs-episodes.json` and inspect previously approved/published episode concepts; use the newest episodes for category planning but compare against all entries.
- Prefer topics with a distinct scientific insight or falsifiable/explainable causal mechanism. Check trustworthy original research or educational sources before writing.
- Pick a narrative approach fitting the idea: mystery/investigation, inside journey, causal simulation, scale comparison, engineering breakdown, alternate-history comparison, or evidence-based myth test. This is an option menu, not a cyclical template.
- Choose Higgsfield for shots where generated realism creates real understanding or wonder; choose Bang Motion for precise mechanisms, timelines, labels, diagrams, and causal reasoning. Relative duration is optional and variable.
- For each scene explain its *specific* contribution. Keep the technical 3×10-second / 12×2.5-second constraint but vary storytelling across whole episodes; scene labels are descriptive rather than enforced positional presets.
- Narration English plus Indonesian translation, and sensible sound effects. Verify that an English TTS segment fits 2.5 seconds. AI may write the draft; a human or genuinely capable reviewer must fact-check and approve sources.

### Originality memory
`scripts/what-if-labs-originality.mjs` exports an episode fingerprint and a lexical similarity audit; `scripts/what-if-labs-history.mjs` checks and registers against `data/what-if-labs-episodes.json`.

```bash
node scripts/what-if-labs-history.mjs check examples/what-if-labs-storyboard.example.json
node scripts/validate-what-if-labs-plan.mjs examples/what-if-labs-storyboard.example.json
```

The preflight automatically runs in `scripts/what-if-labs-auto.mjs` before any ElevenLabs request. Identical narrations or highly overlapping topic+script block production. Similarity warnings warrant editorial review; simple synonyms cannot make a copied video original.

After an episode is **approved or published**, set its `publication_status` and run:

```bash
node scripts/what-if-labs-history.mjs register episodes/my-episode/storyboard.json
git add data/what-if-labs-episodes.json
git commit -m "Record What If Labs episode"
git push
```

Without the commit/push, the next agent or computer may not see updated memory.

### YouTube policy guard
Official reference: https://support.google.com/youtube/answer/1311392 and https://support.google.com/youtube/answer/14328491 . Review updates before publishing. A consistent brand, voice, duration and explainer format are not inherently prohibited; low-effort, repetitive and minimally differentiated mass-produced videos threaten monetization. Distinguish novel teaching content from generic AI montages. Respect rights, including reused assets. Decide responsibly whether realistic generated events require altered/synthetic disclosure. Avoid claims of assured monetization or a platform-defined safe number of uploads.

### Publishing cadence
Start with roughly four to five researched episodes per week if the team can sustain the quality; this is **our editorial guideline**, not an official YouTube upload limit. Compare retention, viewed-vs-swiped, topical audience feedback, and episode distinctness over 30 days. Never auto-publish solely because schedule says so.

### Operational limits
This is a preflight tool, not visual understanding, online fact-checking, license clearance, or a completed Higgsfield/Bang Motion integration. Frame-level render QC and real audio-video sync still require testing. Do not claim the pipeline creates footage from a text manifest alone.
