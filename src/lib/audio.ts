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

  const lang = get(currentLang);
  const path = getAudioPath(section, lang);

  // If same section, don't restart
  if (currentSection === `${section}-${lang}` && narrationAudio && !narrationAudio.paused) {
    return;
  }

  // Fade out current
  if (narrationAudio) {
    await fadeOut(narrationAudio);
    narrationAudio.pause();
    narrationAudio = null;
  }

  // Play ambient intro before first narration
  if (!hasPlayedAmbientIntro) {
    await playAmbientIntro();
  }

  currentSection = `${section}-${lang}`;
  narrationAudio = new Audio(path);
  narrationAudio.volume = 0;

  // Set up end listener
  narrationAudio.addEventListener("ended", () => {
    isPlaying.set(false);
  });

  try {
    await narrationAudio.play();
    await fadeIn(narrationAudio, config.audio.narrationVolume);
    isPlaying.set(true);
    audioEnabled.set(true);
  } catch {
    // Autoplay blocked or file missing — fail silently
    isPlaying.set(false);
  }
}

export function togglePlayback() {
  if (!narrationAudio) return;

  if (narrationAudio.paused) {
    narrationAudio.play();
    isPlaying.set(true);
  } else {
    narrationAudio.pause();
    isPlaying.set(false);
  }
}

export function stopAll() {
  cancelPendingAmbient();
  if (narrationAudio) {
    narrationAudio.pause();
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
    const interval = setInterval(() => {
      if (audio.volume + step >= targetVolume) {
        audio.volume = targetVolume;
        clearInterval(interval);
        resolve();
      } else {
        audio.volume += step;
      }
    }, 16);
  });
}

function fadeOut(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    const step = audio.volume / (config.audio.crossfadeDuration / 16);
    const interval = setInterval(() => {
      if (audio.volume - step <= 0) {
        audio.volume = 0;
        clearInterval(interval);
        resolve();
      } else {
        audio.volume -= step;
      }
    }, 16);
  });
}
