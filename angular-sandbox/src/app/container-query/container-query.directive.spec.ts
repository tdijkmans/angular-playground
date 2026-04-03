import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContainerQueryDirective } from './container-query.directive';

@Component({
  template: `
    <div
      [appContainerQuery]="breakpoints"
      #cq="containerQuery"
      style="width: 100px"
    ></div>
  `,
  imports: [ContainerQueryDirective],
  standalone: true,
})
class TestHostComponent {
  breakpoints: Record<string, number> = { sm: 300, md: 600, lg: 900 };
}

describe('ContainerQueryDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let mockObserveTarget: Element | null;
  let mockCallback: ResizeObserverCallback;
  let mockDisconnectCalled: boolean;

  beforeEach(async () => {
    mockObserveTarget = null;
    mockDisconnectCalled = false;

    // Replace global ResizeObserver with a controllable mock
    (window as unknown as Record<string, unknown>)['ResizeObserver'] =
      class MockResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          mockCallback = callback;
        }
        observe(target: Element) {
          mockObserveTarget = target;
        }
        disconnect() {
          mockDisconnectCalled = true;
        }
        unobserve() {}
      };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    const directive = fixture.debugElement
      .query(By.directive(ContainerQueryDirective))
      ?.injector.get(ContainerQueryDirective);
    expect(directive).toBeTruthy();
  });

  it('should observe the host element on init', () => {
    const hostEl = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;
    expect(mockObserveTarget).toBe(hostEl);
  });

  it('should apply breakpoint classes when width meets the threshold', fakeAsync(() => {
    const hostEl: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;

    // Simulate width = 650px (sm and md are active; lg is not)
    const entry = {
      contentRect: { width: 650 } as DOMRectReadOnly,
      target: hostEl,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    } as ResizeObserverEntry;

    mockCallback([entry], {} as ResizeObserver);
    tick();
    fixture.detectChanges();

    expect(hostEl.classList.contains('sm')).toBeTrue();
    expect(hostEl.classList.contains('md')).toBeTrue();
    expect(hostEl.classList.contains('lg')).toBeFalse();
  }));

  it('should remove breakpoint classes when width drops below threshold', fakeAsync(() => {
    const hostEl: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;

    // First, set width to 1000px (all active)
    let entry = {
      contentRect: { width: 1000 } as DOMRectReadOnly,
      target: hostEl,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    } as ResizeObserverEntry;
    mockCallback([entry], {} as ResizeObserver);
    tick();
    fixture.detectChanges();
    expect(hostEl.classList.contains('lg')).toBeTrue();

    // Then drop width to 200px (none active)
    entry = {
      contentRect: { width: 200 } as DOMRectReadOnly,
      target: hostEl,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    } as ResizeObserverEntry;
    mockCallback([entry], {} as ResizeObserver);
    tick();
    fixture.detectChanges();

    expect(hostEl.classList.contains('sm')).toBeFalse();
    expect(hostEl.classList.contains('md')).toBeFalse();
    expect(hostEl.classList.contains('lg')).toBeFalse();
  }));

  it('should update the activeBreakpoints signal correctly', fakeAsync(() => {
    const hostEl: HTMLElement = fixture.debugElement.query(
      By.directive(ContainerQueryDirective)
    ).nativeElement;

    const directive = fixture.debugElement
      .query(By.directive(ContainerQueryDirective))
      ?.injector.get(ContainerQueryDirective);

    const entry = {
      contentRect: { width: 700 } as DOMRectReadOnly,
      target: hostEl,
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    } as ResizeObserverEntry;
    mockCallback([entry], {} as ResizeObserver);
    tick();

    const active = directive!.activeBreakpoints();
    expect(active).toContain('sm');
    expect(active).toContain('md');
    expect(active).not.toContain('lg');
  }));

  it('should disconnect the ResizeObserver on destroy', () => {
    fixture.destroy();
    expect(mockDisconnectCalled).toBeTrue();
  });
});
