const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_DIGIT = /[0-9]/;
const HAS_SYMBOL = /[^a-zA-Z0-9]/;

export interface CharacterClassInfo {
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  classes: number;
  estimatedPoolSize: number;
}

export function getCharacterClassInfo(value: string): CharacterClassInfo {
  const hasLowercase = HAS_LOWERCASE.test(value);
  const hasUppercase = HAS_UPPERCASE.test(value);
  const hasDigit = HAS_DIGIT.test(value);
  const hasSymbol = HAS_SYMBOL.test(value);

  const classes = [hasLowercase, hasUppercase, hasDigit, hasSymbol].filter(Boolean).length;
  const estimatedPoolSize =
    (hasLowercase ? 26 : 0) + (hasUppercase ? 26 : 0) + (hasDigit ? 10 : 0) + (hasSymbol ? 33 : 0);

  return {
    hasLowercase,
    hasUppercase,
    hasDigit,
    hasSymbol,
    classes,
    estimatedPoolSize,
  };
}
