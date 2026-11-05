import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPreferences,
  DEFAULT_PREFERENCES,
  loadPreferences,
  PREFERENCES_KEY,
  savePreferences,
} from './storage';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('preferences storage', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('round-trips valid preferences', () => {
    savePreferences({ theme: 'dark', defaultMode: 'passphrase' });

    expect(loadPreferences()).toEqual({ theme: 'dark', defaultMode: 'passphrase' });
  });

  it('falls back for invalid JSON', () => {
    localStorage.setItem(PREFERENCES_KEY, '{not json');

    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('falls back for invalid fields', () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ theme: 'neon', defaultMode: 'quantum' }),
    );

    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('clears stored preferences', () => {
    savePreferences({ theme: 'light', defaultMode: 'pin' });
    clearPreferences();

    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('returns defaults when storage reads fail', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage is blocked.', 'SecurityError');
    });

    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('does not throw when storage writes or clears fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is full.', 'QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage is blocked.', 'SecurityError');
    });

    expect(() => savePreferences(DEFAULT_PREFERENCES)).not.toThrow();
    expect(() => clearPreferences()).not.toThrow();
  });
});
