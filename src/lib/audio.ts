import { writable, get } from "svelte/store";
import { config } from "../../scrollytelling.config.ts";
import { currentLang } from "./i18n";

export const isPlaying = writable(false);
export const isLoaded = writable(false);
export const audioEnabled = writable(false);

let narrationAudio: HTMLAudioElement | null = null;
let ambientAudio: HTMLAudioElement | null = null;
let currentSection: string | null = null;
let hasPlayedAmbientIntro = false;
let pendingAmbientTimeout: number | null = null;

/** Track active fade intervals so stopAll can kill them */
let activeFadeIntervals: number[] = [];

/** Generation counter — incremented on each playSection call.
 *  If a newer call arrives while an older one is in-flight, the older
 *  one bails out at each await point. Prevents orphaned audio elements. */
let playGeneration = 0;

function getAudioPath(section: string, lang: string): string {
  return `/audio/${lang}/${section}.mp3`;
}

export async function preloadAudio(section: string) {
  const lang = get(currentLang);
  const path = getAudioPath(section, lang);

  return new Promise<void>((resolve) => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = path;
    audio.addEventListener("canplaythrough", () => resolve(), { once: true });
    audio.addEventListener("error", () => resolve(), { once: true });
  });
}

/** Play ambient audio intro (rain, etc.) before first narration */
async function playAmbientIntro(): Promise<void> {
  if (hasPlayedAmbientIntro) return;
  hasPlayedAmbientIntro = true;

  const lang = get(currentLang);
  const ambientPath = `/audio/${lang}/ambient.mp3`;
  ambientAudio = new Audio(ambientPath);
  ambientAudio.volume = 0;

  try {
    await ambientAudio.play();
    await fadeIn(ambientAudio, config.audio.ambientVolume);

    // Play ambient for 4 seconds, then fade out
    return new Promise((resolve) => {
      pendingAmbientTimeout = window.setTimeout(async () => {
        if (ambientAudio) {
          await fadeOut(ambientAudio);
          ambientAudio.pause();
          ambientAudio = null;
        }
        resolve();
      }, 4000);
    });
  } catch {
    // No ambient file — skip silently
    ambientAudio = null;
  }
}

function cancelPendingAmbient() {
  if (pendingAmbientTimeout !== null) {
    clearTimeout(pendingAmbientTimeout);
    pendingAmbientTimeout = null;
  }
  if (ambientAudio) {
    ambientAudio.pause();
    ambientAudio = null;
  }
}

export async function playSection(section: string) {
  if (!config.audio.enabled) return;

  const gen = ++playGeneration;
  const lang = get(currentLang);
  const path = getAudioPath(section, lang);

  // If same section is already playing, don't restart
  if (currentSection === `${section}-${lang}` && narrationAudio && !narrationAudio.paused) {
    return;
  }

  // Fade out and destroy current audio
  if (narrationAudio) {
    const old = narrationAudio;
    narrationAudio = null;
    await fadeOut(old);
    old.pause();
    old.src = ""; // Release media resource
    if (gen !== playGeneration) return; // Superseded
  }

  // Play ambient intro before first narration
  if (!hasPlayedAmbientIntro) {
    await playAmbientIntro();
    if (gen !== playGeneration) return; // Superseded
  }

  currentSection = `${section}-${lang}`;
  const audio = new Audio(path);
  audio.volume = 0;
  narrationAudio = audio;

  // Set up end listener
  audio.addEventListener("ended", () => {
    // Only update state if this is still the active audio
    if (narrationAudio === audio) {
      isPlaying.set(false);
    }
  });

  try {
    await audio.play();
    if (gen !== playGeneration) {
      // Superseded while waiting for play() — kill this audio
      audio.pause();
      audio.src = "";
      return;
    }
    await fadeIn(audio, config.audio.narrationVolume);
    if (gen !== playGeneration) {
      audio.pause();
      audio.src = "";
      return;
    }
    isPlaying.set(true);
    audioEnabled.set(true);
  } catch {
    // Autoplay blocked or file missing — fail silently
    if (narrationAudio === audio) {
      isPlaying.set(false);
    }
  }
}

/**
 * Toggle audio pause/play. Only operates on the current narrationAudio.
 * Safe to call rapidly — no async gaps.
 */
export function togglePlayback() {
  if (!narrationAudio) return;

  if (narrationAudio.paused) {
    narrationAudio.play().catch(() => {
      // play() can reject if element is in a bad state — ignore
    });
    isPlaying.set(true);
  } else {
    narrationAudio.pause();
    isPlaying.set(false);
  }
}

export function stopAll() {
  // Kill all in-flight fades
  activeFadeIntervals.forEach(clearInterval);
  activeFadeIntervals = [];

  // Increment generation to invalidate any in-flight playSection calls
  playGeneration++;

  cancelPendingAmbient();
  if (narrationAudio) {
    narrationAudio.pause();
    narrationAudio.src = "";
    narrationAudio = null;
  }
  isPlaying.set(false);
  audioEnabled.set(false);
  currentSection = null;
  hasPlayedAmbientIntro = false;
}

function fadeIn(audio: HTMLAudioElement, targetVolume: number): Promise<void> {
  return new Promise((resolve) => {
    const step = targetVolume / (config.audio.crossfadeDuration / 16);
    const interval = window.setInterval(() => {
      // If audio was destroyed mid-fade, bail
      if (!audio || audio.paused) {
        clearInterval(interval);
        activeFadeIntervals = activeFadeIntervals.filter((id) => id !== interval);
        resolve();
        return;
      }
      if (audio.volume + step >= targetVolume) {
        audio.volume = targetVolume;
        clearInterval(interval);
        activeFadeIntervals = activeFadeIntervals.filter((id) => id !== interval);
        resolve();
      } else {
        audio.volume += step;
      }
    }, 16);
    activeFadeIntervals.push(interval);
  });
}

function fadeOut(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    if (!audio || audio.volume === 0) {
      resolve();
      return;
    }
    const step = audio.volume / (config.audio.crossfadeDuration / 16);
    const interval = window.setInterval(() => {
      if (!audio || audio.paused) {
        clearInterval(interval);
        activeFadeIntervals = activeFadeIntervals.filter((id) => id !== interval);
        resolve();
        return;
      }
      if (audio.volume - step <= 0) {
        audio.volume = 0;
        clearInterval(interval);
        activeFadeIntervals = activeFadeIntervals.filter((id) => id !== interval);
        resolve();
      } else {
        audio.volume -= step;
      }
    }, 16);
    activeFadeIntervals.push(interval);
  });
}
