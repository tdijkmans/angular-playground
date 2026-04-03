import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContainerQueryDirective } from './container-query.directive';

/** Minimal host component used in tests. */
@Component({
  template: `<div [containerQuery]="breakpoints" style="width:300px"></div>`,
  imports: [ContainerQueryDirective],
  standalone: true,
})
class TestHostComponent {
  breakpoints: Record<string, number> = { sm: 200, md: 400, lg: 600 };
}

/** Captured ResizeObserver callback from the most recent instantiation. */
let capturedCallback: ResizeObserverCallback | undefined;

/** Helper: simulate a ResizeObserver callback for a given width. */
function triggerResize(fixture: ComponentFixture<unknown>, width: number): void {
  const el: HTMLElement = fixture.debugElement.query(
    By.directive(ContainerQueryDirective)
  ).nativeElement;

  const fakeEntry = {
    contentRect: { width } as DOMRectReadOnly,
    target: el,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  } as unknown as ResizeObserverEntry;

  capturedCallback!([fakeEntry], {} as ResizeObserver);
}

describe('ContainerQueryDirective', () => {
  let disconnectSpy: jasmine.Spy;
  let observeSpy: jasmine.Spy;
  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(() => {
    capturedCallback = undefined;
    disconnectSpy = jasmine.createSpy('disconnect');
    observeSpy = jasmine.createSpy('observe');
    originalResizeObserver = window.ResizeObserver;

    // Replace the global ResizeObserver with a class-based fake so that
    // `new ResizeObserver(cb)` inside the directive works correctly.
    class FakeResizeObserver {
      observe = observeSpy;
      disconnect = disconnectSpy;
      unobserve = jasmine.createSpy('unobserve');
      constructor(cb: ResizeObserverCallback) {
        capturedCallback = cb;
      }
    }
    (window as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      FakeResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should create an instance', async () => {
    const fixture = await setup();
    const directiveEl: DebugElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    );
    expect(directiveEl).toBeTruthy();
  });

  it('should start observing the host element on init', async () => {
    const fixture = await setup();
    const el: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(observeSpy).toHaveBeenCalledWith(el);
  });

  it('should apply initial classes based on offsetWidth on init', async () => {
    // The test host element has style="width:300px".
    // offsetWidth=300 means sm (≥200) is active, but md (≥400) and lg (≥600) are not.
    const fixture = await setup();
    const el: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(el.classList).toContain('sm');
    expect(el.classList).not.toContain('md');
    expect(el.classList).not.toContain('lg');
  });

  it('should add classes for breakpoints whose minWidth is met', async () => {
    const fixture = await setup();
    triggerResize(fixture, 450);

    const el: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(el.classList).toContain('sm');
    expect(el.classList).toContain('md');
    expect(el.classList).not.toContain('lg');
  });

  it('should remove a class when the width drops below its breakpoint', async () => {
    const fixture = await setup();

    triggerResize(fixture, 700); // all three classes active
    let el: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(el.classList).toContain('lg');

    triggerResize(fixture, 300); // only sm active
    el = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(el.classList).toContain('sm');
    expect(el.classList).not.toContain('md');
    expect(el.classList).not.toContain('lg');
  });

  it('should disconnect the ResizeObserver on destroy', async () => {
    const fixture = await setup();
    fixture.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should apply no classes when width is below all breakpoints', async () => {
    const fixture = await setup();
    triggerResize(fixture, 100);

    const el: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(el.classList).not.toContain('sm');
    expect(el.classList).not.toContain('md');
    expect(el.classList).not.toContain('lg');
  });

  it('should apply all classes when width meets all breakpoints', async () => {
    const fixture = await setup();
    triggerResize(fixture, 800);

    const el: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(el.classList).toContain('sm');
    expect(el.classList).toContain('md');
    expect(el.classList).toContain('lg');
  });
});
