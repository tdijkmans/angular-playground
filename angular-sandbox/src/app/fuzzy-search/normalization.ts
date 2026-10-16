import { ResolvedSearchKey, SearchKey, SearchOptions } from './types';

const COMBINING_MARKS = /\p{M}+/gu;

export const DEFAULT_OPTIONS: Required<SearchOptions<unknown>> = {
  keys: [],
  threshold: 0.6,
  location: 0,
  distance: 100,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  fieldNormWeight: 1,
  includeScore: false,
  includeMatches: false,
  minMatchCharLength: 1,
  findAllMatches: false,
  isCaseSensitive: false,
  ignoreDiacritics: false,
  shouldSort: true,
};

export function resolveOptions<T>(options: SearchOptions<T> = {}): Required<SearchOptions<T>> {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    keys: options.keys ?? [],
  };
}

export function resolveKeys<T>(sampleItems: readonly T[], keys: ReadonlyArray<SearchKey>): ResolvedSearchKey[] {
  if (keys.length > 0) {
    const resolved = keys.map((key) => {
      if (typeof key === 'string') {
        return { name: key, weight: 1 };
      }

      return {
        name: key.name,
        weight: key.weight > 0 ? key.weight : 1,
      };
    });

    const totalWeight = resolved.reduce((sum, key) => sum + key.weight, 0) || 1;

    return resolved.map((key) => ({ ...key, weight: key.weight / totalWeight }));
  }

  if (sampleItems.length === 0 || typeof sampleItems[0] === 'string') {
    return [{ name: '$', weight: 1 }];
  }

  return [];
}

export function normalizeString(input: string, isCaseSensitive: boolean, ignoreDiacritics: boolean): string {
  const source = isCaseSensitive ? input : input.toLocaleLowerCase();

  if (!ignoreDiacritics) {
    return source;
  }

  return source.normalize('NFD').replace(COMBINING_MARKS, '');
}

export function normalizeWithMap(
  input: string,
  isCaseSensitive: boolean,
  ignoreDiacritics: boolean,
): { normalized: string; mapToOriginalIndex: number[] } {
  const mapToOriginalIndex: number[] = [];
  const normalizedChars: string[] = [];

  let sourceOffset = 0;

  for (const sourceChar of input) {
    const processedChar = normalizeString(sourceChar, isCaseSensitive, ignoreDiacritics);

    for (const normalizedChar of processedChar) {
      normalizedChars.push(normalizedChar);
      mapToOriginalIndex.push(sourceOffset);
    }

    sourceOffset += sourceChar.length;
  }

  return {
    normalized: normalizedChars.join(''),
    mapToOriginalIndex,
  };
}

export function applyFieldNorm(value: string, fieldNormWeight: number): number {
  const termCount = Math.max(value.trim().split(/\s+/u).filter(Boolean).length, 1);
  return 1 / Math.pow(termCount, 0.5 * fieldNormWeight);
}
