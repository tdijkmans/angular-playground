export interface BitapSearchConfig {
  location: number;
  distance: number;
  threshold: number;
  findAllMatches: boolean;
  minMatchCharLength: number;
  ignoreLocation: boolean;
}

export interface BitapSearchResult {
  isMatch: boolean;
  score: number;
  indices: Array<[number, number]>;
}

const MAX_BITS = 32;

function createPatternAlphabet(pattern: string): Record<string, number> {
  const mask: Record<string, number> = {};

  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i];
    mask[char] = (mask[char] ?? 0) | (1 << (pattern.length - i - 1));
  }

  return mask;
}

function computeScore(
  errors: number,
  currentLocation: number,
  expectedLocation: number,
  distance: number,
  ignoreLocation: boolean,
  patternLength: number,
): number {
  const accuracy = errors / patternLength;

  if (ignoreLocation) {
    return accuracy;
  }

  const proximity = Math.abs(expectedLocation - currentLocation);

  if (distance <= 0) {
    return proximity === 0 ? accuracy : 1;
  }

  return accuracy + proximity / distance;
}

function convertMaskToIndices(mask: number[], minMatchCharLength: number): Array<[number, number]> {
  const indices: Array<[number, number]> = [];
  let start = -1;

  for (let i = 0; i < mask.length; i += 1) {
    const isMatch = mask[i] === 1;

    if (isMatch && start === -1) {
      start = i;
      continue;
    }

    if (!isMatch && start !== -1) {
      const end = i - 1;
      if (end - start + 1 >= minMatchCharLength) {
        indices.push([start, end]);
      }
      start = -1;
    }
  }

  if (start !== -1) {
    const end = mask.length - 1;
    if (end - start + 1 >= minMatchCharLength) {
      indices.push([start, end]);
    }
  }

  return indices;
}

function searchShortPattern(text: string, pattern: string, config: BitapSearchConfig): BitapSearchResult {
  const expectedLocation = Math.max(0, Math.min(config.location, text.length));
  const textLength = text.length;
  const patternLength = pattern.length;
  const matchMask = 1 << (patternLength - 1);
  const patternAlphabet = createPatternAlphabet(pattern);
  const resultMask = new Array<number>(textLength).fill(0);

  let threshold = config.threshold;
  let bestLocation = text.indexOf(pattern, expectedLocation);

  if (bestLocation !== -1) {
    threshold = Math.min(
      threshold,
      computeScore(0, bestLocation, expectedLocation, config.distance, config.ignoreLocation, patternLength),
    );
  }

  bestLocation = text.lastIndexOf(pattern, expectedLocation + patternLength);
  if (bestLocation !== -1) {
    threshold = Math.min(
      threshold,
      computeScore(0, bestLocation, expectedLocation, config.distance, config.ignoreLocation, patternLength),
    );
  }

  bestLocation = -1;

  let binMax = patternLength + textLength;
  let lastBitArray: number[] = [];

  for (let errorCount = 0; errorCount < patternLength; errorCount += 1) {
    let binMin = 0;
    let binMid = binMax;

    while (binMin < binMid) {
      const score = computeScore(
        errorCount,
        expectedLocation + binMid,
        expectedLocation,
        config.distance,
        config.ignoreLocation,
        patternLength,
      );

      if (score <= threshold) {
        binMin = binMid;
      } else {
        binMax = binMid;
      }

      binMid = Math.floor((binMax - binMin) / 2 + binMin);
    }

    binMax = binMid;

    const start = Math.max(1, expectedLocation - binMid + 1);
    const finish = config.findAllMatches
      ? textLength
      : Math.min(expectedLocation + binMid, textLength) + patternLength;

    const bitArray = new Array<number>(finish + 2).fill(0);
    bitArray[finish + 1] = (1 << errorCount) - 1;

    for (let j = finish; j >= start; j -= 1) {
      const currentLocation = j - 1;
      const charMatch = patternAlphabet[text[currentLocation]] ?? 0;

      if (errorCount === 0) {
        bitArray[j] = ((bitArray[j + 1] << 1) | 1) & charMatch;
      } else {
        bitArray[j] =
          (((bitArray[j + 1] << 1) | 1) & charMatch) |
          ((((lastBitArray[j + 1] ?? 0) | (lastBitArray[j] ?? 0)) << 1) | 1) |
          (lastBitArray[j + 1] ?? 0);
      }

      if ((bitArray[j] & matchMask) !== 0) {
        resultMask[currentLocation] = 1;

        const score = computeScore(
          errorCount,
          currentLocation,
          expectedLocation,
          config.distance,
          config.ignoreLocation,
          patternLength,
        );

        if (score <= threshold) {
          threshold = score;
          bestLocation = currentLocation;
        }
      }
    }

    const nextScore = computeScore(
      errorCount + 1,
      expectedLocation,
      expectedLocation,
      config.distance,
      config.ignoreLocation,
      patternLength,
    );

    if (nextScore > threshold) {
      break;
    }

    lastBitArray = bitArray;
  }

  const hasAcceptedMatch = bestLocation >= 0;
  const indices = hasAcceptedMatch ? convertMaskToIndices(resultMask, config.minMatchCharLength) : [];

  return {
    isMatch: hasAcceptedMatch,
    score: hasAcceptedMatch ? Math.max(0, threshold) : 1,
    indices,
  };
}

export function bitapSearch(text: string, pattern: string, config: BitapSearchConfig): BitapSearchResult {
  if (pattern.length === 0) {
    return {
      isMatch: true,
      score: 0,
      indices: [],
    };
  }

  if (pattern.length > MAX_BITS) {
    const exactIndex = text.indexOf(pattern);
    if (exactIndex >= 0) {
      return {
        isMatch: true,
        score: 0,
        indices: [[exactIndex, exactIndex + pattern.length - 1]],
      };
    }
  }

  if (pattern.length <= MAX_BITS) {
    return searchShortPattern(text, pattern, config);
  }

  const chunkSize = MAX_BITS;
  const chunkResults: BitapSearchResult[] = [];

  for (let offset = 0; offset < pattern.length; offset += chunkSize) {
    const chunk = pattern.slice(offset, Math.min(offset + chunkSize, pattern.length));
    const chunkLocation = config.location + offset;

    const chunkResult = searchShortPattern(text, chunk, {
      ...config,
      location: chunkLocation,
    });

    chunkResults.push(chunkResult);

    if (!chunkResult.isMatch) {
      return {
        isMatch: false,
        score: 1,
        indices: [],
      };
    }
  }

  const score = chunkResults.reduce((total, current) => total + current.score, 0) / chunkResults.length;

  const mergedIndices = chunkResults.flatMap((result) => result.indices);
  mergedIndices.sort((left, right) => left[0] - right[0]);

  return {
    isMatch: true,
    score,
    indices: mergedIndices,
  };
}
