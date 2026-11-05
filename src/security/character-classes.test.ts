import { describe, expect, it } from 'vitest';
import { getCharacterClassInfo } from './character-classes';

describe('getCharacterClassInfo', () => {
  it('detects lowercase characters', () => {
    expect(getCharacterClassInfo('abc')).toMatchObject({
      hasLowercase: true,
      hasUppercase: false,
      hasDigit: false,
      hasSymbol: false,
      classes: 1,
      estimatedPoolSize: 26,
    });
  });

  it('detects all four classes', () => {
    expect(getCharacterClassInfo('aA1!')).toMatchObject({
      hasLowercase: true,
      hasUppercase: true,
      hasDigit: true,
      hasSymbol: true,
      classes: 4,
      estimatedPoolSize: 95,
    });
  });

  it('treats unicode and emoji as symbols', () => {
    expect(getCharacterClassInfo('é😀')).toMatchObject({
      hasLowercase: false,
      hasUppercase: false,
      hasDigit: false,
      hasSymbol: true,
      classes: 1,
      estimatedPoolSize: 33,
    });
  });

  it('handles empty input', () => {
    expect(getCharacterClassInfo('').classes).toBe(0);
    expect(getCharacterClassInfo('').estimatedPoolSize).toBe(0);
  });
});
