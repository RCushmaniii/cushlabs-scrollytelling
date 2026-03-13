<script lang="ts">
  import { onMount } from "svelte";
  import { presentationState } from "@/lib/presentation";

  let el: HTMLDivElement;
  let lang = $state("en");
  let started = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  // Animation states
  let eyebrowVisible = $state(false);
  let titleLine1Visible = $state(false);
  let titleLine2Visible = $state(false);
  let wordGroups = $state<{ visible: boolean; special?: string }[]>([]);

  const content: Record<string, {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    groups: { text: string; special?: string }[];
  }> = {
    en: {
      eyebrow: "CushLabs AI Services",
      titleLine1: "Your Story,",
      titleLine2: "Unforgettable",
      groups: [
        { text: "We build" },
        { text: "cinematic", special: "glow" },
        { text: "scrollytelling presentations" },
        { text: "that make" },
        { text: "investors," },
        { text: "partners," },
        { text: "and audiences" },
        { text: "lean in", special: "lean-in" },
        { text: "—" },
        { text: "not tune out.", special: "tune-out" },
      ],
    },
    es: {
      eyebrow: "CushLabs AI Services",
      titleLine1: "Tu Historia,",
      titleLine2: "Inolvidable",
      groups: [
        { text: "Construimos" },
        { text: "presentaciones", special: "glow" },
        { text: "cinematograficas" },
        { text: "de scrollytelling que hacen que" },
        { text: "inversores," },
        { text: "socios" },
        { text: "y audiencias" },
        { text: "se inclinen", special: "lean-in" },
        { text: "—" },
        { text: "no se desconecten.", special: "tune-out" },
      ],
    },
  };

  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(() => fn(), ms);
    timeouts.push(id);
  }

  function reset() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    started = false;
    eyebrowVisible = false;
    titleLine1Visible = false;
    titleLine2Visible = false;
    wordGroups = [];
  }

  function playThunder() {
    const sfx = new Audio("/audio/sfx/thunder.mp3");
    sfx.volume = 0.5;
    sfx.play().catch(() => {});
  }

  function startSequence() {
    if (started) return;
    reset();
    started = true;
    const c = content[lang];

    wordGroups = c.groups.map((g) => ({ visible: false, special: g.special }));

    schedule(() => { eyebrowVisible = true; }, 300);
    schedule(() => { titleLine1Visible = true; }, 700);
    schedule(() => {
      titleLine2Visible = true;
      playThunder();
    }, 1200);
    schedule(() => { playThunder(); }, 1200 + 5300 + 3500);

    const baseDelay = 1800;
    const wordInterval = 250;

    c.groups.forEach((_, i) => {
      schedule(() => {
        wordGroups[i].visible = true;
        wordGroups = [...wordGroups];
      }, baseDelay + i * wordInterval);
    });
  }

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";

    // Watch language changes
    const mutObs = new MutationObserver(() => {
      const newLang = document.body.dataset.activeLang || "en";
      if (newLang !== lang) {
        lang = newLang;
        if (started) {
          reset();
          startSequence();
        }
      }
    });
    mutObs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });

    // Wait for overlay to be dismissed before starting
    const unsub = presentationState.subscribe((state) => {
      if (state !== "overlay" && !started) {
        // Brief delay to let overlay fade out
        schedule(() => startSequence(), 400);
      }
    });

    // Restart animations when tab returns during presentation
    function handleRestart() {
      if (started) {
        reset();
        startSequence();
      }
    }
    window.addEventListener("presentation:restart-section", handleRestart);

    return () => {
      reset();
      mutObs.disconnect();
      unsub();
      window.removeEventListener("presentation:restart-section", handleRestart);
    };
  });
</script>

<div bind:this={el} class="space-y-8 text-center">
  <!-- Eyebrow -->
  <div class="mb-4 min-h-[1.5em]">
    {#if eyebrowVisible}
      <span class="eyebrow-reveal font-mono text-xs tracking-[0.4em] uppercase text-[var(--color-accent)]">
        {content[lang].eyebrow}
      </span>
    {/if}
  </div>

  <!-- Title — no overflow-hidden, use opacity + transform instead -->
  <h1 class="font-heading text-5xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tight">
    {#if titleLine1Visible}
      <span class="title-line-reveal block">
        {content[lang].titleLine1}
      </span>
    {:else}
      <span class="block opacity-0">{content[lang].titleLine1}</span>
    {/if}
    {#if titleLine2Visible}
      <span class="title-accent-reveal block text-[var(--color-accent)]">
        {content[lang].titleLine2}
      </span>
    {:else}
      <span class="block opacity-0 text-[var(--color-accent)]">{content[lang].titleLine2}</span>
    {/if}
  </h1>

  <!-- Animated subtitle -->
  <p class="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed min-h-[3em]">
    {#each wordGroups as group, i}
      {#if group.visible}
        <span
          class="word-group inline-block mr-[0.3em]"
          class:word-glow={group.special === "glow"}
          class:word-lean-in={group.special === "lean-in"}
          class:word-tune-out={group.special === "tune-out"}
          class:word-plain={!group.special}
        >
          {content[lang].groups[i].text}
        </span>
      {:else}
        <span class="inline-block mr-[0.3em] opacity-0">
          {content[lang].groups[i].text}
        </span>
      {/if}
    {/each}
  </p>
</div>

<style>
  /* Eyebrow: fade in + slide down */
  .eyebrow-reveal {
    animation: fadeIn 0.8s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 0.7; transform: translateY(0); }
  }

  /* Title line 1: fade up */
  .title-line-reveal {
    animation: titleReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes titleReveal {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Title line 2 (accent): fade up with glow */
  .title-accent-reveal {
    animation: titleAccentReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes titleAccentReveal {
    from { opacity: 0; transform: translateY(40px); text-shadow: none; }
    to { opacity: 1; transform: translateY(0); text-shadow: 0 0 40px color-mix(in srgb, var(--color-accent) 30%, transparent); }
  }

  /* Plain words: fly up + fade in */
  .word-plain {
    color: var(--color-text-muted);
    animation: wordFlyUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes wordFlyUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* "cinematic" — glows gold */
  .word-glow {
    color: var(--color-accent);
    animation: wordGlow 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes wordGlow {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); text-shadow: 0 0 25px color-mix(in srgb, var(--color-accent) 35%, transparent); }
  }

  /* "lean in" — scales forward, bold gold */
  .word-lean-in {
    color: var(--color-accent);
    font-weight: 700;
    animation: leanIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes leanIn {
    0% { opacity: 0; transform: translateY(15px) scale(0.85); }
    60% { opacity: 1; transform: translateY(-2px) scale(1.1); }
    100% { opacity: 1; transform: translateY(0) scale(1.05); text-shadow: 0 0 30px color-mix(in srgb, var(--color-accent) 40%, transparent); }
  }

  /* "not tune out" — fades dim, slight shrink */
  .word-tune-out {
    animation: tuneOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes tuneOut {
    0% { opacity: 0; transform: translateY(15px) scale(1); color: var(--color-text-muted); }
    40% { opacity: 0.7; transform: translateY(0) scale(1); color: var(--color-text-muted); }
    100% { opacity: 0.35; transform: translateY(2px) scale(0.95); color: var(--color-text-muted); filter: blur(0.5px); }
  }
</style>
