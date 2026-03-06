<script lang="ts">
  import { onMount } from "svelte";

  let el: HTMLElement;
  let matrixCanvas: HTMLCanvasElement;
  let lang = $state("en");
  let step = $state(0);
  let running = $state(false);
  let matrixRunning = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];
  let rafs: number[] = [];

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

  // ── Matrix Rain (canvas-based) ──
  function startMatrixRain() {
    if (!matrixCanvas || matrixRunning) return;
    matrixRunning = true;

    const ctx = matrixCanvas.getContext("2d")!;
    const fontSize = 14;
    const chars = "01";

    function resize() {
      const rect = el.getBoundingClientRect();
      matrixCanvas.width = rect.width;
      matrixCanvas.height = rect.height;
    }
    resize();

    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0).map(() => Math.random() * -50);

    // Get the accent color from CSS vars
    const style = getComputedStyle(el);
    const accent = style.getPropertyValue("--color-accent").trim() || "#F5C542";

    function draw() {
      if (!matrixRunning) return;

      // Semi-transparent black to create trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.06)";
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright head character
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.12;
        ctx.fillText(char, x, y);

        // Dimmer trail
        ctx.globalAlpha = 0.04;
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);

        // Move drop down
        drops[i]++;

        // Reset drop to top randomly after it passes bottom
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }

      ctx.globalAlpha = 1;
      const raf = requestAnimationFrame(draw);
      rafs.push(raf);
    }

    draw();
  }

  function stopMatrixRain() {
    matrixRunning = false;
  }

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

  // Decode effect: binary → glitch → resolved text
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
    const scrambleInterval = 60;

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

    function decodeTick() {
      if (!running || decoded >= len) {
        for (let i = 0; i < len; i++) {
          chars[i] = { ch: text[i], done: true };
        }
        setter([...chars]);
        onDone?.();
        return;
      }

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

    schedule(decodeTick, speed * 4);
  }

  function reset() {
    timeouts.forEach(clearTimeout);
    rafs.forEach(cancelAnimationFrame);
    timeouts = [];
    rafs = [];
    running = false;
    stopMatrixRain();
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
    // Clear canvas
    if (matrixCanvas) {
      const ctx = matrixCanvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
  }

  function startSequence() {
    reset();
    running = true;
    const c = content[lang];
    step = 1;

    // Start matrix rain immediately
    startMatrixRain();

    // Phase 1: Headline decodes
    schedule(() => {
      decodeText(c.headline, (chars) => (headlineChars = chars), 55, () => {
        headlineDone = true;

        // Phase 2: Intro text decodes
        schedule(() => {
          step = 2;
          decodeText(c.intro, (chars) => (introChars = chars), 20, () => {
            introDone = true;

            // Phase 3: Features decode one by one
            schedule(() => {
              step = 3;
              decodeFeature(0, c);
            }, 800);
          });
        }, 700);
      });
    }, 1200);
  }

  function decodeFeature(idx: number, c: typeof content.en) {
    if (!running || idx >= c.features.length) {
      step = 7;
      // Fade out matrix rain after all features done
      stopMatrixRain();
      return;
    }

    features[idx].visible = true;
    features = [...features];

    decodeText(
      c.features[idx].title,
      (chars) => {
        features[idx].titleChars = chars;
        features = [...features];
      },
      60,
      () => {
        decodeText(
          c.features[idx].desc,
          (chars) => {
            features[idx].descChars = chars;
            features = [...features];
          },
          16,
          () => {
            schedule(() => decodeFeature(idx + 1, c), 500);
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
  <!-- Matrix rain canvas — absolute behind everything -->
  <canvas
    bind:this={matrixCanvas}
    class="matrix-canvas"
  ></canvas>

  <!-- Headline — bold bright gold when decoded -->
  <div class="relative z-10 max-w-4xl">
    <h2 class="font-heading text-3xl md:text-5xl lg:text-6xl font-black leading-tight min-h-[1.5em]">
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

  <!-- Intro paragraph — bold gold when decoded -->
  <div class="relative z-10 max-w-3xl min-h-[3em]">
    {#if introChars.length > 0}
      <p class="text-xl md:text-2xl leading-relaxed font-semibold">
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
  /* Matrix rain canvas — fills the section, sits behind content */
  .matrix-canvas {
    position: absolute;
    inset: -2rem -1.5rem;
    width: calc(100% + 3rem);
    height: calc(100% + 4rem);
    z-index: 0;
    pointer-events: none;
    opacity: 1;
  }

  /* Binary/undecoded characters — barely visible */
  .decode-char {
    transition: color 0.2s ease, text-shadow 0.3s ease;
  }
  .binary {
    font-family: var(--font-mono);
    color: color-mix(in srgb, var(--color-accent) 8%, transparent);
    text-shadow: none;
  }

  /* Headline decodes in bold bright gold with strong glow */
  .decoded-headline {
    color: var(--color-accent);
    text-shadow:
      0 0 40px color-mix(in srgb, var(--color-accent) 40%, transparent),
      0 0 80px color-mix(in srgb, var(--color-accent) 15%, transparent);
  }

  /* Intro decodes in bold gold */
  .decoded-intro {
    color: var(--color-accent);
    text-shadow: 0 0 25px color-mix(in srgb, var(--color-accent) 25%, transparent);
  }

  /* Feature descriptions decode in light text */
  .decoded {
    color: var(--color-text);
    text-shadow: none;
  }

  /* Feature titles in full accent gold */
  .decoded-accent {
    color: var(--color-accent);
    text-shadow: 0 0 20px color-mix(in srgb, var(--color-accent) 25%, transparent);
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
