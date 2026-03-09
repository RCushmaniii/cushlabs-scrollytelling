/**
 * Master configuration for the scrollytelling template.
 * Edit this file to customize colors, fonts, languages, and site metadata.
 * Tailwind, Astro layout, and Svelte components all read from here.
 */

export const config = {
  site: {
    title: "CushLabs Scrollytelling",
    description: "A cinematic scrollytelling pitch deck",
    url: "https://scrollytelling.cushlabs.ai",
  },

  colors: {
    primary: "#0D3B2E",       // Deep forest green
    secondary: "#1A6B4A",     // Emerald
    accent: "#F5C542",        // Gold
    background: "#0A0A0A",    // Near-black
    surface: "#0A0A0A",       // Same as background — no shade difference
    text: "#F0EDE6",          // Warm white
    textMuted: "#A0998C",     // Muted warm gray
  },

  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap",
  },

  languages: [
    { code: "en", label: "English", default: true },
    { code: "es", label: "Espanol" },
  ],

  audio: {
    enabled: true,
    ambientVolume: 0.3,
    narrationVolume: 0.8,
    crossfadeDuration: 1000, // ms
  },

  effects: {
    fireflies: true,
    grain: true,
    parallax: true,
  },

  scrollReveal: {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  },
} as const;

export type ScrollytellingConfig = typeof config;
