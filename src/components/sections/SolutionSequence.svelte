<script lang="ts">
  import { onMount } from "svelte";

  let el: HTMLElement;
  let lang = $state("en");
  let step = $state(0);
  let running = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];
  let rafs: number[] = [];

  // Binary rain background state
  let matrixLines = $state<string[]>([]);
  let matrixVisible = $state(false);
  let matrixFading = $state(false);

  // Decode display states — each block is an array of { char, decoded }
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
        {
          title: "PRESENTATION MODE",
          desc: "One click. Scroll locks, narration plays, sections auto-advance. Your audience watches — no clicking, no fumbling.",
        },
        {
          title: "BILINGUAL BY DEFAULT",
          desc: "English and Spanish, instant toggle. Both browse and presentation mode. One site, two audiences, zero friction.",
        },
        {
          title: "AI NARRATION + SOUND DESIGN",
          desc: "Professional voiceover per section, per language. Ambient soundscapes with crossfade transitions between chapters.",
        },
        {
          title: "CINEMATIC ATMOSPHERE",
          desc: "Film grain. Parallax depth. Ambient particles. Scroll-triggered choreography. Every pixel engineered for impact.",
        },
      ],
    },
    es: {
      headline: "La solucion es el scrollytelling.",
      intro: "No te entregamos una plantilla. CushLabs construye tu presentacion cinematografica de principio a fin — estrategia narrativa a experiencia web inmersiva.",
      features: [
        {
          title: "MODO PRESENTACION",
          desc: "Un clic. El scroll se bloquea, la narracion se reproduce, las secciones avanzan. Tu audiencia solo mira — sin clics, sin complicaciones.",
        },
        {
          title: "BILINGUE POR DEFECTO",
          desc: "Ingles y espanol, cambio instantaneo. Modo navegacion y presentacion. Un sitio, dos audiencias, cero friccion.",
        },
        {
          title: "NARRACION IA + DISENO SONORO",
          desc: "Voz profesional por seccion, por idioma. Paisajes sonoros ambientales con transiciones crossfade entre capitulos.",
        },
        {
          title: "ATMOSFERA CINEMATOGRAFICA",
          desc: "Grano de pelicula. Profundidad parallax. Particulas ambientales. Coreografia activada por scroll. Cada pixel disenado para impactar.",
        },
      ],
    },
  };

  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      if (running) fn();
    }, ms);
    timeouts.push(id);
    return id;
  }

  function randChar(set: string): string {
    return set[Math.floor(Math.random() * set.length)];
  }

  // Generate binary block for background ambiance
  function generateMatrixLines(count: number): string[] {
    const lines: string[] = [];
    for (let i = 0; i < count; i++) {
      let line = "";
      const len = 60 + Math.floor(Math.random() * 60);
      for (let j = 0; j < len; j++) {
        line += Math.random() > 0.6 ? " " : randChar(BINARY);
      }
      lines.push(line);
    }
    return lines;
  }

  // Decode effect: binary → glitch → resolved text
  function decodeText(
    text: string,
    setter: (chars: { ch: string; done: boolean }[]) => void,
    speed: number,
    onDone?: () => void
  ) {
    const len = text.length;
    // Init with binary
    let chars: { ch: string; done: boolean }[] = [];
    for (let i = 0; i < len; i++) {
      chars.push({ ch: text[i] === " " ? " " : randChar(BINARY), done: text[i] === " " });
    }
    setter([...chars]);

    let decoded = 0;
    const scrambleInterval = 60;

    // Scramble undecoded characters
    function scramble() {
      if (!running) return;
      let changed = false;
      for (let i = decoded; i < len; i++) {
        if (text[i] !== " " && !chars[i].done) {
          const dist = i - decoded;
          if (dist < 3) {
            chars[i] = { ch: randChar(HEX), done: false };
          } else if (dist < 8) {
            chars[i] = { ch: randChar(GLITCH), done: false };
          } else {
            chars[i] = { ch: randChar(BINARY), done: false };
          }
          changed = true;
        }
      }
      if (changed) setter([...chars]);
      if (decoded < len) {
        schedule(scramble, scrambleInterval);
      }
    }
    scramble();

    // Progressively decode characters
    function decodeTick() {
      if (!running || decoded >= len) {
        for (let i = 0; i < len; i++) {
          chars[i] = { ch: text[i], done: true };
        }
        setter([...chars]);
        onDone?.();
        return;
      }

      // Decode 1-2 chars per tick (slower, more deliberate)
      const batch = Math.min(1 + Math.floor(Math.random() * 1.5), len - decoded);
      for (let b = 0; b < batch; b++) {
        if (decoded < len) {
          chars[decoded] = { ch: text[decoded], done: true };
          decoded++;
        }
      }
      setter([...chars]);
      schedule(decodeTick, speed);
    }

    schedule(decodeTick, speed * 4); // Longer pause before decode starts
  }

  function reset() {
    timeouts.forEach(clearTimeout);
    rafs.forEach(cancelAnimationFrame);
    timeouts = [];
    rafs = [];
    running = false;
    step = 0;
    headlineChars = [];
    headlineDone = false;
    introChars = [];
    introDone = false;
    matrixLines = [];
    matrixVisible = false;
    matrixFading = false;
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

    // Phase 0: Binary matrix fades in
    matrixLines = generateMatrixLines(16);
    matrixVisible = true;
    step = 1;

    // Phase 1: Headline decodes (20% slower: 35 → 42)
    schedule(() => {
      decodeText(c.headline, (chars) => (headlineChars = chars), 42, () => {
        headlineDone = true;
        // Start fading matrix once headline is resolved
        matrixFading = true;

        // Phase 2: Intro text decodes (20% slower: 12 → 15)
        schedule(() => {
          step = 2;
          decodeText(c.intro, (chars) => (introChars = chars), 15, () => {
            introDone = true;

            // Phase 3: Features decode one by one
            schedule(() => {
              step = 3;
              decodeFeature(0, c);
            }, 600);
          });
        }, 500);
      });
    }, 1000);
  }

  function decodeFeature(idx: number, c: typeof content.en) {
    if (!running || idx >= c.features.length) {
      step = 7;
      return;
    }

    features[idx].visible = true;
    features = [...features];

    // Feature title decode (20% slower: 40 → 48)
    decodeText(
      c.features[idx].title,
      (chars) => {
        features[idx].titleChars = chars;
        features = [...features];
      },
      48,
      () => {
        // Feature desc decode (20% slower: 10 → 12)
        decodeText(
          c.features[idx].desc,
          (chars) => {
            features[idx].descChars = chars;
            features = [...features];
          },
          12,
          () => {
            schedule(() => decodeFeature(idx + 1, c), 400);
          }
        );
      }
    );
  }

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";

    const mutObs = new MutationObserver(() => {
      const newLang = document.body.dataset.activeLang || "en";
      if (newLang !== lang) {
        lang = newLang;
        if (running) startSequence();
      }
    });
    mutObs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });

    const intObs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startSequence();
        } else {
          reset();
        }
      },
      { threshold: 0.1 }
    );
    intObs.observe(el);

    return () => {
      reset();
      mutObs.disconnect();
      intObs.disconnect();
    };
  });
</script>

<div bind:this={el} class="relative space-y-10">
  <!-- Binary matrix background — sits behind everything -->
  {#if matrixVisible}
    <div
      class="matrix-bg absolute inset-0 -inset-x-6 -inset-y-10 overflow-hidden pointer-events-none select-none z-0"
      class:matrix-fade={matrixFading}
    >
      {#each matrixLines as line, i}
        <div
          class="matrix-line font-mono text-[10px] md:text-xs leading-[2] whitespace-nowrap"
          style="animation-delay: {i * 0.2}s"
        >
          {line}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Headline — gold accent when decoded -->
  <div class="relative z-10 max-w-4xl">
    <h2 class="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-tight min-h-[1.5em]">
      {#if headlineChars.length > 0}
        {#each headlineChars as { ch, done }}
          <span
            class="decode-char"
            class:decoded-headline={done}
            class:binary={!done}
          >{ch}</span>
        {/each}
      {/if}
    </h2>
  </div>

  <!-- Intro paragraph — gold accent when decoded -->
  <div class="relative z-10 max-w-3xl min-h-[3em]">
    {#if introChars.length > 0}
      <p class="text-xl md:text-2xl leading-relaxed">
        {#each introChars as { ch, done }}
          <span
            class="decode-char"
            class:decoded-intro={done}
            class:binary={!done}
          >{ch}</span>
        {/each}
      </p>
    {/if}
  </div>

  <!-- Feature blocks -->
  <div class="relative z-10 space-y-4 pt-4">
    {#each features as feature, idx}
      <div
        class="feature-block p-6 rounded-xl border transition-all duration-500"
        class:feature-visible={feature.visible}
        class:feature-hidden={!feature.visible}
      >
        <!-- Feature title -->
        <div class="mb-2 min-h-[1.5em]">
          {#if feature.titleChars.length > 0}
            <h3 class="font-mono text-sm md:text-base tracking-[0.2em]">
              {#each feature.titleChars as { ch, done }}
                <span
                  class="decode-char"
                  class:decoded-accent={done}
                  class:binary={!done}
                >{ch}</span>
              {/each}
            </h3>
          {/if}
        </div>

        <!-- Feature description -->
        <div class="min-h-[1.5em]">
          {#if feature.descChars.length > 0}
            <p class="text-base md:text-lg leading-relaxed">
              {#each feature.descChars as { ch, done }}
                <span
                  class="decode-char"
                  class:decoded={done}
                  class:binary={!done}
                >{ch}</span>
              {/each}
            </p>
          {/if}
        </div>

        <!-- Scan line effect -->
        {#if feature.visible && feature.descChars.some(c => !c.done)}
          <div class="scan-line"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  /* Binary/undecoded characters — dim, sits behind resolved text */
  .decode-char {
    transition: color 0.2s ease, text-shadow 0.3s ease;
  }
  .binary {
    font-family: var(--font-mono);
    color: color-mix(in srgb, var(--color-accent) 12%, transparent);
    text-shadow: none;
  }

  /* Headline decodes in bright gold */
  .decoded-headline {
    color: var(--color-accent);
    text-shadow: 0 0 30px color-mix(in srgb, var(--color-accent) 30%, transparent);
  }

  /* Intro decodes in slightly muted gold */
  .decoded-intro {
    color: color-mix(in srgb, var(--color-accent) 80%, var(--color-text));
    text-shadow: 0 0 15px color-mix(in srgb, var(--color-accent) 15%, transparent);
  }

  /* Feature descriptions decode in light text */
  .decoded {
    color: var(--color-text);
    text-shadow: none;
  }

  /* Feature titles in full accent */
  .decoded-accent {
    color: var(--color-accent);
    text-shadow: 0 0 20px color-mix(in srgb, var(--color-accent) 25%, transparent);
  }

  /* Matrix background lines — very dim, pure background */
  .matrix-bg {
    opacity: 1;
    transition: opacity 3s ease;
  }
  .matrix-bg.matrix-fade {
    opacity: 0;
  }
  .matrix-line {
    color: color-mix(in srgb, var(--color-accent) 6%, transparent);
    animation: matrixPulse 5s ease-in-out infinite alternate;
  }
  @keyframes matrixPulse {
    0% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  /* Feature blocks */
  .feature-hidden {
    opacity: 0;
    transform: translateY(20px);
    border-color: transparent;
    background: transparent;
  }
  .feature-visible {
    opacity: 1;
    transform: translateY(0);
    border-color: color-mix(in srgb, var(--color-accent) 12%, transparent);
    background: color-mix(in srgb, var(--color-accent) 3%, transparent);
  }

  /* Horizontal scan line on active decode */
  .scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-accent),
      transparent
    );
    opacity: 0.3;
    animation: scanMove 2.5s ease-in-out infinite;
  }
  @keyframes scanMove {
    0% { top: 20%; }
    50% { top: 80%; }
    100% { top: 20%; }
  }

  .feature-block {
    position: relative;
    overflow: hidden;
  }
</style>
