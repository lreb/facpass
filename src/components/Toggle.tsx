export interface ToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ id, label, description, checked, onChange }: ToggleProps) {
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4"
    >
      <span className="space-y-1">
        <span className="block text-sm font-medium text-text-primary">{label}</span>
        {description ? (
          <span id={descriptionId} className="block text-sm text-text-secondary">
            {description}
          </span>
        ) : null}
      </span>
      <span className="relative mt-1 inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          aria-label={label}
          aria-describedby={descriptionId}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span
          className="h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
