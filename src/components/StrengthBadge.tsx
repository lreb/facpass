import type { StrengthLabel } from '../types/security';
import { Badge, type BadgeTone } from './Badge';

const TONES: Record<StrengthLabel, BadgeTone> = {
  critical: 'danger',
  weak: 'danger',
  fair: 'warning',
  good: 'warning',
  strong: 'success',
  excellent: 'success',
};

const LABELS: Record<StrengthLabel, string> = {
  critical: 'Critical',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
  excellent: 'Excellent',
};

export function StrengthBadge({ label }: { label: StrengthLabel }) {
  return <Badge tone={TONES[label]}>{LABELS[label]}</Badge>;
}
