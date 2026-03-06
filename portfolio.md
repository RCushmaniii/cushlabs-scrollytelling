---
# =============================================================================
# PORTFOLIO.MD — CushLabs Scrollytelling
# =============================================================================
portfolio_enabled: true
portfolio_priority: 3
portfolio_featured: true
portfolio_last_reviewed: "2026-03-06"

title: "CushLabs Scrollytelling Template"
tagline: "Cinematic, bilingual scrollytelling pitch decks that feel like cinema — not slides"
slug: "cushlabs-scrollytelling"

category: "Templates"
target_audience: "Founders, consultants, and agencies who need pitch decks that win attention"
tags:
  - "scrollytelling"
  - "pitch-deck"
  - "astro"
  - "svelte"
  - "bilingual"
  - "presentation-mode"
  - "cinematic"
  - "tailwind-css"

thumbnail: "/images/scrollytelling-thumbnail.jpg"
hero_images:
  - "/images/scrollytelling-hero.jpg"
  - "/images/scrollytelling-presentation-mode.jpg"
  - "/images/scrollytelling-mobile.jpg"
demo_video_url: ""

live_url: "https://cushlabs-scrollytelling.vercel.app"
demo_url: "https://cushlabs-scrollytelling.vercel.app"
case_study_url: ""

problem_solved: |
  Traditional pitch decks are forgettable — investors see hundreds of slide-based
  presentations every month. Scrollytelling pitch decks combine the narrative power
  of cinema with the interactivity of the web, creating presentations that leave a
  lasting impression. This template makes that accessible without writing 3,000 lines
  of HTML from scratch every time.

key_outcomes:
  - "Full presentation mode with auto-narration and scroll-lock — no manual clicking"
  - "Instant EN/ES language switching in both browse and presentation modes"
  - "Config-driven customization — new pitch deck in hours, not days"
  - "98 Lighthouse performance score with Astro islands architecture"
  - "Mobile-responsive with scroll-snap carousels and touch support"
  - "Accessible: reduced-motion, ARIA labels, keyboard navigation"

tech_stack:
  - "Astro 5"
  - "Svelte 5"
  - "Tailwind CSS 3"
  - "MDX"
  - "TypeScript"
  - "Vercel"
  - "IntersectionObserver API"
  - "Web Audio API"

complexity: "Production"
---

## Overview

CushLabs Scrollytelling is a production-grade template for building cinematic, bilingual
pitch decks as scrollytelling websites. Born from the atlas-biodiversidad-pitch project — a
single 3,000-line HTML file that worked brilliantly but couldn't be reused — this template
extracts every feature into a configurable, component-driven Astro architecture.

The template ships with two interaction modes: a free-browse scrolling experience and a
presentation mode that locks scroll, auto-advances through sections, and plays synchronized
narration. Both modes support instant language switching between English and Spanish
(extensible to any number of languages).

Everything is driven from a single `scrollytelling.config.ts` file — colors, fonts,
languages, audio settings, and visual effects. New pitch decks are created by editing
config and writing MDX content files, without touching CSS or JavaScript internals.

## The Challenge

- **Pitch decks are forgettable:** 92% of investors say storytelling influences their
  decision, yet most pitches are static slides that fail to create emotional connection
- **Custom scrollytelling is expensive:** Building a cinematic web experience from scratch
  takes weeks and produces a one-off that can't be reused for the next client
- **Bilingual audiences need instant switching:** Route-based i18n breaks the immersive
  flow — users need to toggle languages without page reloads or losing their place
- **Presentation vs self-guided:** Some contexts need auto-play narration (board meetings),
  others need free exploration (investor due diligence) — one site must serve both

## The Solution

**Component architecture with Astro islands:**
Svelte components handle only interactive elements (language toggle, audio controls,
animated counters). Everything else renders as static HTML/CSS for near-instant loading.

**Dual-mode experience:**
An opening overlay lets users choose "Play Presentation" (scroll-locked, auto-narrated)
or "Browse Freely" (normal scrolling). Both modes work in all supported languages.

**Config-driven theming:**
One TypeScript config file drives Tailwind colors, Astro layout variables, and Svelte
component behavior. Swap colors and fonts without touching a single component file.

**MDX content authoring:**
Each narrative section is a standalone MDX file with bilingual content blocks. Svelte
components (counters, carousels) can be embedded directly in markdown.

## Technical Highlights

- **Presentation mode engine:** Scroll-lock, auto-advance, narration sync with crossfade
  transitions and ambient audio intro — all coordinated through a central state machine
- **CSS-first reveal system:** IntersectionObserver adds/removes `.visible` classes, keeping
  JS bundle tiny while supporting repeatable animations on scroll
- **Data-lang CSS toggle:** All bilingual content in the DOM simultaneously, toggled via
  CSS selectors on `body[data-active-lang]` — instant switching, works offline
- **Ambient audio system:** Rain/ambient intro fades to section narration, language-aware
  audio paths, preload on first interaction to respect autoplay policies
- **Mobile carousels:** Grid on desktop, `scroll-snap` with dot navigation on mobile,
  auto-cycling during presentation mode narration segments

## Results

**For the End User:**
- New pitch deck can be configured and content-authored in a single afternoon
- Presentation mode eliminates the need for separate slideshow tools
- Bilingual support opens Latin American and US markets from a single deployment

**Technical Demonstration:**
- Astro islands architecture achieving near-zero JS for static content
- Complex state coordination (presentation mode, audio, language, scroll) without a
  heavy framework
- Production template design: config-driven, component-based, documented, deployable
