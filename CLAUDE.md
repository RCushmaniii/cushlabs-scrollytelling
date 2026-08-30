# CLAUDE.md — CushLabs Scrollytelling

## Why this matters before you change anything

The scroll-driven story pieces used to show prospects what the work looks like.

**If this breaks:** Sales collateral breaks in front of a prospect. It is public and attributable, and a broken showcase of front-end craft argues against the thing it is meant to prove.

Its risk class and revenue proximity are recorded in `operating-system/portfolio/repo-metadata.json`, and are read from there rather than restated here -- the same rule that governs prices, client facts and platform approvals.
## Project Overview

Production-grade scrollytelling template for cinematic, bilingual pitch decks. Built with Astro 5 + Svelte 5 + Tailwind CSS 3 + MDX. Supports dual-mode interaction: Presentation Mode (scroll-locked, auto-narrated) and Browse Freely (normal scrolling). All configuration driven from `scrollytelling.config.ts`.

## Tech Stack

- Astro 5 (static site generator, islands architecture)
- Svelte 5 (interactive components with runes syntax)
- Tailwind CSS 3 (utility-first styling)
- MDX (content authoring with embedded components)
- TypeScript (strict mode)
- Vercel (static adapter, auto-deploy)

## Project Structure

- `scrollytelling.config.ts` — Master config: colors, fonts, languages, audio, effects
- `src/components/ui/` — Svelte interactive islands (client:load / client:visible)
- `src/components/effects/` — Astro visual effect components (static, no JS)
- `src/components/sections/` — Astro section wrapper components
- `src/layouts/` — Root layout with fixed UI chrome and CSS variable injection
- `src/content/sections/` — MDX files, one per narrative act, bilingual
- `src/lib/` — Shared modules: i18n, audio, scroll, presentation state
- `src/styles/` — CSS: base reset, reveal animations, reduced-motion overrides
- `public/audio/{lang}/` — Narration MP3s organized by language
- `public/images/` — Source images

## Development Commands

```powershell
pnpm install   # Install dependencies
pnpm dev       # Start dev server (localhost:4321)
pnpm build     # Build for production
pnpm preview   # Preview production build
```

## Key Patterns & Conventions

- **Bilingual content:** Use `<span data-lang="en" class="active">` / `<span data-lang="es">` pairs. CSS toggles visibility via `body[data-active-lang]`.
- **Svelte runes:** Components use `$state()`, `$props()`, `$effect()` — Svelte 5 syntax.
- **Reveal animations:** Add `.reveal`, `.reveal-left`, `.reveal-right`, or `.reveal-scale` classes. IntersectionObserver adds/removes `.visible`. Animations repeat on scroll.
- **Stagger delays:** Use `.reveal-delay-1` through `.reveal-delay-8` for sequenced reveals.
- **Astro islands:** Interactive components use `client:load` (immediate) or `client:visible` (lazy). Static components use no client directive.
- **Presentation mode:** Managed by `src/lib/presentation.ts`. Locks scroll, auto-advances sections, plays narration, opens CTA at end.
- **Audio paths:** `/audio/{lang}/{section-id}.mp3` — language code from config, section ID from MDX frontmatter.

## Current Focus

Feature-complete template with presentation mode, bilingual support, audio narration, and all visual effects from the atlas-biodiversidad-pitch reference site.

## Known Issues

- Audio autoplay blocked on mobile until first user interaction (browser policy — handled gracefully)
- `background-attachment: fixed` parallax doesn't work on iOS Safari (falls back to scroll)
- Svelte 5 warnings about deprecated lifecycle functions may appear in dev console

## Environment Setup

No environment variables required. All configuration lives in `scrollytelling.config.ts`.


## Session Log

A running log of all working sessions is maintained at `docs/SESSION_LOG.md`.
Always append a new entry at the top of this file before closing a session.
Use the `session-logger` skill to generate the entry.