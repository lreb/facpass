import type { GeneratorMode } from './types';

export const GENERATOR_MODE_LABELS: Record<GeneratorMode, string> = {
  password: 'Password',
  passphrase: 'Passphrase',
  pin: 'PIN',
  pronounceable: 'Pronounceable',
};

export const GENERATOR_MODES: readonly GeneratorMode[] = [
  'password',
  'passphrase',
  'pin',
  'pronounceable',
];
