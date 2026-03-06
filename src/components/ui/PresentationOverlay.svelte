<script lang="ts">
  import { onMount } from "svelte";
  import {
    presentationState,
    startPresentation,
    viewSiteMode,
  } from "@/lib/presentation";
  import { languages } from "@/lib/i18n";

  let state = $state<"overlay" | "presenting" | "browsing">("overlay");
  let fadeOut = $state(false);

  onMount(() => {
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
    class="presentation-overlay fixed inset-0 z-[300] flex items-center justify-center bg-[var(--color-background)]"
    class:fade-out={fadeOut}
  >
    <div class="text-center px-6 max-w-2xl">
      <div class="mb-8 opacity-60">
        <span class="font-mono text-xs tracking-[0.4em] uppercase text-[var(--color-accent)]">
          CushLabs Presents
        </span>
      </div>

      <h1 class="font-heading text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-[var(--color-text)] leading-[1.1]">
        <span data-lang="en" class="active">The Future<br/>Starts Here</span>
        <span data-lang="es">El Futuro<br/>Comienza Aqui</span>
      </h1>

      <p class="text-lg text-[var(--color-text-muted)] mb-12 max-w-lg mx-auto">
        <span data-lang="en" class="active">A cinematic scrollytelling experience</span>
        <span data-lang="es">Una experiencia cinematografica de narrativa interactiva</span>
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
    </div>
  </div>
{/if}

{#if state === "presenting"}
  <button
    onclick={() => {
      import("@/lib/presentation").then(m => m.exitPresentation());
    }}
    class="pres-exit-btn fixed top-4 right-20 z-50 px-4 py-2 text-xs font-medium bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
  >
    <span data-lang="en" class="active">Exit Presentation</span>
    <span data-lang="es">Salir de Presentacion</span>
  </button>
{/if}

<style>
  .presentation-overlay {
    transition: opacity 0.6s ease-out;
  }
  .presentation-overlay.fade-out {
    opacity: 0;
    pointer-events: none;
  }
</style>
