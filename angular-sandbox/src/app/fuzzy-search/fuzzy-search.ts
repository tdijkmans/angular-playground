import { bitapSearch } from './bitap';
import { createIndex } from './indexer';
import { normalizeString, resolveOptions } from './normalization';
import {
  FuzzySearchIndex,
  IndexedField,
  SearchMatch,
  SearchOptions,
  SearchRequest,
  SearchResult,
} from './types';

interface InternalFieldMatch {
  score: number;
  matches: SearchMatch[];
}

function mapToOriginalIndices(indices: Array<[number, number]>, map: number[], original: string): Array<[number, number]> {
  return indices
    .map(([start, end]) => {
      if (start < 0 || end < 0 || start >= map.length || end >= map.length) {
        return null;
      }

      const startOffset = map[start];
      const nextOffset = map[end + 1];
      const endOffset = typeof nextOffset === 'number' ? nextOffset - 1 : original.length - 1;

      return [startOffset, Math.max(startOffset, endOffset)] as [number, number];
    })
    .filter((value): value is [number, number] => value !== null);
}

function scoreField(
  query: string,
  field: IndexedField,
  options: Required<SearchOptions<unknown>>,
): InternalFieldMatch | null {
  let bestScore = Number.POSITIVE_INFINITY;
  const bestMatches: SearchMatch[] = [];

  for (let valueIndex = 0; valueIndex < field.values.length; valueIndex += 1) {
    const value = field.values[valueIndex];

    const matchResult = bitapSearch(value.normalized, query, {
      threshold: options.threshold,
      location: options.location,
      distance: options.distance,
      ignoreLocation: options.ignoreLocation,
      minMatchCharLength: options.minMatchCharLength,
      findAllMatches: options.findAllMatches,
    });

    if (!matchResult.isMatch) {
      continue;
    }

    const baseScore = Math.min(1, Math.max(0, matchResult.score));
    const normalizedScore = Math.min(1, baseScore * (2 - value.norm));

    if (normalizedScore < bestScore) {
      bestScore = normalizedScore;
    }

    if (options.includeMatches) {
      const mappedIndices = mapToOriginalIndices(matchResult.indices, value.mapToOriginalIndex, value.original);
      if (mappedIndices.length > 0) {
        bestMatches.push({
          key: field.key,
          value: value.original,
          valueIndex: field.values.length > 1 ? valueIndex : undefined,
          indices: mappedIndices,
        });
      }
    }
  }

  if (!Number.isFinite(bestScore)) {
    return null;
  }

  return {
    score: bestScore,
    matches: bestMatches,
  };
}

export class FuzzySearch<T> {
  private readonly options: Required<SearchOptions<T>>;

  private readonly index: FuzzySearchIndex<T>;

  constructor(items: readonly T[], options: SearchOptions<T> = {}, index?: FuzzySearchIndex<T>) {
    this.options = resolveOptions(options);
    this.index = index ?? createIndex(items, options);
  }

  static createIndex<T>(items: readonly T[], options: SearchOptions<T> = {}): FuzzySearchIndex<T> {
    return createIndex(items, options);
  }

  search(query: string, request: SearchRequest = {}): SearchResult<T>[] {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = normalizeString(
      query,
      this.options.isCaseSensitive,
      this.options.ignoreDiacritics,
    );

    if (!normalizedQuery.trim()) {
      return [];
    }

    const limit = request.limit ?? Number.POSITIVE_INFINITY;
    const runtimeOptions: Required<SearchOptions<unknown>> = {
      ...(this.options as Required<SearchOptions<unknown>>),
      threshold: request.threshold ?? this.options.threshold,
      location: request.location ?? this.options.location,
      distance: request.distance ?? this.options.distance,
      ignoreLocation: request.ignoreLocation ?? this.options.ignoreLocation,
      findAllMatches: request.findAllMatches ?? this.options.findAllMatches,
      minMatchCharLength: request.minMatchCharLength ?? this.options.minMatchCharLength,
    };

    const results: Array<{ item: T; refIndex: number; score: number; matches: SearchMatch[] }> = [];

    for (const indexedItem of this.index.items) {
      if (indexedItem.fields.length === 0) {
        continue;
      }

      let weightedScoreTotal = 0;
      let matchedWeightTotal = 0;
      const itemMatches: SearchMatch[] = [];

      for (const field of indexedItem.fields) {
        const fieldMatch = scoreField(normalizedQuery, field, runtimeOptions);

        if (!fieldMatch) {
          continue;
        }

        weightedScoreTotal += fieldMatch.score * field.weight;
        matchedWeightTotal += field.weight;

        if (this.options.includeMatches && fieldMatch.matches.length > 0) {
          itemMatches.push(...fieldMatch.matches);
        }
      }

      if (matchedWeightTotal === 0) {
        continue;
      }

      const score = Math.min(1, weightedScoreTotal / matchedWeightTotal);

      if (score > runtimeOptions.threshold) {
        continue;
      }

      results.push({
        item: indexedItem.item,
        refIndex: indexedItem.refIndex,
        score,
        matches: itemMatches,
      });
    }

    if (this.options.shouldSort) {
      results.sort((left, right) => {
        if (left.score !== right.score) {
          return left.score - right.score;
        }

        return left.refIndex - right.refIndex;
      });
    }

    return results.slice(0, limit).map((result) => {
      const searchResult: SearchResult<T> = {
        item: result.item,
        refIndex: result.refIndex,
      };

      if (this.options.includeScore) {
        searchResult.score = result.score;
      }

      if (this.options.includeMatches) {
        searchResult.matches = result.matches;
      }

      return searchResult;
    });
  }
}
