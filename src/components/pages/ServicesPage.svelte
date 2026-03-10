<script lang="ts">
  import { onMount } from "svelte";
  import { initScrollReveals } from "@/lib/scroll";

  let lang = $state("en");

  onMount(() => {
    lang = document.body.dataset.activeLang || "en";

    const obs = new MutationObserver(() => {
      lang = document.body.dataset.activeLang || "en";
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-active-lang"] });

    // Re-init reveals after Svelte renders
    initScrollReveals();

    return () => obs.disconnect();
  });

  const t: Record<string, Record<string, string>> = {
    en: {
      badge: "Scrollytelling as a Service",
      title: "Your Pitch Presents Itself",
      subtitle: "We build cinematic, self-running presentations that do the talking for you. No slides. No presenter. Just a link — and an experience your audience won't forget.",
      problemBadge: "The Problem",
      problemTitle: "Pitch Decks Are Broken",
      problemDesc: "Investors see hundreds of decks a month. Yours gets 5 seconds before it's forgotten. And when your deck gets forwarded without you there to present it — it has to speak for itself.",
      pain1Title: "Forwarded Without Context",
      pain1Desc: "Your deck gets shared to a partner or advisor. Without you narrating, it's just 12 slides of bullet points that look like everyone else's.",
      pain2Title: "Lost in Translation",
      pain2Desc: "Pitching across languages and time zones? Your carefully crafted story falls flat in a Zoom at midnight — or never gets told at all.",
      pain3Title: "Brilliant, But Hate Presenting",
      pain3Desc: "You're a builder, not a showman. Your product is world-class, but your pitch doesn't do it justice. You dread the \"any questions?\" silence.",
      pain4Title: "Death by Slide Deck",
      pain4Desc: "12 slides in Google Docs that look exactly like the last 12 they saw. You're competing for attention with everyone using the same template.",
      whoBadge: "Who It's For",
      whoTitle: "Built for Founders Who'd Rather Build",
      who1Title: "Shy Founders",
      who1Desc: "You're brilliant at what you build. Let your pitch be brilliant too — without you having to perform it.",
      who2Title: "Non-Native Speakers",
      who2Desc: "Pitching in your second language? Your scrollytelling site speaks perfect English (or Spanish) every single time.",
      who3Title: "Async-First Teams",
      who3Desc: "Send a link instead of scheduling a call. Investors watch when it suits them — on their couch at 11pm, not your 8am Zoom.",
      who4Title: "Technical Founders",
      who4Desc: "You think in systems, not stories. We translate your architecture into a narrative that makes non-technical people lean in.",
      howBadge: "How It Works",
      howTitle: "From Deck to Experience in 3 Steps",
      step1Num: "01",
      step1Title: "Send Us Your Story",
      step1Desc: "Share your existing deck, a rough outline, or just talk to us. We'll figure out the narrative arc together.",
      step2Num: "02",
      step2Title: "We Build the Experience",
      step2Desc: "Cinematic animations. Professional narration. Scroll-driven storytelling that auto-plays like a film. We handle everything.",
      step3Num: "03",
      step3Title: "Share the Link",
      step3Desc: "Your audience taps play and the presentation runs itself — perfectly paced, perfectly narrated, every single time.",
      offerBadge: "Free Offer",
      offerTitle: "Send Us Your Deck. We'll Send Back a Story Map.",
      offerDesc: "Not ready to commit? Send us your existing pitch deck and we'll send back a free story map — a visual breakdown of how your content could work as a scrollytelling experience. No strings attached.",
      offerCta: "Send Your Deck",
      offerNote: "Just email your deck — PDF, Google Slides link, whatever you have. We'll respond within 48 hours.",
      ctaTitle: "Ready to Stand Out?",
      ctaDesc: "Every project starts with a free conversation. We'll learn about your story, your audience, and your goals.",
      ctaPrimary: "Book a Free Consultation",
      ctaSecondary: "See the Demo",
      ctaDemoNote: "Watch our own pitch — built with scrollytelling, of course.",
    },
    es: {
      badge: "Scrollytelling como Servicio",
      title: "Tu Pitch Se Presenta Solo",
      subtitle: "Construimos presentaciones cinematicas y auto-ejecutables que hablan por ti. Sin diapositivas. Sin presentador. Solo un enlace — y una experiencia que tu audiencia no olvidara.",
      problemBadge: "El Problema",
      problemTitle: "Las Presentaciones Estan Rotas",
      problemDesc: "Los inversores ven cientos de presentaciones al mes. La tuya tiene 5 segundos antes de ser olvidada. Y cuando tu deck se reenvía sin ti ahi para presentarlo — tiene que hablar por si solo.",
      pain1Title: "Reenviada Sin Contexto",
      pain1Desc: "Tu presentacion se comparte con un socio o asesor. Sin ti narrando, son solo 12 diapositivas de viñetas que se ven como las de todos los demas.",
      pain2Title: "Perdida en la Traduccion",
      pain2Desc: "Presentando entre idiomas y zonas horarias? Tu historia cuidadosamente elaborada se pierde en un Zoom a medianoche — o nunca se cuenta.",
      pain3Title: "Brillante, Pero Odia Presentar",
      pain3Desc: "Eres un constructor, no un showman. Tu producto es de clase mundial, pero tu pitch no le hace justicia. Temes el silencio de \"alguna pregunta?\".",
      pain4Title: "Muerte por Diapositivas",
      pain4Desc: "12 slides en Google Docs que se ven exactamente como las ultimas 12 que vieron. Compites por atencion con todos usando la misma plantilla.",
      whoBadge: "Para Quien Es",
      whoTitle: "Hecho para Founders que Prefieren Construir",
      who1Title: "Founders Introvertidos",
      who1Desc: "Eres brillante en lo que construyes. Deja que tu pitch tambien sea brillante — sin necesidad de actuarlo.",
      who2Title: "Hablantes No Nativos",
      who2Desc: "Presentando en tu segundo idioma? Tu sitio de scrollytelling habla ingles (o español) perfecto cada vez.",
      who3Title: "Equipos Async-First",
      who3Desc: "Envia un enlace en vez de agendar una llamada. Los inversores miran cuando les conviene — en su sofa a las 11pm, no en tu Zoom de las 8am.",
      who4Title: "Founders Tecnicos",
      who4Desc: "Piensas en sistemas, no en historias. Traducimos tu arquitectura en una narrativa que hace que la gente no tecnica se incline.",
      howBadge: "Como Funciona",
      howTitle: "De Deck a Experiencia en 3 Pasos",
      step1Num: "01",
      step1Title: "Envianos Tu Historia",
      step1Desc: "Comparte tu deck existente, un borrador, o simplemente hablanos. Descubriremos el arco narrativo juntos.",
      step2Num: "02",
      step2Title: "Construimos la Experiencia",
      step2Desc: "Animaciones cinematicas. Narracion profesional. Storytelling controlado por scroll que se auto-reproduce como una pelicula. Nos encargamos de todo.",
      step3Num: "03",
      step3Title: "Comparte el Enlace",
      step3Desc: "Tu audiencia toca play y la presentacion se ejecuta sola — perfectamente pautada, perfectamente narrada, cada vez.",
      offerBadge: "Oferta Gratuita",
      offerTitle: "Envianos Tu Deck. Te Devolvemos un Story Map.",
      offerDesc: "No estas listo para comprometerte? Envianos tu pitch deck existente y te devolvemos un story map gratis — un desglose visual de como tu contenido podria funcionar como experiencia de scrollytelling. Sin compromiso.",
      offerCta: "Enviar Tu Deck",
      offerNote: "Solo envia tu deck por email — PDF, enlace de Google Slides, lo que tengas. Respondemos en 48 horas.",
      ctaTitle: "Listo para Destacar?",
      ctaDesc: "Cada proyecto empieza con una conversacion gratuita. Aprenderemos sobre tu historia, tu audiencia y tus objetivos.",
      ctaPrimary: "Agendar Consulta Gratis",
      ctaSecondary: "Ver el Demo",
      ctaDemoNote: "Mira nuestro propio pitch — construido con scrollytelling, por supuesto.",
    },
  };

  function i(key: string): string {
    return t[lang]?.[key] ?? t.en[key] ?? key;
  }
</script>

<!-- Hero -->
<section class="pt-28 pb-16 px-6 text-center max-w-[900px] mx-auto animate-fade-up">
  <span class="inline-block font-mono text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-full px-4 py-1.5 mb-6">
    {i("badge")}
  </span>
  <h1 class="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] tracking-tight mb-6 leading-[1.1]">
    {i("title")}
  </h1>
  <p class="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-[700px] mx-auto mb-10">
    {i("subtitle")}
  </p>
  <div class="flex flex-wrap gap-3 justify-center">
    <a href="/consultation" class="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--color-accent)]/20">
      {i("ctaPrimary")}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
    <a href="/?mode=prez&lang={lang}" class="inline-flex items-center gap-2 px-7 py-3.5 border border-white/10 text-[var(--color-text-muted)] font-semibold rounded-xl transition-all duration-300 hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]">
      {i("ctaSecondary")}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </a>
  </div>
</section>

<!-- Problem Section -->
<section class="max-w-[1100px] mx-auto px-6 py-16">
  <div class="text-center mb-12 reveal">
    <span class="inline-block font-mono text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-full px-4 py-1.5 mb-4">
      {i("problemBadge")}
    </span>
    <h2 class="font-heading text-3xl md:text-5xl font-bold text-[var(--color-text)] tracking-tight mb-4">
      {i("problemTitle")}
    </h2>
    <p class="text-lg text-[var(--color-text-muted)] leading-relaxed max-w-[650px] mx-auto">
      {i("problemDesc")}
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div class="glass-card reveal reveal-delay-1">
      <div class="card-icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("pain1Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("pain1Desc")}</p>
    </div>

    <div class="glass-card reveal reveal-delay-2">
      <div class="card-icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("pain2Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("pain2Desc")}</p>
    </div>

    <div class="glass-card reveal reveal-delay-3">
      <div class="card-icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("pain3Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("pain3Desc")}</p>
    </div>

    <div class="glass-card reveal reveal-delay-4">
      <div class="card-icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("pain4Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("pain4Desc")}</p>
    </div>
  </div>
</section>

<!-- Who It's For -->
<section class="max-w-[1100px] mx-auto px-6 py-16">
  <div class="text-center mb-12 reveal">
    <span class="inline-block font-mono text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-full px-4 py-1.5 mb-4">
      {i("whoBadge")}
    </span>
    <h2 class="font-heading text-3xl md:text-5xl font-bold text-[var(--color-text)] tracking-tight">
      {i("whoTitle")}
    </h2>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div class="glass-card reveal reveal-delay-1">
      <div class="card-icon accent">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("who1Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("who1Desc")}</p>
    </div>

    <div class="glass-card reveal reveal-delay-2">
      <div class="card-icon accent">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("who2Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("who2Desc")}</p>
    </div>

    <div class="glass-card reveal reveal-delay-3">
      <div class="card-icon accent">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.07a4.5 4.5 0 00-6.364-6.364L4.5 8.257m16.5 3.743H21m-3.257-3.257L18 9m-1.5 9H18m-5.243 3.257L12 21" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("who3Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("who3Desc")}</p>
    </div>

    <div class="glass-card reveal reveal-delay-4">
      <div class="card-icon accent">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>
      <h3 class="font-heading text-lg font-bold text-[var(--color-text)] mb-2">{i("who4Title")}</h3>
      <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">{i("who4Desc")}</p>
    </div>
  </div>
</section>

<!-- How It Works -->
<section class="max-w-[900px] mx-auto px-6 py-16">
  <div class="text-center mb-12 reveal">
    <span class="inline-block font-mono text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] bg-[var(--color-accent)]/10 rounded-full px-4 py-1.5 mb-4">
      {i("howBadge")}
    </span>
    <h2 class="font-heading text-3xl md:text-5xl font-bold text-[var(--color-text)] tracking-tight">
      {i("howTitle")}
    </h2>
  </div>

  <div class="space-y-6">
    <div class="glass-panel p-8 flex gap-6 items-start reveal reveal-delay-1">
      <span class="font-mono text-3xl font-bold text-[var(--color-accent)] opacity-40 shrink-0">{i("step1Num")}</span>
      <div>
        <h3 class="font-heading text-xl font-bold text-[var(--color-text)] mb-2">{i("step1Title")}</h3>
        <p class="text-[var(--color-text-muted)] leading-relaxed">{i("step1Desc")}</p>
      </div>
    </div>

    <div class="glass-panel p-8 flex gap-6 items-start reveal reveal-delay-2">
      <span class="font-mono text-3xl font-bold text-[var(--color-accent)] opacity-40 shrink-0">{i("step2Num")}</span>
      <div>
        <h3 class="font-heading text-xl font-bold text-[var(--color-text)] mb-2">{i("step2Title")}</h3>
        <p class="text-[var(--color-text-muted)] leading-relaxed">{i("step2Desc")}</p>
      </div>
    </div>

    <div class="glass-panel p-8 flex gap-6 items-start reveal reveal-delay-3">
      <span class="font-mono text-3xl font-bold text-[var(--color-accent)] opacity-40 shrink-0">{i("step3Num")}</span>
      <div>
        <h3 class="font-heading text-xl font-bold text-[var(--color-text)] mb-2">{i("step3Title")}</h3>
        <p class="text-[var(--color-text-muted)] leading-relaxed">{i("step3Desc")}</p>
      </div>
    </div>
  </div>
</section>

<!-- The Offer -->
<section class="max-w-[900px] mx-auto px-6 py-16">
  <div class="offer-panel reveal reveal-scale">
    <span class="inline-block font-mono text-xs tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4">
      {i("offerBadge")}
    </span>
    <h2 class="font-heading text-2xl md:text-4xl font-bold text-[var(--color-text)] tracking-tight mb-4">
      {i("offerTitle")}
    </h2>
    <p class="text-lg text-[var(--color-text-muted)] leading-relaxed mb-8 max-w-[600px] mx-auto">
      {i("offerDesc")}
    </p>
    <a href="/contact" class="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--color-accent)]/20">
      {i("offerCta")}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
    <p class="text-sm text-[var(--color-text-muted)] mt-4 opacity-60">
      {i("offerNote")}
    </p>
  </div>
</section>

<!-- Final CTA -->
<section class="max-w-[800px] mx-auto px-6 py-20 text-center reveal">
  <h2 class="font-heading text-3xl md:text-5xl font-bold text-[var(--color-text)] tracking-tight mb-4">
    {i("ctaTitle")}
  </h2>
  <p class="text-lg text-[var(--color-text-muted)] leading-relaxed mb-10 max-w-[550px] mx-auto">
    {i("ctaDesc")}
  </p>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <a href="/consultation" class="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)] text-[var(--color-background)] font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_var(--color-accent)]/20">
      {i("ctaPrimary")}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
    <a href="/?mode=prez&lang={lang}" class="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-[var(--color-text-muted)] font-semibold rounded-xl transition-all duration-300 hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)]">
      {i("ctaSecondary")}
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </a>
  </div>
  <p class="text-sm text-[var(--color-text-muted)] opacity-50">{i("ctaDemoNote")}</p>
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
    border-radius: 20px;
    padding: 2rem;
    transition: border-color 0.3s;
  }
  .glass-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }

  .card-icon {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-muted);
    margin-bottom: 1rem;
  }
  .card-icon.accent {
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
    color: var(--color-accent);
  }

  .offer-panel {
    text-align: center;
    padding: 3rem 2rem;
    border-radius: 24px;
    border: 2px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
    background: color-mix(in srgb, var(--color-accent) 3%, var(--color-background));
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  :global(.animate-fade-up) {
    animation: fade-up 0.8s ease-out;
  }
</style>
