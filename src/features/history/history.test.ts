import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSessionHistory,
  createHistoryEntry,
  HISTORY_ENABLED_KEY,
  HISTORY_KEY,
  loadHistoryPreference,
  loadSessionHistory,
  MAX_HISTORY_ENTRIES,
  saveHistoryPreference,
  saveSessionHistory,
  type HistoryEntry,
} from './history';

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('session history', () => {
  it('starts empty', () => {
    expect(loadSessionHistory()).toEqual([]);
  });

  it('round-trips entries', () => {
    const entries: HistoryEntry[] = [
      { id: 'one', value: 'test-value-1', mode: 'password', createdAt: 1_700_000_000_000 },
      { id: 'two', value: 'test-value-2', mode: 'passphrase', createdAt: 1_700_000_001_000 },
    ];

    saveSessionHistory(entries);

    expect(loadSessionHistory()).toEqual(entries);
  });

  it('caps stored entries', () => {
    const entries = Array.from({ length: MAX_HISTORY_ENTRIES + 10 }, (_, index) => ({
      id: `id-${index}`,
      value: `value-${index}`,
      mode: 'pin' as const,
      createdAt: index,
    }));

    saveSessionHistory(entries);

    expect(loadSessionHistory()).toHaveLength(MAX_HISTORY_ENTRIES);
  });

  it('ignores invalid JSON and invalid entries', () => {
    sessionStorage.setItem(HISTORY_KEY, '{not json');
    expect(loadSessionHistory()).toEqual([]);

    sessionStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        { id: 'ok', value: 'value', mode: 'password', createdAt: 1 },
        { id: 'bad-mode', value: 'value', mode: 'unknown', createdAt: 1 },
        { id: 'missing-value', mode: 'pin', createdAt: 1 },
      ]),
    );

    expect(loadSessionHistory()).toEqual([
      { id: 'ok', value: 'value', mode: 'password', createdAt: 1 },
    ]);
  });

  it('clears stored entries', () => {
    saveSessionHistory([{ id: 'one', value: 'value', mode: 'password', createdAt: 1 }]);
    clearSessionHistory();

    expect(loadSessionHistory()).toEqual([]);
    expect(sessionStorage.getItem(HISTORY_KEY)).toBeNull();
  });

  it('creates entries with an id, mode, and timestamp', () => {
    const entry = createHistoryEntry('test-value', 'pronounceable');

    expect(entry.id).toBeTruthy();
    expect(entry.value).toBe('test-value');
    expect(entry.mode).toBe('pronounceable');
    expect(entry.createdAt).toBeGreaterThan(0);
  });

  it('returns empty history when session storage reads fail', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage is blocked.', 'SecurityError');
    });

    expect(loadSessionHistory()).toEqual([]);
    expect(loadHistoryPreference()).toBe(false);
  });

  it('does not throw when session storage writes or clears fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full.', 'QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage is blocked.', 'SecurityError');
    });

    expect(() => saveSessionHistory([])).not.toThrow();
    expect(() => clearSessionHistory()).not.toThrow();
    expect(() => saveHistoryPreference(true)).not.toThrow();
    expect(() => saveHistoryPreference(false)).not.toThrow();
  });
});

describe('history preference', () => {
  it('is disabled by default', () => {
    expect(loadHistoryPreference()).toBe(false);
  });

  it('round-trips the enabled state', () => {
    saveHistoryPreference(true);

    expect(loadHistoryPreference()).toBe(true);
    expect(localStorage.getItem(HISTORY_ENABLED_KEY)).toBe('true');

    saveHistoryPreference(false);

    expect(loadHistoryPreference()).toBe(false);
    expect(localStorage.getItem(HISTORY_ENABLED_KEY)).toBeNull();
  });
});
