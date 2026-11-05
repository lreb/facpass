import { describe, expect, it } from 'vitest';
import {
  buildFindings,
  detectCommonPassword,
  detectDictionaryWord,
  detectKeyboardPattern,
  detectLowDiversity,
  detectRepeatedPattern,
  detectSequentialRun,
  detectShortLength,
  detectYear,
} from './patterns';

describe('detectCommonPassword', () => {
  it('flags an exact common password as critical', () => {
    expect(detectCommonPassword('password')).toMatchObject({
      id: 'common-password',
      severity: 'critical',
    });
  });

  it('flags a common fragment as a warning', () => {
    expect(detectCommonPassword('my-Password-2024')).toMatchObject({
      id: 'common-password-fragment',
      severity: 'warning',
    });
  });

  it('returns null for an unrelated value', () => {
    expect(detectCommonPassword('Xq7$vL2!')).toBeNull();
  });
});

describe('detectRepeatedPattern', () => {
  it('detects repeated single characters', () => {
    expect(detectRepeatedPattern('aaaa')).toMatchObject({ id: 'repeated-pattern' });
  });

  it('detects repeated blocks', () => {
    expect(detectRepeatedPattern('abcabc')).toMatchObject({ id: 'repeated-pattern' });
  });

  it('does not flag a varied value', () => {
    expect(detectRepeatedPattern('abcd')).toBeNull();
  });
});

describe('detectSequentialRun', () => {
  it('detects ascending sequences', () => {
    expect(detectSequentialRun('abcdef')).toMatchObject({ id: 'sequential-run' });
  });

  it('detects descending sequences', () => {
    expect(detectSequentialRun('654321')).toMatchObject({ id: 'sequential-run' });
  });

  it('does not flag short or broken runs', () => {
    expect(detectSequentialRun('abXqZ')).toBeNull();
  });
});

describe('detectKeyboardPattern', () => {
  it('detects a keyboard row', () => {
    expect(detectKeyboardPattern('qwerty')).toMatchObject({ id: 'keyboard-pattern' });
  });

  it('detects a reversed keyboard row', () => {
    expect(detectKeyboardPattern('ytrewq')).toMatchObject({ id: 'keyboard-pattern' });
  });

  it('does not flag an unrelated value', () => {
    expect(detectKeyboardPattern('Xq7$vL2!')).toBeNull();
  });
});

describe('detectYear', () => {
  it('detects a year fragment', () => {
    expect(detectYear('user2024')).toMatchObject({ id: 'year-pattern' });
  });

  it('does not flag a non-year number', () => {
    expect(detectYear('4820')).toBeNull();
  });
});

describe('detectDictionaryWord', () => {
  it('detects a common word', () => {
    expect(detectDictionaryWord('mysecret')).toMatchObject({ id: 'dictionary-word' });
  });

  it('does not flag an unrelated value', () => {
    expect(detectDictionaryWord('Xq7$vL2!')).toBeNull();
  });
});

describe('detectLowDiversity', () => {
  it('flags fewer than three character classes', () => {
    expect(detectLowDiversity('abc123')).toMatchObject({ id: 'low-diversity' });
  });

  it('does not flag four character classes', () => {
    expect(detectLowDiversity('aA1!abcd')).toBeNull();
  });
});

describe('detectShortLength', () => {
  it('flags short passwords as critical', () => {
    expect(detectShortLength('abc')).toMatchObject({
      id: 'short-password',
      severity: 'critical',
    });
  });

  it('flags modest lengths as a warning', () => {
    expect(detectShortLength('abcdefghij')).toMatchObject({
      id: 'modest-length',
      severity: 'warning',
    });
  });

  it('does not flag twelve or more characters', () => {
    expect(detectShortLength('abcdefghijkl')).toBeNull();
  });
});

describe('buildFindings', () => {
  it('combines independent rules', () => {
    const findings = buildFindings('summer2024');
    const ids = findings.map((finding) => finding.id);

    expect(ids).toContain('dictionary-word');
    expect(ids).toContain('year-pattern');
  });
});
