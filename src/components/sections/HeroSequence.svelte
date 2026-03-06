<script lang="ts">
  import { onMount } from "svelte";

  let el: HTMLDivElement;
  let lang = $state("en");
  let started = $state(false);
  let step = $state(0);
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  // Word group states (each group animates in sequence)
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
    step = 0;
    eyebrowVisible = false;
    titleLine1Visible = false;
    titleLine2Visible = false;
    wordGroups = [];
  }

  function startSequence() {
    reset();
    started = true;
    const c = content[lang];

    // Init word groups (all hidden)
    wordGroups = c.groups.map((g) => ({ visible: false, special: g.special }));

    // Eyebrow fades in
    schedule(() => { eyebrowVisible = true; }, 200);

    // Title line 1 flies up
    schedule(() => { titleLine1Visible = true; }, 600);

    // Title line 2 (accent) flies up
    schedule(() => { titleLine2Visible = true; }, 1000);

    // Subtitle words reveal one group at a time
    const baseDelay = 1600;
    const wordInterval = 220;

    c.groups.forEach((_, i) => {
      schedule(() => {
        wordGroups[i].visible = true;
        wordGroups = [...wordGroups]; // trigger reactivity
      }, baseDelay + i * wordInterval);
    });
  }

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";

    const mutObs = new MutationObserver(() => {
      const newLang = document.body.dataset.activeLang || "en";
      if (newLang !== lang) {
        lang = newLang;
        startSequence();
      }
    });
    mutObs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });

    // Start immediately since hero is always visible on load
    // Small delay for page paint
    schedule(() => startSequence(), 100);

    return () => {
      reset();
      mutObs.disconnect();
    };
  });
</script>

<div bind:this={el} class="space-y-6">
  <!-- Eyebrow -->
  <div class="mb-4 h-5">
    {#if eyebrowVisible}
      <span class="eyebrow-reveal font-mono text-xs tracking-[0.4em] uppercase text-[var(--color-accent)] opacity-70">
        {content[lang].eyebrow}
      </span>
    {/if}
  </div>

  <!-- Title -->
  <h1 class="font-heading text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
    <span class="inline-block overflow-hidden">
      {#if titleLine1Visible}
        <span class="title-line-reveal inline-block">
          {content[lang].titleLine1}
        </span>
      {/if}
    </span>
    <br/>
    <span class="inline-block overflow-hidden">
      {#if titleLine2Visible}
        <span class="title-accent-reveal inline-block text-[var(--color-accent)]">
          {content[lang].titleLine2}
        </span>
      {/if}
    </span>
  </h1>

  <!-- Animated subtitle -->
  <p class="text-lg md:text-xl max-w-2xl leading-relaxed min-h-[3em]">
    {#each wordGroups as group, i}
      {#if group.visible}
        <span
          class="word-group inline-block mr-[0.3em]"
          class:word-glow={group.special === "glow"}
          class:word-lean-in={group.special === "lean-in"}
          class:word-tune-out={group.special === "tune-out"}
          class:word-plain={!group.special}
          style="animation-delay: 0ms"
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
  /* Eyebrow: fade in + slide right */
  .eyebrow-reveal {
    animation: fadeSlideRight 0.6s ease-out forwards;
  }
  @keyframes fadeSlideRight {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 0.7; transform: translateX(0); }
  }

  /* Title lines: slide up from below */
  .title-line-reveal {
    animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .title-accent-reveal {
    animation: slideUpGlow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(100%); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUpGlow {
    from { opacity: 0; transform: translateY(100%); text-shadow: none; }
    to { opacity: 1; transform: translateY(0); text-shadow: 0 0 40px color-mix(in srgb, var(--color-accent) 30%, transparent); }
  }

  /* Plain words: fly up + fade in */
  .word-plain {
    color: var(--color-text-muted);
    animation: wordFlyUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes wordFlyUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* "cinematic" — glows gold */
  .word-glow {
    color: var(--color-accent);
    animation: wordGlow 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes wordGlow {
    from { opacity: 0; transform: translateY(20px); text-shadow: none; }
    to { opacity: 1; transform: translateY(0); text-shadow: 0 0 25px color-mix(in srgb, var(--color-accent) 35%, transparent); }
  }

  /* "lean in" — scales forward, bold, gold accent */
  .word-lean-in {
    color: var(--color-accent);
    font-weight: 700;
    animation: leanIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes leanIn {
    0% { opacity: 0; transform: translateY(20px) scale(0.8); }
    60% { opacity: 1; transform: translateY(-2px) scale(1.12); }
    100% { opacity: 1; transform: translateY(0) scale(1.05); text-shadow: 0 0 30px color-mix(in srgb, var(--color-accent) 40%, transparent); }
  }

  /* "not tune out" — fades to dim, slight shrink */
  .word-tune-out {
    animation: tuneOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes tuneOut {
    0% { opacity: 0; transform: translateY(20px) scale(1); color: var(--color-text-muted); }
    40% { opacity: 0.7; transform: translateY(0) scale(1); color: var(--color-text-muted); }
    100% { opacity: 0.35; transform: translateY(2px) scale(0.95); color: var(--color-text-muted); filter: blur(0.5px); }
  }
</style>
