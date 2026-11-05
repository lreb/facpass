import raw from './data/10k-most-common.txt?raw';

export const COMMON_PASSWORDS: ReadonlySet<string> = new Set(
  raw
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean),
);

export const COMMON_PASSWORD_FRAGMENTS = [
  'password',
  'qwerty',
  'letmein',
  'welcome',
  'admin',
  'iloveyou',
  'monkey',
  'dragon',
  'football',
  'baseball',
  'sunshine',
  'princess',
  'master',
  'shadow',
  'superman',
  'batman',
  'trustno1',
  'abc123',
  '123456',
] as const;
