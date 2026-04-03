# AngularSandbox

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.4.

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

## Container Query Directive

This project includes a standalone directive for programmatic container-query behavior:

- Selector: `[appCq]`
- Export: `#ref="cq"`
- File: `src/app/directives/container-query.directive.ts`

### Features

- Observes host or parent container dimensions with `ResizeObserver`
- Supports breakpoints from array or object map
- Supports width-only, height-only, or both-axis matching
- Applies active-breakpoint class with customizable prefix
- Optional CSS custom properties output with customizable prefix
- Signal API + RxJS observable API
- Manual recalculation via exported directive instance
- Zone-less friendly: observer work runs outside Angular zone

### API

Inputs:

- `[appCq]`: `CqBreakpointsInput` (required)
- `[cqComparisonStrategy]`: `'width' | 'height' | 'both'` (default: `'width'`)
- `[cqDefaultBreakpoint]`: `string | null` fallback breakpoint name when no match
- `[cqEmitOnBreakpointChangeOnly]`: `boolean` (default: `false`)
- `[cqObserveParent]`: `boolean` (default: `false`)
- `[cqClassPrefix]`: `string` (default: `'cq'`)
- `[cqCssVariables]`: `boolean` (default: `false`)
- `[cqCssVarPrefix]`: `string` (default: `'cq'`)

Exported API (`#cq="cq"`):

- `cq.state()`: signal value with breakpoint + dimensions
- `cq.state$`: observable stream of state
- `cq.breakpoint()`: active breakpoint name
- `cq.dimensions()`: current dimensions
- `cq.recalculate()`: manual recalculation

Types:

```ts
type CqComparisonStrategy = 'width' | 'height' | 'both';

interface CqBreakpointRange {
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
}

interface CqNamedBreakpoint extends CqBreakpointRange {
	name: string;
}

type CqBreakpointMap = Record<string, CqBreakpointRange>;
type CqBreakpointsInput = CqNamedBreakpoint[] | CqBreakpointMap;
```

### Examples

Basic usage:

```html
<div [appCq]="{ compact: { maxWidth: 479 }, wide: { minWidth: 480 } }" #cq="cq">
	Active: {{ cq.breakpoint() }}
</div>
```

Multiple breakpoints:

```html
<div
	[appCq]="[
		{ name: 'xs', maxWidth: 299 },
		{ name: 'sm', minWidth: 300, maxWidth: 499 },
		{ name: 'lg', minWidth: 500 }
	]"
	#cq="cq"
>
	{{ cq.state().activeClass }}
</div>
```

Using signals:

```html
<div [appCq]="breakpoints" #cq="cq">{{ cq.dimensions().width }} x {{ cq.dimensions().height }}</div>
```

Using observable:

```html
<div [appCq]="breakpoints" [cqEmitOnBreakpointChangeOnly]="true" #cq="cq"></div>
<p>{{ (cq.state$ | async)?.breakpoint ?? 'none' }}</p>
```

Using CSS variables:

```html
<div
	[appCq]="breakpoints"
	[cqCssVariables]="true"
	[cqCssVarPrefix]="'demo-cq'"
	#cq="cq"
>
	{{ cq.breakpoint() }}
</div>
```

Class prefix customization:

```html
<div [appCq]="breakpoints" [cqClassPrefix]="'layout'" #cq="cq">
	{{ cq.state().activeClass }}
</div>
```
