import type { StrengthLabel } from '../../types/security';

export function strengthLabelFromEntropy(entropy: number): StrengthLabel {
  if (entropy < 28) {
    return 'critical';
  }

  if (entropy < 40) {
    return 'weak';
  }

  if (entropy < 60) {
    return 'fair';
  }

  if (entropy < 80) {
    return 'good';
  }

  if (entropy < 100) {
    return 'strong';
  }

  return 'excellent';
}
