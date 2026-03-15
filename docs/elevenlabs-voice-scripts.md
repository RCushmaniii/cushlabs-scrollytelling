# CWS Scrollytelling — ElevenLabs Voice Scripts & Audio Design

## Voice Direction (Global)

### Narrator Voice Profile
- **Tone:** Calm, confident, conversational. Think: a sharp friend explaining something they've figured out — not a keynote speaker, not a hype man.
- **Pace:** Measured. Slightly slower than natural conversation. Let the words breathe.
- **Energy arc:** Starts low and observational (Sections 0-1), builds through the insight (Section 2), stays steady and clear through the system reveal (Sections 3-5), warms up for the ICP mirror (Section 6), and lands with quiet conviction at the close (Sections 7-8).
- **What it should NOT sound like:** Corporate explainer video. AI product demo. TED talk cadence. Podcast ad read.
- **What it SHOULD sound like:** Someone who's been in the trenches, figured something out, and is walking you through it without performing.

### ElevenLabs Settings (Suggested Starting Points)
- **Model:** Eleven Multilingual v2 or Turbo v2.5
- **Voice:** Select or clone a voice that's male or female, 30s-40s range, warm but not soft, articulate but not polished
- **Stability:** 0.45–0.55 (slightly expressive, not robotic)
- **Similarity Boost:** 0.70–0.80
- **Style:** 0.15–0.25 (subtle emotional variation)
- **Speaker Boost:** On

---

## Audio Design (Global)

### Ambient Layer
A low, continuous ambient bed runs underneath the entire experience. It should feel like "digital space" — not music, not silence. Think:
- Soft analog hum
- Very subtle digital texture (distant data processing)
- Evolves slightly across sections (darker in Sections 0-1, warmer from Section 2 onward)

### Transition Sounds
Between major sections, a subtle audio cue signals the shift. Options:
- A soft "page turn" or paper-slide sound (analog feel)
- A quiet digital chime or ping (system feel)
- A low frequency shift in the ambient bed (seamless)

**Recommendation:** Use the ambient bed shift. It's the most immersive and least interruptive.

### Audio Trigger Model
- Voice clips trigger on scroll (Intersection Observer fires when section enters viewport)
- Each clip plays once per scroll-through (don't replay on scroll-back unless user resets)
- Provide a visible audio toggle (mute/unmute) — always default to MUTED with a clear "Enable Audio" prompt at the top
- Consider a "scroll to listen" affordance so users know audio is part of the experience
- **Accessibility:** Provide a full transcript toggle or "Read instead of listen" option for users who can't or won't use audio. The visual experience must stand alone.

---

## Section 0: THE HOOK

### Script ID: `cws-s0-hook`
### Duration: ~20-25 seconds
### Tone: Flat. Observational. Almost tired. Reading generic AI content like you've seen it a thousand times.

```
[VOICE — flat, slightly deadpan]

"Unlock your potential."

"We're passionate about helping businesses grow."

"In today's fast-paced digital landscape..."

[PAUSE — 1.5 seconds]

[VOICE — shifts slightly, more direct, more real]

This is what AI sounds like without context.

No voice. No guardrails. No memory.

Just... language.
```

### Audio Notes
- **SFX:** Each generic line could have a subtle "typing/generation" sound — rapid soft keystrokes or a faint digital pulse. Stops after the pause.
- **Ambient:** Dark, slightly uneasy. Low hum. The vibe is "something's off."
- **On the pause:** The typing sounds stop abruptly. Brief silence. Then the narrator's voice shifts register — this is the first real moment.

### ElevenLabs Production Notes
- Record the generic lines as a SEPARATE clip from the commentary. The generic lines need a deliberately flat, almost mocking delivery. The commentary ("This is what AI sounds like...") should be warmer, more human.
- Alternatively, record as one take but direct the voice actor to shift tone clearly at the pause.

---

## Section 1: NAME THE PROBLEM

### Script ID: `cws-s1-problem`
### Duration: ~30-35 seconds
### Tone: Clear, steady, diagnostic. Not angry — understanding. Like a doctor explaining a diagnosis calmly.

```
[VOICE — measured, clear]

The problem isn't the AI.
The AI is powerful.

The problem is what's missing.

Every time you open a new chat, a new prompt, a new session —
the AI knows nothing about you.

Not your voice.
Not your audience.
Not your story.
Not your boundaries.

So it does what any intelligent system does
when it has no constraints.

It defaults to average.

[PAUSE — 1 second]

And average doesn't build trust.
Average doesn't sound like a person with a point of view.

It sounds like a machine —
guessing what a person might say.
```

### Audio Notes
- **SFX:** When "Not your voice / Not your audience / Not your story / Not your boundaries" plays, each line could have a subtle hollow echo or a quiet negative tone (soft buzz) — reinforcing emptiness.
- **Ambient:** Still dark but slightly more present. The hum has a subtle pulse now, like a system running idle.
- **On "It defaults to average":** A subtle low-frequency drop. Weight. Gravity.

---

## Section 2: THE INSIGHT (Turning Point)

### Script ID: `cws-s2-insight`
### Duration: ~20-25 seconds
### Tone: This is the pivot. The voice lifts. Not excited — *certain*. Like someone who's about to show you something they know will change how you think.

```
[VOICE — slightly more energy, forward-leaning, confident]

What if the AI didn't start from zero?

What if — before it wrote a single word —
it already knew:

how you talk,
who you're talking to,
what you're allowed to say,
and what "good" looks like — in your voice.

[PAUSE — 1.5 seconds]

That's not a prompt.

That's an operating system.
```

### Audio Notes
- **SFX:** When the voice-dna.json file card slides in (on scroll), a clean, satisfying "lock-in" sound — like a card clicking into place. Think: soft magnetic snap + subtle digital confirmation tone.
- **Ambient:** The dark hum shifts. Warmer. A subtle harmonic enters — something that feels like "activation" or "power on." The atmosphere is no longer empty.
- **On "That's an operating system":** The ambient fully transitions to the warmer tone. This is the audio turning point of the entire piece. Brief swell, then settles.
- **Text morph SFX:** As the on-screen text transforms from generic to branded, a subtle "rewriting" sound — soft rapid keystrokes morphing into something smoother. Like analog typewriter transitioning to human speech rhythm.

### ElevenLabs Production Notes
- This is the most important clip. The delivery of "That's not a prompt. That's an operating system." needs to land like a thesis statement. Confident, not loud. A slight downward inflection on "operating system" — it's a conclusion, not a question.
- Record 3-4 takes of this section. The right delivery will be obvious.

---

## Section 3: THE SYSTEM REVEAL

### Script ID: `cws-s3a-voice` through `cws-s3e-skills`
### Duration: ~60-75 seconds total (5 sub-clips, ~12-15 seconds each)
### Tone: Steady, explanatory, building. Each layer adds clarity. The voice should feel like a guide walking you through a machine — proud of it but not overselling.

#### 3a: Voice DNA — `cws-s3a-voice`
```
[VOICE — warm, clear]

Layer one. Voice DNA.

Your tone. Your rhythm. Your phrases.
The emotional palette that makes your writing yours.

Not a brand guidelines PDF that nobody reads.
A living file that shapes every word the AI writes.
```

**SFX:** File card lock-in sound (same satisfying snap from Section 2). On the right side of the screen, as text transforms, a subtle warm "wash" — like ink spreading.

---

#### 3b: Audience Context — `cws-s3b-icp`
```
[VOICE — slightly more empathetic in tone]

Layer two. Audience context.

Who are you talking to?
What keeps them up at night?
What words do they use to describe their own problems?

When the AI knows your audience,
it stops writing at people —
and starts writing for them.
```

**SFX:** File card lock-in. Text transformation sound shifts to something slightly more human — softer, less mechanical.

---

#### 3c: Claims Policy — `cws-s3c-claims`
```
[VOICE — slightly more serious, grounded]

Layer three. Claims discipline.

The guardrail most AI systems skip.

What can you claim? What's verified?
What language is off-limits?

Without this, AI fabricates.
Invents metrics. Makes promises you can't keep.

With this — claims stay grounded.
```

**SFX:** When the fabricated stat gets flagged on screen, a sharp but short alert tone — not alarming, more like a precise "catch." Then a smooth correction sound as it's replaced. Think: error ping → clean resolution tone.

---

#### 3d: Business Profile — `cws-s3d-business`
```
[VOICE — matter-of-fact, confident]

Layer four. Business truth.

Your positioning. Your methodology. Your offers.
The real structure of what you do and how you do it.

So the AI never invents a service you don't offer.
Never misprices your work.
Never misrepresents your process.
```

**SFX:** File card lock-in. The system diagram on screen is now nearly complete — a subtle "accumulation" tone, like layers stacking harmonically.

---

#### 3e: Skills — `cws-s3e-skills`
```
[VOICE — opening up slightly, a touch of pride]

And then — skills.

A skill is a recipe for a specific content type.
LinkedIn post. Cold email. Landing page. Case study.

It defines the structure and rules.
But never the message — that always comes from context.

One system. Any format.
Always you.
```

**SFX:** As different content formats morph on screen (LinkedIn → email → landing page), a quick rhythmic sequence — three soft "mode shift" sounds, like a dial clicking into different positions. Satisfying and precise.
**Ambient:** The warm tone is now fully established. The system is complete. There's a feeling of "arrival."

---

## Section 4: THE TRANSFORMATION (Proof)

### Script ID: `cws-s4-proof`
### Duration: ~15-20 seconds (let the visuals do the heavy lifting here)
### Tone: Simple. Let the proof speak. The narrator steps back.

```
[VOICE — calm, understated]

Same AI. Same prompt. Same model.

The only difference — is context.

[LONG PAUSE — let the before/after visuals play for 8-10 seconds with no voice]
```

### Audio Notes
- **The silence is the point.** After the narrator sets up the frame, the reader needs time to READ the before/after content. Don't narrate over the proof. Let it land visually.
- **SFX during the visual comparison:** Very subtle. A faint "flat" tone under the WITHOUT side. A warmer, cleaner tone under the WITH side. Almost subliminal — the audio should make the WITH side *feel* better without the reader knowing why.
- **Optional:** A very quiet "typing" sound as each content pair appears — reinforcing that both were generated, but one is clearly better.

### ElevenLabs Production Notes
- This is the shortest voice clip. Resist the urge to add more narration. The visual proof is the star here. The voice just frames it.

---

## Section 5: THE QA MOAT

### Script ID: `cws-s5-qa`
### Duration: ~15-20 seconds
### Tone: Precise, professional. Like a quality inspector who's quiet but sharp.

```
[VOICE — steady, precise]

Generate. Verify. Humanize.

Every piece runs through a multi-layer QA pass
before it ships.

Voice alignment.
Claims discipline.
Format compliance.
Humanization.

The system doesn't just write.
It catches what shouldn't ship.
```

### Audio Notes
- **SFX:** Each QA checkmark appearing on screen gets a clean, crisp confirmation sound — a soft tick or subtle chime. Each one is slightly different in pitch (ascending), creating a sense of progress.
- **On the flagged element:** A distinct but non-alarming "attention" sound — different from the checkmarks. Think: a soft pulse instead of a tick. Then as the correction happens in real-time, a smooth "resolution" tone.
- **Ambient:** Clean, controlled. The warmth is still there but the texture is more precise — like a well-run system doing its job.

---

## Section 6: WHO IT'S FOR (ICP Mirror)

### Script ID: `cws-s6-icp`
### Duration: ~30-35 seconds (three panels)
### Tone: Warm, empathetic, direct. Each panel should feel like you're speaking to that specific person. Slight shifts in energy between panels.

```
[VOICE — warm, understanding — addressing solopreneurs]

You're the voice of your brand.
But you can't write everything yourself.

Your Context Writing System means —
AI writes it. You approve it. It sounds like you.
Every time.

[BEAT — 1 second]

[VOICE — slightly more professional, addressing leaders]

Your team is growing. Your content is scaling.
Your voice is starting to drift.

One source of truth. Every channel. Every team member.
Brand voice that scales — without dilution.

[BEAT — 1 second]

[VOICE — pragmatic, direct, addressing agencies]

Every client has a different voice.
You can't keep them all in your head.

Each client gets their own context files.
Quality becomes repeatable. Not generic — calibrated.
```

### Audio Notes
- **SFX:** Each panel transition gets a subtle "shift" sound — like turning a page or a soft focus-pull audio cue. Nothing jarring. Just a breath between audiences.
- **Ambient:** Warm, steady. The system is proven — now we're talking about who benefits. The audio should feel like a conversation, not a presentation.

### ElevenLabs Production Notes
- These three panels could be recorded as ONE continuous take with natural pauses, OR as three separate clips triggered independently on scroll. Three separate clips gives more control over timing. Recommend separate clips.

---

## Section 7: HOW IT WORKS (The Offer)

### Script ID: `cws-s7-offer`
### Duration: ~30-35 seconds
### Tone: Clear, inviting, premium. Not salesy. Like describing a service you're proud of to someone you respect.

```
[VOICE — warm, clear, inviting]

Your system doesn't exist yet.
We build it — with you.

[BEAT]

It starts with a Voice Discovery.
A real conversation — not a form.

We learn how you think. How you speak.
What you'd never say.
And what makes your writing feel like yours.

Then we map your audience, positioning,
and guardrails into structured context files.

We assemble the full system —
voice, audience, claims, skills,
and examples from your best work.

Everything calibrated. Everything connected.

And then — it goes live.
Not as a one-time deliverable.
As infrastructure that gets better over time.
```

### Audio Notes
- **SFX:** As each step appears on screen, a building sequence — each step has a slightly more "complete" sound. Step 1 is a single soft tone. Step 2 adds a harmonic. Step 3 adds another. Step 4 resolves the chord. Like building a chord progression one note at a time.
- **Ambient:** Warm, open, forward-looking. The dark tones from the opening are completely gone. This should feel like possibility.

---

## Section 8: THE CLOSE (Conversion)

### Script ID: `cws-s8-close`
### Duration: ~15-20 seconds
### Tone: Quiet conviction. Not a hard sell. A steady hand extending an invitation. This should feel like the most human moment in the entire piece.

```
[VOICE — quiet, genuine, no performance]

Your voice is worth a system.

Content that sounds like you.
Claims that stay clean.
A voice that scales.

It starts with one conversation.

[SILENCE — 3 seconds. Let the CTA button sit on screen.]
```

### Audio Notes
- **SFX:** As the "empty AI box" from Section 0 reappears — now filled with glowing context files — a soft, warm resolution tone. A full-circle moment. The sound should feel like completion.
- **On the CTA button appearing:** Nothing. Silence. Let the reader sit with the decision. Any audio here would feel like pressure.
- **Ambient:** Fades to near-silence over the last 5 seconds. The piece ends in stillness. The reader is alone with the choice.

### ElevenLabs Production Notes
- "Your voice is worth a system" is the single most important line in the entire piece. It should land like a gift, not a pitch. Quiet. Warm. No upswing. No energy push. Just truth.
- Record 5+ takes of this line. You'll know the right one.

---

## Audio Asset Checklist

### Voice Clips to Record (11 clips)
| ID | Section | Duration | Priority |
|---|---|---|---|
| `cws-s0-hook` | Section 0: Hook | ~20-25s | HIGH |
| `cws-s1-problem` | Section 1: Problem | ~30-35s | HIGH |
| `cws-s2-insight` | Section 2: Insight | ~20-25s | CRITICAL |
| `cws-s3a-voice` | Section 3a: Voice DNA | ~12-15s | MEDIUM |
| `cws-s3b-icp` | Section 3b: Audience | ~12-15s | MEDIUM |
| `cws-s3c-claims` | Section 3c: Claims | ~12-15s | MEDIUM |
| `cws-s3d-business` | Section 3d: Business | ~12-15s | MEDIUM |
| `cws-s3e-skills` | Section 3e: Skills | ~12-15s | MEDIUM |
| `cws-s4-proof` | Section 4: Proof | ~15-20s | HIGH |
| `cws-s5-qa` | Section 5: QA | ~15-20s | MEDIUM |
| `cws-s6-icp` | Section 6: ICP | ~30-35s | MEDIUM |
| `cws-s7-offer` | Section 7: Offer | ~30-35s | HIGH |
| `cws-s8-close` | Section 8: Close | ~15-20s | CRITICAL |

**Total narration: ~4-5 minutes**

### SFX Assets to Create or Source
| ID | Description | Section | Priority |
|---|---|---|---|
| `sfx-typing-generic` | Rapid soft keystrokes / digital pulse | S0 | MEDIUM |
| `sfx-typing-stop` | Abrupt stop of typing | S0 | MEDIUM |
| `sfx-hollow-echo` | Empty/hollow resonance (4 variations) | S1 | LOW |
| `sfx-low-drop` | Low frequency gravity moment | S1 | MEDIUM |
| `sfx-card-lockin` | Magnetic snap + digital confirm | S2, S3 | HIGH |
| `sfx-text-morph` | Typewriter-to-smooth transition | S2 | HIGH |
| `sfx-ambient-shift` | Dark-to-warm ambient transition | S2 | HIGH |
| `sfx-claim-flag` | Sharp precise alert ping | S3c | MEDIUM |
| `sfx-claim-resolve` | Smooth correction/resolution | S3c | MEDIUM |
| `sfx-mode-shift` | Dial click (3 variations) | S3e | MEDIUM |
| `sfx-flat-tone` | Subtle dull tone for WITHOUT side | S4 | LOW |
| `sfx-warm-tone` | Subtle warm tone for WITH side | S4 | LOW |
| `sfx-qa-tick` | Clean confirmation tick (ascending set of 5) | S5 | MEDIUM |
| `sfx-qa-attention` | Soft pulse for flagged element | S5 | MEDIUM |
| `sfx-qa-resolve` | Resolution after correction | S5 | LOW |
| `sfx-panel-shift` | Soft page-turn/focus-pull (3 variations) | S6 | LOW |
| `sfx-chord-build` | 4-note ascending chord progression | S7 | MEDIUM |
| `sfx-box-complete` | Warm resolution — full circle | S8 | HIGH |

### Ambient Beds (2-3 continuous tracks, crossfaded)
| ID | Description | Sections | Duration |
|---|---|---|---|
| `amb-dark-idle` | Low digital hum, uneasy, empty | S0–S1 | ~60-90s |
| `amb-activation` | Transitional — dark to warm | S2 | ~20-30s |
| `amb-warm-system` | Warm, present, clean, forward | S3–S7 | ~120-180s |
| `amb-fade-silence` | Warm fading to stillness | S8 | ~20-30s |

---

## ElevenLabs Workflow

### Recommended Approach
1. **Write final scripts** (above are final — reviewed and refined)
2. **Select or clone voice** — if using your own voice, record a 3-5 min sample for voice cloning. If selecting from the library, audition with the Section 2 script ("What if the AI didn't start from zero?") since it has the widest emotional range.
3. **Generate clips section by section** — don't batch them. Each section has different emotional direction.
4. **Fine-tune per clip:**
   - S0: Lower stability (more deadpan for generic lines)
   - S2: Slightly higher style (the pivot needs subtle emotion)
   - S8: Lowest style setting (pure sincerity, no performance)
5. **Export as individual MP3/WAV files** per script ID
6. **Mix with SFX and ambient** in a DAW or use Howler.js / Web Audio API in the app for dynamic mixing

### In-App Audio Architecture
```
Audio Controller
├── Ambient Layer (continuous, crossfaded)
│   ├── amb-dark-idle
│   ├── amb-activation
│   ├── amb-warm-system
│   └── amb-fade-silence
├── Voice Layer (triggered by scroll position)
│   ├── cws-s0-hook
│   ├── cws-s1-problem
│   ├── ... (one per section)
│   └── cws-s8-close
└── SFX Layer (triggered by specific scroll events)
    ├── sfx-card-lockin (on file card animation)
    ├── sfx-text-morph (on text transformation)
    ├── sfx-qa-tick (on checkmark appearance)
    └── ... (event-driven)
```

### Libraries for Web Audio
- **Howler.js** — best for managing multiple audio sprites, crossfading, volume control. Battle-tested.
- **Tone.js** — overkill unless you want to generate SFX programmatically (which could be cool for the ambient beds)
- **Web Audio API direct** — lightest weight but more manual work for crossfading and timing

**Recommendation:** Howler.js for voice + SFX, with optional Tone.js for procedural ambient generation.

---

## Pitfalls & Traps

1. **Auto-playing audio will get you bounced.** Always default to muted. Show a clear "Enable Audio" affordance. Some users will never turn it on — the visual experience must stand alone.
2. **Scroll-triggered audio timing is hard.** If the user scrolls fast, clips can overlap or get cut off. Build a queue system: if a new clip triggers before the previous one finishes, fade out the old one quickly (200ms) before starting the new one.
3. **Mobile audio is a minefield.** iOS Safari requires a user gesture before any audio plays. Your "Enable Audio" button handles this, but test thoroughly.
4. **File sizes matter.** 4-5 minutes of voice + SFX + ambient could be 15-25MB. Lazy-load audio per section. Don't load Section 8 audio until the user reaches Section 6.
5. **The ambient bed needs seamless looping.** If a user sits on a section reading, the ambient shouldn't audibly restart. Use loop points or generate long enough beds (~3 min per layer).
6. **ElevenLabs voice consistency across clips.** Generate all clips in the same session if possible. If you regenerate one clip later, the voice can drift slightly. Keep your settings locked.
7. **Accessibility.** Provide a full transcript toggle or "Read instead of listen" option. Screen readers can't access scroll-triggered audio. The visual experience must be complete without audio.
