import type { GeneratorMode } from '../features/generator/types';
import { getLocalStorage } from './web-storage';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Preferences {
  theme: ThemePreference;
  defaultMode: GeneratorMode;
}

export const PREFERENCES_KEY = 'facpass.preferences.v1';

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  defaultMode: 'password',
};

const THEMES: readonly ThemePreference[] = ['light', 'dark', 'system'];
const MODES: readonly GeneratorMode[] = ['password', 'passphrase', 'pin', 'pronounceable'];

export function loadPreferences(): Preferences {
  const storage = getLocalStorage();
  if (!storage) {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const raw = storage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return { ...DEFAULT_PREFERENCES };
    }

    return {
      theme: isTheme(parsed.theme) ? parsed.theme : DEFAULT_PREFERENCES.theme,
      defaultMode: isMode(parsed.defaultMode)
        ? parsed.defaultMode
        : DEFAULT_PREFERENCES.defaultMode,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    getLocalStorage()?.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Preferences are non-essential; keep working when storage is unavailable.
  }
}

export function clearPreferences(): void {
  try {
    getLocalStorage()?.removeItem(PREFERENCES_KEY);
  } catch {
    // Preferences are non-essential; keep working when storage is unavailable.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTheme(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEMES.includes(value as ThemePreference);
}

function isMode(value: unknown): value is GeneratorMode {
  return typeof value === 'string' && MODES.includes(value as GeneratorMode);
}
