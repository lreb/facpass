import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Hash,
  KeyRound,
  Loader2,
  RefreshCw,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PasswordDisplay } from '../../components/PasswordDisplay';
import { RangeField } from '../../components/RangeField';
import { StrengthBadge } from '../../components/StrengthBadge';
import { Tabs, type TabItem } from '../../components/Tabs';
import { Toggle } from '../../components/Toggle';
import { copyTextToClipboard } from '../../lib/clipboard';
import {
  generatePassphrase,
  generatePassword,
  generatePin,
  generatePronounceable,
} from './generators';
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  DEFAULT_PASSWORD_OPTIONS,
  DEFAULT_PIN_OPTIONS,
  DEFAULT_PRONOUNCEABLE_OPTIONS,
  type GeneratorMode,
  type GeneratorOutput,
  type PassphraseOptions,
  type PasswordOptions,
  type PinOptions,
  type PronounceableOptions,
} from './types';
import { GENERATOR_MODE_LABELS } from './mode-labels';
import { loadEffLargeWordList, type WordList } from './wordlists/eff-large';

const MODE_TABS: readonly TabItem[] = [
  {
    id: 'password',
    label: 'Password',
    icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
    panelId: 'mode-panel-password',
  },
  {
    id: 'passphrase',
    label: 'Passphrase',
    icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
    panelId: 'mode-panel-passphrase',
  },
  {
    id: 'pin',
    label: 'PIN',
    icon: <Hash className="h-4 w-4" aria-hidden="true" />,
    panelId: 'mode-panel-pin',
  },
  {
    id: 'pronounceable',
    label: 'Pronounceable',
    icon: <Wand2 className="h-4 w-4" aria-hidden="true" />,
    panelId: 'mode-panel-pronounceable',
  },
];

const OUTPUT_PLACEHOLDERS: Record<GeneratorMode, string> = {
  password: 'Choose options, then generate a password.',
  passphrase: 'Load the local word list, then generate a passphrase.',
  pin: 'Choose a length, then generate a PIN.',
  pronounceable: 'Choose options, then generate a pronounceable password.',
};

type CopyState = 'idle' | 'copied' | 'error';

export interface GeneratorViewProps {
  initialMode: GeneratorMode;
  onGenerated: (output: GeneratorOutput) => void;
}

export function GeneratorView({ initialMode, onGenerated }: GeneratorViewProps) {
  const [mode, setMode] = useState<GeneratorMode>(initialMode);
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>(
    DEFAULT_PASSPHRASE_OPTIONS,
  );
  const [pinOptions, setPinOptions] = useState<PinOptions>(DEFAULT_PIN_OPTIONS);
  const [pronounceableOptions, setPronounceableOptions] = useState<PronounceableOptions>(
    DEFAULT_PRONOUNCEABLE_OPTIONS,
  );
  const [outputs, setOutputs] = useState<Record<GeneratorMode, GeneratorOutput | null>>(() => ({
    password: safeInitialPassword(),
    passphrase: null,
    pin: null,
    pronounceable: null,
  }));
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [wordListError, setWordListError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const copyTimeoutRef = useRef<number | null>(null);

  const output = outputs[mode];

  useEffect(() => {
    let cancelled = false;

    loadEffLargeWordList()
      .then((list) => {
        if (!cancelled) {
          setWordList(list);
          setWordListError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWordListError(
            'The local word list could not be loaded. Passphrase generation is unavailable until the app reloads.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const generate = useCallback(
    (targetMode: GeneratorMode) => {
      setError(null);
      setCopyState('idle');

      try {
        let nextOutput: GeneratorOutput;

        if (targetMode === 'password') {
          nextOutput = generatePassword(passwordOptions);
        } else if (targetMode === 'passphrase') {
          if (!wordList) {
            setError(
              wordListError ?? 'The local word list is still loading. Try again in a moment.',
            );
            return;
          }
          nextOutput = generatePassphrase(passphraseOptions, wordList);
        } else if (targetMode === 'pin') {
          nextOutput = generatePin(pinOptions);
        } else {
          nextOutput = generatePronounceable(pronounceableOptions);
        }

        setOutputs((current) => ({ ...current, [targetMode]: nextOutput }));
        onGenerated(nextOutput);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not generate a value.');
      }
    },
    [
      onGenerated,
      passphraseOptions,
      passwordOptions,
      pinOptions,
      pronounceableOptions,
      wordList,
      wordListError,
    ],
  );

  const handleModeChange = (nextTabId: string) => {
    const nextMode = nextTabId as GeneratorMode;
    setMode(nextMode);
    setError(null);
    setCopyState('idle');

    if (!outputs[nextMode] && (nextMode !== 'passphrase' || wordList)) {
      generate(nextMode);
    }
  };

  const handleClear = () => {
    setOutputs((current) => ({ ...current, [mode]: null }));
    setError(null);
    setCopyState('idle');
  };

  const handleCopy = async () => {
    if (!output) {
      return;
    }

    const result = await copyTextToClipboard(output.value);
    setCopyState(result === 'copied' ? 'copied' : 'error');

    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyState('idle');
    }, 2_000);
  };

  return (
    <div className="space-y-4">
      <Tabs items={MODE_TABS} active={mode} onChange={handleModeChange} label="Generation mode" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {GENERATOR_MODE_LABELS[mode]} options
              </h2>
              <p className="mt-1 text-sm text-text-secondary">{modeNote(mode)}</p>
            </div>
            <Button onClick={() => generate(mode)} disabled={mode === 'passphrase' && !wordList}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Generate
            </Button>
          </div>

          <div className="mt-5 space-y-5">
            <ModePanel mode="password" active={mode}>
              <PasswordOptionsPanel
                options={passwordOptions}
                onChange={(patch) => setPasswordOptions((current) => ({ ...current, ...patch }))}
              />
            </ModePanel>

            <ModePanel mode="passphrase" active={mode}>
              <PassphraseOptionsPanel
                options={passphraseOptions}
                wordList={wordList}
                error={wordListError}
                onChange={(patch) => setPassphraseOptions((current) => ({ ...current, ...patch }))}
              />
            </ModePanel>

            <ModePanel mode="pin" active={mode}>
              <PinOptionsPanel
                options={pinOptions}
                onChange={(patch) => setPinOptions((current) => ({ ...current, ...patch }))}
              />
            </ModePanel>

            <ModePanel mode="pronounceable" active={mode}>
              <PronounceableOptionsPanel
                options={pronounceableOptions}
                onChange={(patch) =>
                  setPronounceableOptions((current) => ({ ...current, ...patch }))
                }
              />
            </ModePanel>
          </div>
        </Card>

        <div className="space-y-4">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Your {GENERATOR_MODE_LABELS[mode]}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Generated locally with Web Crypto. Nothing leaves this device.
                </p>
              </div>
              {output ? <StrengthBadge label={output.label} /> : null}
            </div>

            <div className="mt-4">
              <PasswordDisplay
                value={output?.value ?? null}
                label={`Generated ${GENERATOR_MODE_LABELS[mode].toLowerCase()}`}
                placeholder={
                  mode === 'passphrase' && !wordList && !wordListError
                    ? 'Loading local word list…'
                    : OUTPUT_PLACEHOLDERS[mode]
                }
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={() => generate(mode)} disabled={mode === 'passphrase' && !wordList}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Generate
              </Button>
              <Button variant="secondary" onClick={handleCopy} disabled={!output}>
                {copyState === 'copied' ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copyState === 'copied' ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="ghost" onClick={handleClear} disabled={!output}>
                <X className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </div>

            <p className="mt-2 min-h-4 text-xs text-text-secondary" aria-live="polite">
              {copyState === 'copied'
                ? 'Copied to the clipboard. Clear it when you are done.'
                : copyState === 'error'
                  ? 'Clipboard access was blocked. Select the value and copy it manually.'
                  : ''}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Clipboard contents may be visible to other apps and may be kept in clipboard history.
              FacPass cannot clear the clipboard automatically.
            </p>

            {output ? (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <p className="text-sm text-text-primary">
                  <span className="font-semibold">Estimated entropy: </span>
                  {Math.round(output.entropyBits).toLocaleString('en-US')} bits
                </p>
                <p className="text-xs text-text-secondary">{output.note}</p>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-text-secondary">
                {mode === 'passphrase' && !wordList && !wordListError ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Loading the local EFF word list…
                  </>
                ) : (
                  'Generate a value to see details.'
                )}
              </p>
            )}
          </Card>

          <Card className="border-dashed">
            <h2 className="text-sm font-semibold text-text-primary">Good to know</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-text-secondary">
              <li>Values are generated in memory and are not saved to disk.</li>
              <li>Entropy is an estimate based on the generation method, not a guarantee.</li>
              <li>
                Use a unique password for every account and enable multi-factor authentication.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ModePanel({
  mode,
  active,
  children,
}: {
  mode: GeneratorMode;
  active: GeneratorMode;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`mode-panel-${mode}`}
      aria-labelledby={`tab-${mode}`}
      hidden={mode !== active}
    >
      {children}
    </div>
  );
}

function PasswordOptionsPanel({
  options,
  onChange,
}: {
  options: PasswordOptions;
  onChange: (patch: Partial<PasswordOptions>) => void;
}) {
  return (
    <>
      <RangeField
        id="password-length"
        label="Length"
        value={options.length}
        min={4}
        max={128}
        suffix="characters"
        hint="Longer passwords generally provide more entropy. Aim for at least 16 characters."
        onChange={(length) => onChange({ length })}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-text-primary">Character classes</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle
            id="password-lowercase"
            label="Lowercase"
            checked={options.useLowercase}
            onChange={(useLowercase) => onChange({ useLowercase })}
          />
          <Toggle
            id="password-uppercase"
            label="Uppercase"
            checked={options.useUppercase}
            onChange={(useUppercase) => onChange({ useUppercase })}
          />
          <Toggle
            id="password-digits"
            label="Digits"
            checked={options.useDigits}
            onChange={(useDigits) => onChange({ useDigits })}
          />
          <Toggle
            id="password-symbols"
            label="Symbols"
            checked={options.useSymbols}
            onChange={(useSymbols) => onChange({ useSymbols })}
          />
        </div>
      </fieldset>

      <Toggle
        id="password-each-class"
        label="Include every selected class"
        description="Guarantees at least one character from each enabled class."
        checked={options.ensureEachClass}
        onChange={(ensureEachClass) => onChange({ ensureEachClass })}
      />

      <Toggle
        id="password-ambiguous"
        label="Exclude ambiguous characters"
        description="Removes look-alike characters such as O, 0, I, l, 1, and |."
        checked={options.excludeAmbiguous}
        onChange={(excludeAmbiguous) => onChange({ excludeAmbiguous })}
      />

      <div className="space-y-2">
        <label htmlFor="password-excluded" className="block text-sm font-medium text-text-primary">
          Additional excluded characters
        </label>
        <input
          id="password-excluded"
          type="text"
          value={options.excludedCharacters}
          maxLength={64}
          autoComplete="off"
          spellCheck={false}
          placeholder="For example: @#"
          onChange={(event) => onChange({ excludedCharacters: event.target.value })}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
        <p className="text-xs text-text-secondary">
          These characters are removed from every selected class.
        </p>
      </div>
    </>
  );
}

function PassphraseOptionsPanel({
  options,
  wordList,
  error,
  onChange,
}: {
  options: PassphraseOptions;
  wordList: WordList | null;
  error: string | null;
  onChange: (patch: Partial<PassphraseOptions>) => void;
}) {
  return (
    <>
      <RangeField
        id="passphrase-words"
        label="Words"
        value={options.wordCount}
        min={3}
        max={12}
        suffix="words"
        hint="Each additional word adds about 12.9 bits when using the EFF large word list."
        onChange={(wordCount) => onChange({ wordCount })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="passphrase-separator"
            className="block text-sm font-medium text-text-primary"
          >
            Separator
          </label>
          <select
            id="passphrase-separator"
            value={options.separator}
            onChange={(event) =>
              onChange({ separator: event.target.value as PassphraseOptions['separator'] })
            }
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <option value="-">Hyphen (-)</option>
            <option value=" ">Space</option>
            <option value=".">Period (.)</option>
            <option value="_">Underscore (_)</option>
            <option value="">None</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="passphrase-capitalization"
            className="block text-sm font-medium text-text-primary"
          >
            Capitalization
          </label>
          <select
            id="passphrase-capitalization"
            value={options.capitalization}
            onChange={(event) =>
              onChange({
                capitalization: event.target.value as PassphraseOptions['capitalization'],
              })
            }
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <option value="none">None</option>
            <option value="first">First word</option>
            <option value="all">Every word</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4 text-sm">
        {error ? (
          <p className="text-danger">{error}</p>
        ) : wordList ? (
          <p className="text-text-secondary">
            Using the local EFF large word list:{' '}
            <span className="font-semibold text-text-primary">
              {wordList.size.toLocaleString('en-US')} words
            </span>
            .
          </p>
        ) : (
          <p className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Loading the local EFF large word list…
          </p>
        )}
      </div>
    </>
  );
}

function PinOptionsPanel({
  options,
  onChange,
}: {
  options: PinOptions;
  onChange: (patch: Partial<PinOptions>) => void;
}) {
  return (
    <>
      <RangeField
        id="pin-length"
        label="Length"
        value={options.length}
        min={4}
        max={12}
        suffix="digits"
        hint="PINs have a small search space. Only use them where rate limiting and lockouts apply."
        onChange={(length) => onChange({ length })}
      />
      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
        A {options.length}-digit PIN has about {Math.round(options.length * Math.log2(10))} bits of
        entropy. It is not a substitute for a strong password.
      </div>
    </>
  );
}

function PronounceableOptionsPanel({
  options,
  onChange,
}: {
  options: PronounceableOptions;
  onChange: (patch: Partial<PronounceableOptions>) => void;
}) {
  return (
    <>
      <RangeField
        id="pronounceable-length"
        label="Length"
        value={options.length}
        min={6}
        max={32}
        suffix="characters"
        hint="Pronounceable passwords use a consonant-vowel pattern for easier typing."
        onChange={(length) => onChange({ length })}
      />
      <Toggle
        id="pronounceable-capitalize"
        label="Capitalize first character"
        checked={options.capitalize}
        onChange={(capitalize) => onChange({ capitalize })}
      />
    </>
  );
}

function modeNote(mode: GeneratorMode): string {
  if (mode === 'password') {
    return 'Random characters from the classes you choose.';
  }

  if (mode === 'passphrase') {
    return 'Random words from a local word list.';
  }

  if (mode === 'pin') {
    return 'Random digits for devices that require a numeric code.';
  }

  return 'A consonant-vowel pattern that is easier to read aloud.';
}

function safeInitialPassword(): GeneratorOutput | null {
  try {
    return generatePassword(DEFAULT_PASSWORD_OPTIONS);
  } catch {
    return null;
  }
}
