import { describe, expect, it } from 'vitest';
import { loadEffLargeWordList, parseEffWordList } from './eff-large';

describe('parseEffWordList', () => {
  it('extracts the word from numbered lines', () => {
    expect(parseEffWordList('11111\tabacus\n11112\tabdomen\n')).toEqual(['abacus', 'abdomen']);
  });

  it('ignores blank lines and removes duplicates', () => {
    expect(parseEffWordList('\n11111\talpha\n11112\talpha\n11113\tbravo\n\n')).toEqual([
      'alpha',
      'bravo',
    ]);
  });
});

describe('loadEffLargeWordList', () => {
  it('loads the complete EFF large word list', async () => {
    const wordList = await loadEffLargeWordList();

    expect(wordList.size).toBe(7_776);
    expect(wordList.words).toHaveLength(7_776);
    expect(new Set(wordList.words).size).toBe(7_776);
    expect(wordList.words[0]).toBe('abacus');
    expect(wordList.words[wordList.words.length - 1]).toBe('zoom');
  });

  it('caches the parsed list', async () => {
    const first = await loadEffLargeWordList();
    const second = await loadEffLargeWordList();

    expect(second).toBe(first);
  });
});
