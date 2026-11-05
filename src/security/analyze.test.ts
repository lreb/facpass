import { describe, expect, it } from 'vitest';
import { analyzePassword } from './analyze';

describe('analyzePassword', () => {
  it('returns null for empty input', () => {
    expect(analyzePassword('')).toBeNull();
  });

  it('treats a common password as critical with zero effective entropy', () => {
    const analysis = analyzePassword('password');

    expect(analysis).not.toBeNull();
    expect(analysis?.score).toBe(0);
    expect(analysis?.label).toBe('critical');
    expect(analysis?.effectiveEntropyBits).toBe(0);
    expect(analysis?.findings.some((finding) => finding.id === 'common-password')).toBe(true);
    expect(analysis?.crackTimes.online.label).toBe('instantly');
  });

  it('detects repeated patterns independently', () => {
    const analysis = analyzePassword('aaaaaaaaaaaaaaaa');

    expect(analysis?.findings.some((finding) => finding.id === 'repeated-pattern')).toBe(true);
    expect(analysis?.findings.some((finding) => finding.id === 'low-diversity')).toBe(true);
    expect(analysis?.score).toBeLessThan(50);
  });

  it('detects sequential and keyboard patterns independently', () => {
    const sequential = analyzePassword('abcdefghijklmnop');
    const keyboard = analyzePassword('qwertyuiop');

    expect(sequential?.findings.some((finding) => finding.id === 'sequential-run')).toBe(true);
    expect(keyboard?.findings.some((finding) => finding.id === 'keyboard-pattern')).toBe(true);
  });

  it('scores a long random four-class value highly', () => {
    const analysis = analyzePassword('Xq7$vL2!nR8@wT4#');

    expect(analysis?.score).toBeGreaterThanOrEqual(80);
    expect(analysis?.characterClasses).toBe(4);
    expect(analysis?.label).toBe('excellent');
    expect(analysis?.findings).toHaveLength(0);
  });

  it('sorts findings from most to least severe', () => {
    const analysis = analyzePassword('password');
    const severities = analysis?.findings.map((finding) => finding.severity) ?? [];

    expect(severities[0]).toBe('critical');
    expect(severities.indexOf('critical')).toBeLessThan(severities.indexOf('warning'));
  });

  it('handles unicode and emoji input', () => {
    const analysis = analyzePassword('pässwörd😀123');

    expect(analysis).not.toBeNull();
    expect(analysis?.length).toBe('pässwörd😀123'.length);
    expect(analysis?.findings.length).toBeGreaterThan(0);
  });

  it('handles extreme-length input without throwing', () => {
    const analysis = analyzePassword('a'.repeat(10_000));

    expect(analysis).not.toBeNull();
    expect(analysis?.score).toBeLessThan(50);
  });

  it('provides crack-time assumptions', () => {
    const analysis = analyzePassword('Xq7$vL2!nR8@wT4#');

    expect(analysis?.crackTimes.assumptions).toMatch(/estimate/i);
    expect(analysis?.searchSpaceNote).toMatch(/estimate/i);
  });
});
