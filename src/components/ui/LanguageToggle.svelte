<script lang="ts">
  import { currentLang, languages } from "@/lib/i18n";
  import { onMount } from "svelte";

  let activeLang = $state("en");

  onMount(() => {
    currentLang.subscribe((lang) => {
      activeLang = lang;
    });
    // Initialize on mount
    currentLang.set(activeLang);
  });

  function switchLang(code: string) {
    currentLang.set(code);
  }
</script>

<div class="fixed top-4 right-4 z-50 flex gap-1 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
  {#each languages as lang}
    <button
      class="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300"
      class:active={activeLang === lang.code}
      onclick={() => switchLang(lang.code)}
    >
      {lang.label}
    </button>
  {/each}
</div>

<style>
  button {
    color: var(--color-text-muted);
  }
  button:hover {
    color: var(--color-text);
  }
  button.active {
    background-color: var(--color-accent);
    color: var(--color-background);
  }
</style>
