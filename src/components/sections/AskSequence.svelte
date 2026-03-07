<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { getEmail } from "@/lib/email";

  let el: HTMLDivElement;
  let bgCanvas: HTMLCanvasElement;
  let cardEl: HTMLDivElement;
  let headlineEl: HTMLHeadingElement;
  let lang = $state("en");
  let cardVisible = $state(false);
  let running = $state(false);
  let emailAddr = $state("");
  let renderer: THREE.WebGLRenderer | null = null;
  let animFrameId: number | null = null;

  const content: Record<string, {
    subtitle: string;
    cta1: string;
    cta2: string;
  }> = {
    en: {
      subtitle: "Every project starts with a free consultation. We'll learn about your story, your audience, and your goals — then show you exactly how scrollytelling can deliver the impact you need.",
      cta1: "Book a Free Consultation",
      cta2: "Send a Message",
    },
    es: {
      subtitle: "Cada proyecto comienza con una consulta gratuita. Conoceremos tu historia, tu audiencia y tus objetivos — y luego te mostraremos exactamente como el scrollytelling puede entregar el impacto que necesitas.",
      cta1: "Reserva una Consulta Gratuita",
      cta2: "Enviar un Mensaje",
    },
  };

  // Headline structure: per-letter with gold accent flags
  const headlines: Record<string, { c: string; g?: boolean }[][]> = {
    en: [
      [
        {c:'R'},{c:'e'},{c:'a'},{c:'d'},{c:'y'},
        {c:' '},
        {c:'t'},{c:'o'},
        {c:' '},
        {c:'m'},{c:'a'},{c:'k'},{c:'e'},
        {c:' '},
        {c:'y'},{c:'o'},{c:'u'},{c:'r'},
      ],
      [
        {c:'a'},{c:'u'},{c:'d'},{c:'i'},{c:'e'},{c:'n'},{c:'c'},{c:'e'},
        {c:' '},
        {c:'l',g:true},{c:'e',g:true},{c:'a',g:true},{c:'n',g:true},
        {c:' '},
        {c:'i',g:true},{c:'n',g:true},{c:'?',g:true},
      ],
    ],
    es: [
      [
        {c:'L'},{c:'i'},{c:'s'},{c:'t'},{c:'o'},
        {c:' '},
        {c:'p'},{c:'a'},{c:'r'},{c:'a'},
        {c:' '},
        {c:'q'},{c:'u'},{c:'e'},
        {c:' '},
        {c:'t'},{c:'u'},
      ],
      [
        {c:'a'},{c:'u'},{c:'d'},{c:'i'},{c:'e'},{c:'n'},{c:'c'},{c:'i'},{c:'a'},
        {c:' '},
        {c:'s',g:true},{c:'e',g:true},
        {c:' '},
        {c:'i',g:true},{c:'n',g:true},{c:'c',g:true},{c:'l',g:true},{c:'i',g:true},{c:'n',g:true},{c:'e',g:true},{c:'?',g:true},
      ],
    ],
  };

  function buildHeadline() {
    if (!headlineEl) return;
    headlineEl.innerHTML = "";
    const lines = headlines[lang] || headlines.en;
    const BASE = 0.6;
    const GAP = 0.052;
    let n = 0;
    for (const line of lines) {
      const div = document.createElement("div");
      div.style.display = "block";
      for (const { c, g } of line) {
        if (c === " ") {
          const s = document.createElement("span");
          s.className = "ask-lspace";
          div.appendChild(s);
          n++;
        } else {
          const s = document.createElement("span");
          s.className = "ask-letter" + (g ? " ask-gold" : "");
          s.textContent = c;
          s.style.animationDelay = `${BASE + n * GAP}s`;
          div.appendChild(s);
          n++;
        }
      }
      headlineEl.appendChild(div);
    }
  }

  // --- Three.js star field (ported from reference) ---
  // Canvas is positioned fixed to fill the entire viewport so stars
  // extend beyond the section boundaries — no visible container edge.
  function initStarField() {
    if (!bgCanvas || renderer) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    // Match page background exactly: #0A0A0A
    renderer.setClearColor(0x0A0A0A, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 1000);
    camera.position.z = 1;

    const COUNT = 2800;
    const pos = new Float32Array(COUNT * 3);
    const sz = new Float32Array(COUNT);
    const br = new Float32Array(COUNT);
    const spd = new Float32Array(COUNT);
    const ph = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5;

      const r = Math.random();
      if (r < 0.08) {
        sz[i] = Math.random() * 6 + 5;
        br[i] = Math.random() * 0.2 + 0.9;
      } else if (r < 0.28) {
        sz[i] = Math.random() * 3 + 2;
        br[i] = Math.random() * 0.25 + 0.65;
      } else {
        sz[i] = Math.random() * 1.6 + 0.5;
        br[i] = Math.random() * 0.3 + 0.40;
      }
      spd[i] = Math.random() * 1.6 + 0.4;
      ph[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    geo.setAttribute("aBright", new THREE.BufferAttribute(br, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(spd, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(ph, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aSize;
        attribute float aBright;
        attribute float aSpeed;
        attribute float aPhase;
        uniform  float uTime;
        varying  float vAlpha;
        void main() {
          float tw = 0.70 + 0.30 * sin(uTime * aSpeed + aPhase);
          vAlpha = aBright * tw;
          vec3 drifted = position;
          float driftAmt = aSize * 0.018;
          drifted.x += sin(uTime * aSpeed * 0.18 + aPhase)       * driftAmt * 1.4;
          drifted.y += cos(uTime * aSpeed * 0.13 + aPhase * 1.3) * driftAmt;
          drifted.z += sin(uTime * aSpeed * 0.09 + aPhase * 0.7) * driftAmt * 0.5;
          gl_Position  = projectionMatrix * modelViewMatrix * vec4(drifted, 1.0);
          gl_PointSize = aSize * (0.80 + 0.20 * sin(uTime * aSpeed * 0.6 + aPhase));
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float core = 1.0 - smoothstep(0.0, 0.18, d);
          float halo = 1.0 - smoothstep(0.18, 0.50, d);
          float bright = core * 0.9 + halo * 0.5;
          vec3 col = mix(vec3(0.85, 0.90, 1.0), vec3(1.0, 0.98, 0.92), core * 0.4);
          gl_FragColor = vec4(col, vAlpha * bright);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    scene.add(new THREE.Points(geo, mat));

    let tx = 0;
    let ty = 0;

    function onMouseMove(e: MouseEvent) {
      tx = (e.clientX / window.innerWidth - 0.5) * 0.014;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.009;
    }
    document.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();

    function animate() {
      if (!running) return;
      animFrameId = requestAnimationFrame(animate);
      mat.uniforms.uTime.value = clock.getElapsedTime();
      camera.position.x += (tx - camera.position.x) * 0.035;
      camera.position.y += (-ty - camera.position.y) * 0.035;
      renderer!.render(scene, camera);
    }

    (el as any).__camera = camera;
    (el as any).__starCleanup = () => {
      document.removeEventListener("mousemove", onMouseMove);
      geo.dispose();
      mat.dispose();
      renderer?.dispose();
      renderer = null;
    };

    animate();
  }

  function hideFireflies() {
    const ff = document.querySelector('.fireflies-container') as HTMLElement;
    if (ff) { ff.style.transition = 'opacity 0.5s ease'; ff.style.opacity = '0'; }
  }

  function showFireflies() {
    const ff = document.querySelector('.fireflies-container') as HTMLElement;
    if (ff) { ff.style.transition = 'opacity 0.5s ease'; ff.style.opacity = '1'; }
  }

  function reset() {
    running = false;
    cardVisible = false;
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    if (headlineEl) headlineEl.innerHTML = "";
    showFireflies();
  }

  function startSequence() {
    reset();
    running = true;
    hideFireflies();
    initStarField();
    buildHeadline();
    requestAnimationFrame(() => { cardVisible = true; });
  }

  function handleEmailClick() {
    if (emailAddr) {
      window.location.href = `${"mai" + "lto"}:${emailAddr}`;
    }
  }

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";
    emailAddr = getEmail();

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

    const onResize = () => {
      if (renderer && (el as any).__camera) {
        const cam = (el as any).__camera as THREE.PerspectiveCamera;
        cam.aspect = window.innerWidth / window.innerHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      reset();
      mutObs.disconnect();
      intObs.disconnect();
      window.removeEventListener("resize", onResize);
      (el as any).__starCleanup?.();
    };
  });
</script>

<!-- Inject keyframes via svelte:head to survive Astro production CSS stripping -->
<svelte:head>
  <style>
    @keyframes ask-letter-slam {
      0%   { opacity: 0; filter: blur(8px) brightness(2.5); transform: translateZ(120px) scale(1.6) translateY(-8px); }
      60%  { opacity: 1; filter: blur(1px) brightness(1.3); transform: translateZ(-8px) scale(0.97) translateY(2px); }
      100% { opacity: 1; filter: blur(0) brightness(1); transform: translateZ(0) scale(1) translateY(0); }
    }
    @keyframes ask-border-scan {
      0%   { background-position: 220% 0; opacity: 1; }
      85%  { background-position: -80% 0; opacity: 1; }
      100% { background-position: -100% 0; opacity: 0; }
    }
    @keyframes ask-ring-explode {
      0%   { opacity: 0;    transform: scale(0.7);  filter: blur(8px); }
      35%  { opacity: 1;    transform: scale(1.12); filter: blur(20px); }
      70%  { opacity: 0.8;  transform: scale(0.98); filter: blur(26px); }
      100% { opacity: 0.65; transform: scale(1);    filter: blur(24px); }
    }
    @keyframes ask-ring-breathe {
      0%,100% { opacity: 0.65; transform: scale(1);    filter: blur(24px); }
      50%     { opacity: 0.38; transform: scale(1.06);  filter: blur(32px); }
    }
    @keyframes ask-expand-line {
      to { width: 48px; }
    }
    @keyframes ask-rise {
      to { opacity: 1; transform: translateY(0); }
    }
    .ask-letter {
      display: inline-block;
      opacity: 0;
      transform: translateZ(120px) scale(1.6) translateY(-8px);
      transform-style: preserve-3d;
      animation: ask-letter-slam 0.70s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .ask-gold { color: #F0C040; font-style: italic; }
    .ask-lspace { display: inline-block; width: 0.26em; }
  </style>
</svelte:head>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={el}
  style="position:relative;display:flex;align-items:center;justify-content:center;min-height:70vh;z-index:2;"
>
  <!-- Three.js star field canvas — fixed fullscreen so stars extend beyond section -->
  <canvas
    bind:this={bgCanvas}
    style="position:fixed;inset:0;z-index:0;width:100vw;height:100vh;pointer-events:none;"
  ></canvas>

  <!-- Glow wrapper (sits outside card) -->
  <div style="position:relative;display:inline-block;z-index:1;">
    <!-- Glow ring — explosion + breathing animation -->
    <div style="
      position:absolute;
      inset:-80px;
      border-radius:28px;
      pointer-events:none;
      z-index:0;
      opacity:0;
      background:radial-gradient(ellipse at center,
        transparent 0%,
        transparent 42%,
        rgba(240,192,64,0.28) 58%,
        rgba(240,192,64,0.10) 72%,
        transparent 88%
      );
      filter:blur(24px);
      {cardVisible ? 'animation:ask-ring-explode 4.2s cubic-bezier(0.16,1,0.3,1) 4.8s forwards, ask-ring-breathe 5.5s ease-in-out 9s infinite;' : ''}
    "></div>

    <!-- Card -->
    <div
      bind:this={cardEl}
      style="
        position:relative;
        width:min(680px, 92vw);
        padding:56px 52px 50px;
        background:rgba(14,11,5,0.88);
        border:1px solid rgba(240,192,64,0.20);
        border-radius:20px;
        backdrop-filter:blur(28px);
        -webkit-backdrop-filter:blur(28px);
        box-shadow:0 0 0 1px rgba(240,192,64,0.05), 0 40px 100px rgba(0,0,0,0.85), inset 0 1px 0 rgba(240,192,64,0.10);
        text-align:center;
        opacity:{cardVisible ? 1 : 0};
        transform:{cardVisible ? 'translateY(0) rotateX(0deg)' : 'translateY(30px) rotateX(6deg)'};
        transition:opacity 0.9s 0.1s ease, transform 0.9s 0.1s ease;
        z-index:1;
      "
      role="presentation"
    >
      <!-- Scanning border (runs once, fades out) -->
      {#if cardVisible}
        <div style="
          content:'';
          position:absolute;
          inset:0;
          border-radius:20px;
          padding:1px;
          background:linear-gradient(90deg,transparent 0%,transparent 15%,rgba(240,192,64,1.0) 50%,transparent 85%,transparent 100%) border-box;
          background-size:300% 100%;
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:destination-out;
          mask-composite:exclude;
          animation:ask-border-scan 4.5s cubic-bezier(0.25,0,0.55,1) 0.3s 1 forwards;
          pointer-events:none;
          z-index:10;
        "></div>
      {/if}

      <!-- Corner accents -->
      <div style="position:absolute;top:12px;left:12px;width:18px;height:18px;border-color:rgba(240,192,64,0.55);border-style:solid;border-width:1px 0 0 1px;border-radius:2px 0 0 0;pointer-events:none;"></div>
      <div style="position:absolute;top:12px;right:12px;width:18px;height:18px;border-color:rgba(240,192,64,0.55);border-style:solid;border-width:1px 1px 0 0;border-radius:0 2px 0 0;pointer-events:none;"></div>
      <div style="position:absolute;bottom:12px;left:12px;width:18px;height:18px;border-color:rgba(240,192,64,0.55);border-style:solid;border-width:0 0 1px 1px;border-radius:0 0 0 2px;pointer-events:none;"></div>
      <div style="position:absolute;bottom:12px;right:12px;width:18px;height:18px;border-color:rgba(240,192,64,0.55);border-style:solid;border-width:0 1px 1px 0;border-radius:0 0 2px 0;pointer-events:none;"></div>

      <!-- Eyebrow -->
      <p style="
        font-size:0.75rem;
        letter-spacing:0.2em;
        color:#F0C040;
        text-transform:uppercase;
        margin-bottom:26px;
        opacity:0;
        transform:translateY(8px);
        font-family:var(--font-mono, monospace);
        font-weight:600;
        {cardVisible ? 'animation:ask-rise 0.5s 0.5s ease forwards;' : ''}
      ">Let's Talk</p>

      <!-- Headline (built by JS) -->
      <h2
        bind:this={headlineEl}
        style="
          font-family:var(--font-heading, 'Playfair Display', serif);
          font-size:clamp(32px, 5vw, 52px);
          line-height:1.18;
          color:#EDE3C8;
          margin-bottom:4px;
          perspective:500px;
          perspective-origin:50% 50%;
        "
      ></h2>

      <!-- Divider -->
      <div style="
        width:0;
        height:1px;
        background:linear-gradient(90deg, transparent, #F0C040, transparent);
        margin:20px auto 24px;
        {cardVisible ? 'animation:ask-expand-line 0.7s 2.5s ease forwards;' : ''}
      "></div>

      <!-- Body text -->
      <p style="
        font-size:1rem;
        font-weight:300;
        line-height:1.78;
        color:rgba(237,227,200,0.65);
        max-width:440px;
        margin:0 auto 34px;
        opacity:0;
        transform:translateY(8px);
        {cardVisible ? 'animation:ask-rise 0.6s 2.7s ease forwards;' : ''}
      ">{content[lang].subtitle}</p>

      <!-- Buttons -->
      <div style="
        display:flex;
        gap:14px;
        justify-content:center;
        flex-wrap:wrap;
        opacity:0;
        transform:translateY(8px);
        {cardVisible ? 'animation:ask-rise 0.6s 3.0s ease forwards;' : ''}
      ">
        <a href="/consultation" style="
          font-family:var(--font-body, 'DM Sans', sans-serif);
          font-size:0.9rem;font-weight:500;letter-spacing:0.04em;
          padding:14px 30px;border-radius:50px;
          text-decoration:none;display:inline-block;
          background:#F0C040;color:#160F00;border:none;
          box-shadow:0 4px 20px rgba(240,192,64,0.28);
          transition:transform 0.18s ease, box-shadow 0.18s ease;
        ">{content[lang].cta1}</a>
        <a href="/contact" style="
          font-family:var(--font-body, 'DM Sans', sans-serif);
          font-size:0.9rem;font-weight:500;letter-spacing:0.04em;
          padding:14px 30px;border-radius:50px;
          text-decoration:none;display:inline-block;
          background:transparent;color:#EDE3C8;
          border:1px solid rgba(237,227,200,0.25);
          transition:transform 0.18s ease, border-color 0.18s ease;
        ">{content[lang].cta2}</a>
      </div>

      <!-- Email (obfuscated, linked, hover effect) -->
      {#if emailAddr}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <p
          onclick={handleEmailClick}
          style="
            margin-top:26px;font-size:0.8rem;letter-spacing:0.09em;
            color:#6A6050;
            opacity:0;
            transform:translateY(8px);
            cursor:pointer;
            transition:color 0.2s ease;
            {cardVisible ? 'animation:ask-rise 0.5s 3.3s ease forwards;' : ''}
          "
          onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EDE3C8'; }}
          onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6A6050'; }}
        >{emailAddr}</p>
      {/if}
    </div>
  </div>
</div>
