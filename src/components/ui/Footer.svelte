<script lang="ts">
  import { onMount } from "svelte";
  import { getEmail } from "@/lib/email";

  let lang = $state("en");
  let emailAddr = $state("");

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
      tagline: "Cinematic scrollytelling presentations that make audiences lean in — not tune out.",
      location: "Guadalajara, Mexico",
      nav: "Navigation",
      home: "Home",
      contact: "Contact",
      consultation: "Book a Free Call",
      demo: "Live Demo",
      connect: "Connect",
      email: "Email",
      whatsapp: "WhatsApp",
      github: "GitHub",
      linkedin: "LinkedIn",
      services: "Services",
      svcScrollytelling: "Scrollytelling Presentations",
      svcPitches: "Investor & Stakeholder Pitches",
      svcData: "Interactive Data Narratives",
      svcNarration: "AI Narration & Sound Design",
      copyright: "CushLabs AI Services. All rights reserved.",
    },
    es: {
      tagline: "Presentaciones cinematograficas de scrollytelling que hacen que las audiencias se inclinen — no se desconecten.",
      location: "Guadalajara, Mexico",
      nav: "Navegacion",
      home: "Inicio",
      contact: "Contacto",
      consultation: "Reservar Llamada Gratis",
      demo: "Demo en Vivo",
      connect: "Conectar",
      email: "Email",
      whatsapp: "WhatsApp",
      github: "GitHub",
      linkedin: "LinkedIn",
      services: "Servicios",
      svcScrollytelling: "Presentaciones de Scrollytelling",
      svcPitches: "Pitches para Inversores y Stakeholders",
      svcData: "Narrativas Interactivas de Datos",
      svcNarration: "Narracion IA y Diseno Sonoro",
      copyright: "CushLabs AI Services. Todos los derechos reservados.",
    },
  };

  function i(key: string): string {
    return t[lang]?.[key] ?? t.en[key] ?? key;
  }
</script>

<footer class="relative z-10 border-t border-white/5 bg-[var(--color-background)]">
  <div class="max-w-[1200px] mx-auto px-6 pt-16 pb-8">
    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
      <!-- Brand -->
      <div>
        <a href="/" class="inline-block font-heading text-xl font-bold text-[var(--color-text)] mb-3 hover:opacity-80 transition-opacity">
          CUSH<span class="text-[var(--color-accent)]">LABS</span>
        </a>
        <p class="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 max-w-[280px]">
          {i("tagline")}
        </p>
        <p class="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-[var(--color-accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {i("location")}
        </p>
      </div>

      <!-- Navigation -->
      <div>
        <h4 class="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-text)] mb-4">
          {i("nav")}
        </h4>
        <ul class="space-y-2.5">
          <li><a href="/" class="footer-link">{i("home")}</a></li>
          <li><a href="/contact" class="footer-link">{i("contact")}</a></li>
          <li><a href="/consultation" class="footer-link">{i("consultation")}</a></li>
          <li>
            <a href="https://atlas-biodiversidad-pitch.vercel.app" target="_blank" rel="noopener noreferrer" class="footer-link">
              {i("demo")}
              <svg class="inline w-3 h-3 ml-0.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
        </ul>
      </div>

      <!-- Services -->
      <div>
        <h4 class="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-text)] mb-4">
          {i("services")}
        </h4>
        <ul class="space-y-2.5">
          <li><span class="text-sm text-[var(--color-text-muted)]">{i("svcScrollytelling")}</span></li>
          <li><span class="text-sm text-[var(--color-text-muted)]">{i("svcPitches")}</span></li>
          <li><span class="text-sm text-[var(--color-text-muted)]">{i("svcData")}</span></li>
          <li><span class="text-sm text-[var(--color-text-muted)]">{i("svcNarration")}</span></li>
        </ul>
      </div>

      <!-- Connect -->
      <div>
        <h4 class="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-text)] mb-4">
          {i("connect")}
        </h4>
        <ul class="space-y-2.5">
          {#if emailAddr}
            <li>
              <a href="mailto:{emailAddr}" class="footer-link flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {emailAddr}
              </a>
            </li>
          {/if}
          <li>
            <a href="https://api.whatsapp.com/send/?phone=523315590572&text=Hi%20Robert!%20I%20found%20your%20scrollytelling%20site%20and%20had%20a%20question.&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" class="footer-link flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {i("whatsapp")}
            </a>
          </li>
          <li>
            <a href="https://github.com/RCushmaniii" target="_blank" rel="noopener noreferrer" class="footer-link flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {i("github")}
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/in/robertcushman" target="_blank" rel="noopener noreferrer" class="footer-link flex items-center gap-2">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {i("linkedin")}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p class="text-xs text-[var(--color-text-muted)]">
        &copy; 2026 {i("copyright")}
      </p>
      <p class="text-xs text-[var(--color-text-muted)] opacity-60">
        Robert Cushman &middot; <a href="https://cushlabs.ai" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--color-accent)] transition-colors">cushlabs.ai</a>
      </p>
    </div>
  </div>
</footer>

<style>
  .footer-link {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }
  .footer-link:hover {
    color: var(--color-accent);
  }
</style>
