# Master Timeline Architecture — Scroll-Synced Audio & Animation

## Status: Future Enhancement (Not Yet Implemented)

This document captures the architectural pattern used by high-end storytelling sites
(Apple product pages, interactive documentaries) for perfectly synchronized
scroll + audio + animation experiences.

---

## The Core Idea: One Master Timeline

Instead of separate systems for scroll, audio, and animation, everything references
one master progress value.

**Current architecture (what we have):**

```
scroll → animation (IntersectionObserver)
audio → separate timer (presentation mode auto-advance)
text → separate timer (CSS animation delays)
```

**Target architecture:**

```
scroll progress
      |
master timeline
      |
audio + text + animation
```

Everything moves together. Scrolling literally scrubs through the story like a
video editor timeline.

---

## Implementation Pattern (GSAP + ScrollTrigger)

### Page Structure

```html
<section class="panel" id="intro">
  <p class="line">I'm Robert from CushLabs.</p>
</section>

<section class="panel" id="demo">
  <p class="line">What you're about to experience isn't a slide deck.</p>
</section>
```

### Scroll Timeline

```javascript
gsap.registerPlugin(ScrollTrigger);

let tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".panel",
    start: "top top",
    end: "+=3000",
    scrub: true,  // Links scroll position directly to timeline progress
    pin: true
  }
});
```

The `scrub` setting is the key — it links scroll position directly to timeline progress.

### Audio Sync to Scroll

```javascript
ScrollTrigger.create({
  trigger: ".panel",
  start: "top top",
  end: "+=3000",
  scrub: true,
  onUpdate: (self) => {
    narration.currentTime = narration.duration * self.progress;
  }
});
```

Result: `scroll position → audio time`. If the user scrolls backward, audio rewinds too.

### Text Highlights

```javascript
tl.to("#intro .line", { opacity: 1 })
  .to("#demo .line", { opacity: 1 })
  .to("#story .line", { opacity: 1 });
```

```css
.line {
  opacity: 0.3;
  transition: opacity 0.4s ease;
}
```

Highlighted lines fade in exactly when the timeline reaches them.

---

## Pro Techniques

### Section Pinning

Freeze the screen while the story unfolds within a section.

```javascript
pin: true
```

### Parallax Storytelling

Different layers move at different speeds, creating depth.

### Audio Atmospheres

Background music fades as narration starts — crossfade controlled by timeline position.

### Text Stagger Effects

```javascript
gsap.from(".line", {
  opacity: 0,
  y: 30,
  stagger: 0.3
});
```

---

## Why This Matters

Normal websites: `scroll → reveal elements`
Storytelling sites: `scroll → control time`

The experience feels cinematic and intentional because the user is scrubbing through
a story, not just scrolling past content.

---

## Browser Constraint

Audio autoplay is blocked until user interaction. Narration must be triggered after
the first click or scroll event. Our current presentation mode overlay handles this
naturally (user clicks "Play Presentation" first).

---

## Migration Path from Current Architecture

Our current system uses:
- `IntersectionObserver` for scroll-triggered reveals
- `presentation.ts` for auto-advance mode with narration sync
- CSS `@keyframes` for animations with fixed delays

To migrate to a master timeline:
1. Add GSAP + ScrollTrigger as dependencies
2. Replace IntersectionObserver reveals with ScrollTrigger-driven animations
3. Sync narration `currentTime` to scroll progress instead of auto-play
4. Pin sections during their narrative beat
5. Presentation mode becomes "auto-scroll the timeline" rather than "auto-advance sections"

This is a significant refactor but the payoff is Apple-level synchronization.

---

## Future Product Idea

**AI-generated narrated scrollytelling**: user uploads a PDF or CV, AI generates
narration, the site automatically builds the scrolling story. This is the natural
evolution of the scrollytelling platform concept and could become a standalone product.
