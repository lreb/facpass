import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-border bg-surface-elevated text-text-secondary',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-accent/30 bg-accent/10 text-accent',
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
