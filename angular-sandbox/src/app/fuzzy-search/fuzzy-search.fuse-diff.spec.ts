import Fuse from 'fuse.js';
import { describe, expect, it } from 'vitest';

import { FuzzySearch } from './fuzzy-search';

interface DemoItem {
  name: string;
  description: string;
}

const DATASET: DemoItem[] = [
  { name: 'Tomato', description: 'Fresh red tomato for quick sauces.' },
  { name: 'Tomato purée', description: 'Concentrated tomato with silky texture.' },
  { name: 'Crème fraîche', description: 'Tangy cultured cream for finishing soups.' },
  { name: 'Jalapeño', description: 'Green chili with medium heat and grassy notes.' },
  { name: 'Aubergine', description: 'Creamy roasted eggplant for traybakes.' },
];

const OPTIONS = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'description', weight: 0.3 },
  ],
  includeScore: true,
  includeMatches: true,
  ignoreDiacritics: true,
  threshold: 0.4,
  location: 0,
  distance: 100,
  shouldSort: true,
};

describe('FuzzySearch vs Fuse.js', () => {
  it('keeps top result ordering compatible for representative queries', () => {
    const queries = ['tomat', 'crme fraiche', 'jalapeno'];

    const engine = new FuzzySearch(DATASET, OPTIONS);
    const fuse = new Fuse(DATASET, OPTIONS);

    for (const query of queries) {
      const ours = engine.search(query).slice(0, 3).map((result) => result.item.name);
      const theirs = fuse.search(query).slice(0, 3).map((result) => result.item.name);

      expect(ours[0]).toBe(theirs[0]);
      expect(ours).toEqual(expect.arrayContaining(theirs.slice(0, 2)));
    }
  });

  it('reports score and match-index differences transparently', () => {
    const query = 'tomat';

    const engine = new FuzzySearch(DATASET, OPTIONS);
    const fuse = new Fuse(DATASET, OPTIONS);

    const ours = engine.search(query);
    const theirs = fuse.search(query);

    expect(ours.length).toBeGreaterThan(0);
    expect(theirs.length).toBeGreaterThan(0);

    const ourTop = ours[0];
    const theirTop = theirs[0];

    expect(ourTop.item.name).toBe(theirTop.item.name);

    const scoreDelta = Math.abs((ourTop.score ?? 1) - (theirTop.score ?? 1));
    expect(scoreDelta).toBeLessThan(0.25);

    const ourIndices = ourTop.matches?.[0]?.indices.length ?? 0;
    const theirIndices = theirTop.matches?.[0]?.indices.length ?? 0;
    expect(Math.abs(ourIndices - theirIndices)).toBeLessThanOrEqual(2);
  });
});
