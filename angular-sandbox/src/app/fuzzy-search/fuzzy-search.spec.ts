import { describe, expect, it } from 'vitest';

import { FuzzySearch } from './fuzzy-search';
import { SearchOptions } from './types';

interface Ingredient {
  name: string;
  description: string;
  tags: string[];
  aliases?: string[];
  meta?: {
    family?: string;
  };
}

const ITEMS: Ingredient[] = [
  {
    name: 'Tomato',
    description: 'Fresh red tomato used in pasta sauce.',
    tags: ['nightshade', 'fresh'],
    aliases: ['tomat'],
    meta: { family: 'solanum' },
  },
  {
    name: 'Tomato purée',
    description: 'Concentrated tomato base for soup and stew.',
    tags: ['nightshade', 'canned'],
    aliases: ['pureed tomato'],
    meta: { family: 'solanum' },
  },
  {
    name: 'Crème fraîche',
    description: 'Cultured cream with a tangy profile.',
    tags: ['dairy'],
    aliases: ['creme fraiche'],
    meta: { family: 'cream' },
  },
  {
    name: 'Jalapeño',
    description: 'Green chili pepper with medium heat.',
    tags: ['chili', 'pepper'],
    aliases: ['jalapeno'],
    meta: { family: 'capsicum' },
  },
  {
    name: 'Basil',
    description: 'Fragrant herb often paired with tomato and mozzarella.',
    tags: ['herb'],
    aliases: ['sweet basil'],
    meta: { family: 'mint' },
  },
];

function createEngine(overrides: SearchOptions<Ingredient> = {}) {
  return new FuzzySearch(ITEMS, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'description', weight: 0.2 },
      { name: 'aliases', weight: 0.1 },
    ],
    includeScore: true,
    includeMatches: true,
    ignoreDiacritics: true,
    ...overrides,
  });
}

describe('FuzzySearch', () => {
  it('returns exact matches first', () => {
    const engine = createEngine({ threshold: 0.4 });
    const [first] = engine.search('Tomato');

    expect(first.item.name).toBe('Tomato');
    expect(first.score).toBeDefined();
    expect(first.score!).toBeLessThan(0.2);
  });

  it('supports partial and typo-tolerant matches', () => {
    const engine = createEngine({ threshold: 0.5 });
    const results = engine.search('tomat');

    expect(results.map((result) => result.item.name)).toContain('Tomato');
    expect(results.map((result) => result.item.name)).toContain('Tomato purée');
  });

  it('supports substitutions, insertions, and deletions', () => {
    const engine = createEngine({ threshold: 0.6 });

    expect(engine.search('jalpeno').some((result) => result.item.name === 'Jalapeño')).toBe(true); // deletion
    expect(engine.search('jalaapeno').some((result) => result.item.name === 'Jalapeño')).toBe(true); // insertion
    expect(engine.search('jalapeqa').some((result) => result.item.name === 'Jalapeño')).toBe(true); // substitution
  });

  it('documents transposition behavior', () => {
    const engine = createEngine({ threshold: 0.6 });
    const result = engine.search('toamto').find((entry) => entry.item.name === 'Tomato');

    // Bitap in this implementation does not model adjacent transpositions as one edit.
    // It can still match transposed input when threshold allows the extra substitutions.
    expect(result).toBeDefined();
    expect(result?.score).toBeGreaterThan(0.15);
  });

  it('respects diacritic normalization options', () => {
    const normalizedEngine = new FuzzySearch(ITEMS, {
      keys: ['name'],
      ignoreDiacritics: true,
      threshold: 0.5,
      includeScore: true,
    });
    const strictEngine = new FuzzySearch(ITEMS, {
      keys: ['name'],
      ignoreDiacritics: false,
      threshold: 0.5,
      includeScore: true,
    });

    const normalizedResult = normalizedEngine.search('creme fraiche').find((result) => result.item.name === 'Crème fraîche');
    const strictResult = strictEngine.search('creme fraiche').find((result) => result.item.name === 'Crème fraîche');

    expect(normalizedResult).toBeDefined();
    expect(strictResult).toBeDefined();
    expect(normalizedResult!.score ?? 1).toBeLessThan(strictResult!.score ?? 1);
  });

  it('supports case sensitivity', () => {
    const caseSensitive = new FuzzySearch(ITEMS, { keys: ['name'], isCaseSensitive: true, threshold: 0.4 });
    const caseInsensitive = new FuzzySearch(ITEMS, { keys: ['name'], isCaseSensitive: false, threshold: 0.4 });

    expect(caseSensitive.search('TOMATO').some((result) => result.item.name === 'Tomato')).toBe(false);
    expect(caseInsensitive.search('TOMATO').some((result) => result.item.name === 'Tomato')).toBe(true);
  });

  it('supports weighted fields and nested keys', () => {
    const engine = new FuzzySearch(ITEMS, {
      keys: [
        { name: 'meta.family', weight: 0.9 },
        { name: 'name', weight: 0.1 },
      ],
      includeScore: true,
      threshold: 0.5,
    });

    const [first] = engine.search('capsicum');
    expect(first.item.name).toBe('Jalapeño');
  });

  it('supports array fields and match indices for highlighting', () => {
    const engine = createEngine({ threshold: 0.5 });
    const [result] = engine.search('sweet basil');

    expect(result.item.name).toBe('Basil');
    const aliasMatch = result.matches?.find((match) => match.key === 'aliases');
    expect(aliasMatch?.indices.length).toBeGreaterThan(0);
  });

  it('returns deterministic sorting with stable tie-breaking', () => {
    const engine = new FuzzySearch(['tomato', 'tomato', 'tomatillo'], {
      includeScore: true,
      shouldSort: true,
      threshold: 0.5,
    });

    const results = engine.search('tomato');
    expect(results[0].refIndex).toBe(0);
    expect(results[1].refIndex).toBe(1);
  });

  it('handles empty queries and long patterns', () => {
    const engine = createEngine({ threshold: 0.6 });
    expect(engine.search('')).toEqual([]);

    const longQuery = 'Fresh red tomato used in pasta sauce.';
    const results = engine.search(longQuery);
    expect(results.some((result) => result.item.name === 'Tomato')).toBe(true);
  });

  it('supports reusable prebuilt indexes and result limits', () => {
    const options = {
      keys: ['name'],
      includeScore: true,
      threshold: 0.6,
    } as const;

    const index = FuzzySearch.createIndex(ITEMS, options);
    const engine = new FuzzySearch(ITEMS, options, index);

    const results = engine.search('to', { limit: 1 });

    expect(results).toHaveLength(1);
  });
});
