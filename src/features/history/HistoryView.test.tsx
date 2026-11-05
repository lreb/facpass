import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { copyTextToClipboard } from '../../lib/clipboard';
import { HistoryView } from './HistoryView';
import type { HistoryEntry } from './history';

vi.mock('../../lib/clipboard', () => ({
  copyTextToClipboard: vi.fn(),
}));

const entry: HistoryEntry = {
  id: 'entry-1',
  value: 'test-generated-value',
  mode: 'password',
  createdAt: Date.UTC(2026, 0, 1),
};

function renderHistory() {
  render(
    <HistoryView
      enabled
      entries={[entry]}
      onEnabledChange={vi.fn()}
      onClear={vi.fn()}
      onRemove={vi.fn()}
    />,
  );
}

describe('HistoryView', () => {
  it('announces a successful copy', async () => {
    const user = userEvent.setup();
    vi.mocked(copyTextToClipboard).mockResolvedValue('copied');
    renderHistory();

    await user.click(screen.getByRole('button', { name: /^Copy value for/ }));

    expect(
      screen.getByText('Copied to the clipboard. Clear it when you are done.'),
    ).toBeInTheDocument();
  });

  it('announces a blocked clipboard', async () => {
    const user = userEvent.setup();
    vi.mocked(copyTextToClipboard).mockResolvedValue('failed');
    renderHistory();

    await user.click(screen.getByRole('button', { name: /^Copy value for/ }));

    expect(
      screen.getByText('Clipboard access was blocked. Select the value and copy it manually.'),
    ).toBeInTheDocument();
  });
});
