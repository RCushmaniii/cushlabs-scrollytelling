<script lang="ts">
  import { onMount } from "svelte";
  import {
    presentationState,
    startPresentation,
    viewSiteMode,
  } from "@/lib/presentation";
  import { currentLang, languages } from "@/lib/i18n";

  let state = $state<"overlay" | "presenting" | "browsing">("overlay");
  let fadeOut = $state(false);
  let activeLang = $state("en");
  let autoLaunch = $state(false);

  function switchLang(code: string) {
    currentLang.set(code);
  }

  onMount(() => {
    currentLang.subscribe((lang) => { activeLang = lang; });

    presentationState.subscribe((s) => {
      if (s !== "overlay" && state === "overlay") {
        fadeOut = true;
        setTimeout(() => {
          state = s;
          fadeOut = false;
        }, 600);
      } else {
        state = s;
        fadeOut = false;
      }
    });

    // URL parameters: ?mode=prez&lang=es
    const params = new URLSearchParams(window.location.search);

    // Set language from URL if provided
    const langParam = params.get("lang");
    if (langParam) {
      currentLang.set(langParam);
    }

    // Flag auto-launch so the overlay shows a streamlined "tap to begin" state
    // We can't auto-play audio without a user gesture (browser policy)
    if (params.get("mode") === "prez") {
      autoLaunch = true;
    }
  });

  function handlePlay() {
    startPresentation();
  }

  function handleBrowse() {
    viewSiteMode();
  }

</script>

{#if state === "overlay"}
  <div
    class="presentation-overlay fixed inset-0 z-[300] flex items-center justify-center bg-[var(--color-background)]/95 backdrop-blur-sm"
    class:fade-out={fadeOut}
  >
    {#if autoLaunch}
      <!-- Streamlined auto-launch: just a tap target to unlock audio + start -->
      <div class="text-center px-6 max-w-2xl">
        <div class="mb-8 opacity-60">
          <span class="font-mono text-xs tracking-[0.4em] uppercase text-[var(--color-accent)]">
            CushLabs AI Services
          </span>
        </div>

        <h1 class="font-heading text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-[var(--color-text)] leading-[1.1]">
          <span data-lang="en" class="active">Your Story,<br/><span class="text-[var(--color-accent)]">Unforgettable</span></span>
          <span data-lang="es">Tu Historia,<br/><span class="text-[var(--color-accent)]">Inolvidable</span></span>
        </h1>

        <button
          onclick={handlePlay}
          class="auto-launch-btn group px-10 py-5 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold text-lg rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>
            <span data-lang="en" class="active">Tap to Begin</span>
            <span data-lang="es">Toca para Comenzar</span>
          </span>
        </button>
      </div>
    {:else}
      <!-- Standard overlay with full options -->
      <div class="text-center px-6 max-w-2xl">
        <div class="mb-8 opacity-60">
          <span class="font-mono text-xs tracking-[0.4em] uppercase text-[var(--color-accent)]">
            CushLabs AI Services
          </span>
        </div>

        <h1 class="font-heading text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-[var(--color-text)] leading-[1.1]">
          <span data-lang="en" class="active">Your Story,<br/><span class="text-[var(--color-accent)]">Unforgettable</span></span>
          <span data-lang="es">Tu Historia,<br/><span class="text-[var(--color-accent)]">Inolvidable</span></span>
        </h1>

        <p class="text-lg text-[var(--color-text-muted)] mb-12 max-w-lg mx-auto">
          <span data-lang="en" class="active">Cinematic scrollytelling presentations that make audiences lean in</span>
          <span data-lang="es">Presentaciones cinematograficas de scrollytelling que hacen que las audiencias se inclinen</span>
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onclick={handlePlay}
            class="group px-8 py-4 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>
              <span data-lang="en" class="active">Play Presentation</span>
              <span data-lang="es">Reproducir Presentacion</span>
            </span>
          </button>

          <button
            onclick={handleBrowse}
            class="px-8 py-4 border-2 border-white/20 text-[var(--color-text)] font-semibold rounded-full transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            <span data-lang="en" class="active">Browse Freely</span>
            <span data-lang="es">Explorar Libremente</span>
          </button>
        </div>

        <!-- Language toggle -->
        <div class="mt-10 flex justify-center">
          <div class="flex gap-0.5 bg-black/40 backdrop-blur-md rounded-full p-0.5 border border-white/10">
            {#each languages as lang}
              <button
                class="lang-btn px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300"
                class:active={activeLang === lang.code}
                onclick={() => switchLang(lang.code)}
              >
                {lang.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}


<style>
  .presentation-overlay {
    transition: opacity 0.6s ease-out;
  }
  .presentation-overlay.fade-out {
    opacity: 0;
    pointer-events: none;
  }
  .lang-btn {
    color: var(--color-text-muted);
  }
  .lang-btn:hover {
    color: var(--color-text);
  }
  .lang-btn.active {
    background-color: var(--color-accent);
    color: var(--color-background);
  }
  .auto-launch-btn {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 var(--color-accent); }
    50% { box-shadow: 0 0 20px 4px var(--color-accent); }
  }
</style>
