import { describe, expect, it } from 'vitest';

import { FuzzySearch } from './fuzzy-search';

interface BenchmarkItem {
  name: string;
  description: string;
}

function createDataset(size: number): BenchmarkItem[] {
  const items: BenchmarkItem[] = [];

  for (let index = 0; index < size; index += 1) {
    items.push({
      name: `Ingredient ${index}`,
      description: `Ingredient ${index} is used in tomato basil stew batch ${index % 11}`,
    });
  }

  return items;
}

describe('FuzzySearch benchmark coverage', () => {
  it('measures representative search sizes', () => {
    const sizes = [100, 1_000, 10_000, 100_000];
    const timings: Array<{ size: number; durationMs: number }> = [];

    for (const size of sizes) {
      const dataset = createDataset(size);
      const engine = new FuzzySearch(dataset, {
        keys: ['name', 'description'],
        threshold: 0.5,
      });

      const startedAt = performance.now();
      const results = engine.search('Ingredient 10', { limit: 20 });
      const durationMs = performance.now() - startedAt;

      timings.push({ size, durationMs });

      expect(results.length).toBeGreaterThan(0);
      expect(durationMs).toBeGreaterThanOrEqual(0);
    }

    console.info('Benchmark timings (ms):', timings);
  });
});
