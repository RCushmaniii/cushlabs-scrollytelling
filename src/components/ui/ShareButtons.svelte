<script lang="ts">
  import { currentLang } from "@/lib/i18n";
  import { onMount } from "svelte";

  interface Props {
    url?: string;
    titleEn?: string;
    titleEs?: string;
  }

  let { url = "", titleEn = "Check out this presentation", titleEs = "Mira esta presentacion" }: Props = $props();

  let activeLang = $state("en");
  let copied = $state(false);
  let shareUrl = $state("");

  onMount(() => {
    shareUrl = url || window.location.href;
    currentLang.subscribe((lang) => {
      activeLang = lang;
    });
  });

  function getShareText(): string {
    return activeLang === "es" ? titleEs : titleEn;
  }

  function shareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(getShareText() + " " + shareUrl)}`,
      "_blank"
    );
  }

  function shareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  }

  function shareEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(getShareText())}&body=${encodeURIComponent(shareUrl)}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    }
  }
</script>

<div class="flex gap-3 items-center">
  <button
    onclick={shareWhatsApp}
    class="share-btn w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all"
    aria-label="Share on WhatsApp"
  >
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </button>

  <button
    onclick={shareLinkedIn}
    class="share-btn w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#0077B5]/20 hover:border-[#0077B5]/40 transition-all"
    aria-label="Share on LinkedIn"
  >
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </button>

  <button
    onclick={shareEmail}
    class="share-btn w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
    aria-label="Share via email"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </button>

  <button
    onclick={copyLink}
    class="share-btn w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
    aria-label="Copy link"
  >
    {#if copied}
      <svg class="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    {:else}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    {/if}
  </button>
</div>

<style>
  .share-btn {
    color: var(--color-text-muted);
  }
  .share-btn:hover {
    color: var(--color-text);
  }
</style>
