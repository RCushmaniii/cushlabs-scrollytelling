<script lang="ts">
  import { onMount } from "svelte";

  let atBottom = $state(false);
  let scrolledPastHero = $state(false);

  onMount(() => {
    function checkScroll() {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      atBottom = window.scrollY >= scrollMax - 100;
      scrolledPastHero = window.scrollY > 100;
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener("scroll", checkScroll);
  });

  function handleClick() {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const sections = document.querySelectorAll("section[id]");
    const viewportCenter = window.innerHeight / 2;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top > viewportCenter * 0.5) {
        section.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
  }
</script>

<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
  {#if !scrolledPastHero}
    <span class="scroll-label text-xs text-[var(--color-text-muted)] opacity-60 transition-opacity duration-500">
      <span data-lang="en" class="active">Scroll down</span>
      <span data-lang="es">Desliza hacia abajo</span>
    </span>
  {/if}

  <button
    class="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/50"
    onclick={handleClick}
    aria-label={atBottom ? "Back to top" : "Scroll to next section"}
  >
    {#if atBottom}
      <span class="scroll-arrow-up block w-3 h-3 border-l-2 border-t-2 border-[var(--color-accent)] rotate-[0deg]" />
    {:else}
      <span class="scroll-arrow block w-3 h-3 border-r-2 border-b-2 border-[var(--color-accent)] rotate-[0deg]" />
    {/if}
  </button>

  {#if atBottom}
    <span class="text-xs text-[var(--color-text-muted)] opacity-60">
      <span data-lang="en" class="active">Back to top</span>
      <span data-lang="es">Volver arriba</span>
    </span>
  {/if}
</div>

<style>
  .scroll-arrow {
    transform: rotate(45deg) translateY(0);
    animation: scrollBounce 2s ease-in-out infinite;
  }
  .scroll-arrow-up {
    transform: rotate(45deg) translateY(0);
    animation: scrollBounceUp 2s ease-in-out infinite;
  }

  @keyframes scrollBounce {
    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 1; }
    50% { transform: rotate(45deg) translateY(6px); opacity: 0.4; }
  }
  @keyframes scrollBounceUp {
    0%, 100% { transform: rotate(45deg) translateY(0); opacity: 1; }
    50% { transform: rotate(45deg) translateY(-6px); opacity: 0.4; }
  }
</style>
