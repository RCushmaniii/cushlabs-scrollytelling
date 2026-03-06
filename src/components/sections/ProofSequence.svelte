<script lang="ts">
  import { onMount } from "svelte";

  let el: HTMLDivElement;
  let canvasContainer: HTMLDivElement;
  let p5Instance: any = null;
  let lang = $state("en");
  let step = $state(0);
  let running = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  // Testimonial decode state
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
    const id = setTimeout(() => {
      if (running) fn();
    }, ms);
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
    step = 0;
    introChars = [];
    introDone = false;
    quoteChars = [];
    quoteDone = false;
    attributionVisible = false;
    demoVisible = false;
    if (p5Instance) {
      p5Instance.remove();
      p5Instance = null;
    }
  }

  async function startSequence() {
    reset();
    running = true;
    step = 1;

    const c = content[lang];

    // Launch P5.js 3D headline
    const p5Module = await import("p5");
    const P5 = p5Module.default;

    interface Particle {
      tx: number; ty: number;
      sx: number; sy: number; sz: number;
      delay: number;
    }

    p5Instance = new P5((p: any) => {
      let font: any;
      let points: Particle[] = [];
      let startTime = 0;
      let fontSize = 56;
      let assembled = false;
      let canvasW = 0;
      let canvasH = 0;

      const ASSEMBLE_DURATION = 2800;
      const ASSEMBLE_STAGGER = 1800;

      p.preload = () => {
        font = p.loadFont("/fonts/PlayfairDisplay-Black.ttf");
      };

      p.setup = () => {
        canvasW = canvasContainer.clientWidth;
        canvasH = Math.min(420, canvasW * 0.55);
        const canvas = p.createCanvas(canvasW, canvasH, p.WEBGL);
        canvas.parent(canvasContainer);
        canvas.style("display", "block");
        p.pixelDensity(Math.min(window.devicePixelRatio, 2));
        buildPoints();
        startTime = p.millis();
      };

      function buildPoints() {
        fontSize = Math.max(28, Math.min(canvasW * 0.055, 64));
        p.textFont(font);
        p.textSize(fontSize);

        const headline = c.headline;
        const bounds = font.textBounds(headline, 0, 0, fontSize);
        const rawPts = font.textToPoints(headline, -bounds.w / 2, bounds.h / 3, fontSize, {
          sampleFactor: 0.15,
        });

        points = rawPts.map((pt: { x: number; y: number }, i: number) => {
          const angle = (i / rawPts.length) * Math.PI * 10;
          const r = 400 + Math.random() * 800;
          return {
            tx: pt.x,
            ty: pt.y,
            sx: Math.cos(angle) * r * (Math.random() > 0.5 ? 1 : -1),
            sy: Math.sin(angle) * r * 0.6,
            sz: -300 - Math.random() * 1200,
            delay: (i / rawPts.length) * ASSEMBLE_STAGGER + Math.random() * 200,
          };
        });
      }

      p.draw = () => {
        p.clear();
        if (!running) return;

        const elapsed = p.millis() - startTime;

        // Subtle scene breathing
        p.push();
        p.rotateX(Math.sin(elapsed * 0.0003) * 0.04);
        p.rotateY(Math.sin(elapsed * 0.0002) * 0.02);

        // Draw particles
        for (const pt of points) {
          const t = Math.max(0, Math.min(1, (elapsed - pt.delay) / ASSEMBLE_DURATION));
          const eased = 1 - Math.pow(1 - t, 3);

          const x = p.lerp(pt.sx, pt.tx, eased);
          const y = p.lerp(pt.sy, pt.ty, eased);
          const z = p.lerp(pt.sz, 0, eased);

          // Float after assembly
          const float = t >= 1
            ? Math.sin((elapsed * 0.001) + pt.delay * 0.003) * 2
            : 0;

          const alpha = Math.min(255, eased * 300 + 30);

          // Glow layer
          p.push();
          p.translate(x, y + float, z);
          p.noFill();
          p.stroke(245, 197, 66, alpha * 0.2);
          p.strokeWeight(5);
          p.point(0, 0, 0);
          p.pop();

          // Core particle
          p.push();
          p.translate(x, y + float, z);
          p.noFill();
          p.stroke(245, 197, 66, alpha);
          p.strokeWeight(eased < 1 ? 1.5 : 2.5);
          p.point(0, 0, 0);
          p.pop();
        }

        // Once assembled, fade in solid text behind particles
        const allDone = elapsed > ASSEMBLE_STAGGER + ASSEMBLE_DURATION + 500;
        if (allDone && !assembled) {
          assembled = true;
          // Trigger next phase
          onP5Complete();
        }

        if (elapsed > ASSEMBLE_STAGGER + ASSEMBLE_DURATION) {
          const fadeT = Math.min(1, (elapsed - ASSEMBLE_STAGGER - ASSEMBLE_DURATION) / 800);
          p.push();
          p.fill(245, 197, 66, fadeT * 220);
          p.noStroke();
          p.textFont(font);
          p.textSize(fontSize);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(c.headline, 0, 0);
          p.pop();
        }

        p.pop();
      };

      p.windowResized = () => {
        canvasW = canvasContainer.clientWidth;
        canvasH = Math.min(420, canvasW * 0.55);
        p.resizeCanvas(canvasW, canvasH);
        buildPoints();
        startTime = p.millis();
        assembled = false;
      };
    });
  }

  function onP5Complete() {
    if (!running) return;
    const c = content[lang];
    step = 2;

    // Decode intro
    schedule(() => {
      decodeText(c.intro, (chars) => (introChars = chars), 14, () => {
        introDone = true;

        // Decode quote
        schedule(() => {
          step = 3;
          decodeText(c.quote, (chars) => (quoteChars = chars), 10, () => {
            quoteDone = true;

            // Show attribution
            schedule(() => {
              attributionVisible = true;

              // Show demo callout
              schedule(() => {
                step = 4;
                demoVisible = true;
              }, 500);
            }, 300);
          });
        }, 500);
      });
    }, 300);
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

<div bind:this={el} class="space-y-10">
  <!-- P5.js 3D headline canvas -->
  <div bind:this={canvasContainer} class="w-full relative">
    {#if step === 0}
      <div class="h-[300px]"></div>
    {/if}
  </div>

  <!-- Intro text -->
  <div class="max-w-3xl min-h-[3em]">
    {#if introChars.length > 0}
      <p class="text-xl md:text-2xl leading-relaxed">
        {#each introChars as { ch, done }}
          <span class="decode-char" class:decoded={done} class:binary={!done}>{ch}</span>
        {/each}
      </p>
    {/if}
  </div>

  <!-- Testimonial quote -->
  <div class="max-w-3xl mx-auto text-center pt-4 min-h-[4em]">
    {#if quoteChars.length > 0}
      <blockquote class="text-xl md:text-2xl italic font-heading leading-relaxed">
        {#each quoteChars as { ch, done }}
          <span class="decode-char" class:decoded-quote={done} class:binary={!done}>{ch}</span>
        {/each}
      </blockquote>
    {/if}

    {#if attributionVisible}
      <cite class="block mt-6 text-sm text-[var(--color-text-muted)] not-italic attribution-fade">
        {content[lang].attribution}
      </cite>
    {/if}
  </div>

  <!-- Demo callout -->
  <div
    class="demo-callout p-6 md:p-8 rounded-2xl border transition-all duration-700"
    class:demo-visible={demoVisible}
    class:demo-hidden={!demoVisible}
  >
    <div class="flex flex-col md:flex-row md:items-center gap-6">
      <div class="flex-1">
        <h3 class="font-heading text-xl font-bold text-[var(--color-text)] mb-2">
          {content[lang].demoTitle}
        </h3>
        <p class="text-sm text-[var(--color-text-muted)]">
          {content[lang].demoDesc}
        </p>
      </div>
      <a
        href="https://atlas-biodiversidad-pitch.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-full transition-transform duration-300 hover:scale-105 text-sm"
      >
        {content[lang].demoCta}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
</div>

<style>
  .decode-char {
    transition: color 0.2s ease;
  }
  .binary {
    font-family: var(--font-mono);
    color: color-mix(in srgb, var(--color-accent) 12%, transparent);
  }
  .decoded {
    color: var(--color-text);
  }
  .decoded-quote {
    color: var(--color-text);
    text-shadow: 0 0 20px color-mix(in srgb, var(--color-accent) 10%, transparent);
  }

  .attribution-fade {
    animation: fadeSlideUp 0.6s ease-out forwards;
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .demo-hidden {
    opacity: 0;
    transform: translateY(20px);
    border-color: transparent;
    background: transparent;
  }
  .demo-visible {
    opacity: 1;
    transform: translateY(0);
    border-color: color-mix(in srgb, var(--color-accent) 20%, transparent);
    background: color-mix(in srgb, var(--color-accent) 3%, transparent);
  }
</style>
