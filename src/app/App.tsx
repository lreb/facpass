import { useCallback, useEffect, useState } from 'react';
import { History, KeyRound, Moon, Settings, ShieldCheck, Sun, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../components/Button';
import { Tabs, type TabItem } from '../components/Tabs';
import { AnalyzerView } from '../features/analyzer/AnalyzerView';
import { GeneratorView } from '../features/generator/GeneratorView';
import { GENERATOR_MODES } from '../features/generator/mode-labels';
import type { GeneratorMode, GeneratorOutput } from '../features/generator/types';
import {
  clearSessionHistory,
  createHistoryEntry,
  loadHistoryPreference,
  loadSessionHistory,
  MAX_HISTORY_ENTRIES,
  saveHistoryPreference,
  saveSessionHistory,
  type HistoryEntry,
} from '../features/history/history';
import { HistoryView } from '../features/history/HistoryView';
import { SettingsView } from '../features/settings/SettingsView';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { cn } from '../lib/cn';
import {
  clearPreferences,
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  type Preferences,
  type ThemePreference,
} from '../lib/storage';

type AppTab = 'generator' | 'analyzer' | 'history' | 'settings';

interface ParsedHash {
  tab: AppTab;
  mode?: GeneratorMode;
}

const TAB_LABELS: Record<AppTab, string> = {
  generator: 'Generator',
  analyzer: 'Analyze',
  history: 'History',
  settings: 'Settings',
};

export default function App() {
  const [{ tab: initialTab, mode: hashMode }] = useState<ParsedHash>(() => parseHash());
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences());
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>(
    () => hashMode ?? preferences.defaultMode,
  );
  const [tab, setTab] = useState<AppTab>(initialTab);
  const [resolvedDark, setResolvedDark] = useState(false);
  const isOnline = useOnlineStatus();
  const [historyEnabled, setHistoryEnabled] = useState(() => loadHistoryPreference());
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() =>
    historyEnabled ? loadSessionHistory() : [],
  );
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const media =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    const applyTheme = () => {
      const isDark =
        preferences.theme === 'dark' ||
        (preferences.theme === 'system' && (media?.matches ?? false));

      document.documentElement.classList.toggle('dark', isDark);
      setResolvedDark(isDark);

      const themeColor = document.querySelector('meta[name="theme-color"]');
      themeColor?.setAttribute('content', isDark ? '#0b1120' : '#2563eb');
    };

    applyTheme();

    if (!media || preferences.theme !== 'system') {
      return;
    }

    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [preferences.theme]);

  useEffect(() => {
    if (!historyEnabled) {
      clearSessionHistory();
    }
  }, [historyEnabled]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const hadController = Boolean(navigator.serviceWorker.controller);

    const handleControllerChange = () => {
      if (hadController) {
        setUpdateReady(true);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash();
      setTab(parsed.tab);

      if (parsed.mode) {
        setGeneratorMode(parsed.mode);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updatePreferences = (patch: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      savePreferences(next);
      return next;
    });
  };

  const handleThemeChange = (theme: ThemePreference) => {
    updatePreferences({ theme });
  };

  const handleDefaultModeChange = (mode: GeneratorMode) => {
    updatePreferences({ defaultMode: mode });
    setGeneratorMode(mode);
  };

  const handleResetPreferences = () => {
    clearPreferences();
    setPreferences({ ...DEFAULT_PREFERENCES });
    setGeneratorMode(DEFAULT_PREFERENCES.defaultMode);
  };

  const handleSelectTab = (nextTab: AppTab) => {
    setTab(nextTab);

    const hash =
      nextTab === 'generator' ? '#generate' : nextTab === 'analyzer' ? '#analyze' : `#${nextTab}`;

    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  };

  const handleHistoryEnabledChange = (enabled: boolean) => {
    setHistoryEnabled(enabled);
    saveHistoryPreference(enabled);

    if (!enabled) {
      setHistoryEntries([]);
      clearSessionHistory();
    }
  };

  const handleGenerated = useCallback(
    (output: GeneratorOutput) => {
      if (!historyEnabled) {
        return;
      }

      const entry = createHistoryEntry(output.value, output.mode);
      setHistoryEntries((current) => {
        const next = [entry, ...current].slice(0, MAX_HISTORY_ENTRIES);
        saveSessionHistory(next);
        return next;
      });
    },
    [historyEnabled],
  );

  const handleClearHistory = () => {
    setHistoryEntries([]);
    clearSessionHistory();
  };

  const handleRemoveHistory = (id: string) => {
    setHistoryEntries((current) => {
      const next = current.filter((entry) => entry.id !== id);
      saveSessionHistory(next);
      return next;
    });
  };

  const handleToggleTheme = () => {
    updatePreferences({ theme: resolvedDark ? 'light' : 'dark' });
  };

  const tabs: readonly TabItem[] = [
    {
      id: 'generator',
      label: TAB_LABELS.generator,
      icon: <KeyRound className="h-4 w-4" aria-hidden="true" />,
      panelId: 'panel-generator',
    },
    {
      id: 'analyzer',
      label: TAB_LABELS.analyzer,
      icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
      panelId: 'panel-analyzer',
    },
    {
      id: 'history',
      label:
        historyEnabled && historyEntries.length > 0
          ? `${TAB_LABELS.history} (${historyEntries.length})`
          : TAB_LABELS.history,
      icon: <History className="h-4 w-4" aria-hidden="true" />,
      panelId: 'panel-history',
    },
    {
      id: 'settings',
      label: TAB_LABELS.settings,
      icon: <Settings className="h-4 w-4" aria-hidden="true" />,
      panelId: 'panel-settings',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-background"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-background">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight text-text-primary">FacPass</h1>
              <p className="text-xs text-text-secondary">Local-first password tools</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              role="status"
              aria-live="polite"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                isOnline
                  ? 'border-border bg-surface text-text-secondary'
                  : 'border-warning/30 bg-warning/10 text-warning',
              )}
            >
              {isOnline ? (
                <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleTheme}
              aria-label={resolvedDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {resolvedDark ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {updateReady ? (
        <div role="status" className="border-b border-accent/30 bg-accent/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
            <p className="text-sm text-text-primary">A new version of FacPass is available.</p>
            <Button size="sm" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      ) : null}

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:px-6 lg:py-10"
      >
        <Tabs
          items={tabs}
          active={tab}
          onChange={(nextTab) => handleSelectTab(nextTab as AppTab)}
          label="Main sections"
        />

        <div className="mt-4">
          <section
            role="tabpanel"
            id="panel-generator"
            aria-labelledby="tab-generator"
            hidden={tab !== 'generator'}
          >
            <GeneratorView
              key={generatorMode}
              initialMode={generatorMode}
              onGenerated={handleGenerated}
            />
          </section>

          <section
            role="tabpanel"
            id="panel-analyzer"
            aria-labelledby="tab-analyzer"
            hidden={tab !== 'analyzer'}
          >
            <AnalyzerView isActive={tab === 'analyzer'} />
          </section>

          <section
            role="tabpanel"
            id="panel-history"
            aria-labelledby="tab-history"
            hidden={tab !== 'history'}
          >
            <HistoryView
              enabled={historyEnabled}
              onEnabledChange={handleHistoryEnabledChange}
              entries={historyEntries}
              onClear={handleClearHistory}
              onRemove={handleRemoveHistory}
            />
          </section>

          <section
            role="tabpanel"
            id="panel-settings"
            aria-labelledby="tab-settings"
            hidden={tab !== 'settings'}
          >
            <SettingsView
              theme={preferences.theme}
              onThemeChange={handleThemeChange}
              defaultMode={preferences.defaultMode}
              onDefaultModeChange={handleDefaultModeChange}
              onResetPreferences={handleResetPreferences}
            />
          </section>
        </div>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-text-secondary sm:px-6">
        <p>No accounts. No tracking. No plaintext transmission.</p>
        <p className="mt-1">
          Security estimates are not guarantees. FacPass is not a password vault.
        </p>
      </footer>
    </div>
  );
}

function parseHash(): ParsedHash {
  const rawHash = window.location.hash.replace(/^#/, '');
  const [path, query] = rawHash.split('?');
  const params = new URLSearchParams(query ?? '');
  const modeParam = params.get('mode');
  const mode =
    modeParam && GENERATOR_MODES.includes(modeParam as GeneratorMode)
      ? (modeParam as GeneratorMode)
      : undefined;

  if (path === 'analyze') {
    return { tab: 'analyzer' };
  }

  if (path === 'history') {
    return { tab: 'history' };
  }

  if (path === 'settings') {
    return { tab: 'settings' };
  }

  return { tab: 'generator', mode };
}
