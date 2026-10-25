# Brew Production — MP4 + audio

Brew Production keeps the HTML animation as its editable source. When a user asks for a video file, a real playable MP4 must also be generated and attached. Never present HTML or ZIP as though it is an MP4.

## Requirements

- Node.js 18+
- Puppeteer and Chrome/Chromium: `npm install puppeteer`
- `ffmpeg` and `ffprobe` on PATH
- An HTML animation with `window.OPENER.ready`, `window.OPENER.tl`, and `window.OPENER.DURATION`, compatible with the included Bang Motion starter.
- Separate licensed WAV/MP3 files for requested voiceover, music, or effects. The scripts do not generate TTS.

## Render a video

From the Brew Production repository, using the location of the animation project:

```bash
node scripts/render-video.mjs --project ./streamflow-promo \
  --output ./streamflow-promo/StreamFlow.mp4 \
  --fps 30 --width 1920 --height 1080 \
  --narration ./streamflow-promo/voice.wav \
  --music ./streamflow-promo/music.mp3 --require-audio
```

For vertical video use `--width 1080 --height 1920`. Use `--duration 30` if you have validated that the timeline really is 30 seconds. Remove nonexistent audio parameters; do not promise narration if no audio asset is available.

If deterministic PNG frames already exist:

```bash
node scripts/encode-mp4.mjs --frames ./frames --output ./video.mp4 \
  --fps 30 --narration ./voice.wav --require-audio
```

Frames must be named `f00000.png`, `f00001.png`, etc. The MP4 output is checked using ffprobe for H.264 codec, AAC when audio is supplied, and expected duration.

## Before delivery

1. Confirm MP4 exists, is nonempty, and opens in a player.
2. Verify the first, middle and last frames are visually correct.
3. Confirm requested voiceover/music/effects actually exist and are audible.
4. Attach the MP4 file for download as well as the editable HTML/ZIP.
5. If FFmpeg, Puppeteer, TTS, or permission is unavailable, explain what is missing rather than claiming successful delivery.

The Codex terminal approval dialog is a platform safety control and cannot be disabled from this skill. Group safe commands sensibly, but do not circumvent permission requirements.
