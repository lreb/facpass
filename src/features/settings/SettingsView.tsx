import { Monitor, Moon, RotateCcw, Settings, ShieldCheck, Sun } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import type { ThemePreference } from '../../lib/storage';
import { GENERATOR_MODE_LABELS, GENERATOR_MODES } from '../generator/mode-labels';
import type { GeneratorMode } from '../generator/types';

const THEME_OPTIONS: ReadonlyArray<{
  id: ThemePreference;
  label: string;
  icon: typeof Sun;
}> = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export interface SettingsViewProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  defaultMode: GeneratorMode;
  onDefaultModeChange: (mode: GeneratorMode) => void;
  onResetPreferences: () => void;
}

export function SettingsView({
  theme,
  onThemeChange,
  defaultMode,
  onDefaultModeChange,
  onResetPreferences,
}: SettingsViewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-text-primary">Preferences</h2>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">Theme</p>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Theme">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.id;

                return (
                  <Button
                    key={option.id}
                    variant={isActive ? 'primary' : 'secondary'}
                    onClick={() => onThemeChange(option.id)}
                    aria-pressed={isActive}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-text-secondary">
              System follows your operating system appearance.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="default-mode" className="block text-sm font-medium text-text-primary">
              Default generation mode
            </label>
            <select
              id="default-mode"
              value={defaultMode}
              onChange={(event) => onDefaultModeChange(event.target.value as GeneratorMode)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus sm:max-w-sm"
            >
              {GENERATOR_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {GENERATOR_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-border pt-5">
            <Button variant="secondary" onClick={onResetPreferences}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset preferences
            </Button>
            <p className="mt-2 text-xs text-text-secondary">
              Resets the theme and default mode. Session history is managed separately.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-text-primary">Privacy and data</h2>
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text-secondary">
          <li>No account, analytics, tracking, or plaintext transmission.</li>
          <li>
            Preferences are stored in localStorage. Generated values are not stored unless you
            explicitly enable session history.
          </li>
          <li>
            Session history, when enabled, uses sessionStorage and is cleared when this tab closes.
          </li>
          <li>Core generation and analysis work offline after the app is loaded.</li>
          <li>Security scores and crack times are estimates, not guarantees.</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary">About FacPass</h2>
        <p className="mt-2 text-sm text-text-secondary">
          FacPass is a local-first, offline-capable password generator and security analyzer. It is
          deployed as a static progressive web app and has no backend.
        </p>
        <p className="mt-3 text-xs text-text-secondary">
          Passphrase words: EFF Large Wordlist, licensed CC BY 3.0 US. Common-password checks:
          SecLists, licensed MIT. See the NOTICE file in the source repository for details.
        </p>
        <p className="mt-3 text-xs text-text-secondary">
          Source:{' '}
          <a
            href="https://github.com/lreb/facpass"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent underline underline-offset-2"
          >
            github.com/lreb/facpass
          </a>
        </p>
      </Card>
    </div>
  );
}
