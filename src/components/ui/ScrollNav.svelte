<script lang="ts">
  import { onMount } from "svelte";

  let visible = $state(true);

  onMount(() => {
    function checkScroll() {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      visible = window.scrollY < scrollMax - 100;
    }
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener("scroll", checkScroll);
  });

  function scrollToNext() {
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

{#if visible}
  <button
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-black/50 animate-float"
    onclick={scrollToNext}
    aria-label="Scroll to next section"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
{/if}

<style>
  button {
    color: var(--color-accent);
  }
</style>
