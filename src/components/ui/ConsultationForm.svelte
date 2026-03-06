<script lang="ts">
  import { onMount } from "svelte";
  import { currentLang } from "@/lib/i18n";
  import { openMailto } from "@/lib/email";

  let activeLang = $state("en");
  let open = $state(false);
  let submitted = $state(false);
  let name = $state("");
  let email = $state("");
  let company = $state("");
  let message = $state("");

  onMount(() => {
    currentLang.subscribe((lang) => { activeLang = lang; });
    (window as any).__openConsultation = () => { open = true; document.body.style.overflow = "hidden"; };
    return () => { delete (window as any).__openConsultation; };
  });

  function hide() {
    open = false;
    document.body.style.overflow = "";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) hide();
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    // In production, this would POST to an API endpoint
    // For now, construct a mailto link as fallback
    openMailto(
      `Scrollytelling Consultation — ${company || name}`,
      `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`
    );
    submitted = true;
    setTimeout(() => { hide(); submitted = false; name = email = company = message = ""; }, 3000);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={hide}
    role="dialog"
    aria-modal="true"
  >
    <div
      class="bg-[var(--color-surface)] border border-white/10 rounded-2xl p-6 md:p-10 max-w-lg w-full animate-slide-up relative"
      onclick={(e) => e.stopPropagation()}
    >
      <button
        class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        onclick={hide}
        aria-label="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {#if submitted}
        <div class="text-center py-8">
          <div class="mb-4">
            <svg class="w-12 h-12 mx-auto text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="font-heading text-xl font-bold text-[var(--color-text)] mb-2">
            {activeLang === "es" ? "Mensaje enviado" : "Message sent"}
          </h3>
          <p class="text-sm text-[var(--color-text-muted)]">
            {activeLang === "es" ? "Nos pondremos en contacto pronto." : "We'll be in touch shortly."}
          </p>
        </div>
      {:else}
        <h2 class="font-heading text-2xl font-bold text-[var(--color-text)] mb-2">
          {activeLang === "es" ? "Consulta Gratuita" : "Free Consultation"}
        </h2>
        <p class="text-sm text-[var(--color-text-muted)] mb-6">
          {activeLang === "es"
            ? "Cuentanos sobre tu proyecto y te mostraremos como el scrollytelling puede transformar tu presentacion."
            : "Tell us about your project and we'll show you how scrollytelling can transform your presentation."}
        </p>

        <form onsubmit={handleSubmit} class="space-y-4">
          <div>
            <input
              type="text"
              bind:value={name}
              required
              placeholder={activeLang === "es" ? "Tu nombre" : "Your name"}
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <input
              type="email"
              bind:value={email}
              required
              placeholder={activeLang === "es" ? "Tu email" : "Your email"}
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <input
              type="text"
              bind:value={company}
              placeholder={activeLang === "es" ? "Empresa (opcional)" : "Company (optional)"}
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <textarea
              bind:value={message}
              rows="3"
              placeholder={activeLang === "es" ? "Cuentanos sobre tu proyecto..." : "Tell us about your project..."}
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:border-[var(--color-accent)]/50 focus:outline-none transition-colors resize-none"
            ></textarea>
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-full transition-transform duration-300 hover:scale-[1.02]"
          >
            {activeLang === "es" ? "Enviar Solicitud" : "Send Request"}
          </button>
        </form>
      {/if}
    </div>
  </div>
{/if}
