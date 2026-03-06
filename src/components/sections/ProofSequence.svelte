<script lang="ts">
  import { onMount } from "svelte";

  let el: HTMLDivElement;
  let lang = $state("en");
  let running = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  // Animation states
  let headlineChars = $state<{ ch: string; done: boolean }[]>([]);
  let headlineDone = $state(false);
  let introChars = $state<{ ch: string; done: boolean }[]>([]);
  let introDone = $state(false);
  let quoteChars = $state<{ ch: string; done: boolean }[]>([]);
  let quoteDone = $state(false);
  let attributionVisible = $state(false);
  let demoVisible = $state(false);

  const BINARY = "01";
  const HEX = "0123456789ABCDEF";
  const GLITCH = "01ABCDEF!@#$%^&*<>/\\|{}[]~";

  const content: Record<string, {
    headline: string;
    intro: string;
    quote: string;
    attribution: string;
    demoTitle: string;
    demoDesc: string;
    demoCta: string;
  }> = {
    en: {
      headline: "Don't take our word for it.",
      intro: "Our first scrollytelling project was a biodiversity conservation pitch for western Mexico. Built as a proof of concept. The result speaks for itself.",
      quote: '"They couldn\'t believe it was a website. They thought it was a professionally produced film. That\'s the reaction you want when you\'re asking for seven figures."',
      attribution: "— Conservation Project Director, Western Mexico",
      demoTitle: "Atlas de Biodiversidad — Live Demo",
      demoDesc: "Full bilingual presentation with narration, presentation mode, scroll animations, species carousel, team section, and investor CTA. Built in one sprint.",
      demoCta: "View Live Demo",
    },
    es: {
      headline: "No confies solo en nuestra palabra.",
      intro: "Nuestro primer proyecto de scrollytelling fue una presentacion de conservacion de biodiversidad para el occidente de Mexico. Construido como prueba de concepto. El resultado habla por si mismo.",
      quote: '"No podian creer que fuera un sitio web. Pensaron que era una pelicula producida profesionalmente. Esa es la reaccion que quieres cuando pides siete cifras."',
      attribution: "— Director de Proyecto de Conservacion, Occidente de Mexico",
      demoTitle: "Atlas de Biodiversidad — Demo en Vivo",
      demoDesc: "Presentacion bilingue completa con narracion, modo presentacion, animaciones de scroll, carrusel de especies, seccion de equipo y CTA para inversores. Construido en un sprint.",
      demoCta: "Ver Demo en Vivo",
    },
  };

  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(() => { if (running) fn(); }, ms);
    timeouts.push(id);
    return id;
  }

  function randChar(set: string): string {
    return set[Math.floor(Math.random() * set.length)];
  }

  function decodeText(
    text: string,
    setter: (chars: { ch: string; done: boolean }[]) => void,
    speed: number,
    onDone?: () => void
  ) {
    const len = text.length;
    let chars: { ch: string; done: boolean }[] = [];
    for (let i = 0; i < len; i++) {
      chars.push({ ch: text[i] === " " ? " " : randChar(BINARY), done: text[i] === " " });
    }
    setter([...chars]);

    let decoded = 0;

    function scramble() {
      if (!running || decoded >= len) return;
      for (let i = decoded; i < len; i++) {
        if (text[i] !== " " && !chars[i].done) {
          const dist = i - decoded;
          if (dist < 3) chars[i] = { ch: randChar(HEX), done: false };
          else if (dist < 8) chars[i] = { ch: randChar(GLITCH), done: false };
          else chars[i] = { ch: randChar(BINARY), done: false };
        }
      }
      setter([...chars]);
      schedule(scramble, 60);
    }
    scramble();

    function decodeTick() {
      if (!running || decoded >= len) {
        for (let i = 0; i < len; i++) chars[i] = { ch: text[i], done: true };
        setter([...chars]);
        onDone?.();
        return;
      }
      const batch = Math.min(1 + Math.floor(Math.random() * 1.5), len - decoded);
      for (let b = 0; b < batch; b++) {
        if (decoded < len) { chars[decoded] = { ch: text[decoded], done: true }; decoded++; }
      }
      setter([...chars]);
      schedule(decodeTick, speed);
    }
    schedule(decodeTick, speed * 4);
  }

  function reset() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    running = false;
    headlineChars = [];
    headlineDone = false;
    introChars = [];
    introDone = false;
    quoteChars = [];
    quoteDone = false;
    attributionVisible = false;
    demoVisible = false;
  }

  function startSequence() {
    reset();
    running = true;
    const c = content[lang];

    schedule(() => {
      decodeText(c.headline, (chars) => (headlineChars = chars), 50, () => {
        headlineDone = true;
        schedule(() => {
          decodeText(c.intro, (chars) => (introChars = chars), 14, () => {
            introDone = true;
            schedule(() => {
              decodeText(c.quote, (chars) => (quoteChars = chars), 10, () => {
                quoteDone = true;
                schedule(() => {
                  attributionVisible = true;
                  schedule(() => { demoVisible = true; }, 500);
                }, 300);
              });
            }, 500);
          });
        }, 500);
      });
    }, 800);
  }

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";

    const mutObs = new MutationObserver(() => {
      const newLang = document.body.dataset.activeLang || "en";
      if (newLang !== lang) { lang = newLang; if (running) startSequence(); }
    });
    mutObs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });

    const intObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) startSequence();
      else reset();
    }, { threshold: 0.1 });
    intObs.observe(el);

    return () => { reset(); mutObs.disconnect(); intObs.disconnect(); };
  });

  // Inline style helpers (Svelte scoped CSS stripped in Astro prod builds for MDX components)
  function charStyle(done: boolean, type: 'headline' | 'text' | 'quote'): string {
    const base = "transition:color 0.15s ease,text-shadow 0.2s ease;";
    if (!done) {
      return base + "font-family:var(--font-mono);color:color-mix(in srgb, var(--color-accent) 8%, transparent);text-shadow:none;";
    }
    switch (type) {
      case 'headline':
        return base + "color:var(--color-accent);text-shadow:0 0 30px color-mix(in srgb, var(--color-accent) 50%, transparent),0 0 60px color-mix(in srgb, var(--color-accent) 20%, transparent);";
      case 'text':
        return base + "color:var(--color-text);";
      case 'quote':
        return base + "color:var(--color-text);text-shadow:0 0 20px color-mix(in srgb, var(--color-accent) 10%, transparent);";
    }
  }
</script>

<div bind:this={el} class="space-y-10">
  <!-- Headline -->
  <div class="max-w-4xl">
    <h2 style="font-family:var(--font-heading);font-size:clamp(1.875rem, 5vw, 3.75rem);font-weight:900;line-height:1.15;min-height:1.5em;color:var(--color-accent);">
      {#if headlineChars.length > 0}
        {#each headlineChars as { ch, done }}
          <span style={charStyle(done, 'headline')}>{ch}</span>
        {/each}
      {/if}
    </h2>
  </div>

  <!-- Intro -->
  <div class="max-w-3xl min-h-[2em]">
    {#if introChars.length > 0}
      <p class="text-xl md:text-2xl leading-relaxed" style="color:var(--color-text);">
        {#each introChars as { ch, done }}
          <span style={charStyle(done, 'text')}>{ch}</span>
        {/each}
      </p>
    {/if}
  </div>

  <!-- Testimonial quote -->
  <div class="max-w-3xl mx-auto pt-6 min-h-[4em]">
    {#if quoteChars.length > 0}
      <div style="position:relative;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 30%, transparent));border-radius:2px;"></div>
        <blockquote class="text-xl md:text-2xl italic leading-relaxed pl-6" style="font-family:var(--font-heading);">
          {#each quoteChars as { ch, done }}
            <span style={charStyle(done, 'quote')}>{ch}</span>
          {/each}
        </blockquote>
      </div>
    {/if}

    {#if attributionVisible}
      <cite class="block mt-6 pl-6 text-sm not-italic" style="color:var(--color-text-muted);animation:fadeSlideUp 0.6s ease-out forwards;">
        {content[lang].attribution}
      </cite>
    {/if}
  </div>

  <!-- Demo callout -->
  <div style={demoVisible
    ? "padding:1.5rem 2rem;border-radius:1rem;border:1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);background:color-mix(in srgb, var(--color-accent) 4%, transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:1;transform:translateY(0);transition:all 0.7s ease;"
    : "padding:1.5rem 2rem;border-radius:1rem;border:1px solid transparent;background:transparent;opacity:0;transform:translateY(20px);transition:all 0.7s ease;"
  }>
    <div class="flex flex-col md:flex-row md:items-center gap-6">
      <div class="flex-1">
        <h3 class="text-xl font-bold mb-2" style="font-family:var(--font-heading);color:var(--color-text);">
          {content[lang].demoTitle}
        </h3>
        <p class="text-sm leading-relaxed" style="color:var(--color-text-muted);">
          {content[lang].demoDesc}
        </p>
      </div>
      <a
        href="https://atlas-biodiversidad-pitch.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-full transition-transform duration-300 hover:scale-105 text-sm"
        style="background:var(--color-accent);color:var(--color-background);"
      >
        {content[lang].demoCta}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
</div>
