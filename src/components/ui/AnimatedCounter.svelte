<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    target: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    active?: boolean; // If provided, wait for this to be true before animating
  }

  let { target, suffix = "", prefix = "", duration = 2000, active }: Props = $props();

  let display = $state("0");
  let el: HTMLElement;
  let hasAnimated = $state(false);

  onMount(() => {
    // If no active prop, self-trigger on intersection (backward compat)
    if (active === undefined) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            animateCount();
          } else {
            display = "0";
            hasAnimated = false;
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  });

  // When controlled by active prop
  $effect(() => {
    if (active !== undefined) {
      if (active && !hasAnimated) {
        animateCount();
      } else if (!active) {
        display = "0";
        hasAnimated = false;
      }
    }
  });

  function animateCount() {
    hasAnimated = true;
    const start = performance.now();
    const isFloat = !Number.isInteger(target);

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
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
