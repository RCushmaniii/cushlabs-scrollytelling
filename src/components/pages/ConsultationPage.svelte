<script lang="ts">
  import { onMount } from "svelte";
  import { getEmail } from "@/lib/email";

  let lang = $state("en");
  let emailAddr = $state("");

  // Form state
  let step = $state(1);
  let name = $state("");
  let email = $state("");
  let company = $state("");
  let projectType = $state("");
  let timeline = $state("");
  let message = $state("");
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
      badge: "Free Consultation",
      title: "Let's Build Something Unforgettable",
      subtitle: "A 30-minute call where we learn about your story, your audience, and your goals — then map out exactly how scrollytelling can deliver the impact you need.",
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
      step1: "About You",
      step2: "Your Project",
      step3: "Details",
      nameLabel: "Name",
      emailLabel: "Email",
      companyLabel: "Company / Organization",
      companyPlaceholder: "Optional",
      projectLabel: "Project Type",
      projectPlaceholder: "Select one...",
      optPitch: "Investor Pitch Deck",
      optReport: "Annual / Impact Report",
      optData: "Data Story / Visualization",
      optMarketing: "Marketing / Brand Story",
      optOther: "Other",
      timelineLabel: "Timeline",
      timelinePlaceholder: "Select one...",
      timeASAP: "ASAP (within 2 weeks)",
      time1: "1-2 months",
      time3: "3+ months",
      timeExploring: "Just exploring",
      messageLabel: "Tell us about your project",
      messagePlaceholder: "What story do you want to tell? Who is your audience? What does success look like?",
      next: "Next",
      back: "Back",
      submit: "Book Consultation",
      sending: "Booking...",
      required: "*",
      errorRequired: "Please fill in the required fields.",
      errorGeneric: "Something went wrong. Try again or reach out via WhatsApp.",
      successTitle: "You're Booked",
      successDesc: "We'll send a calendar invite to your email within 24 hours with available times. Looking forward to learning about your project.",
      successCta: "Back to Home",
      orReach: "Or reach us directly",
    },
    es: {
      badge: "Consulta Gratuita",
      title: "Construyamos Algo Inolvidable",
      subtitle: "Una llamada de 30 minutos donde conocemos tu historia, tu audiencia y tus objetivos — luego mapeamos exactamente como el scrollytelling puede entregar el impacto que necesitas.",
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
      step1: "Sobre Ti",
      step2: "Tu Proyecto",
      step3: "Detalles",
      nameLabel: "Nombre",
      emailLabel: "Correo",
      companyLabel: "Empresa / Organizacion",
      companyPlaceholder: "Opcional",
      projectLabel: "Tipo de Proyecto",
      projectPlaceholder: "Selecciona uno...",
      optPitch: "Pitch para Inversores",
      optReport: "Reporte Anual / de Impacto",
      optData: "Historia de Datos / Visualizacion",
      optMarketing: "Marketing / Historia de Marca",
      optOther: "Otro",
      timelineLabel: "Cronograma",
      timelinePlaceholder: "Selecciona uno...",
      timeASAP: "Lo antes posible (en 2 semanas)",
      time1: "1-2 meses",
      time3: "3+ meses",
      timeExploring: "Solo explorando",
      messageLabel: "Cuentanos sobre tu proyecto",
      messagePlaceholder: "Que historia quieres contar? Quien es tu audiencia? Como se ve el exito?",
      next: "Siguiente",
      back: "Atras",
      submit: "Reservar Consulta",
      sending: "Reservando...",
      required: "*",
      errorRequired: "Completa los campos requeridos.",
      errorGeneric: "Hubo un error. Intenta de nuevo o escribenos por WhatsApp.",
      successTitle: "Reservado",
      successDesc: "Te enviaremos una invitacion de calendario a tu correo en 24 horas con horarios disponibles. Esperamos conocer tu proyecto.",
      successCta: "Volver al Inicio",
      orReach: "O contactanos directamente",
    },
  };

  function i(key: string): string {
    return t[lang]?.[key] ?? t.en[key] ?? key;
  }

  function nextStep() {
    error = "";
    if (step === 1 && (!name.trim() || !email.trim())) {
      error = i("errorRequired");
      return;
    }
    if (step < 3) step++;
  }

  function prevStep() {
    error = "";
    if (step > 1) step--;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";

    if (!name.trim() || !email.trim()) {
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
          company: company.trim() || undefined,
          projectType: projectType || undefined,
          timeline: timeline || undefined,
          message: message.trim() || undefined,
          _subject: `Consultation request from ${name.trim()} — cushlabs-scrollytelling`,
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
  <!-- What to expect -->
  <div class="glass-panel p-8 mb-8">
    <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-5">{i("whatTitle")}</h3>
    <div class="space-y-3">
      {#each [i("what1"), i("what2"), i("what3"), i("what4")] as item}
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-base text-[var(--color-text-muted)] leading-relaxed">{item}</p>
        </div>
      {/each}
    </div>
  </div>

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
    <!-- Step progress -->
    <div class="flex items-center justify-center gap-2 mb-8">
      {#each [1, 2, 3] as s}
        <div class="flex items-center gap-2" class:opacity-40={s > step}>
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold transition-colors {s <= step ? 'step-active' : 'step-inactive'}"
          >
            {s}
          </div>
          <span class="text-sm font-mono text-[var(--color-text-muted)] hidden sm:inline">
            {i(`step${s}`)}
          </span>
          {#if s < 3}
            <div class="w-8 h-px bg-white/10 mx-1"></div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Form -->
    <div class="glass-panel p-8 md:p-10">
      <form onsubmit={handleSubmit}>
        <!-- Step 1: About You -->
        {#if step === 1}
          <div class="space-y-5 animate-fade-up">
            <div>
              <label for="c-name" class="form-label">
                {i("nameLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
              </label>
              <input type="text" id="c-name" bind:value={name} required autocomplete="name" class="form-input" />
            </div>
            <div>
              <label for="c-email" class="form-label">
                {i("emailLabel")} <span class="text-[var(--color-accent)]">{i("required")}</span>
              </label>
              <input type="email" id="c-email" bind:value={email} required autocomplete="email" class="form-input" />
            </div>
            <div>
              <label for="c-company" class="form-label">{i("companyLabel")}</label>
              <input type="text" id="c-company" bind:value={company} placeholder={i("companyPlaceholder")} autocomplete="organization" class="form-input" />
            </div>
          </div>
        {/if}

        <!-- Step 2: Your Project -->
        {#if step === 2}
          <div class="space-y-5 animate-fade-up">
            <div>
              <label for="c-project" class="form-label">{i("projectLabel")}</label>
              <select id="c-project" bind:value={projectType} class="form-input">
                <option value="">{i("projectPlaceholder")}</option>
                <option value="pitch">{i("optPitch")}</option>
                <option value="report">{i("optReport")}</option>
                <option value="data">{i("optData")}</option>
                <option value="marketing">{i("optMarketing")}</option>
                <option value="other">{i("optOther")}</option>
              </select>
            </div>
            <div>
              <label for="c-timeline" class="form-label">{i("timelineLabel")}</label>
              <select id="c-timeline" bind:value={timeline} class="form-input">
                <option value="">{i("timelinePlaceholder")}</option>
                <option value="asap">{i("timeASAP")}</option>
                <option value="1-2months">{i("time1")}</option>
                <option value="3+months">{i("time3")}</option>
                <option value="exploring">{i("timeExploring")}</option>
              </select>
            </div>
          </div>
        {/if}

        <!-- Step 3: Details -->
        {#if step === 3}
          <div class="space-y-5 animate-fade-up">
            <div>
              <label for="c-message" class="form-label">{i("messageLabel")}</label>
              <textarea id="c-message" bind:value={message} rows="6" placeholder={i("messagePlaceholder")} class="form-input resize-y min-h-[150px]"></textarea>
            </div>
          </div>
        {/if}

        {#if error}
          <div class="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        {/if}

        <!-- Navigation buttons -->
        <div class="flex items-center justify-between mt-8">
          <div>
            {#if step > 1}
              <button type="button" onclick={prevStep} class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                {i("back")}
              </button>
            {/if}
          </div>
          <div>
            {#if step < 3}
              <button type="button" onclick={nextStep} class="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5">
                {i("next")}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {:else}
              <button type="submit" disabled={submitting} class="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--color-accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0">
                {#if submitting}
                  <span class="w-4 h-4 border-2 border-[var(--color-background)]/30 border-t-[var(--color-background)] rounded-full animate-spin"></span>
                  {i("sending")}
                {:else}
                  {i("submit")}
                {/if}
              </button>
            {/if}
          </div>
        </div>
      </form>
    </div>

    <!-- Direct contact fallback -->
    <div class="text-center mt-8">
      <p class="text-sm text-[var(--color-text-muted)] mb-2">{i("orReach")}</p>
      <div class="flex items-center justify-center gap-4">
        {#if emailAddr}
          <a href="mailto:{emailAddr}" class="text-sm text-[var(--color-accent)] hover:opacity-80 transition-opacity">
            {emailAddr}
          </a>
        {/if}
        <span class="text-[var(--color-text-muted)] opacity-30">|</span>
        <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" class="text-sm text-[#25D366] hover:opacity-80 transition-opacity">
          WhatsApp
        </a>
      </div>
    </div>
  {/if}
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

  .step-active {
    background: var(--color-accent);
    color: var(--color-background);
  }
  .step-inactive {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-muted);
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  :global(.animate-fade-up) {
    animation: fade-up 0.6s ease-out;
  }
</style>
