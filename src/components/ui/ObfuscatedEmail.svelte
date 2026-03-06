<script lang="ts">
  import { onMount } from "svelte";
  import { getEmail, openMailto } from "@/lib/email";

  interface Props {
    class?: string;
  }

  let { class: className = "" }: Props = $props();
  let display = $state("");

  onMount(() => {
    display = getEmail();
  });

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    openMailto();
  }
</script>

<!-- Honeypot: hidden fake mailto that traps bots -->
<a href="mailto:noreply@example.com" class="hidden" aria-hidden="true" tabindex="-1">contact</a>

<!-- Real email: assembled at runtime, invisible to scrapers -->
{#if display}
  <button onclick={handleClick} class="hover:underline cursor-pointer {className}">
    {display}
  </button>
{:else}
  <span class={className}>
    <span aria-hidden="true">info</span><span aria-hidden="true">@</span><span aria-hidden="true">cushlabs</span><span aria-hidden="true">.</span><span aria-hidden="true">ai</span>
  </span>
{/if}
