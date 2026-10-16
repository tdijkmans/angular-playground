import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { FuzzySearch, SearchMatch, SearchOptions, SearchResult } from '../../fuzzy-search';
import { FUZZY_DEMO_RECORDS, FuzzyDemoRecord } from './fuzzy-search-data';

interface HighlightPart {
  text: string;
  isMatch: boolean;
}

interface DemoSearchResult {
  result: SearchResult<FuzzyDemoRecord>;
  nameParts: HighlightPart[];
  descriptionParts: HighlightPart[];
}

const EXAMPLE_QUERIES = [
  'tomato',
  'tomat',
  'crme fraiche',
  'jalapeno',
  'extra virgin',
  'smoked paprica',
];

function mergeRanges(ranges: Array<[number, number]>): Array<[number, number]> {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort((left, right) => left[0] - right[0]);
  const merged: Array<[number, number]> = [sorted[0]];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const previous = merged[merged.length - 1];

    if (current[0] <= previous[1] + 1) {
      previous[1] = Math.max(previous[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

function buildHighlightParts(value: string, ranges: Array<[number, number]>): HighlightPart[] {
  if (ranges.length === 0) {
    return [{ text: value, isMatch: false }];
  }

  const mergedRanges = mergeRanges(ranges);
  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (const [start, end] of mergedRanges) {
    if (start > cursor) {
      parts.push({ text: value.slice(cursor, start), isMatch: false });
    }

    parts.push({ text: value.slice(start, end + 1), isMatch: true });
    cursor = end + 1;
  }

  if (cursor < value.length) {
    parts.push({ text: value.slice(cursor), isMatch: false });
  }

  return parts.filter((part) => part.text.length > 0);
}

function collectRanges(matches: SearchMatch[] | undefined, key: string, value: string): Array<[number, number]> {
  return (matches ?? [])
    .filter((match) => match.key === key && match.value === value)
    .flatMap((match) => match.indices);
}

@Component({
  selector: 'app-fuzzy-search-demo',
  imports: [DecimalPipe],
  templateUrl: './fuzzy-search-demo.html',
  styleUrl: './fuzzy-search-demo.scss',
})
export class FuzzySearchDemoComponent {
  protected readonly indexedRecordCount = FUZZY_DEMO_RECORDS.length;
  protected readonly exampleQueries = EXAMPLE_QUERIES;

  protected readonly query = signal('tomat');
  protected readonly threshold = signal(0.35);
  protected readonly location = signal(0);
  protected readonly distance = signal(100);
  protected readonly ignoreLocation = signal(false);
  protected readonly isCaseSensitive = signal(false);
  protected readonly ignoreDiacritics = signal(true);
  protected readonly resultLimit = signal(15);

  private readonly engine = computed(() => {
    const options: SearchOptions<FuzzyDemoRecord> = {
      keys: [
        { name: 'name', weight: 0.65 },
        { name: 'description', weight: 0.25 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: this.threshold(),
      location: this.location(),
      distance: this.distance(),
      ignoreLocation: this.ignoreLocation(),
      isCaseSensitive: this.isCaseSensitive(),
      ignoreDiacritics: this.ignoreDiacritics(),
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1,
    };

    return new FuzzySearch(FUZZY_DEMO_RECORDS, options);
  });

  protected readonly searchState = computed(() => {
    const query = this.query();

    const startedAt = performance.now();
    const results = this.engine().search(query, { limit: this.resultLimit() });
    const durationMs = performance.now() - startedAt;

    const decoratedResults: DemoSearchResult[] = results.map((result) => {
      const nameRanges = collectRanges(result.matches, 'name', result.item.name);
      const descriptionRanges = collectRanges(result.matches, 'description', result.item.description);

      return {
        result,
        nameParts: buildHighlightParts(result.item.name, nameRanges),
        descriptionParts: buildHighlightParts(result.item.description, descriptionRanges),
      };
    });

    return {
      durationMs,
      results: decoratedResults,
    };
  });

  protected updateQuery(value: string): void {
    this.query.set(value);
  }

  protected applyExample(query: string): void {
    this.query.set(query);
  }

  protected updateThreshold(value: string): void {
    this.threshold.set(Number(value));
  }

  protected updateLocation(value: string): void {
    this.location.set(Math.max(0, Number(value)));
  }

  protected updateDistance(value: string): void {
    this.distance.set(Math.max(0, Number(value)));
  }

  protected updateResultLimit(value: string): void {
    this.resultLimit.set(Math.max(1, Number(value)));
  }

  protected updateIgnoreLocation(value: boolean): void {
    this.ignoreLocation.set(value);
  }

  protected updateCaseSensitive(value: boolean): void {
    this.isCaseSensitive.set(value);
  }

  protected updateIgnoreDiacritics(value: boolean): void {
    this.ignoreDiacritics.set(value);
  }
}
