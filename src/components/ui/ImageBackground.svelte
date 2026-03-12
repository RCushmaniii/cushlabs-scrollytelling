<script lang="ts">
  import { onMount } from "svelte";

  let { src, sectionId }: { src: string; sectionId: string } = $props();

  let visible = $state(false);

  onMount(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => { visible = entries[0].isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(section);

    return () => observer.disconnect();
  });
</script>

<div class="img-fixed-bg" class:visible>
  <div class="img-el" style="background-image: url('{src}')"></div>
  <div class="img-overlay"></div>
</div>

<style>
  .img-fixed-bg {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .img-fixed-bg.visible {
    opacity: 1;
  }

  .img-el {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: calc(50% - 35px) center;
    background-repeat: no-repeat;
  }

  .img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.5) 40%,
      rgba(0, 0, 0, 0.6) 70%,
      rgba(0, 0, 0, 0.8) 100%
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .img-fixed-bg {
      transition: opacity 0.3s ease;
    }
  }
</style>
