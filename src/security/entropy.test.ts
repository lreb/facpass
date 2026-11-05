import { describe, expect, it } from 'vitest';
import {
  entropyBits,
  estimateCrackTime,
  formatDuration,
  passphraseEntropyBits,
  pinEntropyBits,
} from './entropy';

describe('entropyBits', () => {
  it('uses the base-2 logarithm of the pool size', () => {
    expect(entropyBits(2, 4)).toBe(4);
    expect(entropyBits(10, 6)).toBeCloseTo(6 * Math.log2(10), 10);
  });

  it('returns zero for unusable inputs', () => {
    expect(entropyBits(1, 10)).toBe(0);
    expect(entropyBits(0, 10)).toBe(0);
    expect(entropyBits(10, 0)).toBe(0);
    expect(entropyBits(Number.NaN, 10)).toBe(0);
    expect(entropyBits(10, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('passphraseEntropyBits', () => {
  it('uses the word-list size for each independent word', () => {
    expect(passphraseEntropyBits(7_776, 5)).toBeCloseTo(5 * Math.log2(7_776), 10);
  });

  it('returns zero for unusable inputs', () => {
    expect(passphraseEntropyBits(1, 5)).toBe(0);
    expect(passphraseEntropyBits(7_776, 0)).toBe(0);
  });
});

describe('pinEntropyBits', () => {
  it('uses ten possible digits per position', () => {
    expect(pinEntropyBits(6)).toBeCloseTo(6 * Math.log2(10), 10);
  });
});

describe('formatDuration', () => {
  it('formats representative durations', () => {
    expect(formatDuration(0.4)).toBe('less than a second');
    expect(formatDuration(30)).toBe('30 seconds');
    expect(formatDuration(60)).toBe('1 minute');
    expect(formatDuration(3_600)).toBe('1 hour');
    expect(formatDuration(86_400)).toBe('1 day');
    expect(formatDuration(365.25 * 24 * 60 * 60)).toBe('1 year');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('longer than the age of the universe');
    expect(formatDuration(1e18)).toBe('longer than a million years');
  });
});

describe('estimateCrackTime', () => {
  it('handles zero entropy', () => {
    expect(estimateCrackTime(0, 1_000)).toEqual({ seconds: 0, label: 'instantly' });
  });

  it('returns a human-readable label', () => {
    const estimate = estimateCrackTime(64, 1_000);

    expect(estimate.seconds).toBeGreaterThan(0);
    expect(estimate.label).toMatch(/year|million|universe/);
  });
});
