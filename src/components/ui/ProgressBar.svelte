<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { getScrollProgress } from "@/lib/scroll";

  let progress = $state(0);
  let rafId: number;

  function updateProgress() {
    progress = getScrollProgress();
    rafId = requestAnimationFrame(updateProgress);
  }

  onMount(() => {
    rafId = requestAnimationFrame(updateProgress);
  });

  onDestroy(() => {
    if (typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
    }
  });
</script>

<div class="fixed top-0 left-0 w-full h-[3px] z-[60]">
  <div
    class="h-full transition-[width] duration-100 ease-out"
    style="width: {progress * 100}%; background: var(--color-accent);"
  />
</div>
