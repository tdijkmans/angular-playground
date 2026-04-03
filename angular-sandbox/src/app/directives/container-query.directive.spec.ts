import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContainerQueryDirective, type CqBreakpointsInput } from './container-query.directive';

class MockResizeObserver implements ResizeObserver {
  static latest: MockResizeObserver | null = null;

  readonly observed = new Set<Element>();

  constructor(private readonly callback: ResizeObserverCallback) {
    MockResizeObserver.latest = this;
  }

  observe(target: Element): void {
    this.observed.add(target);
  }

  unobserve(target: Element): void {
    this.observed.delete(target);
  }

  disconnect(): void {
    this.observed.clear();
  }

  takeRecords(): ResizeObserverEntry[] {
    return [];
  }

  emit(): void {
    const entries = Array.from(this.observed).map((target) => ({
      target,
      contentRect: target.getBoundingClientRect(),
    })) as ResizeObserverEntry[];

    this.callback(entries, this);
  }
}

@Component({
  standalone: true,
  imports: [ContainerQueryDirective],
  template: `
    <div
      class="host"
      [appCq]="breakpoints"
      [cqComparisonStrategy]="strategy"
      [cqClassPrefix]="classPrefix"
      [cqCssVariables]="cssVars"
      [cqCssVarPrefix]="cssVarPrefix"
      [cqDefaultBreakpoint]="defaultBreakpoint"
      [cqEmitOnBreakpointChangeOnly]="emitOnChangeOnly"
      #cq="cq"
    ></div>

    <div class="parent" [style.width.px]="parentWidth" [style.height.px]="parentHeight">
      <div class="child" [appCq]="breakpoints" [cqObserveParent]="true" #parentCq="cq"></div>
    </div>

    <div class="external-source" #externalSource [style.width.px]="externalWidth" [style.height.px]="externalHeight"></div>
    <div class="external-target" [appCq]="breakpoints" [cqObserveTarget]="externalSource" #externalCq="cq"></div>
  `,
})
class HostComponent {
  breakpoints: CqBreakpointsInput = {
    small: { maxWidth: 399 },
    medium: { minWidth: 400, maxWidth: 799 },
    large: { minWidth: 800 },
  };

  strategy: 'width' | 'height' | 'both' = 'width';
  classPrefix = 'cq';
  cssVars = false;
  cssVarPrefix = 'cq';
  defaultBreakpoint: string | null = null;
  emitOnChangeOnly = false;

  parentWidth = 550;
  parentHeight = 320;
  externalWidth = 820;
  externalHeight = 300;

  @ViewChild('cq', { static: true })
  cqDirective!: ContainerQueryDirective;

  @ViewChild('parentCq', { static: true })
  parentDirective!: ContainerQueryDirective;

  @ViewChild('externalCq', { static: true })
  externalDirective!: ContainerQueryDirective;
}

describe('ContainerQueryDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;
  let hostEl: HTMLElement;
  let parentEl: HTMLElement;
  let externalSourceEl: HTMLElement;
  let originalResizeObserver: typeof ResizeObserver | undefined;

  beforeEach(async () => {
    originalResizeObserver = (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();

    hostEl = fixture.nativeElement.querySelector('.host') as HTMLElement;
    parentEl = fixture.nativeElement.querySelector('.parent') as HTMLElement;
    externalSourceEl = fixture.nativeElement.querySelector('.external-source') as HTMLElement;
  });

  afterEach(() => {
    if (originalResizeObserver) {
      (globalThis as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = originalResizeObserver;
    } else {
      delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    }
  });

  it('should create', () => {
    expect(hostComponent.cqDirective).toBeTruthy();
  });

  it('should apply only the active class for matched breakpoint', () => {
    setRect(hostEl, 320, 200);
    hostComponent.cqDirective.recalculate();
    fixture.detectChanges();

    expect(hostEl.classList.contains('cq-small')).toBeTrue();
    expect(hostEl.classList.contains('cq-medium')).toBeFalse();

    setRect(hostEl, 640, 200);
    hostComponent.cqDirective.recalculate();
    fixture.detectChanges();

    expect(hostEl.classList.contains('cq-small')).toBeFalse();
    expect(hostEl.classList.contains('cq-medium')).toBeTrue();
  });

  it('should support breakpoint array input', () => {
    hostComponent.breakpoints = [
      { name: 'tiny', maxWidth: 199 },
      { name: 'wide', minWidth: 200 },
    ];

    setRect(hostEl, 500, 200);
    fixture.detectChanges();
    hostComponent.cqDirective.recalculate();

    expect(hostComponent.cqDirective.breakpoint()).toBe('wide');
  });

  it('should support height-only strategy', () => {
    hostComponent.strategy = 'height';
    hostComponent.breakpoints = {
      short: { maxHeight: 299 },
      tall: { minHeight: 300 },
    };

    setRect(hostEl, 100, 360);
    fixture.detectChanges();
    hostComponent.cqDirective.recalculate();

    expect(hostComponent.cqDirective.breakpoint()).toBe('tall');
  });

  it('should use default breakpoint when no match exists', () => {
    hostComponent.breakpoints = {
      huge: { minWidth: 900 },
    };
    hostComponent.defaultBreakpoint = 'huge';

    setRect(hostEl, 300, 200);
    fixture.detectChanges();
    hostComponent.cqDirective.recalculate();

    expect(hostComponent.cqDirective.breakpoint()).toBe('huge');
  });

  it('should write css variables when enabled', () => {
    hostComponent.cssVars = true;
    hostComponent.cssVarPrefix = 'demo';

    setRect(hostEl, 640, 360);
    fixture.detectChanges();
    hostComponent.cqDirective.recalculate();

    expect(hostEl.style.getPropertyValue('--demo-width')).toBe('640px');
    expect(hostEl.style.getPropertyValue('--demo-height')).toBe('360px');
    expect(hostEl.style.getPropertyValue('--demo-size')).toBe('640x360');
    expect(hostEl.style.getPropertyValue('--demo-breakpoint')).toBe('medium');
  });

  it('should support observing parent container size', () => {
    setRect(parentEl, 760, 320);
    hostComponent.parentDirective.recalculate();

    expect(hostComponent.parentDirective.breakpoint()).toBe('medium');
  });

  it('should support observing a custom target element', () => {
    setRect(externalSourceEl, 910, 280);
    hostComponent.externalDirective.recalculate();

    expect(hostComponent.externalDirective.breakpoint()).toBe('large');
    expect(hostComponent.externalDirective.dimensions()).toEqual({ width: 910, height: 280 });
  });

  it('should emit observable updates only on breakpoint changes when configured', () => {
    hostComponent.emitOnChangeOnly = true;

    setRect(hostEl, 350, 200);
    fixture.detectChanges();

    const emitted: Array<string | null> = [];
    const subscription = hostComponent.cqDirective.state$.subscribe((state) => {
      emitted.push(state.breakpoint);
    });

    hostComponent.cqDirective.recalculate();
    setRect(hostEl, 360, 210);
    hostComponent.cqDirective.recalculate();
    setRect(hostEl, 900, 210);
    hostComponent.cqDirective.recalculate();

    subscription.unsubscribe();

    expect(emitted).toEqual(['small', 'large']);
  });

  it('should allow manual recalculation', () => {
    setRect(hostEl, 900, 100);

    hostComponent.cqDirective.recalculate();

    expect(hostComponent.cqDirective.breakpoint()).toBe('large');
    expect(hostComponent.cqDirective.dimensions()).toEqual({ width: 900, height: 100 });
  });

  function setRect(element: HTMLElement, width: number, height: number): void {
    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      width,
      height,
      toJSON: () => ({}),
    } as DOMRect;

    (element as HTMLElement & { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () =>
      rect;
  }
});
