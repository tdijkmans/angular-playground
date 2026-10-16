# AngularSandbox

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.11.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Fuzzy search experiment

This repository now includes a framework-independent fuzzy search engine in `/home/runner/work/angular-playground/angular-playground/angular-sandbox/src/app/fuzzy-search`.

### Public API

```ts
import { FuzzySearch } from './src/app/fuzzy-search';

const engine = new FuzzySearch(items, {
  keys: [
    { name: 'name', weight: 0.8 },
    { name: 'description', weight: 0.2 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
});

const results = engine.search('tomat', { limit: 10 });
```

### Options

- `keys`: string keys or `{ name, weight }` weighted keys.
- `threshold`: match acceptance threshold (`0` best, `1` loosest).
- `location`, `distance`, `ignoreLocation`: position scoring controls.
- `ignoreFieldNorm`, `fieldNormWeight`: field-length normalization controls.
- `includeScore`, `includeMatches`: include ranking score and match indices.
- `minMatchCharLength`, `findAllMatches`: match-index behavior.
- `isCaseSensitive`, `ignoreDiacritics`: normalization behavior.
- `shouldSort`: deterministic score + stable index sorting.

### Scoring and behavior notes

- Scores are normalized to `0..1` (`0` is best).
- Ranking combines Bitap match score, location penalty, field weights, and field-length normalization.
- Long patterns are segmented to preserve Bitap behavior beyond 32 characters.
- Transpositions are **not** treated as a single edit. They can still match when threshold allows the resulting substitutions.

### Demo route

Run `npm start`, then open:

- `http://localhost:4200/fuzzy-search-demo`

The page includes a 120-record culinary dataset, interactive controls, match highlighting, result counts, and search execution timing.

### React usage example

```tsx
import { FuzzySearch } from './fuzzy-search';

const engine = new FuzzySearch(data, { keys: ['name', 'description'], includeScore: true });
const results = engine.search(query, { limit: 20 });
```

No Angular imports are required for the core engine.
