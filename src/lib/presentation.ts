import { writable, get } from "svelte/store";
import { playSection, stopAll, isPlaying } from "./audio";
import { currentLang } from "./i18n";

export type PresentationState = "overlay" | "presenting" | "browsing";

export const presentationState = writable<PresentationState>("overlay");
export const currentSectionIndex = writable(0);

/** Default dwell time per section when no audio is available */
const DEFAULT_DWELL_MS = 15000;
/** Per-section overrides — content-heavy sections get more time */
const SECTION_DWELL_MS: Record<string, number> = {
  hero: 8000,       // Title + subtitle, short
  problem: 14000,   // Typewriter text
  solution: 20000,  // Headline animation + feature cards reveal
  proof: 16000,     // Evidence / stats
  ask: 18000,       // CTA with letter-slam + card animations
};
/** Bridge audio clips between sections: key is "fromId-toId" */
const BRIDGE_AUDIO: Record<string, string> = {
  "problem-solution": "02-03-bridge",
};
/** Pause between narration ending and scrolling to next section */
const POST_NARRATION_PAUSE_MS = 1500;
/** Time to wait after scrolling for animations to settle */
const POST_SCROLL_SETTLE_MS = 2000;
/** Maximum time to wait for narration before force-advancing */
const MAX_NARRATION_WAIT_MS = 60000;

let scrollLockHandlers: {
  wheel: (e: Event) => void;
  touchmove: (e: Event) => void;
  keydown: (e: KeyboardEvent) => void;
} | null = null;

const SCROLL_LOCK_KEYS = [
  "ArrowUp", "ArrowDown", "Space", " ",
  "PageUp", "PageDown", "Home", "End",
];

function preventScroll(e: Event) { e.preventDefault(); }
function preventScrollKeys(e: KeyboardEvent) {
  if (SCROLL_LOCK_KEYS.includes(e.key)) e.preventDefault();
}

function lockScroll() {
  scrollLockHandlers = {
    wheel: preventScroll,
    touchmove: preventScroll,
    keydown: preventScrollKeys,
  };
  window.addEventListener("wheel", scrollLockHandlers.wheel, { passive: false });
  window.addEventListener("touchmove", scrollLockHandlers.touchmove, { passive: false });
  window.addEventListener("keydown", scrollLockHandlers.keydown, { passive: false });
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  if (!scrollLockHandlers) return;
  window.removeEventListener("wheel", scrollLockHandlers.wheel);
  window.removeEventListener("touchmove", scrollLockHandlers.touchmove);
  window.removeEventListener("keydown", scrollLockHandlers.keydown);
  scrollLockHandlers = null;
  document.body.style.overflow = "";
}

function getSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
}

let activeTimers: number[] = [];
let activeUnsubscribes: (() => void)[] = [];

function clearAllTimers() {
  activeTimers.forEach(clearTimeout);
  activeTimers = [];
  activeUnsubscribes.forEach((fn) => fn());
  activeUnsubscribes = [];
}

function addTimer(fn: () => void, ms: number): number {
  const id = window.setTimeout(() => {
    if (get(presentationState) !== "presenting") return;
    fn();
  }, ms);
  activeTimers.push(id);
  return id;
}

/**
 * Smoothly scroll to a section and wait for the scroll to finish.
 */
function scrollToSection(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    el.scrollIntoView({ behavior: "smooth" });
    // scrollIntoView doesn't have a callback — use a timeout
    // based on estimated scroll distance
    const distance = Math.abs(el.getBoundingClientRect().top);
    const estimatedMs = Math.min(Math.max(distance * 0.5, 400), 1500);
    setTimeout(resolve, estimatedMs);
  });
}

/**
 * Play a bridge audio clip between sections. Resolves when finished.
 */
async function playBridge(fromId: string, toId: string): Promise<void> {
  const key = `${fromId}-${toId}`;
  const file = BRIDGE_AUDIO[key];
  if (!file) return;

  const lang = get(currentLang);
  const path = `/audio/${lang}/${file}.mp3`;
  const audio = new Audio(path);

  return new Promise((resolve) => {
    audio.addEventListener("ended", () => resolve(), { once: true });
    audio.addEventListener("error", () => resolve(), { once: true });
    audio.play().catch(() => resolve());
  });
}

/**
 * Try to play narration for a section. Returns true if audio started playing.
 */
async function tryPlayNarration(sectionId: string): Promise<boolean> {
  try {
    await playSection(sectionId);
    // Check if audio actually started (playSection silently fails if no file)
    return get(isPlaying);
  } catch {
    return false;
  }
}

/**
 * Wait for narration to finish, or time out.
 * Returns immediately if no narration is playing.
 */
function waitForNarrationEnd(): Promise<void> {
  return new Promise((resolve) => {
    if (!get(isPlaying)) {
      resolve();
      return;
    }

    let resolved = false;

    const unsubscribe = isPlaying.subscribe((playing) => {
      if (!playing && !resolved) {
        resolved = true;
        unsubscribe();
        resolve();
      }
    });
    activeUnsubscribes.push(unsubscribe);

    // Fallback: don't wait forever
    addTimer(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve();
      }
    }, MAX_NARRATION_WAIT_MS);
  });
}

/**
 * Run the presentation sequence: advance through all sections.
 */
async function runPresentation() {
  const sections = getSections();
  if (sections.length === 0) return;

  for (let i = 0; i < sections.length; i++) {
    if (get(presentationState) !== "presenting") return;

    currentSectionIndex.set(i);

    // Scroll to section (first section is already visible)
    if (i > 0) {
      // Play bridge audio between sections if one exists
      await playBridge(sections[i - 1].id, sections[i].id);
      if (get(presentationState) !== "presenting") return;

      await scrollToSection(sections[i]);
      // Allow scroll animations to settle
      await sleep(POST_SCROLL_SETTLE_MS);
    }

    if (get(presentationState) !== "presenting") return;

    // Try to play narration
    const hasAudio = await tryPlayNarration(sections[i].id);

    if (hasAudio) {
      // Wait for narration to finish, then pause briefly before advancing
      await waitForNarrationEnd();
      if (get(presentationState) !== "presenting") return;
      await sleep(POST_NARRATION_PAUSE_MS);
    } else {
      // No audio — dwell based on section complexity
      const sectionId = sections[i].id;
      const dwell = SECTION_DWELL_MS[sectionId] ?? DEFAULT_DWELL_MS;
      await sleep(dwell);
    }
  }

  // Presentation complete — brief pause then navigate to consultation
  if (get(presentationState) !== "presenting") return;
  await sleep(2000);
  exitPresentation();
  setTimeout(() => {
    window.location.href = "/consultation";
  }, 500);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => addTimer(resolve, ms));
}

export function startPresentation() {
  clearAllTimers();
  presentationState.set("presenting");
  document.body.classList.remove("overlay-active");
  document.body.classList.add("presentation-active");

  // Scroll to top instantly
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  currentSectionIndex.set(0);

  // Lock scroll
  lockScroll();

  // Trigger hero animation
  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.add("hero-text-ready");

  // Start the auto-advance sequence after a brief delay for overlay fade
  addTimer(() => { runPresentation(); }, 1200);
}

export function exitPresentation() {
  clearAllTimers();
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
  clearAllTimers();
  stopAll();
  unlockScroll();
  document.body.classList.remove("presentation-active");
  document.body.classList.add("overlay-active");
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  presentationState.set("overlay");

  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.remove("hero-text-ready");
}
