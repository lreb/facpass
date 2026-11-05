export interface RangeFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hint?: string;
  onChange: (value: number) => void;
}

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  hint,
  onChange,
}: RangeFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={`${id}-range`} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`${id}-number`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            aria-label={`${label} value`}
            aria-describedby={hintId}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-right text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
          {suffix ? <span className="text-sm text-text-secondary">{suffix}</span> : null}
        </div>
      </div>
      <input
        id={`${id}-range`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={hintId}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-accent"
      />
      {hint ? (
        <p id={hintId} className="text-xs text-text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
