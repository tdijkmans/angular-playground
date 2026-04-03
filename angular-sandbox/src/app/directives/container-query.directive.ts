import {
    DestroyRef,
    Directive,
    ElementRef,
    NgZone,
    Renderer2,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

export type CqComparisonStrategy = 'width' | 'height' | 'both';

export interface CqBreakpointRange {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface CqNamedBreakpoint extends CqBreakpointRange {
  name: string;
}

export type CqBreakpointMap = Record<string, CqBreakpointRange>;

export type CqBreakpointsInput = ReadonlyArray<CqNamedBreakpoint> | CqBreakpointMap;
export type CqObserveTargetInput = HTMLElement | string | null;

export interface CqDimensions {
  width: number;
  height: number;
}

export interface CqState {
  breakpoint: string | null;
  dimensions: CqDimensions;
  matchedBreakpoints: readonly string[];
  activeClass: string | null;
}

interface NormalizedBreakpoint extends CqNamedBreakpoint {
  index: number;
}

@Directive({
  selector: '[appCq]',
  standalone: true,
  exportAs: 'cq',
})
export class ContainerQueryDirective {
  readonly breakpointsInput = input.required<CqBreakpointsInput>({ alias: 'appCq' });
  readonly defaultBreakpoint = input<string | null>(null, { alias: 'cqDefaultBreakpoint' });
  readonly emitOnBreakpointChangeOnly = input<boolean>(false, {
    alias: 'cqEmitOnBreakpointChangeOnly',
  });
  readonly observeParent = input<boolean>(false, { alias: 'cqObserveParent' });
  readonly observeTarget = input<CqObserveTargetInput>(null, { alias: 'cqObserveTarget' });
  readonly classPrefix = input<string>('cq', { alias: 'cqClassPrefix' });
  readonly comparisonStrategy = input<CqComparisonStrategy>('width', {
    alias: 'cqComparisonStrategy',
  });

  private readonly hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private resizeObserver: ResizeObserver | null = null;
  private observedElement: HTMLElement | null = null;
  private appliedClass: string | null = null;
  private lastEmittedBreakpoint: string | null = null;

  private readonly liveStateSignal = signal<CqState>({
    breakpoint: null,
    dimensions: { width: 0, height: 0 },
    matchedBreakpoints: [],
    activeClass: null,
  });

  private readonly changesSubject = new ReplaySubject<CqState>(1);

  readonly state = this.liveStateSignal.asReadonly();
  readonly state$: Observable<CqState> = this.changesSubject.asObservable();
  readonly breakpoint = computed(() => this.liveStateSignal().breakpoint);
  readonly dimensions = computed(() => this.liveStateSignal().dimensions);

  constructor() {
    this.zone.runOutsideAngular(() => {
      effect(() => {
        this.breakpointsInput();
        this.defaultBreakpoint();
        this.emitOnBreakpointChangeOnly();
        this.observeParent();
        this.observeTarget();
        this.classPrefix();
        this.comparisonStrategy();

        this.connectObserver();
        this.recalculate();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.disconnectObserver();
      this.clearAppliedClass();
      this.changesSubject.complete();
    });
  }

  recalculate(): void {
    const target = this.resolveObservedElement();
    if (!target) {
      return;
    }

    const dimensions = readDimensions(target);
    const normalizedBreakpoints = normalizeBreakpoints(this.breakpointsInput());
    const strategy = this.comparisonStrategy();
    const matches = normalizedBreakpoints.filter((bp) => isBreakpointMatch(bp, dimensions, strategy));

    const active = selectActiveBreakpoint(
      matches,
      normalizedBreakpoints,
      this.defaultBreakpoint(),
      strategy,
    );

    const classPrefix = sanitizeToken(this.classPrefix(), 'cq');
    const nextClass = active ? `${classPrefix}-${toKebab(active.name)}` : null;

    this.updateHostClass(nextClass);

    const nextState: CqState = {
      breakpoint: active?.name ?? null,
      dimensions,
      matchedBreakpoints: matches.map((bp) => bp.name),
      activeClass: nextClass,
    };

    this.liveStateSignal.set(nextState);

    if (
      !this.emitOnBreakpointChangeOnly() ||
      this.lastEmittedBreakpoint !== nextState.breakpoint
    ) {
      this.changesSubject.next(nextState);
      this.lastEmittedBreakpoint = nextState.breakpoint;
    }
  }

  private connectObserver(): void {
    const target = this.resolveObservedElement();
    if (!target) {
      this.disconnectObserver();
      return;
    }

    if (this.observedElement === target && this.resizeObserver) {
      return;
    }

    this.disconnectObserver();

    if (!('ResizeObserver' in globalThis)) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.recalculate();
    });

    this.resizeObserver.observe(target);
    this.observedElement = target;
  }

  private disconnectObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.observedElement = null;
  }

  private resolveObservedElement(): HTMLElement | null {
    const host = this.hostElementRef.nativeElement;

    const customTarget = this.resolveCustomTarget(host);
    if (customTarget) {
      return customTarget;
    }

    if (!this.observeParent()) {
      return host;
    }

    return host.parentElement ?? host;
  }

  private resolveCustomTarget(host: HTMLElement): HTMLElement | null {
    const target = this.observeTarget();
    if (!target) {
      return null;
    }

    if (target instanceof HTMLElement) {
      return target;
    }

    const root = host.getRootNode();
    if (root instanceof ShadowRoot || root instanceof Document) {
      return root.querySelector<HTMLElement>(target);
    }

    return null;
  }

  private updateHostClass(nextClass: string | null): void {
    if (this.appliedClass === nextClass) {
      return;
    }

    this.clearAppliedClass();

    if (nextClass) {
      this.renderer.addClass(this.hostElementRef.nativeElement, nextClass);
      this.appliedClass = nextClass;
    }
  }

  private clearAppliedClass(): void {
    if (!this.appliedClass) {
      return;
    }

    this.renderer.removeClass(this.hostElementRef.nativeElement, this.appliedClass);
    this.appliedClass = null;
  }
}

function readDimensions(element: HTMLElement): CqDimensions {
  const rect = element.getBoundingClientRect();
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}

function normalizeBreakpoints(inputBreakpoints: CqBreakpointsInput): NormalizedBreakpoint[] {
  const list = Array.isArray(inputBreakpoints)
    ? inputBreakpoints.map((bp, index) => ({ ...bp, index }))
    : Object.entries(inputBreakpoints).map(([name, range], index) => ({
        name,
        ...range,
        index,
      }));

  for (const bp of list) {
    assertRange(bp.name, bp.minWidth, bp.maxWidth, 'width');
    assertRange(bp.name, bp.minHeight, bp.maxHeight, 'height');
  }

  return list;
}

function assertRange(
  name: string,
  min: number | undefined,
  max: number | undefined,
  axis: 'width' | 'height',
): void {
  if (min !== undefined && max !== undefined && min > max) {
    throw new Error(`Invalid ${axis} range for breakpoint "${name}": min cannot be greater than max.`);
  }
}

function isBreakpointMatch(
  breakpoint: CqBreakpointRange,
  dimensions: CqDimensions,
  strategy: CqComparisonStrategy,
): boolean {
  const widthMatch = isWithin(dimensions.width, breakpoint.minWidth, breakpoint.maxWidth);
  const heightMatch = isWithin(dimensions.height, breakpoint.minHeight, breakpoint.maxHeight);

  if (strategy === 'width') {
    return widthMatch;
  }

  if (strategy === 'height') {
    return heightMatch;
  }

  return widthMatch && heightMatch;
}

function isWithin(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) {
    return false;
  }
  if (max !== undefined && value > max) {
    return false;
  }
  return true;
}

function selectActiveBreakpoint(
  matches: readonly NormalizedBreakpoint[],
  all: readonly NormalizedBreakpoint[],
  defaultName: string | null,
  strategy: CqComparisonStrategy,
): NormalizedBreakpoint | null {
  if (matches.length > 0) {
    return [...matches].sort((a, b) => compareSpecificity(a, b, strategy))[0] ?? null;
  }

  if (!defaultName) {
    return null;
  }

  return all.find((bp) => bp.name === defaultName) ?? null;
}

function compareSpecificity(
  a: NormalizedBreakpoint,
  b: NormalizedBreakpoint,
  strategy: CqComparisonStrategy,
): number {
  const aScore = specificityScore(a, strategy);
  const bScore = specificityScore(b, strategy);

  if (aScore.constrainedAxes !== bScore.constrainedAxes) {
    return bScore.constrainedAxes - aScore.constrainedAxes;
  }

  if (aScore.totalSpan !== bScore.totalSpan) {
    return aScore.totalSpan - bScore.totalSpan;
  }

  if (aScore.totalMin !== bScore.totalMin) {
    return bScore.totalMin - aScore.totalMin;
  }

  return a.index - b.index;
}

function specificityScore(bp: NormalizedBreakpoint, strategy: CqComparisonStrategy) {
  const includeWidth = strategy === 'width' || strategy === 'both';
  const includeHeight = strategy === 'height' || strategy === 'both';

  const width = includeWidth ? rangeSpan(bp.minWidth, bp.maxWidth) : null;
  const height = includeHeight ? rangeSpan(bp.minHeight, bp.maxHeight) : null;

  const constrainedAxes = [width, height].filter((axis) => axis && axis.constrained).length;
  const totalSpan = [width, height]
    .filter((axis): axis is NonNullable<typeof axis> => axis !== null)
    .reduce((sum, axis) => sum + axis.span, 0);

  const totalMin = [bp.minWidth, bp.minHeight]
    .filter((value): value is number => value !== undefined)
    .reduce((sum, value) => sum + value, 0);

  return {
    constrainedAxes,
    totalSpan,
    totalMin,
  };
}

function rangeSpan(min?: number, max?: number): { span: number; constrained: boolean } {
  if (min !== undefined && max !== undefined) {
    return { span: max - min, constrained: true };
  }

  if (min !== undefined || max !== undefined) {
    return { span: Number.POSITIVE_INFINITY, constrained: true };
  }

  return { span: Number.POSITIVE_INFINITY, constrained: false };
}

function sanitizeToken(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  return toKebab(trimmed);
}

function toKebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
