<script lang="ts">
  import { onMount } from "svelte";
  import { getEmail } from "@/lib/email";

  let lang = $state("en");
  let emailAddr = $state("");

  // Form state
  let name = $state("");
  let email = $state("");
  let preferredDate = $state("");
  let preferredTime = $state("");
  let message = $state("");
  let submitting = $state(false);
  let submitted = $state(false);
  let error = $state("");

  // Compute min date (tomorrow) for date picker
  let minDate = $state("");

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";
    emailAddr = getEmail();

    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    minDate = tomorrow.toISOString().split("T")[0];

    const obs = new MutationObserver(() => {
      lang = document.body.dataset.activeLang || "en";
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });
    return () => obs.disconnect();
  });

  const t: Record<string, Record<string, string>> = {
    en: {
      badge: "Free Consultation",
      title: "Book Your Free Call",
      subtitle: "30 minutes. No pitch, no pressure. We'll learn about your story and show you what scrollytelling can do.",
      duration: "Duration",
      durationValue: "30 minutes",
      cost: "Cost",
      costValue: "Free — no strings",
      format: "Format",
      formatValue: "Video call (Zoom/Meet)",
      whatTitle: "What to Expect",
      what1: "We'll learn about your story and who you're trying to reach",
      what2: "Share relevant examples and what makes scrollytelling effective",
      what3: "Discuss scope, timeline, and a clear path forward",
      what4: "No pressure, no pitch — just an honest conversation",
      nameLabel: "Name",
      emailLabel: "Email",
      dateLabel: "Preferred Date",
      timeLabel: "Preferred Time",
      timePlaceholder: "Select a time...",
      timeMorning: "Morning (9:00 – 12:00)",
      timeAfternoon: "Afternoon (12:00 – 17:00)",
      timeEvening: "Evening (17:00 – 20:00)",
      timeFlexible: "Flexible — any time works",
      messageLabel: "Anything else?",
      messagePlaceholder: "Optional — tell us anything that would help us prepare for the call.",
      submit: "Book Consultation",
      sending: "Booking...",
      required: "*",
      timezone: "Times are in your local timezone",
      errorRequired: "Please enter your name, email, and pick a date.",
      errorGeneric: "Something went wrong. Try again or reach out via WhatsApp.",
      successTitle: "You're Booked",
      successDesc: "We'll confirm your time slot and send a calendar invite within 24 hours.",
      successCta: "Back to Home",
      orReach: "Or reach us directly",
    },
    es: {
      badge: "Consulta Gratuita",
      title: "Reserva Tu Llamada Gratis",
      subtitle: "30 minutos. Sin ventas, sin presion. Conoceremos tu historia y te mostraremos lo que el scrollytelling puede hacer.",
      duration: "Duracion",
      durationValue: "30 minutos",
      cost: "Costo",
      costValue: "Gratis — sin compromiso",
      format: "Formato",
      formatValue: "Videollamada (Zoom/Meet)",
      whatTitle: "Que Esperar",
      what1: "Conoceremos tu historia y a quien quieres llegar",
      what2: "Compartiremos ejemplos relevantes y que hace efectivo al scrollytelling",
      what3: "Discutiremos alcance, cronograma y un camino claro",
      what4: "Sin presion, sin ventas — solo una conversacion honesta",
      nameLabel: "Nombre",
      emailLabel: "Correo",
      dateLabel: "Fecha Preferida",
      timeLabel: "Horario Preferido",
      timePlaceholder: "Selecciona un horario...",
      timeMorning: "Manana (9:00 – 12:00)",
      timeAfternoon: "Tarde (12:00 – 17:00)",
      timeEvening: "Noche (17:00 – 20:00)",
      timeFlexible: "Flexible — cualquier horario",
      messageLabel: "Algo mas?",
      messagePlaceholder: "Opcional — cuentanos lo que nos ayude a prepararnos para la llamada.",
      submit: "Reservar Consulta",
      sending: "Reservando...",
      required: "*",
      timezone: "Los horarios son en tu zona horaria local",
      errorRequired: "Ingresa tu nombre, correo y selecciona una fecha.",
      errorGeneric: "Hubo un error. Intenta de nuevo o escribenos por WhatsApp.",
      successTitle: "Reservado",
      successDesc: "Confirmaremos tu horario y enviaremos una invitacion de calendario en 24 horas.",
      successCta: "Volver al Inicio",
      orReach: "O contactanos directamente",
    },
  };

  function i(key: string): string {
    return t[lang]?.[key] ?? t.en[key] ?? key;
  }

  function formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";

    if (!name.trim() || !email.trim() || !preferredDate) {
      error = i("errorRequired");
      return;
    }

    submitting = true;

    // Detect user timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const res = await fetch("https://formspree.io/f/mlgwnqky", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          _replyto: email.trim(),
          preferredDate,
          preferredTime: preferredTime || "flexible",
          timezone: tz,
          message: message.trim() || undefined,
          _subject: `Consultation booking: ${name.trim()} — ${formatDateForDisplay(preferredDate)}`,
          _type: "consultation",
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

  function getWhatsAppUrl(): string {
    const msg = lang === "es"
      ? "Hola Robert! Me gustaria agendar una consulta sobre scrollytelling."
      : "Hi Robert! I'd like to book a scrollytelling consultation.";
    return `https://api.whatsapp.com/send/?phone=523315590572&text=${encodeURIComponent(msg)}&type=phone_number&app_absent=0`;
  }
</script>

<!-- Hero -->
<section class="pt-28 pb-6 px-6 max-w-[1100px] mx-auto animate-fade-up">
  <span class="inline-block font-mono text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-full px-4 py-1.5 mb-6">
    {i("badge")}
  </span>
  <h1 class="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] tracking-tight mb-4">
    {i("title")}
  </h1>
  <p class="text-lg text-[var(--color-text-muted)] leading-relaxed max-w-[650px] mb-8">
    {i("subtitle")}
  </p>

  <!-- Detail cards -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
    <div class="glass-card">
      <p class="card-label">{i("duration")}</p>
      <p class="card-value">{i("durationValue")}</p>
    </div>
    <div class="glass-card">
      <p class="card-label">{i("cost")}</p>
      <p class="card-value">{i("costValue")}</p>
    </div>
    <div class="glass-card">
      <p class="card-label">{i("format")}</p>
      <p class="card-value">{i("formatValue")}</p>
    </div>
  </div>
</section>

<!-- Booking section -->
<section class="max-w-[900px] mx-auto px-6 pb-16">
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
    <!-- Left column: What to expect -->
    <div class="lg:col-span-2">
      <div class="glass-panel p-8 lg:sticky lg:top-28">
        <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-5">{i("whatTitle")}</h3>
        <div class="space-y-3">
          {#each [i("what1"), i("what2"), i("what3"), i("what4")] as item}
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{item}</p>
            </div>
          {/each}
        </div>

        <!-- Direct contact -->
        <div class="mt-8 pt-6 border-t border-white/5">
          <p class="text-xs text-[var(--color-text-muted)] mb-3">{i("orReach")}</p>
          <div class="space-y-2">
            {#if emailAddr}
              <a href="mailto:{emailAddr}" class="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:opacity-80 transition-opacity">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {emailAddr}
              </a>
            {/if}
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-sm text-[#25D366] hover:opacity-80 transition-opacity">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Right column: Form -->
    <div class="lg:col-span-3">
      {#if submitted}
        <!-- Success state -->
        <div class="glass-panel p-10 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="font-heading text-2xl font-bold text-[var(--color-text)] mb-3">{i("successTitle")}</h3>
          <p class="text-[var(--color-text-muted)] max-w-md mx-auto mb-8">{i("successDesc")}</p>
          <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5">
            {i("successCta")}
          </a>
        </div>
      {:else}
        <div class="glass-panel p-8 md:p-10">
          <form onsubmit={handleSubmit}>
            <div class="space-y-5">
              <!-- Name -->
              <div>
                <label for="c-name" class="form-label">
                  {i("nameLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
                </label>
                <input type="text" id="c-name" bind:value={name} required autocomplete="name" class="form-input" />
              </div>

              <!-- Email -->
              <div>
                <label for="c-email" class="form-label">
                  {i("emailLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
                </label>
                <input type="email" id="c-email" bind:value={email} required autocomplete="email" class="form-input" />
              </div>

              <!-- Date & Time row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="c-date" class="form-label">
                    {i("dateLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
                  </label>
                  <input type="date" id="c-date" bind:value={preferredDate} min={minDate} required class="form-input" />
                </div>
                <div>
                  <label for="c-time" class="form-label">{i("timeLabel")}</label>
                  <select id="c-time" bind:value={preferredTime} class="form-input">
                    <option value="">{i("timePlaceholder")}</option>
                    <option value="morning">{i("timeMorning")}</option>
                    <option value="afternoon">{i("timeAfternoon")}</option>
                    <option value="evening">{i("timeEvening")}</option>
                    <option value="flexible">{i("timeFlexible")}</option>
                  </select>
                </div>
              </div>
              <p class="text-xs text-[var(--color-text-muted)] opacity-50 -mt-2">{i("timezone")}</p>

              <!-- Optional message -->
              <div>
                <label for="c-message" class="form-label">{i("messageLabel")}</label>
                <textarea id="c-message" bind:value={message} rows="3" placeholder={i("messagePlaceholder")} class="form-input resize-y min-h-[80px]"></textarea>
              </div>
            </div>

            {#if error}
              <div class="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            {/if}

            <!-- Submit -->
            <div class="mt-8">
              <button type="submit" disabled={submitting} class="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold text-lg rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--color-accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0">
                {#if submitting}
                  <span class="w-5 h-5 border-2 border-[var(--color-background)]/30 border-t-[var(--color-background)] rounded-full animate-spin"></span>
                  {i("sending")}
                {:else}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {i("submit")}
                {/if}
              </button>
            </div>
          </form>
        </div>
      {/if}
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

  .glass-card {
    background: rgba(10, 10, 10, 0.65);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
  }

  .card-label {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }

  .card-value {
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .form-label {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.9rem;
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

  /* Date input styling */
  input[type="date"].form-input {
    color-scheme: dark;
  }
  input[type="date"].form-input::-webkit-calendar-picker-indicator {
    filter: invert(0.7);
    cursor: pointer;
  }

  select.form-input {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23A0998C' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
  }
  select.form-input option {
    background: #1a1a1a;
    color: var(--color-text);
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  :global(.animate-fade-up) {
    animation: fade-up 0.6s ease-out;
  }
</style>
