<script lang="ts">
  import { onMount } from "svelte";
  import { presentationState } from "@/lib/presentation";

  let el: HTMLElement;
  let lang = $state("en");
  let presenting = $state(false);
  let step = $state(0);
  let running = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  let headlineChars = $state<{ ch: string; done: boolean }[]>([]);
  let headlineDone = $state(false);
  let introChars = $state<{ ch: string; done: boolean }[]>([]);
  let introDone = $state(false);
  let features = $state<
    { titleChars: { ch: string; done: boolean }[]; descChars: { ch: string; done: boolean }[]; visible: boolean }[]
  >([
    { titleChars: [], descChars: [], visible: false },
    { titleChars: [], descChars: [], visible: false },
    { titleChars: [], descChars: [], visible: false },
    { titleChars: [], descChars: [], visible: false },
  ]);

  const BINARY = "01";
  const HEX = "0123456789ABCDEF";
  const GLITCH = "01ABCDEF!@#$%^&*<>/\\|{}[]~";

  const content: Record<string, {
    headline: string;
    intro: string;
    features: { title: string; desc: string }[];
  }> = {
    en: {
      headline: "The solution is scrollytelling.",
      intro: "We don't hand you a template. CushLabs builds your cinematic presentation end-to-end — narrative strategy to immersive web experience.",
      features: [
        { title: "PRESENTATION MODE", desc: "One click. Scroll locks, narration plays, sections auto-advance. Your audience watches — no clicking, no fumbling." },
        { title: "BILINGUAL BY DEFAULT", desc: "English and Spanish, instant toggle. Both browse and presentation mode. One site, two audiences, zero friction." },
        { title: "AI NARRATION + SOUND DESIGN", desc: "Professional voiceover per section, per language. Ambient soundscapes with crossfade transitions between chapters." },
        { title: "CINEMATIC ATMOSPHERE", desc: "Film grain. Parallax depth. Ambient particles. Scroll-triggered choreography. Every pixel engineered for impact." },
      ],
    },
    es: {
      headline: "La solucion es el scrollytelling.",
      intro: "No te entregamos una plantilla. CushLabs construye tu presentacion cinematografica de principio a fin — estrategia narrativa a experiencia web inmersiva.",
      features: [
        { title: "MODO PRESENTACION", desc: "Un clic. El scroll se bloquea, la narracion se reproduce, las secciones avanzan. Tu audiencia solo mira — sin clics, sin complicaciones." },
        { title: "BILINGUE POR DEFECTO", desc: "Ingles y espanol, cambio instantaneo. Modo navegacion y presentacion. Un sitio, dos audiencias, cero friccion." },
        { title: "NARRACION IA + DISENO SONORO", desc: "Voz profesional por seccion, por idioma. Paisajes sonoros ambientales con transiciones crossfade entre capitulos." },
        { title: "ATMOSFERA CINEMATOGRAFICA", desc: "Grano de pelicula. Profundidad parallax. Particulas ambientales. Coreografia activada por scroll. Cada pixel disenado para impactar." },
      ],
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
      if (!running) return;
      let changed = false;
      for (let i = decoded; i < len; i++) {
        if (text[i] !== " " && !chars[i].done) {
          const dist = i - decoded;
          if (dist < 3) chars[i] = { ch: randChar(HEX), done: false };
          else if (dist < 8) chars[i] = { ch: randChar(GLITCH), done: false };
          else chars[i] = { ch: randChar(BINARY), done: false };
          changed = true;
        }
      }
      if (changed) setter([...chars]);
      if (decoded < len) schedule(scramble, 60);
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
    step = 0;
    headlineChars = [];
    headlineDone = false;
    introChars = [];
    introDone = false;
    features = [
      { titleChars: [], descChars: [], visible: false },
      { titleChars: [], descChars: [], visible: false },
      { titleChars: [], descChars: [], visible: false },
      { titleChars: [], descChars: [], visible: false },
    ];
  }

  function startSequence() {
    reset();
    running = true;
    const c = content[lang];
    step = 1;

    schedule(() => {
      decodeText(c.headline, (chars) => (headlineChars = chars), 55, () => {
        headlineDone = true;
        schedule(() => {
          step = 2;
          decodeText(c.intro, (chars) => (introChars = chars), 20, () => {
            introDone = true;
            schedule(() => { step = 3; decodeFeature(0, c); }, 800);
          });
        }, 700);
      });
    }, 1200);
  }

  function decodeFeature(idx: number, c: typeof content.en) {
    if (!running || idx >= c.features.length) {
      step = 7;
      return;
    }
    features[idx].visible = true;
    features = [...features];
    decodeText(c.features[idx].title, (chars) => { features[idx].titleChars = chars; features = [...features]; }, 60, () => {
      decodeText(c.features[idx].desc, (chars) => { features[idx].descChars = chars; features = [...features]; }, 16, () => {
        schedule(() => decodeFeature(idx + 1, c), 500);
      });
    });
  }

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";

    const unsub = presentationState.subscribe((s) => { presenting = s === "presenting"; });

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

    return () => { reset(); unsub(); mutObs.disconnect(); intObs.disconnect(); };
  });

  function charStyle(done: boolean, type: 'headline' | 'intro' | 'accent' | 'text'): string {
    const base = "transition:color 0.15s ease,text-shadow 0.2s ease;";
    if (!done) {
      return base + "font-family:var(--font-mono);color:color-mix(in srgb, var(--color-accent) 8%, transparent);text-shadow:none;";
    }
    switch (type) {
      case 'headline':
        return base + "color:var(--color-accent);text-shadow:0 0 30px color-mix(in srgb, var(--color-accent) 50%, transparent),0 0 60px color-mix(in srgb, var(--color-accent) 20%, transparent);";
      case 'intro':
        return base + "color:var(--color-accent);text-shadow:0 0 20px color-mix(in srgb, var(--color-accent) 30%, transparent);";
      case 'accent':
        return base + "color:var(--color-accent);text-shadow:0 0 15px color-mix(in srgb, var(--color-accent) 25%, transparent);";
      case 'text':
        return base + "color:var(--color-text);";
    }
  }

  function featureStyle(visible: boolean): string {
    const base = "position:relative;overflow:hidden;padding:1.5rem;border-radius:0.75rem;border:1px solid transparent;transition:all 0.5s ease;";
    if (!visible) {
      return base + "opacity:0;transform:translateY(20px);border-color:transparent;background:transparent;";
    }
    return base + "opacity:1;transform:translateY(0);border-color:color-mix(in srgb, var(--color-accent) 30%, transparent);background:rgba(245,197,66,0.04);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);";
  }
</script>

<div bind:this={el}>
  <!-- Headline -->
  <div class="max-w-4xl mb-10">
    <h2 style="font-family:var(--font-heading);font-size:clamp(1.875rem, 5vw, 3.75rem);font-weight:900;line-height:1.15;min-height:1.5em;color:var(--color-accent);">
      {#if headlineChars.length > 0}
        {#each headlineChars as { ch, done }}
          <span style={charStyle(done, 'headline')}>{ch}</span>
        {/each}
      {/if}
    </h2>
  </div>

  <!-- Intro -->
  <div class="max-w-3xl min-h-[3em] mb-10">
    {#if introChars.length > 0}
      <p style="font-size:clamp(1.25rem, 2.5vw, 1.5rem);line-height:1.6;font-weight:600;color:var(--color-accent);">
        {#each introChars as { ch, done }}
          <span style={charStyle(done, 'intro')}>{ch}</span>
        {/each}
      </p>
    {/if}
  </div>

  <!-- Feature blocks -->
  <div class="space-y-4">
    {#each features as feature, idx}
      <div style={featureStyle(feature.visible)}>
        <div class="mb-2 min-h-[1.5em]">
          {#if feature.titleChars.length > 0}
            <h3 style="font-family:var(--font-mono);font-size:clamp(0.8rem, 1.5vw, 1rem);letter-spacing:0.2em;color:var(--color-accent);">
              {#each feature.titleChars as { ch, done }}
                <span style={charStyle(done, 'accent')}>{ch}</span>
              {/each}
            </h3>
          {/if}
        </div>
        {#if !presenting}
        <div class="min-h-[1.5em]">
          {#if feature.descChars.length > 0}
            <p style="font-size:clamp(1rem, 1.8vw, 1.125rem);line-height:1.6;color:var(--color-text);">
              {#each feature.descChars as { ch, done }}
                <span style={charStyle(done, 'text')}>{ch}</span>
              {/each}
            </p>
          {/if}
        </div>
        {/if}
        {#if feature.visible && feature.descChars.some(c => !c.done)}
          <div style="position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--color-accent),transparent);opacity:0.3;animation:scanMove 2.5s ease-in-out infinite;"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>
