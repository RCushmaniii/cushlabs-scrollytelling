import { writable } from "svelte/store";
import { config } from "../../scrollytelling.config.ts";

const defaultLang = config.languages.find((l) => l.default)?.code ?? "en";

function createLanguageStore() {
  // Read from localStorage or browser preference
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("lang") : null;
  const browserLang =
    typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : null;
  const supported = config.languages.map((l) => l.code);
  const initial =
    stored && supported.includes(stored)
      ? stored
      : browserLang && supported.includes(browserLang)
        ? browserLang
        : defaultLang;

  const { subscribe, set } = writable(initial);

  return {
    subscribe,
    set(lang: string) {
      if (!supported.includes(lang)) return;
      set(lang);
      if (typeof window !== "undefined") {
        localStorage.setItem("lang", lang);
        document.body.setAttribute("data-active-lang", lang);
        document.documentElement.lang = lang;

        // Toggle visibility of data-lang elements
        document.querySelectorAll("[data-lang]").forEach((el) => {
          el.classList.toggle("active", el.getAttribute("data-lang") === lang);
        });
      }
    },
  };
}

export const currentLang = createLanguageStore();
export const languages = config.languages;
