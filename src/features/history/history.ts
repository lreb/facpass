import { getLocalStorage, getSessionStorage } from '../../lib/web-storage';
import { secureRandomInt } from '../../security/random';
import type { GeneratorMode } from '../generator/types';

export interface HistoryEntry {
  id: string;
  value: string;
  mode: GeneratorMode;
  createdAt: number;
}

export const HISTORY_KEY = 'facpass.history.v1';
export const HISTORY_ENABLED_KEY = 'facpass.history.enabled.v1';
export const MAX_HISTORY_ENTRIES = 50;

const MODES: readonly GeneratorMode[] = ['password', 'passphrase', 'pin', 'pronounceable'];

export function loadHistoryPreference(): boolean {
  try {
    return getLocalStorage()?.getItem(HISTORY_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveHistoryPreference(enabled: boolean): void {
  try {
    const storage = getLocalStorage();
    if (!storage) {
      return;
    }

    if (enabled) {
      storage.setItem(HISTORY_ENABLED_KEY, 'true');
    } else {
      storage.removeItem(HISTORY_ENABLED_KEY);
    }
  } catch {
    // The preference is non-essential; history remains memory-only for this session.
  }
}

export function loadSessionHistory(): HistoryEntry[] {
  const storage = getSessionStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isHistoryEntry).slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

export function saveSessionHistory(entries: readonly HistoryEntry[]): void {
  try {
    const storage = getSessionStorage();
    if (!storage) {
      return;
    }

    const trimmed = entries.slice(0, MAX_HISTORY_ENTRIES);
    storage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Keep the in-memory history usable when storage is full or unavailable.
  }
}

export function clearSessionHistory(): void {
  try {
    getSessionStorage()?.removeItem(HISTORY_KEY);
  } catch {
    // Nothing else to clear when storage is unavailable.
  }
}

export function createHistoryEntry(value: string, mode: GeneratorMode): HistoryEntry {
  return {
    id: createId(),
    value,
    mode,
    createdAt: Date.now(),
  };
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${secureRandomInt(1_000_000).toString(36)}`;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.id === 'string' &&
    typeof entry.value === 'string' &&
    entry.value.length > 0 &&
    typeof entry.createdAt === 'number' &&
    Number.isFinite(entry.createdAt) &&
    typeof entry.mode === 'string' &&
    MODES.includes(entry.mode as GeneratorMode)
  );
}
