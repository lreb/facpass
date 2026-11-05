import { cn } from '../lib/cn';

export interface PasswordDisplayProps {
  value: string | null;
  label: string;
  placeholder: string;
}

export function PasswordDisplay({ value, label, placeholder }: PasswordDisplayProps) {
  return (
    <output
      aria-label={label}
      className={cn(
        'block min-h-24 w-full break-all rounded-xl border border-border bg-background p-4 font-mono text-lg leading-relaxed sm:text-xl',
        value ? 'text-text-primary' : 'text-text-secondary',
      )}
    >
      {value ?? placeholder}
    </output>
  );
}
