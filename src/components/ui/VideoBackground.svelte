<script lang="ts">
  import { onMount } from "svelte";

  let { src, sectionId }: { src: string; sectionId: string } = $props();

  let video: HTMLVideoElement;
  let visible = $state(false);

  onMount(() => {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.warn(`[VideoBackground] Section #${sectionId} not found`);
      return;
    }

    // Observer to show/hide and play/pause based on section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        const isIn = entries[0].isIntersecting;
        visible = isIn;
        if (!video) return;
        if (isIn) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      if (video) video.pause();
    };
  });
</script>

<div class="video-fixed-bg" class:visible>
  <video
    bind:this={video}
    src={src}
    muted
    loop
    playsinline
    disablepictureinpicture
    preload="auto"
    class="video-el"
  ></video>
  <div class="video-overlay"></div>
</div>

<style>
  .video-fixed-bg {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .video-fixed-bg.visible {
    opacity: 1;
  }

  .video-el {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    object-fit: cover;
  }

  .video-overlay {
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
    .video-fixed-bg {
      transition: opacity 0.3s ease;
    }
  }
</style>
