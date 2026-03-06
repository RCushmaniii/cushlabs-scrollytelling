<script lang="ts">
  import { isPlaying, togglePlayback } from "@/lib/audio";
  import { onMount } from "svelte";

  let playing = $state(false);

  onMount(() => {
    isPlaying.subscribe((val) => {
      playing = val;
    });
  });
</script>

<button
  class="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/10 transition-all duration-300 hover:bg-black/60"
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

<style>
  button {
    color: var(--color-text);
  }
  button:hover {
    color: var(--color-accent);
  }
</style>
