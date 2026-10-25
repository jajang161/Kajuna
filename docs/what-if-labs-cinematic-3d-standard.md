# What If Labs — cinematic 3D visual and voice quality contract

**Applies to What If Labs only.** This is an editorial and render acceptance standard, not an automatic claim that video was visually reviewed.

## Intended result
Aim for premium, eye-catching, documentary-grade 3D science visuals. Avoid children's educational cards, flat vector slides, oversized text panels, toy-like objects, generic circles, stock icon collages, looping globe spins or repetitive pan/zoom presets. Author actual 3D geometry, photographic textures, controlled depth of field, physically plausible light, composition, spatial continuity and motivated moving cameras. Use Higgsfield for justified realism, or Three.js/WebGL / 3D assets with Bang Motion for original motion; 2D informational overlays are allowed only when they add precise science and remain subordinate to the 3D scene.

## Episode-specific visual strategy
- Preserve **three 10-second clips with four visible actions/scenes each** (12 × 2.5 s). Every scene must be represented by a visually different, clearly discernible development, not merely changed captions.
- Choose distinct visual mechanisms based on *scientific meaning*: orbital approach, scale comparison, macro dive, cross-section, exploded mechanism, time-dependent consequence, field simulation, environment reconstruction, geographic traversal, matched camera transition, etc.
- Vary framing, lens, scene scale, subject action, and camera motion intentionally. Never require every scene to use a different effect just for variety; maintain coherent continuity and a single subject where needed.
- For each scene specify `visual_goal`, `visual`, `shot_type`, `camera_rule`, `style`, `transition_in`, `transition_out`. Optional `depth_cue`, `material_light`, and `scientific_mechanism` provide richer direction.
- Do not reuse identical multi-shot camera recipes or visual compositions across episodes. Consult episode memory, challenge near-duplicates, and explain unique learning value.
- Exclude from **published pixels** all internal production labels: `SCENE 1/12`, `CLIP 1/3`, `ENGLISH VOICEOVER`, render identifiers, debugging UI, scene counters, subtitle mockups, and editor grids. Captions or genuinely useful measurements are permitted.

## Natural English narration
- Write one **continuous, conversational, non-poetic** 30-second thought, then map speaking time to scenes. Strong, specific first-second hook; make each following phrase reveal a fact or consequence; no repetitive "imagine a world where...", generic filler, sensational claims or stock closing lines.
- Natural human-like neural narration (e.g. ElevenLabs, subject to explicit credit approval). Never present `espeak` or a robotic offline TTS as final-quality voice.
- Narrative segments in the manifest are timing anchors, **not instructions to use twelve unrelated vocal takes**. Preserve flow and natural breath. For a 2.5 s segment, verify the actual TTS timing before paying again or rendering.
- Provide precise English captions and Indonesian translation separately. Hide technical voiceover instructions from frames.

## Before publication: render quality gate
View and listen to the real **1080×1920, 30-second H.264/AAC** MP4, sampling all twelve scene centers and each clip boundary. Check there is visible 3D depth, no card-like full-screen captions, no leaked production labels, no static slides, no repeated visual beats, no object mutations, no captions/audio drift, no clipped speech, smooth transitions, and that facts remain accurate. A programmatic text lint is only a preflight: it cannot certify a rendered movie, animation geometry, or human-quality speech.

## Existing limitations
This guide does not itself generate 3D geometry, AI footage, voice or MP4. The pilot's 2D graphics / offline robotic voice do **not** pass the new quality contract. A full benchmark requires a real render with actual licensed models and authorized neural voice; do not mislabel a structural smoke test as upload-ready.
