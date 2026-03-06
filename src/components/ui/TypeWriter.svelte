<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    words: string[];
    speed?: number;
    pause?: number;
  }

  let { words, speed = 80, pause = 2000 }: Props = $props();

  let display = $state("");
  let wordIndex = $state(0);
  let charIndex = $state(0);
  let deleting = $state(false);
  let el: HTMLElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          tick();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });

  function tick() {
    const currentWord = words[wordIndex % words.length];

    if (!deleting) {
      display = currentWord.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex >= currentWord.length) {
        deleting = true;
        setTimeout(tick, pause);
        return;
      }
    } else {
      display = currentWord.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex <= 0) {
        deleting = false;
        wordIndex++;
      }
    }

    setTimeout(tick, deleting ? speed / 2 : speed);
  }
</script>

<span bind:this={el} class="inline">
  {display}<span class="typing-cursor text-[var(--color-accent)]">|</span>
</span>

<style>
  .typing-cursor {
    animation: blink 0.8s step-end infinite;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }
</style>
