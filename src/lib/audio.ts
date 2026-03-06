import { writable, get } from "svelte/store";
import { config } from "../../scrollytelling.config.ts";
import { currentLang } from "./i18n";

export const isPlaying = writable(false);
export const isLoaded = writable(false);

let narrationAudio: HTMLAudioElement | null = null;
let currentSection: string | null = null;

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

  currentSection = `${section}-${lang}`;
  narrationAudio = new Audio(path);
  narrationAudio.volume = 0;

  try {
    await narrationAudio.play();
    await fadeIn(narrationAudio, config.audio.narrationVolume);
    isPlaying.set(true);
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
  if (narrationAudio) {
    narrationAudio.pause();
    narrationAudio = null;
  }
  isPlaying.set(false);
  currentSection = null;
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
