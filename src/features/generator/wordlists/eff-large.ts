export interface WordList {
  words: readonly string[];
  size: number;
}

let cachedWordList: WordList | null = null;

export async function loadEffLargeWordList(): Promise<WordList> {
  if (cachedWordList) {
    return cachedWordList;
  }

  const module = await import('./eff_large_wordlist.txt?raw');
  const words = parseEffWordList(module.default);
  cachedWordList = {
    words,
    size: new Set(words).size,
  };

  return cachedWordList;
}

export function parseEffWordList(raw: string): string[] {
  const words = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      return parts[parts.length - 1] ?? '';
    })
    .filter(Boolean);

  return Array.from(new Set(words));
}
