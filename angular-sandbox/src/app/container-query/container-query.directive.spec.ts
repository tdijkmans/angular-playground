import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContainerQueryDirective } from './container-query.directive';

// ---------------------------------------------------------------------------
// Minimal host component used in all tests
// ---------------------------------------------------------------------------
@Component({
  standalone: true,
  imports: [ContainerQueryDirective],
  template: `
    <div
      #cq="containerQuery"
      [containerQuery]="breakpoints"
      style="width: 0; display: block;"
    ></div>
  `,
})
class HostComponent {
  breakpoints: Record<string, number> = { sm: 300, md: 600, lg: 900 };
}

// ---------------------------------------------------------------------------
// Mock ResizeObserver so tests run without a real browser layout engine.
// The latest callback and observer instance are stored statically so tests
// can trigger resize events without accessing private directive members.
// ---------------------------------------------------------------------------
class MockResizeObserver {
  static lastCallback: ResizeObserverCallback;
  static lastInstance: MockResizeObserver;

  constructor(callback: ResizeObserverCallback) {
    MockResizeObserver.lastCallback = callback;
    MockResizeObserver.lastInstance = this;
  }

  observe = jasmine.createSpy('observe');
  disconnect = jasmine.createSpy('disconnect');
}

// ---------------------------------------------------------------------------
// Helper – trigger a fake ResizeObserver notification for a given width
// ---------------------------------------------------------------------------
function triggerResize(el: HTMLElement, width: number): void {
  const fakeEntry = {
    contentRect: { width } as DOMRectReadOnly,
    target: el,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  } as unknown as ResizeObserverEntry;

  MockResizeObserver.lastCallback([fakeEntry], MockResizeObserver.lastInstance as unknown as ResizeObserver);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('ContainerQueryDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostEl: DebugElement;

  beforeEach(async () => {
    // Replace the global ResizeObserver with our mock
    (window as any).ResizeObserver = MockResizeObserver;

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostEl = fixture.debugElement.query(By.css('div'));
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the directive', () => {
    const dir = hostEl.injector.get(ContainerQueryDirective);
    expect(dir).toBeTruthy();
  });

  it('should call observe() on the host element during init', () => {
    expect(MockResizeObserver.lastInstance.observe).toHaveBeenCalledWith(hostEl.nativeElement);
  });

  it('should add classes for active breakpoints', () => {
    triggerResize(hostEl.nativeElement, 650);
    fixture.detectChanges();

    const el: HTMLElement = hostEl.nativeElement;
    expect(el.classList).toContain('cq-sm');
    expect(el.classList).toContain('cq-md');
    expect(el.classList).not.toContain('cq-lg');
  });

  it('should remove classes when the container shrinks below a breakpoint', () => {
    // First make md active
    triggerResize(hostEl.nativeElement, 650);
    fixture.detectChanges();
    expect(hostEl.nativeElement.classList).toContain('cq-md');

    // Now shrink below md threshold
    triggerResize(hostEl.nativeElement, 400);
    fixture.detectChanges();
    expect(hostEl.nativeElement.classList).not.toContain('cq-md');
    expect(hostEl.nativeElement.classList).toContain('cq-sm');
  });

  it('should activate all breakpoints when width is large enough', () => {
    triggerResize(hostEl.nativeElement, 1000);
    fixture.detectChanges();

    const el: HTMLElement = hostEl.nativeElement;
    expect(el.classList).toContain('cq-sm');
    expect(el.classList).toContain('cq-md');
    expect(el.classList).toContain('cq-lg');
  });

  it('should activate no breakpoints when width is below all thresholds', () => {
    triggerResize(hostEl.nativeElement, 100);
    fixture.detectChanges();

    const el: HTMLElement = hostEl.nativeElement;
    expect(el.classList).not.toContain('cq-sm');
    expect(el.classList).not.toContain('cq-md');
    expect(el.classList).not.toContain('cq-lg');
  });

  it('should update the activeBreakpoints signal', () => {
    triggerResize(hostEl.nativeElement, 650);
    fixture.detectChanges();

    const dir = hostEl.injector.get(ContainerQueryDirective);
    const active = dir.activeBreakpoints();

    expect(active['sm']).toBeTrue();
    expect(active['md']).toBeTrue();
    expect(active['lg']).toBeFalse();
  });

  it('should disconnect the ResizeObserver on destroy', () => {
    const observer = MockResizeObserver.lastInstance;
    fixture.destroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});

