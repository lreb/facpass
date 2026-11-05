import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn('rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6', className)}
    >
      {children}
    </section>
  );
}
