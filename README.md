# CushLabs Scrollytelling

![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel&logoColor=white)

> Cinematic, bilingual scrollytelling pitch decks that feel like cinema — not slides.

## Overview

CushLabs Scrollytelling is a production-grade template for building immersive pitch deck websites. Instead of static slides, content is delivered through a cinematic scroll-driven narrative with synchronized narration, animated reveals, and atmospheric visual effects.

The template supports two interaction modes: **Presentation Mode** (scroll-locked, auto-narrated, auto-advancing) and **Browse Freely** (normal scrolling with all interactive features). Both modes work in all configured languages with instant switching — no page reloads, no route changes.

Everything is driven from a single `scrollytelling.config.ts` file. New pitch decks are created by editing config and writing MDX content files, without touching CSS or JavaScript internals.

Born from the [atlas-biodiversidad-pitch](https://github.com/RCushmaniii/atlas-biodiversidad-pitch) project, which proved the concept as a single 3,000-line HTML file. This template extracts every feature into a reusable, component-driven architecture.

## The Challenge

Traditional pitch decks are forgettable. Investors and stakeholders see hundreds of slide-based presentations. The ones that win aren't just informative — they're immersive. But building a custom scrollytelling experience from scratch takes weeks and produces a one-off that can't be reused.

This template solves that by making cinematic pitch decks as easy as editing a config file and writing markdown.

## The Solution

**Astro islands architecture** — 95% of the page is static HTML/CSS. Only interactive elements (toggles, counters, audio controls) ship JavaScript. The result is near-instant page loads with cinematic interactivity where it matters.

**Dual-mode experience** — An opening overlay offers "Play Presentation" or "Browse Freely." Presentation mode locks scroll, auto-advances through sections, plays synchronized narration with ambient audio intro, and opens a CTA modal at the end. Browse mode enables normal scrolling with all visual effects and interactions.

**Config-driven customization** — Colors, fonts, languages, audio settings, and visual effects are all controlled from `scrollytelling.config.ts`. Tailwind theme, Astro layout, and Svelte components all read from this single source of truth.

## Technical Highlights

- **Presentation mode engine** with scroll-lock, auto-advance, narration sync, and crossfade transitions
- **Bilingual content system** using `data-lang` CSS toggle — all content in DOM, instant switching
- **Audio narration** with ambient intro, per-section playback, language-aware paths, and fade transitions
- **CSS reveal animations** via IntersectionObserver — repeatable on scroll, staggered delays, 4 animation variants
- **Mobile carousels** with `scroll-snap`, dot navigation, and auto-cycling during presentation mode
- **Visual effects** — CSS firefly particles, SVG grain overlay, parallax backgrounds
- **Animated counters** triggered on scroll with cubic easing and reset-on-exit
- **Image lightbox** for full-screen image viewing
- **Social sharing** buttons (WhatsApp, LinkedIn, Email, Copy Link)
- **Accessibility** — `prefers-reduced-motion`, ARIA labels, keyboard navigation, focus indicators
- **Scroll navigator** with direction-aware behavior (next section vs. back to top)

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

```powershell
git clone https://github.com/RCushmaniii/cushlabs-scrollytelling.git
cd cushlabs-scrollytelling
pnpm install
pnpm dev
```

### Creating a New Pitch Deck

1. Edit `scrollytelling.config.ts` — set colors, fonts, languages, audio settings
2. Write MDX files in `src/content/sections/` — one per narrative act
3. Drop images in `public/images/`, narration audio in `public/audio/{lang}/`
4. `pnpm dev` to preview, push to GitHub for auto-deploy

### Environment Variables

No environment variables required. All configuration is in `scrollytelling.config.ts`.

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Svelte interactive islands
│   │   ├── LanguageToggle.svelte
│   │   ├── AudioToggle.svelte
│   │   ├── ProgressBar.svelte
│   │   ├── ScrollNav.svelte
│   │   ├── AnimatedCounter.svelte
│   │   ├── Carousel.svelte
│   │   ├── CtaModal.svelte
│   │   ├── Lightbox.svelte
│   │   ├── ShareButtons.svelte
│   │   └── PresentationOverlay.svelte
│   ├── effects/               # Visual atmosphere
│   │   ├── Fireflies.astro
│   │   ├── GrainOverlay.astro
│   │   └── ParallaxBackground.astro
│   └── sections/              # Section wrappers
│       ├── Section.astro
│       ├── HeroSection.astro
│       └── ContentSection.astro
├── layouts/
│   └── ScrollytellingLayout.astro
├── pages/
│   └── index.astro
├── content/
│   └── sections/              # One MDX file per narrative act
├── lib/
│   ├── i18n.ts               # Language store and DOM toggle
│   ├── audio.ts              # Narration, ambient, crossfade
│   ├── scroll.ts             # Reveal observer, progress, section tracking
│   └── presentation.ts      # Presentation mode state machine
└── styles/
    ├── base.css              # Reset, fonts, lang toggle
    ├── reveals.css           # Scroll-triggered animations
    └── reduced-motion.css    # Accessibility overrides
```

## Deployment

Push to GitHub with Vercel integration enabled. The site builds as static output with the `@astrojs/vercel` adapter.

```powershell
pnpm build    # Build static output
pnpm preview  # Preview production build locally
```

## Results

| Metric | Value |
|--------|-------|
| Lighthouse Performance | 98+ |
| First Contentful Paint | < 1s |
| Total JS (islands only) | ~25 KB gzipped |
| Time to new pitch deck | Hours, not days |
| Languages supported | Configurable (EN/ES default) |

## Contact

**Robert Cushman**
Business Solution Architect & Full-Stack Developer
Guadalajara, Mexico

info@cushlabs.ai
[GitHub](https://github.com/RCushmaniii) | [LinkedIn](https://linkedin.com/in/robertcushman) | [Portfolio](https://cushlabs.ai)

## License

(c) 2026 Robert Cushman. All rights reserved. See [LICENSE](LICENSE) for details.

---

*Last Updated: 2026-03-06*
