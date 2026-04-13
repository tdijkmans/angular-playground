import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import {
  ContainerQueryDirective,
  CqBreakpoint,
  CqState,
} from './container-query.directive';

const BREAKPOINTS: CqBreakpoint[] = [
  { name: 'compact' },
  { name: 'wide', width: 400 },
];

@Component({
  template: `<div [appCq]="bp" #cq="cq"></div>`,
  imports: [ContainerQueryDirective],
})
class HostComponent {
  bp = BREAKPOINTS;
}

describe('ContainerQueryDirective – directionality', () => {
  let fixture: ComponentFixture<HostComponent>;
  let directive: ContainerQueryDirective;
  let observerCallback: ResizeObserverCallback;
  let rectOverride = { width: 0, height: 0 };

  beforeEach(async () => {
    rectOverride = { width: 0, height: 0 };

    class MockResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        observerCallback = cb;
      }
      observe() {}
      disconnect() {}
    }
    (window as unknown as Record<string, unknown>)['ResizeObserver'] = MockResizeObserver;

    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);

    // Install the spy before detectChanges so the initial recalculate() uses it.
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    spyOn(el, 'getBoundingClientRect').and.callFake(
      () =>
        ({
          width: rectOverride.width,
          height: rectOverride.height,
          top: 0,
          left: 0,
          bottom: rectOverride.height,
          right: rectOverride.width,
        }) as DOMRect,
    );

    fixture.detectChanges();
    directive = fixture.debugElement.children[0].injector.get(ContainerQueryDirective);
  });

  afterEach(() => {
    fixture.destroy();
  });

  function triggerResize(width: number, height: number) {
    rectOverride = { width, height };
    observerCallback([], null as unknown as ResizeObserver);
  }

  it('should start with widthDirection and heightDirection as "initial"', () => {
    const state: CqState = directive.state();
    expect(state.widthDirection).toBe('initial');
    expect(state.heightDirection).toBe('initial');
  });

  it('should set widthDirection to "growing" when width increases', fakeAsync(() => {
    triggerResize(300, 100);
    triggerResize(400, 100);
    tick();
    expect(directive.state().widthDirection).toBe('growing');
  }));

  it('should set widthDirection to "shrinking" when width decreases', fakeAsync(() => {
    triggerResize(500, 100);
    triggerResize(300, 100);
    tick();
    expect(directive.state().widthDirection).toBe('shrinking');
  }));

  it('should set heightDirection to "growing" when height increases', fakeAsync(() => {
    triggerResize(300, 100);
    triggerResize(300, 200);
    tick();
    expect(directive.state().heightDirection).toBe('growing');
  }));

  it('should set heightDirection to "shrinking" when height decreases', fakeAsync(() => {
    triggerResize(300, 300);
    triggerResize(300, 150);
    tick();
    expect(directive.state().heightDirection).toBe('shrinking');
  }));

  it('should preserve last direction when dimension is unchanged', fakeAsync(() => {
    triggerResize(300, 100);
    triggerResize(400, 100); // width grows
    triggerResize(400, 100); // no width change
    tick();
    expect(directive.state().widthDirection).toBe('growing');
  }));

  it('should emit updated direction via state$ observable', fakeAsync(() => {
    const states: CqState[] = [];
    directive.state$.subscribe(s => states.push(s));

    triggerResize(300, 100);
    triggerResize(450, 100);
    tick();

    const last = states[states.length - 1];
    expect(last.widthDirection).toBe('growing');
  }));
});
