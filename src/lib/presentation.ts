import { writable, get } from "svelte/store";
import { playSection, stopAll, isPlaying, togglePlayback } from "./audio";
import { currentLang } from "./i18n";

export type PresentationState = "overlay" | "presenting" | "browsing";

export const presentationState = writable<PresentationState>("overlay");
export const currentSectionIndex = writable(0);
export const presentationPaused = writable(false);

/**
 * Track whether pause was triggered by the user (manual) or by tab visibility (auto).
 * When the tab becomes visible again, we only auto-resume if the pause was auto-triggered.
 * If the user manually paused before alt-tabbing, we respect that and stay paused.
 */
let pausedByVisibility = false;
let visibilityHandler: (() => void) | null = null;

function setupVisibilityHandler() {
  if (visibilityHandler) return; // Already set up

  visibilityHandler = () => {
    if (get(presentationState) !== "presenting") return;

    if (document.hidden) {
      // Tab lost focus — auto-pause if not already paused
      if (!get(presentationPaused)) {
        pausedByVisibility = true;
        presentationPaused.set(true);
        togglePlayback(); // pause audio
      }
    } else {
      // Tab regained focus — auto-resume only if we auto-paused
      if (pausedByVisibility && get(presentationPaused)) {
        pausedByVisibility = false;
        presentationPaused.set(false);
        togglePlayback(); // resume audio
      }
    }
  };

  document.addEventListener("visibilitychange", visibilityHandler);
}

function teardownVisibilityHandler() {
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
  pausedByVisibility = false;
}

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
  document.documentElement.classList.add("pres-no-scrollbar");
}

function unlockScroll() {
  if (!scrollLockHandlers) return;
  window.removeEventListener("wheel", scrollLockHandlers.wheel);
  window.removeEventListener("touchmove", scrollLockHandlers.touchmove);
  window.removeEventListener("keydown", scrollLockHandlers.keydown);
  scrollLockHandlers = null;
  document.documentElement.classList.remove("pres-no-scrollbar");
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

function removeTimer(id: number) {
  clearTimeout(id);
  activeTimers = activeTimers.filter((t) => t !== id);
}

/**
 * Smoothly scroll to a section and wait for the scroll to finish.
 */
function scrollToSection(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    el.scrollIntoView({ behavior: "smooth" });
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
    return get(isPlaying);
  } catch {
    return false;
  }
}

/**
 * Wait for narration to finish. Correctly handles pause/resume cycles:
 * - If paused, blocks until resumed, then re-checks if narration is still playing
 * - Only resolves when narration truly ends (isPlaying goes false while not paused)
 * - Times out after MAX_NARRATION_WAIT_MS as safety net
 */
function waitForNarrationEnd(): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false;

    function done() {
      if (resolved) return;
      resolved = true;
      playUnsub();
      pauseUnsub();
      resolve();
    }

    // Watch isPlaying — but only resolve if we're NOT paused
    const playUnsub = isPlaying.subscribe((playing) => {
      if (resolved) return;
      if (!playing && !get(presentationPaused)) {
        done();
      }
    });
    activeUnsubscribes.push(playUnsub);

    // Watch pause state — when resuming, re-check if narration is still going
    const pauseUnsub = presentationPaused.subscribe((paused) => {
      if (resolved) return;
      if (!paused && !get(isPlaying)) {
        // Resumed but audio already ended while paused — advance now
        done();
      }
      // If resumed and audio is still playing, do nothing — let playUnsub handle it
    });
    activeUnsubscribes.push(pauseUnsub);

    // Safety timeout
    addTimer(() => { done(); }, MAX_NARRATION_WAIT_MS);
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
      await playBridge(sections[i - 1].id, sections[i].id);
      if (get(presentationState) !== "presenting") return;

      await scrollToSection(sections[i]);
      await sleep(POST_SCROLL_SETTLE_MS);
    }

    if (get(presentationState) !== "presenting") return;

    // Try to play narration
    const hasAudio = await tryPlayNarration(sections[i].id);

    if (hasAudio) {
      await waitForNarrationEnd();
      if (get(presentationState) !== "presenting") return;
      await sleep(POST_NARRATION_PAUSE_MS);
    } else {
      const sectionId = sections[i].id;
      const dwell = SECTION_DWELL_MS[sectionId] ?? DEFAULT_DWELL_MS;
      await sleep(dwell);
    }
  }

  // Presentation complete
  if (get(presentationState) !== "presenting") return;
  await sleep(2000);
  exitPresentation();
  setTimeout(() => {
    window.location.href = "/consultation";
  }, 500);
}

/**
 * Pause-aware sleep. Tracks remaining time so pause/resume cycles work correctly.
 * If paused mid-sleep, the timer is cleared and remaining time is preserved.
 * On resume, a new timer fires with the remaining duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    if (get(presentationState) !== "presenting") {
      resolve();
      return;
    }

    let remaining = ms;
    let startedAt = Date.now();
    let timerId: number | null = null;
    let pauseUnsub: (() => void) | null = null;
    let resolved = false;

    function done() {
      if (resolved) return;
      resolved = true;
      if (timerId !== null) removeTimer(timerId);
      if (pauseUnsub) pauseUnsub();
      resolve();
    }

    function startTimer() {
      if (resolved) return;
      if (get(presentationPaused)) {
        // Don't start timer while paused — wait for resume
        return;
      }
      startedAt = Date.now();
      timerId = addTimer(done, remaining);
    }

    // Subscribe to pause changes
    pauseUnsub = presentationPaused.subscribe((paused) => {
      if (resolved) return;
      if (paused) {
        // Paused — clear running timer, save remaining time
        if (timerId !== null) {
          const elapsed = Date.now() - startedAt;
          remaining = Math.max(0, remaining - elapsed);
          removeTimer(timerId);
          timerId = null;
        }
      } else {
        // Resumed — start timer with remaining time
        startTimer();
      }
    });
    activeUnsubscribes.push(pauseUnsub);

    // Kick off if not currently paused
    startTimer();
  });
}

/**
 * Single atomic toggle for pause/play during presentation.
 * Handles both audio and presentation pause state in the same synchronous tick.
 * This is the ONLY function the UI should call — never call togglePlayback +
 * togglePresentationPause separately.
 */
export function togglePresentationPlayback() {
  if (get(presentationState) !== "presenting") {
    // Not in presentation mode — just toggle audio
    togglePlayback();
    return;
  }

  // Manual toggle always clears the visibility-auto-pause flag
  pausedByVisibility = false;

  const isPaused = get(presentationPaused);

  if (isPaused) {
    // Resume: set paused=false FIRST, then resume audio
    presentationPaused.set(false);
    togglePlayback(); // resumes audio, sets isPlaying=true
  } else {
    // Pause: set paused=true FIRST, then pause audio
    presentationPaused.set(true);
    togglePlayback(); // pauses audio, sets isPlaying=false
  }
}

export function startPresentation() {
  clearAllTimers();
  presentationPaused.set(false);
  presentationState.set("presenting");
  document.body.classList.remove("overlay-active");
  document.body.classList.add("presentation-active");

  // Scroll to top instantly
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  currentSectionIndex.set(0);

  // Lock scroll
  lockScroll();

  // Auto-pause when tab loses focus, resume when it comes back
  setupVisibilityHandler();

  // Trigger hero animation
  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.add("hero-text-ready");

  // Start the auto-advance sequence after a brief delay for overlay fade
  addTimer(() => { runPresentation(); }, 1200);
}

export function exitPresentation() {
  clearAllTimers();
  teardownVisibilityHandler();
  presentationPaused.set(false);
  presentationState.set("browsing");
  document.body.classList.remove("presentation-active");
  document.documentElement.classList.remove("pres-no-scrollbar");
  unlockScroll();
  stopAll();
}

export function viewSiteMode() {
  presentationState.set("browsing");
  document.body.classList.remove("overlay-active");
  document.body.classList.remove("presentation-active");
  document.documentElement.classList.remove("pres-no-scrollbar");

  // Trigger hero animation
  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.add("hero-text-ready");
}

export function resetToOverlay() {
  clearAllTimers();
  teardownVisibilityHandler();
  stopAll();
  unlockScroll();
  document.body.classList.remove("presentation-active");
  document.body.classList.add("overlay-active");
  document.documentElement.classList.add("pres-no-scrollbar");
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  presentationPaused.set(false);
  presentationState.set("overlay");

  const hero = document.querySelector(".hero-text-container");
  if (hero) hero.classList.remove("hero-text-ready");
}
