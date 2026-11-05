import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { SeverityBadge } from '../../components/SeverityBadge';
import { StrengthBadge } from '../../components/StrengthBadge';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { analyzePassword, type AnalysisResult } from '../../security/analyze';

const EMPTY_GUIDANCE = [
  'Paste a password to estimate its strength locally.',
  'The value stays in this tab and is never sent anywhere.',
  'Entropy and crack times are estimates, not guarantees.',
];

export interface AnalyzerViewProps {
  isActive?: boolean;
}

export function AnalyzerView({ isActive = true }: AnalyzerViewProps) {
  const [value, setValue] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebouncedValue(value, 180);
  const analysis = useMemo(
    () => (debouncedValue.length > 0 ? analyzePassword(debouncedValue) : null),
    [debouncedValue],
  );

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">Analyze a password</h2>
            <p className="max-w-2xl text-sm text-text-secondary">
              Analysis runs entirely in your browser. The password is not stored, logged, or
              transmitted.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setValue('');
              setIsRevealed(false);
              inputRef.current?.focus();
            }}
            disabled={value.length === 0}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear
          </Button>
        </div>

        <label
          htmlFor="analyzer-input"
          className="mt-5 block text-sm font-medium text-text-primary"
        >
          Password to analyze
        </label>
        <div className="mt-2 flex gap-2">
          <input
            ref={inputRef}
            id="analyzer-input"
            type={isRevealed ? 'text' : 'password'}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby="analyzer-privacy-note"
            className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 font-mono text-base text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
          <Button
            variant="secondary"
            onClick={() => setIsRevealed((current) => !current)}
            aria-label={isRevealed ? 'Hide password' : 'Show password'}
            aria-pressed={isRevealed}
          >
            {isRevealed ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{isRevealed ? 'Hide' : 'Show'}</span>
          </Button>
        </div>
        <p id="analyzer-privacy-note" className="mt-2 text-xs text-text-secondary">
          Nothing is sent over the network. Avoid analyzing real production passwords on shared
          devices.
        </p>
      </Card>

      {analysis ? (
        <AnalysisResultView analysis={analysis} />
      ) : (
        <Card className="border-dashed">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-text-primary">How analysis works</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
                {EMPTY_GUIDANCE.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-dashed">
        <h2 className="text-sm font-semibold text-text-primary">Breach checking</h2>
        <p className="mt-1 text-xs text-text-secondary">
          Breach checking is not enabled in this offline build, so FacPass makes no network requests
          with your password. A future version must hash locally and send only an approved hash
          prefix.
        </p>
      </Card>
    </div>
  );
}

function AnalysisResultView({ analysis }: { analysis: AnalysisResult }) {
  const scoreColor =
    analysis.score < 40
      ? 'var(--danger)'
      : analysis.score < 75
        ? 'var(--warning)'
        : 'var(--success)';

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-text-primary">Strength</h2>
            <StrengthBadge label={analysis.label} />
          </div>
          <p className="text-sm text-text-secondary">
            Score{' '}
            <span className="font-mono font-semibold text-text-primary">{analysis.score}</span>
            /100
          </p>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-label="Password strength score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={analysis.score}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${analysis.score}%`, backgroundColor: scoreColor }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Length" value={analysis.length.toLocaleString('en-US')} />
          <Metric
            label="Character classes"
            value={analysis.characterClasses.toLocaleString('en-US')}
          />
          <Metric label="Estimated entropy" value={`${Math.round(analysis.entropyBits)} bits`} />
          <Metric
            label="After patterns"
            value={`${Math.round(analysis.effectiveEntropyBits)} bits`}
          />
        </dl>

        <p className="mt-4 text-xs text-text-secondary">{analysis.searchSpaceNote}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary">Estimated crack time</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <CrackTime
            title="Online attack"
            description="Throttled or rate-limited guessing"
            value={analysis.crackTimes.online.label}
          />
          <CrackTime
            title="Offline attack"
            description="Fast guessing against a stolen hash"
            value={analysis.crackTimes.offline.label}
          />
        </div>
        <p className="mt-4 text-xs text-text-secondary">{analysis.crackTimes.assumptions}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary">Findings</h2>
        {analysis.findings.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">
            No common weaknesses were detected. That does not prove the password is safe.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {analysis.findings.map((finding) => (
              <li key={finding.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={finding.severity} />
                  <h3 className="text-sm font-semibold text-text-primary">{finding.title}</h3>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{finding.detail}</p>
                <p className="mt-2 text-sm text-text-primary">
                  <span className="font-semibold">Recommendation: </span>
                  {finding.recommendation}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</dt>
      <dd className="mt-1 font-mono text-base font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function CrackTime({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-xs text-text-secondary">{description}</p>
      <p className="mt-3 font-mono text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}
