<script lang="ts">
  import { onMount } from "svelte";
  import { getEmail } from "@/lib/email";

  let lang = $state("en");
  let emailAddr = $state("");

  // Form state
  let name = $state("");
  let email = $state("");
  let phone = $state("");
  let message = $state("");
  let consent = $state(false);
  let submitting = $state(false);
  let submitted = $state(false);
  let error = $state("");

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";
    emailAddr = getEmail();

    const obs = new MutationObserver(() => {
      lang = document.body.dataset.activeLang || "en";
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });
    return () => obs.disconnect();
  });

  const t: Record<string, Record<string, string>> = {
    en: {
      badge: "Get in Touch",
      title: "Let's Talk About Your Project",
      subtitle: "Tell us what you're working on. We'll get back to you with honest thoughts and a clear path forward — no pressure, no pitch.",
      ctaPrimary: "Book a Free Call",
      ctaSecondary: "Send a Message",
      reassurance: "Response within 24 hours. Usually faster.",
      formTitle: "Send a Message",
      nameLabel: "Name",
      emailLabel: "Email",
      phoneLabel: "Phone",
      phoneHint: "Optional — include country code for WhatsApp",
      messageLabel: "Message",
      messagePlaceholder: "What are you building? What does success look like for you?",
      consentLabel: "I agree to the Terms of Use and Privacy Policy",
      submit: "Send Message",
      sending: "Sending...",
      successTitle: "Message Sent",
      successDesc: "We'll get back to you within 24 hours — usually faster.",
      errorGeneric: "Something went wrong. Please try again or reach out via WhatsApp.",
      errorRequired: "Please complete the required fields and accept the terms.",
      sidebarTitle: "Other Ways to Reach Us",
      sidebarSubtitle: "Drop us a message here or reach out on WhatsApp — whatever's easier.",
      sendEmail: "Send Email",
      sendWhatsApp: "Send WhatsApp",
      timezone: "Time Zone",
      timezoneValue: "Guadalajara, Mexico (UTC-6)",
      talkLive: "Prefer to talk live?",
      bookCall: "Book a free consultation call",
      required: "*",
    },
    es: {
      badge: "Contactanos",
      title: "Hablemos de Tu Proyecto",
      subtitle: "Cuentanos en que estas trabajando. Te responderemos con ideas honestas y un camino claro — sin presion, sin ventas.",
      ctaPrimary: "Agendar Llamada Gratis",
      ctaSecondary: "Enviar Mensaje",
      reassurance: "Respuesta en 24 horas. Usualmente mas rapido.",
      formTitle: "Envia un Mensaje",
      nameLabel: "Nombre",
      emailLabel: "Correo",
      phoneLabel: "Telefono",
      phoneHint: "Opcional — incluye codigo de pais para WhatsApp",
      messageLabel: "Mensaje",
      messagePlaceholder: "Que estas construyendo? Como se ve el exito para ti?",
      consentLabel: "Acepto los Terminos de Uso y la Politica de Privacidad",
      submit: "Enviar Mensaje",
      sending: "Enviando...",
      successTitle: "Mensaje Enviado",
      successDesc: "Te responderemos en menos de 24 horas — normalmente mas rapido.",
      errorGeneric: "Hubo un error al enviar. Intenta de nuevo o escribenos por WhatsApp.",
      errorRequired: "Completa los campos requeridos y acepta los terminos.",
      sidebarTitle: "Otras Formas de Contactarnos",
      sidebarSubtitle: "Mandanos un mensaje aqui o por WhatsApp — lo que te sea mas facil.",
      sendEmail: "Enviar Email",
      sendWhatsApp: "Enviar WhatsApp",
      timezone: "Zona Horaria",
      timezoneValue: "Guadalajara, Mexico (UTC-6)",
      talkLive: "Prefieres hablar en vivo?",
      bookCall: "Agenda una consulta gratuita",
      required: "*",
    },
  };

  function i(key: string): string {
    return t[lang]?.[key] ?? t.en[key] ?? key;
  }

  function getWhatsAppUrl(): string {
    const msg = lang === "es"
      ? "Hola Robert! Encontre tu sitio de scrollytelling y tengo una pregunta sobre un proyecto."
      : "Hi Robert! I found your scrollytelling site and had a quick question about a project.";
    return `https://api.whatsapp.com/send/?phone=523315590572&text=${encodeURIComponent(msg)}&type=phone_number&app_absent=0`;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";

    if (!name.trim() || !email.trim() || !message.trim() || !consent) {
      error = i("errorRequired");
      return;
    }

    submitting = true;

    try {
      const res = await fetch("https://formspree.io/f/mlgwnqky", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          _replyto: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
          _subject: `New contact from ${name.trim()} — cushlabs-scrollytelling`,
          _language: lang,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.errors ? data.errors.map((e: any) => e.message).join(", ") : "Unknown error");
      }

      submitted = true;
    } catch {
      error = i("errorGeneric");
    } finally {
      submitting = false;
    }
  }
</script>

<!-- Hero -->
<section class="pt-28 pb-8 px-6 text-center max-w-[800px] mx-auto animate-fade-up">
  <span class="inline-block font-mono text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-full px-4 py-1.5 mb-6">
    {i("badge")}
  </span>
  <h1 class="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] tracking-tight mb-4">
    {i("title")}
  </h1>
  <p class="text-lg text-[var(--color-text-muted)] leading-relaxed max-w-[600px] mx-auto mb-6">
    {i("subtitle")}
  </p>
  <div class="flex flex-wrap gap-3 justify-center mb-3">
    <a href="/consultation" class="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--color-accent)]/20">
      {i("ctaPrimary")}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
    <a href="#contact-form" class="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-[var(--color-text-muted)] font-semibold rounded-xl transition-all duration-300 hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]">
      {i("ctaSecondary")}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </a>
  </div>
  <p class="text-xs text-[var(--color-text-muted)] opacity-60">{i("reassurance")}</p>
</section>

<!-- Contact Grid -->
<section id="contact-form" class="max-w-[1100px] mx-auto px-6 py-12">
  <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-start">

    <!-- Form Panel -->
    <div class="glass-panel p-8 md:p-10">
      {#if submitted}
        <div class="text-center py-12">
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="font-heading text-xl font-bold text-[var(--color-text)] mb-2">{i("successTitle")}</h3>
          <p class="text-[var(--color-text-muted)]">{i("successDesc")}</p>
        </div>
      {:else}
        <h2 class="font-heading text-xl font-bold text-[var(--color-text)] mb-6">{i("formTitle")}</h2>
        <form onsubmit={handleSubmit} class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="name" class="form-label">
                {i("nameLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
              </label>
              <input type="text" id="name" bind:value={name} required autocomplete="name" class="form-input" />
            </div>
            <div>
              <label for="email" class="form-label">
                {i("emailLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
              </label>
              <input type="email" id="email" bind:value={email} required autocomplete="email" class="form-input" />
            </div>
          </div>

          <div>
            <label for="phone" class="form-label">{i("phoneLabel")}</label>
            <input type="tel" id="phone" bind:value={phone} autocomplete="tel" class="form-input" />
            <p class="text-xs text-[var(--color-text-muted)] mt-1.5 opacity-60">{i("phoneHint")}</p>
          </div>

          <div>
            <label for="message" class="form-label">
              {i("messageLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
            </label>
            <textarea id="message" bind:value={message} required rows="5" placeholder={i("messagePlaceholder")} class="form-input resize-y min-h-[120px]"></textarea>
          </div>

          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={consent} class="mt-0.5 w-4 h-4 accent-[var(--color-accent)] flex-shrink-0" />
            <span class="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {i("consentLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
            </span>
          </label>

          {#if error}
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          {/if}

          <button
            type="submit"
            disabled={submitting}
            class="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--color-accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {#if submitting}
              <span class="w-4 h-4 border-2 border-[var(--color-background)]/30 border-t-[var(--color-background)] rounded-full animate-spin"></span>
              {i("sending")}
            {:else}
              {i("submit")}
            {/if}
          </button>
        </form>
      {/if}
    </div>

    <!-- Sidebar -->
    <div class="glass-panel p-8">
      <h2 class="font-heading text-lg font-bold text-[var(--color-text)] mb-1">{i("sidebarTitle")}</h2>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">{i("sidebarSubtitle")}</p>

      <div class="space-y-3 mb-6">
        {#if emailAddr}
          <a
            href="mailto:{emailAddr}?subject={encodeURIComponent('CushLabs Scrollytelling Inquiry')}"
            class="sidebar-btn border border-white/10 hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {i("sendEmail")}
          </a>
        {/if}
        <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" class="sidebar-btn bg-[#16a34a] text-white hover:bg-[#15803d]">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {i("sendWhatsApp")}
        </a>
      </div>

      <!-- Info rows -->
      <div class="space-y-0 mb-6">
        <div class="flex items-center justify-between py-2.5 border-b border-white/5">
          <span class="text-xs text-[var(--color-text-muted)]">{i("timezone")}</span>
          <span class="text-xs text-[var(--color-text)]">{i("timezoneValue")}</span>
        </div>
        {#if emailAddr}
          <div class="flex items-center justify-between py-2.5">
            <span class="text-xs text-[var(--color-text-muted)]">Email</span>
            <span class="text-xs text-[var(--color-text)]">{emailAddr}</span>
          </div>
        {/if}
      </div>

      <hr class="border-white/5 mb-5" />
      <p class="text-xs text-[var(--color-text-muted)] mb-2">{i("talkLive")}</p>
      <a href="/consultation" class="text-sm font-semibold text-[var(--color-accent)] hover:opacity-80 transition-opacity inline-flex items-center gap-1">
        {i("bookCall")}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  </div>
</section>

<style>
  .glass-panel {
    background: rgba(10, 10, 10, 0.65);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
  }

  .form-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }

  .form-input {
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    transition: border-color 0.3s, background 0.3s;
    outline: none;
  }
  .form-input:focus {
    border-color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 4%, transparent);
  }
  .form-input::placeholder {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .sidebar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    color: var(--color-text);
    transition: all 0.3s;
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  :global(.animate-fade-up) {
    animation: fade-up 0.8s ease-out;
  }
</style>
