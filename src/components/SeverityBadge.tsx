import type { FindingSeverity } from '../types/security';
import { Badge, type BadgeTone } from './Badge';

const TONES: Record<FindingSeverity, BadgeTone> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
  good: 'success',
};

const LABELS: Record<FindingSeverity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
  good: 'Good',
};

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  return <Badge tone={TONES[severity]}>{LABELS[severity]}</Badge>;
}
