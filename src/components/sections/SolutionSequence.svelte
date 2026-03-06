<script lang="ts">
  import { onMount } from "svelte";

  let el: HTMLElement;
  let matrixCanvas: HTMLCanvasElement;
  let lang = $state("en");
  let step = $state(0);
  let running = $state(false);
  let matrixRunning = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];
  let matrixRaf: number | null = null;

  // Decode display states
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

  // ── Matrix Rain (canvas) ──
  function startMatrixRain() {
    if (!matrixCanvas || matrixRunning) return;
    matrixRunning = true;

    const ctx = matrixCanvas.getContext("2d")!;
    const fontSize = 14;
    const rainChars = "01";

    // Size canvas to match parent element
    function resize() {
      matrixCanvas.width = el.offsetWidth;
      matrixCanvas.height = el.offsetHeight;
    }
    resize();

    const columns = Math.floor(matrixCanvas.width / fontSize);
    // Stagger initial positions so columns start at different heights
    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -40);

    // Parse accent color
    const style = getComputedStyle(el);
    const accent = style.getPropertyValue("--color-accent").trim() || "#F5C542";

    let lastTime = 0;
    const frameInterval = 80; // ~12fps — slow, deliberate fall like the movie

    function draw(timestamp: number) {
      if (!matrixRunning) return;

      // Throttle to ~12fps for slow cinematic fall
      if (timestamp - lastTime < frameInterval) {
        matrixRaf = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      // Trail fade — higher = longer trails. 0.05 gives nice long tails
      ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
      ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Only ~60% of columns active at any time for sparse look
        if (drops[i] === -999) {
          if (Math.random() > 0.995) drops[i] = Math.random() * -10;
          continue;
        }

        const char = rainChars[Math.floor(Math.random() * rainChars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright head character — the "leading drop"
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.25;
        ctx.fillText(char, x, y);

        // Slightly dimmer character just above (part of the trail)
        ctx.globalAlpha = 0.12;
        ctx.fillText(rainChars[Math.floor(Math.random() * 2)], x, y - fontSize);

        ctx.globalAlpha = 0.06;
        ctx.fillText(rainChars[Math.floor(Math.random() * 2)], x, y - fontSize * 2);

        // Move drop down
        drops[i] += 0.6; // Slow fall speed

        // Reset: once past bottom, either pause or restart from top
        if (drops[i] * fontSize > matrixCanvas.height) {
          if (Math.random() > 0.4) {
            drops[i] = Math.random() * -20; // Restart from above viewport
          } else {
            drops[i] = -999; // Pause this column
          }
        }
      }

      ctx.globalAlpha = 1;
      matrixRaf = requestAnimationFrame(draw);
    }

    matrixRaf = requestAnimationFrame(draw);
  }

  function stopMatrixRain() {
    matrixRunning = false;
    if (matrixRaf !== null) {
      cancelAnimationFrame(matrixRaf);
      matrixRaf = null;
    }
  }

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
    const scrambleInterval = 60;

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
      if (decoded < len) schedule(scramble, scrambleInterval);
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

    // Start matrix rain immediately as ambient background
    startMatrixRain();

    // Headline decodes
    schedule(() => {
      decodeText(c.headline, (chars) => (headlineChars = chars), 55, () => {
        headlineDone = true;
        // Intro decodes
        schedule(() => {
          step = 2;
          decodeText(c.intro, (chars) => (introChars = chars), 20, () => {
            introDone = true;
            // Features decode
            schedule(() => { step = 3; decodeFeature(0, c); }, 800);
          });
        }, 700);
      });
    }, 1200);
  }

  function decodeFeature(idx: number, c: typeof content.en) {
    if (!running || idx >= c.features.length) {
      step = 7;
      stopMatrixRain();
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
</script>

<div bind:this={el} class="solution-wrapper">
  <!-- Matrix rain canvas — ABSOLUTE behind all content -->
  <canvas bind:this={matrixCanvas} class="matrix-rain"></canvas>

  <!-- All content sits above the canvas -->
  <div class="content-layer">
    <!-- Headline -->
    <div class="max-w-4xl mb-10">
      <h2 class="headline-text">
        {#if headlineChars.length > 0}
          {#each headlineChars as { ch, done }}
            <span class="decode-char" class:decoded-headline={done} class:binary={!done}>{ch}</span>
          {/each}
        {/if}
      </h2>
    </div>

    <!-- Intro -->
    <div class="max-w-3xl min-h-[3em] mb-10">
      {#if introChars.length > 0}
        <p class="intro-text">
          {#each introChars as { ch, done }}
            <span class="decode-char" class:decoded-intro={done} class:binary={!done}>{ch}</span>
          {/each}
        </p>
      {/if}
    </div>

    <!-- Feature blocks -->
    <div class="space-y-4">
      {#each features as feature, idx}
        <div class="feature-block" class:feature-visible={feature.visible} class:feature-hidden={!feature.visible}>
          <div class="mb-2 min-h-[1.5em]">
            {#if feature.titleChars.length > 0}
              <h3 class="feature-title">
                {#each feature.titleChars as { ch, done }}
                  <span class="decode-char" class:decoded-accent={done} class:binary={!done}>{ch}</span>
                {/each}
              </h3>
            {/if}
          </div>
          <div class="min-h-[1.5em]">
            {#if feature.descChars.length > 0}
              <p class="feature-desc">
                {#each feature.descChars as { ch, done }}
                  <span class="decode-char" class:decoded={done} class:binary={!done}>{ch}</span>
                {/each}
              </p>
            {/if}
          </div>
          {#if feature.visible && feature.descChars.some(c => !c.done)}
            <div class="scan-line"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  /* Wrapper must be position:relative so canvas can be absolute inside it */
  .solution-wrapper {
    position: relative;
    overflow: hidden;
  }

  /* Canvas fills the entire wrapper, sits at z-0 BEHIND everything */
  .matrix-rain {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  /* Content layer sits ABOVE the canvas */
  .content-layer {
    position: relative;
    z-index: 1;
  }

  /* ── Headline: BOLD GOLD, unmissable ── */
  .headline-text {
    font-family: var(--font-heading);
    font-size: clamp(1.875rem, 5vw, 3.75rem);
    font-weight: 900;
    line-height: 1.15;
    min-height: 1.5em;
    color: var(--color-accent);
  }

  /* ── Intro: bold gold ── */
  .intro-text {
    font-size: clamp(1.25rem, 2.5vw, 1.5rem);
    line-height: 1.6;
    font-weight: 600;
    color: var(--color-accent);
  }

  /* ── Feature title: mono, gold ── */
  .feature-title {
    font-family: var(--font-mono);
    font-size: clamp(0.8rem, 1.5vw, 1rem);
    letter-spacing: 0.2em;
    color: var(--color-accent);
  }

  /* ── Feature description ── */
  .feature-desc {
    font-size: clamp(1rem, 1.8vw, 1.125rem);
    line-height: 1.6;
    color: var(--color-text);
  }

  /* Binary/undecoded characters — dim noise */
  .decode-char {
    transition: color 0.15s ease, text-shadow 0.2s ease;
  }
  .binary {
    font-family: var(--font-mono);
    color: color-mix(in srgb, var(--color-accent) 8%, transparent);
    text-shadow: none;
  }

  /* Decoded headline chars — bright gold with glow */
  .decoded-headline {
    color: var(--color-accent);
    text-shadow:
      0 0 30px color-mix(in srgb, var(--color-accent) 50%, transparent),
      0 0 60px color-mix(in srgb, var(--color-accent) 20%, transparent);
  }

  /* Decoded intro chars — gold */
  .decoded-intro {
    color: var(--color-accent);
    text-shadow: 0 0 20px color-mix(in srgb, var(--color-accent) 30%, transparent);
  }

  /* Decoded feature descriptions — light text */
  .decoded {
    color: var(--color-text);
    text-shadow: none;
  }

  /* Decoded feature titles — accent gold */
  .decoded-accent {
    color: var(--color-accent);
    text-shadow: 0 0 15px color-mix(in srgb, var(--color-accent) 25%, transparent);
  }

  /* Feature blocks */
  .feature-block {
    position: relative;
    overflow: hidden;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid transparent;
    transition: all 0.5s ease;
  }
  .feature-hidden {
    opacity: 0;
    transform: translateY(20px);
    border-color: transparent;
    background: transparent;
  }
  .feature-visible {
    opacity: 1;
    transform: translateY(0);
    border-color: color-mix(in srgb, var(--color-accent) 15%, transparent);
    background: color-mix(in srgb, var(--color-accent) 3%, transparent);
  }

  /* Scan line */
  .scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
    opacity: 0.3;
    animation: scanMove 2.5s ease-in-out infinite;
  }
  @keyframes scanMove {
    0% { top: 20%; }
    50% { top: 80%; }
    100% { top: 20%; }
  }
</style>
