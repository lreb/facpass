import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('../features/generator/wordlists/eff-large', () => ({
  loadEffLargeWordList: vi.fn(() => new Promise(() => undefined)),
}));

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, 'serviceWorker');
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.hash = '';
  document.documentElement.classList.remove('dark');

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('App', () => {
  it('opens on the generator with a generated password', () => {
    render(<App />);

    expect(screen.getByText('FacPass')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Generator' })).toHaveAttribute('aria-selected', 'true');

    const output = screen.getByLabelText('Generated password');
    expect(output.textContent).toHaveLength(20);
    expect(screen.getByText('Estimated entropy:')).toBeInTheDocument();
  });

  it('clears the current generated value', async () => {
    const user = userEvent.setup();
    render(<App />);

    const output = screen.getByLabelText('Generated password');
    expect(output.textContent).toHaveLength(20);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(output.textContent).toBe('Choose options, then generate a password.');
    expect(screen.queryByText('Estimated entropy:')).not.toBeInTheDocument();
  });

  it('analyzes a password locally', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Analyze' }));
    await user.type(screen.getByLabelText('Password to analyze'), 'password');

    await waitFor(
      () => {
        expect(screen.getByText('This is a commonly used password')).toBeInTheDocument();
      },
      { timeout: 2_000 },
    );

    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getByText(/Breach checking is not enabled/)).toBeInTheDocument();
  });

  it('supports opt-in session history and clearing it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'History' }));
    const toggle = screen.getByLabelText('Enable session history');
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(toggle).toBeChecked();

    await user.click(screen.getByRole('tab', { name: 'Generator' }));
    const generateButtons = screen.getAllByRole('button', { name: 'Generate' });
    await user.click(generateButtons[0]);

    await user.click(screen.getByRole('tab', { name: /History/ }));
    const historyPanel = document.getElementById('panel-history');
    expect(historyPanel).not.toBeNull();

    const history = within(historyPanel as HTMLElement);
    expect(history.getByText('Password')).toBeInTheDocument();
    expect(history.getByRole('button', { name: /^Copy value for/ })).toBeInTheDocument();

    await user.click(history.getByRole('button', { name: 'Clear all' }));

    expect(history.getByText('No values yet')).toBeInTheDocument();
  });

  it('applies and persists theme changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: 'Settings' }));
    await user.click(screen.getByRole('button', { name: 'Dark' }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('facpass.preferences.v1')).toContain('"theme":"dark"');
  });

  it('prompts to reload when a new service worker takes control', () => {
    const listeners = new Map<string, EventListener>();
    const serviceWorker = {
      controller: {},
      addEventListener: vi.fn((type: string, listener: EventListener) => {
        listeners.set(type, listener);
      }),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: serviceWorker,
    });

    render(<App />);

    act(() => {
      listeners.get('controllerchange')?.(new Event('controllerchange'));
    });

    expect(screen.getByText('A new version of FacPass is available.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('skips to main content without changing the active tab', async () => {
    const user = userEvent.setup();
    window.location.hash = '#settings';
    render(<App />);

    await user.click(screen.getByRole('link', { name: 'Skip to content' }));

    expect(document.getElementById('main-content')).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
    expect(window.location.hash).toBe('#settings');
  });

  it('honors the analyze shortcut hash', () => {
    window.location.hash = '#analyze';
    render(<App />);

    expect(screen.getByRole('tab', { name: 'Analyze' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Password to analyze')).toHaveFocus();
  });
});
