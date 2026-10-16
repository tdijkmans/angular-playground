import {
  FuzzySearchIndex,
  IndexedField,
  IndexedFieldValue,
  IndexedItem,
  ResolvedSearchKey,
  SearchOptions,
} from './types';
import { applyFieldNorm, normalizeWithMap, resolveKeys, resolveOptions } from './normalization';

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toSearchableStrings(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => toSearchableStrings(entry));
  }

  return [];
}

function readPathValues(input: unknown, pathSegments: string[]): unknown[] {
  if (pathSegments.length === 0) {
    return [input];
  }

  if (Array.isArray(input)) {
    return input.flatMap((entry) => readPathValues(entry, pathSegments));
  }

  if (!isObjectLike(input)) {
    return [];
  }

  const [current, ...rest] = pathSegments;
  return readPathValues(input[current], rest);
}

function extractFieldValues<T>(item: T, keyName: string): string[] {
  if (keyName === '$') {
    return typeof item === 'string' ? [item] : [];
  }

  return readPathValues(item, keyName.split('.')).flatMap((value) => toSearchableStrings(value));
}

function indexFieldValue(
  value: string,
  options: Required<SearchOptions<unknown>>,
): IndexedFieldValue {
  const { normalized, mapToOriginalIndex } = normalizeWithMap(
    value,
    options.isCaseSensitive,
    options.ignoreDiacritics,
  );

  return {
    original: value,
    normalized,
    mapToOriginalIndex,
    norm: options.ignoreFieldNorm ? 1 : applyFieldNorm(normalized, options.fieldNormWeight),
  };
}

function indexField<T>(item: T, key: ResolvedSearchKey, options: Required<SearchOptions<unknown>>): IndexedField | null {
  const values = extractFieldValues(item, key.name)
    .filter((value) => value.length > 0)
    .map((value) => indexFieldValue(value, options));

  if (values.length === 0) {
    return null;
  }

  return {
    key: key.name,
    weight: key.weight,
    values,
  };
}

export function createIndex<T>(items: readonly T[], options: SearchOptions<T> = {}): FuzzySearchIndex<T> {
  const resolvedOptions = resolveOptions(options);
  const keys = resolveKeys(items, resolvedOptions.keys);

  const indexedItems: IndexedItem<T>[] = items.map((item, refIndex) => {
    const fields = keys
      .map((key) => indexField(item, key, resolvedOptions as Required<SearchOptions<unknown>>))
      .filter((field): field is IndexedField => field !== null);

    return {
      item,
      refIndex,
      fields,
    };
  });

  return {
    items: indexedItems,
    keys,
  };
}
