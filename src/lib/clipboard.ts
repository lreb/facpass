export type CopyResult = 'copied' | 'unavailable' | 'failed';

export async function copyTextToClipboard(value: string): Promise<CopyResult> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return 'unavailable';
  }

  try {
    await navigator.clipboard.writeText(value);
    return 'copied';
  } catch {
    return 'failed';
  }
}
