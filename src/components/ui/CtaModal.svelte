<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    title?: string;
    buttonText?: string;
    href?: string;
  }

  let { title = "Ready to get started?", buttonText = "Get in Touch", href = "#contact" }: Props = $props();

  let open = $state(false);

  function show() {
    open = true;
    document.body.style.overflow = "hidden";
  }

  function hide() {
    open = false;
    document.body.style.overflow = "";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) hide();
  }

  onMount(() => {
    // Expose global function for triggering from Astro
    (window as any).__openCtaModal = show;
    return () => {
      delete (window as any).__openCtaModal;
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    onclick={hide}
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal -->
    <div
      class="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-8 md:p-12 max-w-lg w-full text-center animate-slide-up"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 class="font-heading text-2xl md:text-3xl font-bold mb-6 text-[var(--color-text)]">
        {title}
      </h2>

      <slot />

      <a
        {href}
        class="inline-block mt-6 px-8 py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-full transition-transform duration-300 hover:scale-105"
        onclick={hide}
      >
        {buttonText}
      </a>

      <button
        class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        onclick={hide}
        aria-label="Close modal"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}
