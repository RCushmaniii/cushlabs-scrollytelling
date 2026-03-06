<script lang="ts">
  import { onMount } from "svelte";
  import { currentLang, languages } from "@/lib/i18n";
  import { isPlaying, togglePlayback, audioEnabled } from "@/lib/audio";
  import { presentationState } from "@/lib/presentation";

  let activeLang = $state("en");
  let playing = $state(false);
  let hasAudio = $state(false);
  let presState = $state<"overlay" | "presenting" | "browsing">("overlay");
  let scrolled = $state(false);

  onMount(() => {
    currentLang.subscribe((lang) => { activeLang = lang; });
    isPlaying.subscribe((val) => { playing = val; });
    audioEnabled.subscribe((val) => { hasAudio = val; });
    presentationState.subscribe((s) => { presState = s; });
    currentLang.set(activeLang);

    function onScroll() {
      scrolled = window.scrollY > 20;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  function switchLang(code: string) {
    currentLang.set(code);
  }

  function exitPres() {
    import("@/lib/presentation").then(m => m.exitPresentation());
  }
</script>

{#if presState !== "overlay"}
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    class:scrolled
  >
    <div class="max-w-[1440px] mx-auto flex items-center justify-between px-4 py-3">
      <!-- Left: audio toggle -->
      <div class="flex items-center gap-2">
        <button
          class="nav-btn w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300"
          onclick={togglePlayback}
          aria-label={playing ? "Pause narration" : "Play narration"}
        >
          {#if playing}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          {:else}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          {/if}
        </button>
      </div>

      <!-- Right: exit presentation + language toggle -->
      <div class="flex items-center gap-2">
        {#if presState === "presenting"}
          <button
            onclick={exitPres}
            class="nav-btn px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300"
          >
            <span data-lang="en" class="active">Exit</span>
            <span data-lang="es">Salir</span>
          </button>
        {/if}

        <div class="flex gap-0.5 bg-black/40 backdrop-blur-md rounded-full p-0.5 border border-white/10">
          {#each languages as lang}
            <button
              class="lang-btn px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300"
              class:active={activeLang === lang.code}
              onclick={() => switchLang(lang.code)}
            >
              {lang.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </nav>
{/if}

<style>
  nav {
    background: transparent;
  }
  nav.scrolled {
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .nav-btn {
    color: var(--color-text-muted);
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .nav-btn:hover {
    color: var(--color-accent);
    background: rgba(0, 0, 0, 0.6);
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
</style>
