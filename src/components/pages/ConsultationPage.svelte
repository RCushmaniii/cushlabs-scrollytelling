<script lang="ts">
  import { onMount } from "svelte";
  import { getEmail } from "@/lib/email";

  let lang = $state("en");
  let emailAddr = $state("");

  const API_BASE = "https://cushlabs-booking.rcushmaniii.workers.dev";

  // Step state
  let currentStep = $state(1);

  // Step 1: Date & Time
  let calendarMonth = $state(new Date());
  let selectedDate = $state<Date | null>(null);
  let selectedTime = $state<string | null>(null);
  let timeSlots = $state<string[]>([]);
  let loadingSlots = $state(false);

  // Step 2: Your Details
  let name = $state("");
  let email = $state("");
  let phone = $state("");
  let notes = $state("");
  let submitting = $state(false);
  let error = $state("");

  // Step 3: Success
  let submitted = $state(false);

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
      step1: "Date & Time",
      step2: "Your Details",
      step3: "Confirmed",
      selectDate: "Select a date and time",
      selectedDateLabel: "Selected Date",
      selectDateBelow: "Choose a date below",
      selectTime: "Available Times",
      loading: "Loading...",
      noSlots: "No available times for this date.",
      nameLabel: "Full Name",
      emailLabel: "Email",
      phoneLabel: "Phone Number",
      phoneHint: "Optional — for WhatsApp confirmation",
      notesLabel: "Anything you'd like us to know?",
      notesPlaceholder: "Optional — anything that helps us prepare.",
      back: "Back",
      next: "Next",
      confirm: "Confirm Appointment",
      confirming: "Processing...",
      required: "*",
      errorRequired: "Please fill in the required fields.",
      errorDateTime: "Please select a date and time first.",
      errorGeneric: "Something went wrong. Try again or reach out via WhatsApp.",
      successTitle: "You're Booked",
      successDesc: "We'll send a calendar invite to your email with a Zoom/Meet link.",
      summaryDateTime: "Date & Time",
      summaryDetails: "Contact",
      summaryTimezone: "Times shown in your local timezone",
      summaryMeeting: "Meeting Type",
      summaryMeetingValue: "Video Call (Zoom/Google Meet)",
      summaryMeetingHint: "Link will be in your calendar invite",
      prepareTitle: "How to Prepare",
      prepareBody: "No prep needed. Just come ready to tell us about your story, your audience, and what you want to achieve. We'll handle the rest.",
      signOff: "Looking forward to it,",
      returnHome: "Return to Home",
      orReach: "Or reach us directly",
      notProvided: "Not provided",
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
      step1: "Fecha y Hora",
      step2: "Tus Datos",
      step3: "Confirmado",
      selectDate: "Selecciona fecha y hora",
      selectedDateLabel: "Fecha Seleccionada",
      selectDateBelow: "Elige una fecha abajo",
      selectTime: "Horarios Disponibles",
      loading: "Cargando...",
      noSlots: "No hay horarios disponibles para esta fecha.",
      nameLabel: "Nombre Completo",
      emailLabel: "Correo",
      phoneLabel: "Telefono",
      phoneHint: "Opcional — para confirmacion por WhatsApp",
      notesLabel: "Algo que quieras que sepamos?",
      notesPlaceholder: "Opcional — lo que nos ayude a prepararnos.",
      back: "Atras",
      next: "Siguiente",
      confirm: "Confirmar Cita",
      confirming: "Procesando...",
      required: "*",
      errorRequired: "Completa los campos requeridos.",
      errorDateTime: "Selecciona una fecha y hora primero.",
      errorGeneric: "Hubo un error. Intenta de nuevo o escribenos por WhatsApp.",
      successTitle: "Reservado",
      successDesc: "Te enviaremos una invitacion de calendario con el enlace de Zoom/Meet.",
      summaryDateTime: "Fecha y Hora",
      summaryDetails: "Contacto",
      summaryTimezone: "Horarios en tu zona horaria local",
      summaryMeeting: "Tipo de Reunion",
      summaryMeetingValue: "Videollamada (Zoom/Google Meet)",
      summaryMeetingHint: "El enlace estara en tu invitacion de calendario",
      prepareTitle: "Como Prepararte",
      prepareBody: "No necesitas preparar nada. Solo ven listo para contarnos tu historia, tu audiencia y lo que quieres lograr. Nosotros nos encargamos del resto.",
      signOff: "Con gusto,",
      returnHome: "Volver al Inicio",
      orReach: "O contactanos directamente",
      notProvided: "No proporcionado",
    },
  };

  function i(key: string): string {
    return t[lang]?.[key] ?? t.en[key] ?? key;
  }

  // Calendar helpers
  const monthNames: Record<string, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  };
  const dayNames: Record<string, string[]> = {
    en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    es: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
  };

  function getMonthLabel(): string {
    const names = monthNames[lang] || monthNames.en;
    return `${names[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`;
  }

  function getCalendarDays(): ({ day: number; date: Date; isPast: boolean; isToday: boolean; isSelected: boolean } | null)[] {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cells: ({ day: number; date: Date; isPast: boolean; isToday: boolean; isSelected: boolean } | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      cells.push({
        day,
        date,
        isPast: date < today,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
      });
    }
    return cells;
  }

  function prevMonth() {
    const d = new Date(calendarMonth);
    d.setMonth(d.getMonth() - 1);
    calendarMonth = d;
  }

  function nextMonth() {
    const d = new Date(calendarMonth);
    d.setMonth(d.getMonth() + 1);
    calendarMonth = d;
  }

  async function selectDate(date: Date) {
    selectedDate = date;
    selectedTime = null;
    timeSlots = [];
    loadingSlots = true;

    try {
      const dateStr = date.toISOString().split("T")[0];
      const res = await fetch(`${API_BASE}/slots/${dateStr}?lang=${lang}`);
      const data = await res.json();
      if (data.ok && data.slots?.length) {
        timeSlots = data.slots;
      } else {
        timeSlots = [];
      }
    } catch {
      timeSlots = [];
    } finally {
      loadingSlots = false;
    }
  }

  function selectTime(time: string) {
    selectedTime = time;
    // Auto-advance to step 2
    setTimeout(() => { currentStep = 2; }, 300);
  }

  function formatSelectedDate(): string {
    if (!selectedDate) return i("selectDateBelow");
    return selectedDate.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }

  async function handleConfirm() {
    error = "";

    if (!selectedDate || !selectedTime) {
      error = i("errorDateTime");
      currentStep = 1;
      return;
    }

    if (!name.trim() || !email.trim()) {
      error = i("errorRequired");
      return;
    }

    submitting = true;

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await fetch(`${API_BASE}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          date: dateStr,
          time: selectedTime,
          lang,
          notes: notes.trim() || "",
        }),
      });

      const data = await res.json();
      if (data.ok) {
        submitted = true;
        currentStep = 3;
      } else {
        throw new Error(data.error || "Booking failed");
      }
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

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";
    emailAddr = getEmail();

    // Auto-select today or tomorrow
    const now = new Date();
    if (now.getHours() >= 18) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      selectDate(tomorrow);
    } else {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      selectDate(today);
    }

    const obs = new MutationObserver(() => {
      lang = document.body.dataset.activeLang || "en";
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });
    return () => obs.disconnect();
  });
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

  <!-- Step progress -->
  <div class="flex items-center justify-center gap-2 mb-8">
    {#each [1, 2, 3] as s}
      <div class="flex items-center gap-2" class:opacity-40={s > currentStep}>
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold transition-colors {s <= currentStep ? 'step-active' : 'step-inactive'}"
        >
          {#if s < currentStep}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            {s}
          {/if}
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

  <!-- Step 1: Date & Time -->
  {#if currentStep === 1}
    <div class="glass-panel p-8 md:p-10 animate-fade-up">
      <h2 class="font-heading text-2xl font-bold text-[var(--color-text)] mb-2">{i("selectDate")}</h2>

      <!-- Selected date display -->
      <div class="rounded-xl border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4 mb-6">
        <p class="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1">{i("selectedDateLabel")}</p>
        <p class="text-xl font-heading font-bold text-[var(--color-text)]">{formatSelectedDate()}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Calendar -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <button type="button" onclick={prevMonth} class="p-2 rounded-xl border border-white/10 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors text-[var(--color-text)]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h3 class="text-lg font-heading font-bold text-[var(--color-text)]">{getMonthLabel()}</h3>
            <button type="button" onclick={nextMonth} class="p-2 rounded-xl border border-white/10 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors text-[var(--color-text)]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          <!-- Day headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            {#each (dayNames[lang] || dayNames.en) as day}
              <div class="text-center text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-text-muted)] py-2">{day}</div>
            {/each}
          </div>

          <!-- Calendar days -->
          <div class="grid grid-cols-7 gap-1">
            {#each getCalendarDays() as cell}
              {#if cell === null}
                <div class="p-2"></div>
              {:else if cell.isPast}
                <button type="button" disabled class="cal-day cal-past">{cell.day}</button>
              {:else if cell.isSelected}
                <button type="button" class="cal-day cal-selected" onclick={() => selectDate(cell.date)}>{cell.day}</button>
              {:else}
                <button type="button" class="cal-day cal-available" class:cal-today={cell.isToday} onclick={() => selectDate(cell.date)}>{cell.day}</button>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Time slots -->
        <div>
          <h3 class="text-lg font-heading font-semibold text-[var(--color-text)] mb-4">{i("selectTime")}</h3>
          {#if loadingSlots}
            <p class="text-[var(--color-text-muted)] text-center py-8">{i("loading")}</p>
          {:else if timeSlots.length === 0}
            <p class="text-[var(--color-text-muted)] text-center py-8">{i("noSlots")}</p>
          {:else}
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {#each timeSlots as time}
                <button
                  type="button"
                  class="time-slot {selectedTime === time ? 'time-selected' : ''}"
                  onclick={() => selectTime(time)}
                >
                  {time}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Step 2: Your Details -->
  {#if currentStep === 2}
    <div class="glass-panel p-8 md:p-10 animate-fade-up">
      <h2 class="font-heading text-2xl font-bold text-[var(--color-text)] mb-6">{i("step2")}</h2>

      {#if error}
        <div class="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      {/if}

      <div class="space-y-5 max-w-md mx-auto">
        <div>
          <label for="c-name" class="form-label">
            {i("nameLabel")} <span class="text-[var(--color-accent)]">*</span>
          </label>
          <input type="text" id="c-name" bind:value={name} required autocomplete="name" class="form-input" />
        </div>
        <div>
          <label for="c-email" class="form-label">
            {i("emailLabel")} <span class="text-[var(--color-accent)]">*</span>
          </label>
          <input type="email" id="c-email" bind:value={email} required autocomplete="email" class="form-input" />
        </div>
        <div>
          <label for="c-phone" class="form-label">{i("phoneLabel")}</label>
          <input type="tel" id="c-phone" bind:value={phone} autocomplete="tel" class="form-input" />
          <p class="text-xs text-[var(--color-text-muted)] mt-1.5 opacity-60">{i("phoneHint")}</p>
        </div>
        <div>
          <label for="c-notes" class="form-label">{i("notesLabel")}</label>
          <textarea id="c-notes" bind:value={notes} rows="3" placeholder={i("notesPlaceholder")} class="form-input resize-y min-h-[80px]"></textarea>
        </div>
      </div>

      <div class="flex items-center justify-between mt-8 max-w-md mx-auto">
        <button type="button" onclick={() => { error = ""; currentStep = 1; }} class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          {i("back")}
        </button>
        <button
          type="button"
          onclick={handleConfirm}
          disabled={submitting}
          class="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {#if submitting}
            <span class="w-4 h-4 border-2 border-[var(--color-background)]/30 border-t-[var(--color-background)] rounded-full animate-spin"></span>
            {i("confirming")}
          {:else}
            {i("confirm")}
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <!-- Step 3: Success -->
  {#if currentStep === 3}
    <div class="glass-panel p-10 animate-fade-up">
      <div class="text-center mb-6">
        <div class="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="font-heading text-3xl font-bold text-[var(--color-text)] mb-3">{i("successTitle")}</h2>
        <p class="text-lg text-[var(--color-text-muted)] max-w-lg mx-auto">{i("successDesc")}</p>
      </div>

      <div class="max-w-lg mx-auto space-y-6">
        <!-- Summary card -->
        <div class="rounded-xl p-6 space-y-4 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">{i("summaryDateTime")}</p>
              <p class="text-lg font-heading font-bold text-[var(--color-text)]">{formatSelectedDate()} — {selectedTime}</p>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">{i("summaryTimezone")}</p>
            </div>
          </div>

          <div class="border-t border-[var(--color-accent)]/20"></div>

          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div>
              <p class="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">{i("summaryDetails")}</p>
              <p class="font-heading font-bold text-[var(--color-text)]">{name}</p>
              <p class="text-[var(--color-text-muted)]">{email}</p>
              {#if phone}
                <p class="text-[var(--color-text-muted)]">{phone}</p>
              {/if}
            </div>
          </div>

          <div class="border-t border-[var(--color-accent)]/20"></div>

          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">{i("summaryMeeting")}</p>
              <p class="font-heading font-bold text-[var(--color-text)]">{i("summaryMeetingValue")}</p>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">{i("summaryMeetingHint")}</p>
            </div>
          </div>
        </div>

        <!-- How to prepare -->
        <div class="rounded-xl border-2 border-white/5 p-6">
          <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-3">{i("prepareTitle")}</h3>
          <p class="text-[var(--color-text-muted)] leading-relaxed">{i("prepareBody")}</p>
        </div>

        <div class="text-center">
          <p class="text-lg text-[var(--color-text-muted)] mb-6">
            {i("signOff")}<br />
            <span class="font-heading font-bold text-[var(--color-text)]">Robert</span>
          </p>
          <a href="/" class="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] font-semibold text-sm underline-offset-4 hover:underline transition-colors">
            {i("returnHome")}
          </a>
        </div>
      </div>
    </div>
  {/if}

  <!-- Direct contact fallback -->
  {#if currentStep !== 3}
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

  .step-active {
    background: var(--color-accent);
    color: var(--color-background);
  }
  .step-inactive {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-muted);
  }

  /* Calendar */
  .cal-day {
    padding: 0.5rem;
    text-align: center;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.15s;
    font-family: var(--font-mono);
  }
  .cal-past {
    color: var(--color-text-muted);
    opacity: 0.3;
    cursor: not-allowed;
  }
  .cal-available {
    color: var(--color-text);
    cursor: pointer;
  }
  .cal-available:hover {
    border: 1px solid var(--color-accent);
  }
  .cal-today {
    box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--color-accent) 50%, transparent);
  }
  .cal-selected {
    background: var(--color-accent);
    color: var(--color-background);
    cursor: pointer;
  }

  /* Time slots */
  .time-slot {
    padding: 0.75rem 1rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
    cursor: pointer;
    transition: all 0.15s;
  }
  .time-slot:hover {
    border-color: var(--color-accent);
  }
  .time-selected {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-background);
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  :global(.animate-fade-up) {
    animation: fade-up 0.6s ease-out;
  }
</style>
