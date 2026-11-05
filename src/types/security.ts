export type FindingSeverity = 'critical' | 'warning' | 'info' | 'good';

export interface Finding {
  id: string;
  severity: FindingSeverity;
  title: string;
  detail: string;
  recommendation: string;
}

export type StrengthLabel = 'critical' | 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
