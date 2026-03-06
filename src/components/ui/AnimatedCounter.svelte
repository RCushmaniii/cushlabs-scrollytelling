<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    target: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
  }

  let { target, suffix = "", prefix = "", duration = 2000 }: Props = $props();

  let display = $state("0");
  let el: HTMLElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCount();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });

  function animateCount() {
    const start = performance.now();
    const isFloat = !Number.isInteger(target);

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      display = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }
</script>

<span bind:this={el} class="tabular-nums font-heading font-bold">
  {prefix}{display}{suffix}
</span>
