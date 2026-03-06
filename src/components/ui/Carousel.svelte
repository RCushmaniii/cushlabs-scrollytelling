<script lang="ts">
  interface Props {
    items: Array<{ image: string; title: string; description: string }>;
    columns?: number;
  }

  let { items, columns = 3 }: Props = $props();
</script>

<!-- Grid on desktop, scroll-snap on mobile -->
<div
  class="flex gap-6 overflow-x-auto snap-x snap-mandatory md:grid md:overflow-visible pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0"
  style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
>
  {#each items as item, i}
    <div
      class="reveal reveal-delay-{Math.min(i + 1, 8)} flex-shrink-0 w-[80vw] md:w-auto snap-center bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-white/5 transition-transform duration-300 hover:scale-[1.02]"
    >
      {#if item.image}
        <div class="aspect-video overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            class="w-full h-full object-cover"
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
