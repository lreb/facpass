import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  panelId?: string;
}

export interface TabsProps {
  items: readonly TabItem[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}

export function Tabs({ items, active, onChange, label }: TabsProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const next = items[nextIndex];
      if (next) {
        onChange(next.id);
        document.getElementById(`tab-${next.id}`)?.focus();
      }
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-2"
    >
      {items.map((item, index) => {
        const isActive = item.id === active;

        return (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={item.panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isActive
                ? 'bg-accent text-background'
                : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
