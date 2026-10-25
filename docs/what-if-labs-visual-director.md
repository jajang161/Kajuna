# What If Labs — Visual Director and QA

This feature is **manifest-level preflight**, not a guarantee of rendered-video quality. It does not analyze real image frames, recognize factual errors, or establish semantic agreement between narration and imagery. Inspect final video manually.

## Use

```bash
node scripts/validate-what-if-labs-plan.mjs examples/what-if-labs-storyboard.example.json
node scripts/what-if-labs-auto.mjs --manifest examples/what-if-labs-storyboard.example.json
```

The second command defaults to **no paid API calls** and writes drafts. Before `--generate`, all checks run, and failure blocks ElevenLabs requests and MP4 rendering. Consult `docs/what-if-labs-elevenlabs.md` for API setup and credit usage.

## Structured manifest

Keep 12 scenes in 3 clips (4 scenes × 2.5 seconds), with `id`, `clip`, `start`, `end`, `visual`, `visual_goal`, `narration_en`, `translation_id`, `sfx`, `camera_rule`, `shot_type`, `style`, `transition_in`, `transition_out`. Use top-level `topic` (e.g., `space`, `biology`, `technology`, `geography`, `evolution`, `history`), `ratio: "9:16"` and `duration: 30`.

Call `chooseVisualStyles(topic)` from `scripts/what-if-labs-visual-director.mjs` to select suggested visual families. Maximum two dominant styles per episode. The four scene positions of every clip use `establishing`, `explanation`, `consequence`, `reveal`.

Accepted transition names: `cut`, `match-cut`, `object-wipe`, `diagram-transform`, `camera-follow`, `push-through`, `zoom-to-detail`, `pullback`.

## Fail-fast conditions

- Missing required fields or incorrect 30-second scene timing.
- More than nine English narration words per 2.5-second segment (estimate only; actual ElevenLabs duration is checked separately).
- Identical or strongly overlapping consecutive descriptions.
- Mismatched transition names at neighboring scene boundaries.
- Transition mode repeated over twice across scene exits.
- Three consecutive identical camera instructions.
- More than two dominant visual styles or unexpected shot sequence.

Warnings flag unfamiliar topic/style combinations and weak textual agreement between goal and visual. These require human review; warnings do not assert that the video is correct. MP4 frame inspection, factual research, actual acoustic synchrony, visual glitches and final continuity still need dedicated render-stage QA.
