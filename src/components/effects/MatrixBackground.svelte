<script lang="ts">
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;
  let active = $state(false);
  let rafId: number | null = null;
  let columns: number = 0;
  let drops: number[] = [];
  let ctx: CanvasRenderingContext2D | null = null;
  let fontSize = 14;
  let lastTime = 0;
  const frameInterval = 110;
  const rainChars = "01";
  let accent = "#F5C542";

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const newCols = Math.floor(canvas.width / fontSize);
    if (newCols !== columns) {
      columns = newCols;
      drops = Array.from({ length: columns }, () => Math.random() * -40);
    }
  }

  function draw(timestamp: number) {
    if (!active || !ctx) return;

    if (timestamp - lastTime < frameInterval) {
      rafId = requestAnimationFrame(draw);
      return;
    }
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      if (drops[i] === -999) {
        if (Math.random() > 0.997) drops[i] = Math.random() * -15;
        continue;
      }

      const char = rainChars[Math.floor(Math.random() * rainChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.2;
      ctx.fillText(char, x, y);

      ctx.globalAlpha = 0.1;
      ctx.fillText(rainChars[Math.floor(Math.random() * 2)], x, y - fontSize);
      ctx.globalAlpha = 0.06;
      ctx.fillText(rainChars[Math.floor(Math.random() * 2)], x, y - fontSize * 2);
      ctx.globalAlpha = 0.03;
      ctx.fillText(rainChars[Math.floor(Math.random() * 2)], x, y - fontSize * 3);

      drops[i] += 0.4;

      if (drops[i] * fontSize > canvas.height) {
        drops[i] = Math.random() > 0.5 ? Math.random() * -25 : -999;
      }
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (active) return;
    active = true;
    if (!ctx && canvas) ctx = canvas.getContext("2d");
    resize();
    // Hide fireflies
    const fireflies = document.querySelector('.fireflies-container') as HTMLElement;
    if (fireflies) fireflies.style.opacity = '0';
    // Show canvas
    if (container) container.style.opacity = '1';
    rafId = requestAnimationFrame(draw);
  }

  function stop() {
    active = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    // Clear canvas to prevent stale frame showing
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Show fireflies
    const fireflies = document.querySelector('.fireflies-container') as HTMLElement;
    if (fireflies) fireflies.style.opacity = '1';
    // Hide canvas
    if (container) container.style.opacity = '0';
  }

  onMount(() => {
    ctx = canvas.getContext("2d");
    accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#F5C542";
    resize();

    // Add transition to fireflies container
    const fireflies = document.querySelector('.fireflies-container') as HTMLElement;
    if (fireflies) fireflies.style.transition = 'opacity 1s ease';

    window.addEventListener("resize", resize);

    // Watch #solution section visibility
    const target = document.querySelector('#solution');
    if (target) {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      }, { threshold: 0.05 });
      obs.observe(target);
      return () => { stop(); obs.disconnect(); window.removeEventListener("resize", resize); };
    }

    return () => { stop(); window.removeEventListener("resize", resize); };
  });
</script>

<div
  bind:this={container}
  style="position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity 1s ease;mix-blend-mode:screen;"
>
  <canvas
    bind:this={canvas}
    style="width:100%;height:100%;"
  ></canvas>
</div>
