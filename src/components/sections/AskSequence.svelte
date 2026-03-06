<script lang="ts">
  import { onMount } from "svelte";

  let el: HTMLDivElement;
  let card: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let lang = $state("en");
  let visible = $state(false);
  let headlineChars = $state<{ ch: string; done: boolean }[]>([]);
  let headlineDone = $state(false);
  let subtitleVisible = $state(false);
  let ctaVisible = $state(false);
  let emailVisible = $state(false);
  let running = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];
  let rafId: number | null = null;

  const BINARY = "01";
  const HEX = "0123456789ABCDEF";
  const GLITCH = "01ABCDEF!@#$%^&*<>/\\|{}[]~";

  const content: Record<string, {
    headline: string;
    subtitle: string;
    cta1: string;
    cta2: string;
  }> = {
    en: {
      headline: "Ready to make your audience lean in?",
      subtitle: "Every project starts with a free consultation. We'll learn about your story, your audience, and your goals — then show you exactly how scrollytelling can deliver the impact you need.",
      cta1: "Book a Free Consultation",
      cta2: "Send a Message",
    },
    es: {
      headline: "Listo para que tu audiencia se incline?",
      subtitle: "Cada proyecto comienza con una consulta gratuita. Conoceremos tu historia, tu audiencia y tus objetivos — y luego te mostraremos exactamente como el scrollytelling puede entregar el impacto que necesitas.",
      cta1: "Reserva una Consulta Gratuita",
      cta2: "Enviar un Mensaje",
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
      const batch = Math.min(1 + Math.floor(Math.random() * 2), len - decoded);
      for (let b = 0; b < batch; b++) {
        if (decoded < len) { chars[decoded] = { ch: text[decoded], done: true }; decoded++; }
      }
      setter([...chars]);
      schedule(decodeTick, speed);
    }
    schedule(decodeTick, speed * 3);
  }

  // Floating particles on canvas
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    char: string;
  }

  let particles: Particle[] = [];

  function initParticles(w: number, h: number) {
    particles = [];
    const count = Math.floor((w * h) / 12000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: 10 + Math.random() * 6,
        alpha: 0.03 + Math.random() * 0.06,
        char: Math.random() > 0.5 ? "1" : "0",
      });
    }
  }

  function animateParticles() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      ctx.font = `${p.size}px var(--font-mono, monospace)`;
      ctx.fillStyle = `rgba(245, 197, 66, ${p.alpha})`;
      ctx.fillText(p.char, p.x, p.y);
    }

    rafId = requestAnimationFrame(animateParticles);
  }

  // 3D tilt effect on card
  function handleMouseMove(e: MouseEvent) {
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateX = y * -8;
    const rotateY = x * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  function handleMouseLeave() {
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  }

  function reset() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    headlineChars = [];
    headlineDone = false;
    subtitleVisible = false;
    ctaVisible = false;
    emailVisible = false;
    visible = false;
  }

  function startSequence() {
    reset();
    running = true;
    visible = true;
    const c = content[lang];

    // Start particle background
    if (canvas) {
      canvas.width = el.offsetWidth;
      canvas.height = el.offsetHeight;
      initParticles(canvas.width, canvas.height);
      animateParticles();
    }

    // Phase 1: Headline decodes
    schedule(() => {
      decodeText(c.headline, (chars) => (headlineChars = chars), 30, () => {
        headlineDone = true;

        // Phase 2: Subtitle fades in
        schedule(() => {
          subtitleVisible = true;

          // Phase 3: CTA buttons
          schedule(() => {
            ctaVisible = true;

            // Phase 4: Email
            schedule(() => {
              emailVisible = true;
            }, 600);
          }, 500);
        }, 400);
      });
    }, 600);
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
    }, { threshold: 0.15 });
    intObs.observe(el);

    return () => { reset(); mutObs.disconnect(); intObs.disconnect(); };
  });
</script>

<div bind:this={el} class="ask-wrapper">
  <canvas bind:this={canvas} class="particle-canvas"></canvas>

  <div
    bind:this={card}
    class="ask-card"
    class:ask-visible={visible}
    onmousemove={handleMouseMove}
    onmouseleave={handleMouseLeave}
    role="presentation"
  >
    <!-- Glow ring behind card -->
    <div class="glow-ring"></div>

    <div class="card-inner">
      <!-- Section label -->
      <div class="section-label" class:label-visible={visible}>LET'S TALK</div>

      <!-- Headline -->
      <h2 class="ask-headline">
        {#if headlineChars.length > 0}
          {#each headlineChars as { ch, done }}
            <span class="decode-char" class:decoded-gold={done} class:binary={!done}>{ch}</span>
          {/each}
        {/if}
      </h2>

      <!-- Subtitle -->
      <div class="subtitle-area" class:subtitle-show={subtitleVisible}>
        <p class="ask-subtitle">{content[lang].subtitle}</p>
      </div>

      <!-- CTA Buttons -->
      <div class="cta-area" class:cta-show={ctaVisible}>
        <a href="/consultation" class="btn-primary">
          {content[lang].cta1}
        </a>
        <a href="/contact" class="btn-outline">
          {content[lang].cta2}
        </a>
      </div>

      <!-- Email -->
      <div class="email-area" class:email-show={emailVisible}>
        <p class="email-text">info@cushlabs.ai</p>
      </div>
    </div>
  </div>
</div>

<style>
  .ask-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    overflow: hidden;
  }

  .particle-canvas {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }

  .ask-card {
    position: relative;
    z-index: 1;
    max-width: 48rem;
    width: 100%;
    padding: 3rem 2.5rem;
    border-radius: 1.5rem;
    border: 1px solid transparent;
    background: transparent;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transform-style: preserve-3d;
    will-change: transform;
  }

  .ask-card:hover {
    cursor: default;
  }

  .ask-visible {
    border-color: color-mix(in srgb, var(--color-accent) 20%, transparent);
    background: color-mix(in srgb, var(--color-accent) 3%, rgba(15, 15, 15, 0.8));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
      0 0 60px color-mix(in srgb, var(--color-accent) 8%, transparent),
      0 0 120px color-mix(in srgb, var(--color-accent) 4%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--color-accent) 10%, transparent);
  }

  .glow-ring {
    position: absolute;
    inset: -2px;
    border-radius: 1.5rem;
    z-index: -1;
    opacity: 0;
    transition: opacity 1s ease;
    background: conic-gradient(
      from 0deg,
      color-mix(in srgb, var(--color-accent) 30%, transparent),
      transparent 40%,
      color-mix(in srgb, var(--color-accent) 20%, transparent) 60%,
      transparent 80%,
      color-mix(in srgb, var(--color-accent) 30%, transparent)
    );
    filter: blur(8px);
  }

  .ask-visible .glow-ring {
    opacity: 1;
    animation: glowSpin 8s linear infinite;
  }

  @keyframes glowSpin {
    to { transform: rotate(360deg); }
  }

  .card-inner {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-accent);
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.6s ease;
  }

  .label-visible {
    opacity: 0.6;
    transform: translateY(0);
  }

  .ask-headline {
    font-family: var(--font-heading);
    font-size: clamp(1.75rem, 4vw, 3rem);
    font-weight: 900;
    line-height: 1.2;
    min-height: 1.5em;
    color: var(--color-accent);
  }

  .decode-char {
    transition: color 0.15s ease, text-shadow 0.2s ease;
  }

  .binary {
    font-family: var(--font-mono);
    color: color-mix(in srgb, var(--color-accent) 8%, transparent);
    text-shadow: none;
  }

  .decoded-gold {
    color: var(--color-accent);
    text-shadow:
      0 0 30px color-mix(in srgb, var(--color-accent) 40%, transparent),
      0 0 60px color-mix(in srgb, var(--color-accent) 15%, transparent);
  }

  .subtitle-area {
    opacity: 0;
    transform: translateY(15px);
    transition: all 0.7s ease;
    max-width: 36rem;
  }

  .subtitle-show {
    opacity: 1;
    transform: translateY(0);
  }

  .ask-subtitle {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--color-text-muted);
  }

  .cta-area {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    padding-top: 0.5rem;
    opacity: 0;
    transform: translateY(15px);
    transition: all 0.6s ease;
  }

  .cta-show {
    opacity: 1;
    transform: translateY(0);
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 2rem;
    background: var(--color-accent);
    color: var(--color-background);
    font-weight: 600;
    font-size: 0.9375rem;
    border-radius: 9999px;
    text-decoration: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px color-mix(in srgb, var(--color-accent) 40%, transparent);
  }

  .btn-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 2rem;
    border: 2px solid var(--color-accent);
    color: var(--color-accent);
    font-weight: 600;
    font-size: 0.9375rem;
    border-radius: 9999px;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .btn-outline:hover {
    background: var(--color-accent);
    color: var(--color-background);
    box-shadow: 0 0 30px color-mix(in srgb, var(--color-accent) 30%, transparent);
  }

  .email-area {
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.6s ease;
    padding-top: 1rem;
  }

  .email-show {
    opacity: 1;
    transform: translateY(0);
  }

  .email-text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  @media (max-width: 640px) {
    .ask-card {
      padding: 2rem 1.5rem;
    }

    .cta-area {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
