# What If Labs — automatic ElevenLabs production

This extension is **opt-in only for What If Labs**. It does not replace the existing Bang Motion/Brew Production skill for other jobs.

## Production contract

- Final video: **30 seconds, portrait 1080×1920, 30 FPS**, 3 clips × 10 seconds × 4 distinct scenes = **12 scenes**.
- Plan visual action, scientific claim, English narration, **Indonesian translation**, SFX cue and timecode **together**, before generating any paid audio. Scene duration is fixed to 2.5 seconds.
- English is the spoken language of the international edition. Indonesian is supplied as a translation in text and SRT; **do not put Indonesian dubbing in the EN video**.
- Each scene is narrated separately with ElevenLabs `/v1/text-to-speech/{voice_id}/with-timestamps`, so every audio clip can be placed at the correct scene start. English subtitle endpoints use the returned timestamp alignment.
- If real TTS duration exceeds its 2.5-second window, **stop with an actionable error**. Do not silently speed up, trim words, or stretch the visual scene. Shorten the script and regenerate.
- SFX calls use `/v1/sound-generation`, **only** when `--with-sfx --sfx-confirm yes` is explicitly supplied. Effects are placed at the corresponding scene start. The agent should describe the correct causal event and choose a short, coherent sound; never generate effects unrelated to the visual.
- `index.html` must use the Bang Motion deterministic `window.OPENER` timeline and have **exactly 30 seconds** for the MP4 renderer. An existing HTML animation is required. The automation **does not generate moving video from the JSON alone**.
- ElevenLabs TTS **does not fact-check, translate, write the narrative, or generate the visual scenes**. Codex or another planning agent must prepare, validate and translate all 12 rows first. Proofread accuracy before making paid API calls.

## Prepare the JSON storyboard

Copy [example manifest](../examples/what-if-labs-storyboard.example.json) to a new file in the episode folder. Replace **every** example sentence, visual, and SFX with original, scientifically checked content. Schema of each entry:

```json
{
  "id": 1,
  "clip": 1,
  "start": 0,
  "end": 2.5,
  "visual": "Detailed description of what the audience sees",
  "narration_en": "Very short spoken English sentence.",
  "translation_id": "Terjemahan singkat dalam bahasa Indonesia.",
  "sfx": "Whoosh of a camera flying past the subject",
  "sfx_duration": 1.2
}
```

Each clip has 4 consecutive scenes. Scene 1 begins at 0; scene 12 ends at 30. Avoid repetitive scripts and cite sources for real science claims.

## Run with no credits (free validation)

```bash
node scripts/what-if-labs-auto.mjs --manifest ./episode/storyboard.json --out ./episode/output
```

This validates the 12-scene plan, generates `Narration_EN.txt`, `Translation_ID.txt`, `Subtitles_EN.srt`, `Subtitles_ID.srt` and `storyboard.json`. It does not request API services or render MP4.

## Enable live ElevenLabs

Use a private environment variable; **never paste a key into README, JSON, .env committed to Git, source, or Codex chat**. Set it in the Codex environment/secret manager, as allowed by your setup. Provide your own valid voice ID as `ELEVENLABS_VOICE_ID` or `--voice`.

```bash
node scripts/what-if-labs-auto.mjs --manifest ./episode/storyboard.json \
  --project ./episode --out ./episode/output --generate \
  --voice YOUR_VOICE_ID
```

This requests **12 paid text-to-speech generations**, checks each audio clip's real duration, creates narration and SRT, and invokes `render-video.mjs` for final video. It needs `ELEVENLABS_API_KEY`, Node 18+, FFmpeg, FFprobe, Puppeteer/Chromium and `episode/index.html`.

To generate effects too (up to 12 additional paid SFX requests):

```bash
node scripts/what-if-labs-auto.mjs --manifest ./episode/storyboard.json \
  --project ./episode --out ./episode/output --generate \
  --with-sfx --sfx-confirm yes --voice YOUR_VOICE_ID
```

Music is optional and is not automatically generated; use properly licensed audio during final editing. The current pipeline does not retry overlong narration automatically, to avoid extra charges.

## Exported results

- `WhatIfLabs_Final_EN.mp4` (H.264 + AAC, 9:16)
- `Narration_EN.wav` (clean English voice)
- `SFX.wav` (when enabled)
- `Narration_EN.txt` and `Translation_ID.txt`
- `Subtitles_EN.srt` and `Subtitles_ID.srt`
- `storyboard.json` and `production-report.json` (only after successful run)

## QA before claiming completion

- Check all 12 visual actions actually occur at expected times; read the full source `index.html`.
- Confirm English spoken words correspond to visual moments and timings.
- Review subtitle meaning and SRT timing; Indonesian timing is matched to scene boundaries, not translated speech.
- Verify MP4 exists and video+audio streams are present. Listen to start, middle, and ending.
- Do not promise download, speech, SFX or a completed render before the files exist.
- Do not submit API calls just to test connectivity. Inspect input, then ask for authorization when charges or credits have not been approved.
