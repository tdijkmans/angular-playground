export type SearchKey = string | { name: string; weight: number };

export interface SearchOptions<T> {
  keys?: ReadonlyArray<SearchKey>;
  threshold?: number;
  location?: number;
  distance?: number;
  ignoreLocation?: boolean;
  ignoreFieldNorm?: boolean;
  fieldNormWeight?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
  findAllMatches?: boolean;
  isCaseSensitive?: boolean;
  ignoreDiacritics?: boolean;
  shouldSort?: boolean;
}

export interface SearchRequest {
  limit?: number;
  threshold?: number;
  location?: number;
  distance?: number;
  ignoreLocation?: boolean;
  findAllMatches?: boolean;
  minMatchCharLength?: number;
}

export interface SearchMatch {
  key: string;
  value: string;
  valueIndex?: number;
  indices: Array<[number, number]>;
}

export interface SearchResult<T> {
  item: T;
  refIndex: number;
  score?: number;
  matches?: SearchMatch[];
}

export interface ResolvedSearchKey {
  name: string;
  weight: number;
}

export interface IndexedFieldValue {
  original: string;
  normalized: string;
  norm: number;
  mapToOriginalIndex: number[];
}

export interface IndexedField {
  key: string;
  weight: number;
  values: IndexedFieldValue[];
}

export interface IndexedItem<T> {
  item: T;
  refIndex: number;
  fields: IndexedField[];
}

export interface FuzzySearchIndex<T> {
  items: IndexedItem<T>[];
  keys: ResolvedSearchKey[];
}
