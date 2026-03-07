# Audio Production Guide — CushLabs Scrollytelling

## Overview

Three audio layers per section, mixed in the browser via the existing scroll/IntersectionObserver system:

| Layer | Source | Format | Notes |
|-------|--------|--------|-------|
| Narration | ElevenLabs v3 TTS | MP3/WAV | One file per section, per language |
| Ambient Bed | ElevenLabs SFX API (looping) | WAV 48kHz | Crossfades between sections on scroll |
| Transition Hit | ElevenLabs SFX API (one-shot) | WAV 48kHz | Plays on section entry |

## File Naming Convention

```
audio/
  narration/
    en/
      01-hero.mp3
      02-problem.mp3
      03-solution.mp3
      04-proof.mp3
      05-ask.mp3
    es/
      01-hero.mp3
      ...
  ambient/
    01-hero-ambient.wav        (looping)
    02-problem-ambient.wav     (looping)
    03-solution-ambient.wav    (looping)
    04-proof-ambient.wav       (looping)
    05-ask-ambient.wav         (looping)
  sfx/
    01-hero-transition.wav     (one-shot, ~2-3s)
    02-problem-transition.wav
    03-solution-transition.wav
    04-proof-transition.wav
    05-ask-transition.wav
```

## ElevenLabs Settings

### Narration (v3 TTS)
- Model: Eleven v3
- Voice: Choose a warm, confident male voice (recommendations: "Adam", "Antoni", or clone Robert's voice)
- Stability: 0.4-0.5 (allows natural variation)
- Similarity Boost: 0.75
- Style: 0.3-0.4
- Speaker Boost: On

### Ambient Beds (SFX API)
- Duration: 30 seconds (max)
- Loop: true (seamless looping enabled)
- Quality: 48kHz WAV

### Transition Hits (SFX API)
- Duration: 2-4 seconds
- Loop: false
- Quality: 48kHz WAV

## Production Order

1. Generate English narration first (5 files)
2. Review timing — each should match the section's animation duration
3. Generate ambient beds (5 files, looping)
4. Generate transition hits (5 files)
5. Test layering locally (narration + ambient + transition)
6. Adapt Spanish narration scripts and generate (5 files)
7. Integrate into Svelte components via Web Audio API

## Browser Integration Notes

- Use Web Audio API for crossfading ambient beds (GainNode transitions)
- Narration triggered by IntersectionObserver (same as current animation triggers)
- Transition hits fire once on section entry
- Presentation Mode auto-plays all three layers in sequence
- Browse Mode plays on scroll intersection (user must interact first for autoplay policy)
- Volume controls: narration 1.0, ambient 0.15-0.25, transitions 0.4
