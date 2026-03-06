import { writable, get } from "svelte/store";
import { playSection, stopAll, isPlaying } from "./audio";

export type PresentationState = "overlay" | "presenting" | "browsing";

export const presentationState = writable<PresentationState>("overlay");
export const currentSectionIndex = writable(0);

let scrollLockHandlers: {
  wheel: (e: Event) => void;
  touchmove: (e: Event) => void;
  keydown: (e: KeyboardEvent) => void;
} | null = null;

const SCROLL_LOCK_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "Space",
  " ",
  "PageUp",
  "PageDown",
  "Home",
  "End",
];

function preventScroll(e: Event) {
  e.preventDefault();
}

function preventScrollKeys(e: KeyboardEvent) {
  if (SCROLL_LOCK_KEYS.includes(e.key)) {
    e.preventDefault();
  }
}

function lockScroll() {
  scrollLockHandlers = {
    wheel: preventScroll,
    touchmove: preventScroll,
    keydown: preventScrollKeys,
  };
  window.addEventListener("wheel", scrollLockHandlers.wheel, {
    passive: false,
  });
  window.addEventListener("touchmove", scrollLockHandlers.touchmove, {
    passive: false,
  });
  window.addEventListener("keydown", scrollLockHandlers.keydown, {
    passive: false,
  });
}

function unlockScroll() {
  if (!scrollLockHandlers) return;
  window.removeEventListener("wheel", scrollLockHandlers.wheel);
  window.removeEventListener("touchmove", scrollLockHandlers.touchmove);
  window.removeEventListener("keydown", scrollLockHandlers.keydown);
  scrollLockHandlers = null;
}

function getSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
}

let advanceTimer: number | null = null;
let narrationEndHandler: (() => void) | null = null;

function clearAdvanceTimer() {
  if (advanceTimer !== null) {
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }
}

/**
 * Auto-advance to the next section after narration finishes.
 * Falls back to a timeout if no audio is available.
 */
function scheduleNextSection() {
  const sections = getSections();
  const idx = get(currentSectionIndex);

  if (idx >= sections.length - 1) {
    // Last section — end presentation, open consultation form
    advanceTimer = window.setTimeout(() => {
      exitPresentation();
      setTimeout(() => {
        if ((window as any).__openConsultation) {
          (window as any).__openConsultation();
        }
      }, 500);
    }, 3000);
    return;
  }

  // Listen for narration end, or fall back to 8s timer
  const unsubscribe = isPlaying.subscribe((playing) => {
    if (!playing && get(presentationState) === "presenting") {
      unsubscribe();
      advanceTimer = window.setTimeout(() => {
        const nextIdx = get(currentSectionIndex) + 1;
        const nextSections = getSections();
        if (nextIdx < nextSections.length) {
          currentSectionIndex.set(nextIdx);
          nextSections[nextIdx].scrollIntoView({ behavior: "smooth" });

          // Play narration for next section after scroll
          setTimeout(() => {
            playSection(nextSections[nextIdx].id);
            scheduleNextSection();
          }, 800);
        }
      }, 1500);
    }
  });

  // Fallback: if narration doesn't end within 30s, advance anyway
  advanceTimer = window.setTimeout(() => {
    unsubscribe();
    const nextIdx = get(currentSectionIndex) + 1;
    const nextSections = getSections();
    if (
      nextIdx < nextSections.length &&
      get(presentationState) === "presenting"
    ) {
      currentSectionIndex.set(nextIdx);
      nextSections[nextIdx].scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        playSection(nextSections[nextIdx].id);
        scheduleNextSection();
      }, 800);
    }
  }, 30000);
}

export function startPresentation() {
  presentationState.set("presenting");
  document.body.classList.remove("overlay-active");
  document.body.classList.add("presentation-active");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  currentSectionIndex.set(0);

  // Lock scroll
  lockScroll();

  // Trigger hero animation
  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.add("hero-text-ready");

  // Start narration after a brief delay
  setTimeout(() => {
    const sections = getSections();
    if (sections.length > 0) {
      playSection(sections[0].id);
      scheduleNextSection();
    }
  }, 1500);
}

export function exitPresentation() {
  clearAdvanceTimer();
  presentationState.set("browsing");
  document.body.classList.remove("presentation-active");
  unlockScroll();
  stopAll();
}

export function viewSiteMode() {
  presentationState.set("browsing");
  document.body.classList.remove("overlay-active");
  document.body.classList.remove("presentation-active");

  // Trigger hero animation
  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.add("hero-text-ready");
}

export function resetToOverlay() {
  clearAdvanceTimer();
  stopAll();
  unlockScroll();
  document.body.classList.remove("presentation-active");
  document.body.classList.add("overlay-active");
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  presentationState.set("overlay");

  // Remove hero animation class
  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.remove("hero-text-ready");
}
