<script lang="ts">
  import { onMount } from "svelte";
  import { currentLang, languages } from "@/lib/i18n";

  let activeLang = $state("en");

  onMount(() => {
    currentLang.subscribe((lang) => { activeLang = lang; });
  });

  function toggleLang() {
    currentLang.set(activeLang === "en" ? "es" : "en");
  }
</script>

<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--color-background)]/80 border-b border-white/5">
  <div class="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
    <!-- Brand -->
    <a href="/" class="font-heading text-lg font-bold text-[var(--color-text)] hover:opacity-80 transition-opacity">
      CUSH<span class="text-[var(--color-accent)]">LABS</span>
    </a>

    <div class="flex items-center gap-4">
      <a
        href="/services"
        class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors hidden sm:inline"
      >
        {activeLang === "es" ? "Servicios" : "Services"}
      </a>
      <a
        href="/consultation"
        class="text-xs font-semibold text-[var(--color-accent)] hover:opacity-80 transition-opacity"
      >
        {activeLang === "es" ? "Reservar Llamada" : "Book a Call"}
      </a>
      <a
        href="/"
        class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors hidden sm:inline"
      >
        {activeLang === "es" ? "Ver Presentacion" : "View Presentation"}
      </a>

      <!-- Language toggle -->
      <button
        onclick={toggleLang}
        class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/30 transition-colors"
      >
        <span class:opacity-100={activeLang === "en"} class:opacity-40={activeLang !== "en"}>EN</span>
        <span class="opacity-30">/</span>
        <span class:opacity-100={activeLang === "es"} class:opacity-40={activeLang !== "es"}>ES</span>
      </button>
    </div>
  </div>
</nav>
