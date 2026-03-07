# ElevenLabs Narration Tips — Pacing, Tags & Delivery

## Status: Active Reference for Audio Production

---

## Key Principle: Let Punctuation Do the Work

Remove most pacing directive tags. Use **sentence rhythm and punctuation** instead
of artificial pause tags. This produces faster, more natural delivery that sounds
like documentary narration rather than a voice reading stage directions.

### Before (over-tagged):

```text
[serious tone] Here's the truth nobody wants to hear. [pause]

Your pitch deck — the one you spent weeks on — [deliberate] is probably getting
skipped. [long pause]

[matter-of-factly] Investors see HUNDREDS of decks a month. Most are twelve slides
in a Google doc [short pause] that look exactly like the last twelve they saw. [pause]
```

### After (clean pacing):

```text
Here's the truth nobody wants to hear.

Your pitch deck — the one you spent weeks on — is probably getting skipped.

Investors see hundreds of decks every month. Most are twelve slides in a Google doc
that look exactly like the last twelve they saw.
```

---

## Why Clean Pacing Works Better

### 1. Faster delivery

No artificial tags forcing long pauses. The voice model reads naturally.

### 2. Strong emphasis built into structure

Two short sentences create a natural dramatic beat:

```text
That's the gap.
And it's costing you deals.
```

### 3. Better narrator rhythm

The flow follows documentary/trailer voiceover structure:

```text
Hook
  ↓
Problem
  ↓
Evidence
  ↓
Tension
  ↓
Conclusion
```

---

## When to Use v3 Audio Tags

Use tags sparingly and only for genuine vocal effects the model supports:

**Good uses:**
- `[sighs]` — before a weary or resigned line
- `[exhales]` — subtle breath before an opening line
- `[whispers]` — for intimate/conspiratorial moments
- `[laughs]` — genuine laughter

**Bad uses (remove these):**
- `[deliberate]`, `[serious tone]`, `[matter-of-factly]` — not real tags
- `[pause]`, `[short pause]`, `[long pause]` — use ellipses or line breaks
- `[stress on next word]` — use CAPS instead
- `[slows down]`, `[confident]`, `[warmly]` — not supported

---

## Numbers: Always Spell Out

Write numbers as words for smoother narration:

| Do this | Not this |
|---------|----------|
| ninety-two percent | 92% |
| three times | 3x |
| five seconds | 5 seconds |
| seven figures | 7 figures |

---

## Emphasis Techniques (v3)

| Technique | Effect |
|-----------|--------|
| CAPS | Increases emphasis on a word |
| Ellipses (...) | Adds pauses and weight |
| Em dashes (—) | Natural mid-sentence pause |
| Short sentences | Dramatic beats |
| Line breaks | Breathing room between thoughts |

---

## Script Structure for Cinematic Narration

Each section should follow a clear emotional arc:

```
Opening hook (grab attention)
    ↓
Context (set the scene)
    ↓
Evidence/tension (build the case)
    ↓
Payoff (land the point)
```

Keep sentences **short to medium length**. Avoid compound sentences with multiple
clauses — they sound rushed and breathless when narrated.

---

## ElevenLabs v3 Supported Audio Tags Reference

### Voice/Emotion:
`[laughs]`, `[laughs harder]`, `[starts laughing]`, `[wheezing]`,
`[whispers]`, `[sighs]`, `[exhales]`, `[sarcastic]`, `[curious]`,
`[excited]`, `[crying]`, `[snorts]`, `[mischievously]`

### Sound Effects:
`[gunshot]`, `[applause]`, `[clapping]`, `[explosion]`,
`[swallows]`, `[gulps]`

### Special/Experimental:
`[strong X accent]` (replace X with desired accent),
`[sings]`, `[woo]`

### Notes:
- Tag effectiveness depends on the voice and its training samples
- Don't expect a whispering voice to shout convincingly
- Test thoroughly before production use
- Tags can be combined for complex emotional delivery
