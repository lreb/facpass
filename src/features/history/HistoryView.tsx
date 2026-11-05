import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye, EyeOff, History, Trash2 } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Toggle } from '../../components/Toggle';
import { copyTextToClipboard } from '../../lib/clipboard';
import { GENERATOR_MODE_LABELS } from '../generator/mode-labels';
import type { HistoryEntry } from './history';

export interface HistoryViewProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  entries: readonly HistoryEntry[];
  onClear: () => void;
  onRemove: (id: string) => void;
}

export function HistoryView({
  enabled,
  onEnabledChange,
  entries,
  onClear,
  onRemove,
}: HistoryViewProps) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'copied' | 'error' | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const toggleRevealed = (id: string) => {
    setRevealedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleCopy = async (entry: HistoryEntry) => {
    const result = await copyTextToClipboard(entry.value);

    if (result === 'copied') {
      setCopiedId(entry.id);
      setCopyStatus('copied');
    } else {
      setCopiedId(null);
      setCopyStatus('error');
    }

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedId(null);
      setCopyStatus(null);
    }, 2_000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-text-primary">Session history</h2>
            </div>
            <p className="max-w-2xl text-sm text-text-secondary">
              Off by default. When enabled, generated values are kept in sessionStorage for this
              browser tab only and disappear when the tab closes.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={onClear} disabled={entries.length === 0}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear all
          </Button>
        </div>

        <div className="mt-5">
          <Toggle
            id="history-enabled"
            label="Enable session history"
            description="History is not a password vault. It is stored unencrypted in session storage and is visible to anyone with access to this tab."
            checked={enabled}
            onChange={onEnabledChange}
          />
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {copyStatus === 'copied'
            ? 'Copied to the clipboard. Clear it when you are done.'
            : copyStatus === 'error'
              ? 'Clipboard access was blocked. Select the value and copy it manually.'
              : ''}
        </p>

        <p className="mt-3 text-xs text-text-secondary">
          Clipboard contents may be visible to other apps and may be kept in clipboard history.
          FacPass cannot clear the clipboard automatically.
        </p>
      </Card>

      {!enabled ? (
        <Card className="border-dashed">
          <h2 className="text-base font-semibold text-text-primary">History is off</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Generated values are not being retained. Enable session history above if you need to
            refer back to values during this tab session.
          </p>
        </Card>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <h2 className="text-base font-semibold text-text-primary">No values yet</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Generate a password, passphrase, PIN, or pronounceable password to see it here.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const isRevealed = revealedIds.has(entry.id);
            const entryLabel = `${GENERATOR_MODE_LABELS[entry.mode]} generated ${new Date(
              entry.createdAt,
            ).toLocaleString('en-US')}`;

            return (
              <li key={entry.id}>
                <Card className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="accent">{GENERATOR_MODE_LABELS[entry.mode]}</Badge>
                      <span className="text-xs text-text-secondary">
                        {new Date(entry.createdAt).toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRevealed(entry.id)}
                        aria-label={
                          isRevealed
                            ? `Hide value for ${entryLabel}`
                            : `Show value for ${entryLabel}`
                        }
                        aria-pressed={isRevealed}
                      >
                        {isRevealed ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(entry)}
                        aria-label={`Copy value for ${entryLabel}`}
                      >
                        {copiedId === entry.id ? (
                          <Check className="h-4 w-4 text-success" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(entry.id)}
                        aria-label={`Remove value for ${entryLabel}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <p className="mt-3 break-all rounded-lg border border-border bg-background p-3 font-mono text-sm text-text-primary">
                    {isRevealed ? entry.value : '•'.repeat(Math.min(entry.value.length, 32))}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
