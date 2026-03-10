<script lang="ts">
  import { onMount } from "svelte";
  import { presentationState } from "@/lib/presentation";
  import AnimatedCounter from "@/components/ui/AnimatedCounter.svelte";

  let el: HTMLElement;
  let lang = $state("en");
  let presenting = $state(false);
  let step = $state(0);
  let running = $state(false);
  let timeouts: ReturnType<typeof setTimeout>[] = [];

  // Typed display strings
  let headlinePrefix = $state("");
  let cycleWord = $state("");
  let cycleTyping = $state(false);
  let subtextDisplay = $state("");
  let subtextDone = $state(false);
  let card1Desc = $state("");
  let card2Desc = $state("");
  let card3Desc = $state("");

  // Card visibility & counter triggers
  let card1Visible = $state(false);
  let card2Visible = $state(false);
  let card3Visible = $state(false);
  let counter1Active = $state(false);
  let counter2Active = $state(false);
  let counter3Active = $state(false);

  const content: Record<string, {
    headlinePrefix: string;
    cycleWords: string[];
    subtext: string;
    card1: string;
    card2: string;
    card3: string;
  }> = {
    en: {
      headlinePrefix: "Your pitch deck is ",
      cycleWords: ["forgotten.", "skipped.", "ignored.", "generic."],
      subtext: "Investors see hundreds of decks a month. Most are 12 slides in a Google doc that look exactly like the last 12 they saw. The ones that win funding aren't just informative — they're experiences.",
      card1: "of investors say storytelling influences their decision more than data alone",
      card2: "before a pitch is judged — first impressions are the only impression",
      card3: "more engagement with interactive narratives versus traditional slide decks",
    },
    es: {
      headlinePrefix: "Tu presentacion es ",
      cycleWords: ["olvidada.", "ignorada.", "generica.", "aburrida."],
      subtext: "Los inversores ven cientos de presentaciones al mes. La mayoria son 12 diapositivas en un documento de Google que se ven exactamente como las ultimas 12 que vieron. Las que ganan financiamiento no son solo informativas — son experiencias.",
      card1: "de los inversores dicen que la narrativa influye mas en su decision que solo los datos",
      card2: "antes de que se juzgue una presentacion — la primera impresion es la unica",
      card3: "mas engagement con narrativas interactivas versus presentaciones tradicionales",
    },
  };

  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      if (running) fn();
    }, ms);
    timeouts.push(id);
    return id;
  }

  function typeString(
    text: string,
    setter: (v: string) => void,
    speed: number,
    onDone?: () => void
  ) {
    let i = 0;
    function tick() {
      if (!running) return;
      i++;
      setter(text.slice(0, i));
      if (i < text.length) {
        schedule(tick, speed);
      } else {
        onDone?.();
      }
    }
    tick();
  }

  function startCycling() {
    if (!running) return;
    cycleTyping = true;
    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function cycleTick() {
      if (!running) return;
      const c = content[lang];
      const word = c.cycleWords[wordIdx % c.cycleWords.length];

      if (!deleting) {
        charIdx++;
        cycleWord = word.slice(0, charIdx);
        if (charIdx >= word.length) {
          deleting = true;
          schedule(cycleTick, 2500);
          return;
        }
      } else {
        charIdx--;
        cycleWord = word.slice(0, charIdx);
        if (charIdx <= 0) {
          deleting = false;
          wordIdx++;
        }
      }
      schedule(cycleTick, deleting ? 40 : 90);
    }
    cycleTick();
  }

  function reset() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
    running = false;
    step = 0;
    headlinePrefix = "";
    cycleWord = "";
    cycleTyping = false;
    subtextDisplay = "";
    subtextDone = false;
    card1Desc = "";
    card2Desc = "";
    card3Desc = "";
    card1Visible = false;
    card2Visible = false;
    card3Visible = false;
    counter1Active = false;
    counter2Active = false;
    counter3Active = false;
  }

  function startSequence() {
    reset();
    running = true;
    step = 1;
    const c = content[lang];

    // Step 1: Type headline prefix
    typeString(c.headlinePrefix, (v) => (headlinePrefix = v), 55, () => {
      // Step 2: Start cycling words + type subtext
      step = 2;
      startCycling();

      schedule(() => {
        typeString(c.subtext, (v) => (subtextDisplay = v), 18, () => {
          subtextDone = true;

          // Step 3: Card 1
          schedule(() => {
            step = 3;
            card1Visible = true;
            counter1Active = true;
            typeString(c.card1, (v) => (card1Desc = v), 22, () => {

              // Step 4: Card 2
              schedule(() => {
                step = 4;
                card2Visible = true;
                counter2Active = true;
                typeString(c.card2, (v) => (card2Desc = v), 22, () => {

                  // Step 5: Card 3
                  schedule(() => {
                    step = 5;
                    card3Visible = true;
                    counter3Active = true;
                    typeString(c.card3, (v) => (card3Desc = v), 22, () => {
                      step = 6;
                    });
                  }, 400);
                });
              }, 400);
            });
          }, 600);
        });
      }, 300);
    });
  }

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";

    const unsub = presentationState.subscribe((s) => { presenting = s === "presenting"; });

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
      { threshold: 0.15 }
    );
    intObs.observe(el);

    // Restart animations when tab returns during presentation
    function handleRestart() {
      if (running) startSequence();
    }
    window.addEventListener("presentation:restart-section", handleRestart);

    return () => {
      reset();
      unsub();
      mutObs.disconnect();
      intObs.disconnect();
      window.removeEventListener("presentation:restart-section", handleRestart);
    };
  });
</script>

<div bind:this={el} class="space-y-12">
  <!-- Headline -->
  <div class="max-w-3xl">
    <h2 class="font-heading text-3xl md:text-5xl font-bold leading-tight min-h-[1.2em]">
      {#if step >= 1}
        <span>{headlinePrefix}</span>{#if step >= 2}<span class="text-[var(--color-accent)]">{cycleWord}</span>{#if cycleTyping}<span class="typing-cursor text-[var(--color-accent)]">|</span>{/if}{/if}
      {/if}
    </h2>
  </div>

  <!-- Subtext (hidden in presentation mode — audience listens to narration instead) -->
  {#if !presenting}
  <div class="max-w-3xl min-h-[3em]">
    {#if step >= 2}
      <p class="text-xl md:text-2xl text-[var(--color-text-muted)] leading-relaxed">
        {subtextDisplay}{#if !subtextDone && subtextDisplay.length > 0}<span class="typing-cursor text-[var(--color-text-muted)]">|</span>{/if}
        {#if subtextDone}
          <em class="text-[var(--color-accent)] not-italic font-semibold">
            {#if lang === "en"}
              That's the gap.
            {:else}
              Esa es la brecha.
            {/if}
          </em>
        {/if}
      </p>
    {/if}
  </div>
  {/if}

  <!-- Stat Cards -->
  <div class="grid md:grid-cols-3 gap-6">
    <!-- Card 1: 92% -->
    <div
      class="bg-white/[0.03] rounded-xl p-6 border border-white/5 transition-all duration-500"
      class:opacity-0={!card1Visible}
      class:translate-y-4={!card1Visible}
      class:opacity-100={card1Visible}
      class:translate-y-0={card1Visible}
    >
      <div class="text-3xl md:text-4xl text-[var(--color-accent)]">
        <AnimatedCounter target={92} suffix="%" duration={1500} active={counter1Active} />
      </div>
      <p class="text-sm text-[var(--color-text-muted)] mt-3 min-h-[2.5em]">
        {card1Desc}{#if step === 3 && card1Desc.length > 0}<span class="typing-cursor text-[var(--color-text-muted)]">|</span>{/if}
      </p>
    </div>

    <!-- Card 2: 5 sec -->
    <div
      class="bg-white/[0.03] rounded-xl p-6 border border-white/5 transition-all duration-500"
      class:opacity-0={!card2Visible}
      class:translate-y-4={!card2Visible}
      class:opacity-100={card2Visible}
      class:translate-y-0={card2Visible}
    >
      <div class="text-3xl md:text-4xl text-[var(--color-accent)]">
        <AnimatedCounter target={5} duration={1000} active={counter2Active} />
        <span class="text-lg font-body">
          {#if lang === "en"}sec{:else}seg{/if}
        </span>
      </div>
      <p class="text-sm text-[var(--color-text-muted)] mt-3 min-h-[2.5em]">
        {card2Desc}{#if step === 4 && card2Desc.length > 0}<span class="typing-cursor text-[var(--color-text-muted)]">|</span>{/if}
      </p>
    </div>

    <!-- Card 3: 3x -->
    <div
      class="bg-white/[0.03] rounded-xl p-6 border border-white/5 transition-all duration-500"
      class:opacity-0={!card3Visible}
      class:translate-y-4={!card3Visible}
      class:opacity-100={card3Visible}
      class:translate-y-0={card3Visible}
    >
      <div class="text-3xl md:text-4xl text-[var(--color-accent)]">
        <AnimatedCounter target={3} suffix="x" duration={1000} active={counter3Active} />
      </div>
      <p class="text-sm text-[var(--color-text-muted)] mt-3 min-h-[2.5em]">
        {card3Desc}{#if step === 5 && card3Desc.length > 0}<span class="typing-cursor text-[var(--color-text-muted)]">|</span>{/if}
      </p>
    </div>
  </div>
</div>

<style>
  .typing-cursor {
    animation: blink 0.8s step-end infinite;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }
</style>
