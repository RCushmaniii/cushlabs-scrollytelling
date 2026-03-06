<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    items: Array<{ image: string; title: string; description: string }>;
    columns?: number;
  }

  let { items, columns = 3 }: Props = $props();

  let scrollContainer: HTMLElement;
  let activeIndex = $state(0);
  let isMobile = $state(false);

  onMount(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    isMobile = mq.matches;
    mq.addEventListener("change", (e) => { isMobile = e.matches; });

    if (scrollContainer) {
      let debounceTimer: number;
      scrollContainer.addEventListener("scroll", () => {
        clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          updateActiveDot();
        }, 60);
      }, { passive: true });
    }
  });

  function updateActiveDot() {
    if (!scrollContainer || !isMobile) return;
    const cards = scrollContainer.querySelectorAll(".carousel-card");
    const containerCenter = scrollContainer.scrollLeft + scrollContainer.offsetWidth / 2;

    let closestIdx = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const el = card as HTMLElement;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    activeIndex = closestIdx;
  }

  function scrollToCard(index: number) {
    if (!scrollContainer) return;
    const cards = scrollContainer.querySelectorAll(".carousel-card");
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    activeIndex = index;
  }

  // Expose auto-cycle for presentation mode
  onMount(() => {
    (window as any).__carouselCycle = (audioDuration: number) => {
      if (!isMobile) return;
      const interval = (audioDuration || 20) / items.length;
      let idx = 0;
      (window as any).__carouselTimer = setInterval(() => {
        idx = (idx + 1) % items.length;
        scrollToCard(idx);
      }, interval * 1000);
    };
    (window as any).__carouselStop = () => {
      clearInterval((window as any).__carouselTimer);
    };
    return () => {
      delete (window as any).__carouselCycle;
      delete (window as any).__carouselStop;
    };
  });
</script>

<!-- Grid on desktop, scroll-snap on mobile -->
<div
  bind:this={scrollContainer}
  class="carousel-container flex gap-6 overflow-x-auto snap-x snap-mandatory md:grid md:overflow-visible pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0"
  style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
>
  {#each items as item, i}
    <div
      class="carousel-card reveal reveal-delay-{Math.min(i + 1, 8)} flex-shrink-0 w-[80vw] md:w-auto snap-center bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-white/5 transition-transform duration-300 hover:scale-[1.02]"
    >
      {#if item.image}
        <div
          class="aspect-video overflow-hidden cursor-pointer"
          onclick={() => { if ((window as any).__openLightbox) (window as any).__openLightbox(item.image); }}
          role="button"
          tabindex="0"
          aria-label="View {item.title} full size"
        >
          <img
            src={item.image}
            alt={item.title}
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </div>
      {/if}
      <div class="p-6">
        <h3 class="font-heading text-lg font-bold mb-2 text-[var(--color-text)]">
          {item.title}
        </h3>
        <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  {/each}
</div>

<!-- Dot navigation (mobile only) -->
{#if isMobile && items.length > 1}
  <div class="flex justify-center gap-2 mt-4 md:hidden">
    {#each items as _, i}
      <button
        class="w-2 h-2 rounded-full transition-all duration-300"
        class:active={activeIndex === i}
        onclick={() => scrollToCard(i)}
        aria-label="Go to card {i + 1}"
      />
    {/each}
  </div>
{/if}

<style>
  .carousel-container {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .carousel-container::-webkit-scrollbar {
    display: none;
  }

  button {
    background: var(--color-text-muted);
    opacity: 0.3;
  }
  button.active {
    background: var(--color-accent);
    opacity: 1;
    width: 1.5rem;
    border-radius: 9999px;
  }
</style>
