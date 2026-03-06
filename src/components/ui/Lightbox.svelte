<script lang="ts">
  import { onMount } from "svelte";

  let open = $state(false);
  let src = $state("");

  function show(imageSrc: string) {
    src = imageSrc;
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
    (window as any).__openLightbox = show;
    (window as any).__closeLightbox = hide;
    return () => {
      delete (window as any).__openLightbox;
      delete (window as any).__closeLightbox;
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-[250] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 cursor-pointer"
    onclick={hide}
    role="dialog"
    aria-modal="true"
    aria-label="Image lightbox"
  >
    <img
      {src}
      alt=""
      class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
      onclick={(e) => e.stopPropagation()}
    />
    <button
      class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
      onclick={hide}
      aria-label="Close lightbox"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
{/if}
