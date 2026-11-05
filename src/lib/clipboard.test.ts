import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyTextToClipboard } from './clipboard';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('copyTextToClipboard', () => {
  it('returns unavailable when the Clipboard API is missing', async () => {
    vi.stubGlobal('navigator', {});

    await expect(copyTextToClipboard('secret-value')).resolves.toBe('unavailable');
  });

  it('copies through the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyTextToClipboard('secret-value')).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('secret-value');
  });

  it('returns failed when writing is rejected', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyTextToClipboard('secret-value')).resolves.toBe('failed');
  });
});
