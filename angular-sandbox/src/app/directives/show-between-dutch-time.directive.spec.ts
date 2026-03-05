import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ShowBetweenDutchTimeDirective } from './show-between-dutch-time.directive';

@Component({
  standalone: true,
  imports: [ShowBetweenDutchTimeDirective],
  template: `
    <ng-template
      appShowBetweenDutchTime
      [appShowBetweenDutchTimeStart]="start"
      [appShowBetweenDutchTimeEnd]="end"
    >
      <svg data-testid="svg"></svg>
    </ng-template>
  `,
})
class TestHostComponent {
  @ViewChild(ShowBetweenDutchTimeDirective)
  directive!: ShowBetweenDutchTimeDirective;

  start = '';
  end = '';
}

/** Creates a fixture, optionally pre-sets start/end, runs initial detectChanges. */
function setup(start = '', end = '') {
  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.componentInstance.start = start;
  fixture.componentInstance.end = end;
  // detectChanges initialises the component, propagates inputs to the directive,
  // and calls ngOnInit (which starts the timer). The timer hasn't fired yet.
  fixture.detectChanges();
  return fixture;
}

/** Casts the directive to `any` to access private members for testing. */
function asAny(d: ShowBetweenDutchTimeDirective): any {
  return d as any;
}

describe('ShowBetweenDutchTimeDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
  });

  it('should render the element when current Dutch time is within the range', fakeAsync(() => {
    const fixture = setup('2026-06-15T11:00:00', '2026-06-15T13:00:00');
    spyOn(asAny(fixture.componentInstance.directive), 'getDutchNow').and.returnValue(
      new Date('2026-06-15T12:00:00'),
    );

    tick(0); // first timer emission
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="svg"]')).not.toBeNull();
  }));

  it('should NOT render the element when current Dutch time is before the range', fakeAsync(() => {
    const fixture = setup('2026-06-15T11:00:00', '2026-06-15T13:00:00');
    spyOn(asAny(fixture.componentInstance.directive), 'getDutchNow').and.returnValue(
      new Date('2026-06-15T10:00:00'),
    );

    tick(0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="svg"]')).toBeNull();
  }));

  it('should NOT render the element when current Dutch time is after the range', fakeAsync(() => {
    const fixture = setup('2026-06-15T11:00:00', '2026-06-15T13:00:00');
    spyOn(asAny(fixture.componentInstance.directive), 'getDutchNow').and.returnValue(
      new Date('2026-06-15T14:00:00'),
    );

    tick(0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="svg"]')).toBeNull();
  }));

  it('should NOT render the element when inputs are empty', fakeAsync(() => {
    const fixture = setup(); // empty start/end
    tick(0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="svg"]')).toBeNull();
  }));

  it('should re-check visibility every 30 seconds', fakeAsync(() => {
    const fixture = setup('2026-06-15T11:00:00', '2026-06-15T13:00:00');
    const spy = spyOn(asAny(fixture.componentInstance.directive), 'getDutchNow').and.returnValue(
      new Date('2026-06-15T10:59:00'), // outside range
    );

    tick(0); // first emission: outside range
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="svg"]')).toBeNull();

    spy.and.returnValue(new Date('2026-06-15T11:01:00')); // now inside range
    tick(30_000); // second emission at 30 s
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="svg"]')).not.toBeNull();
  }));

  it('should unsubscribe on destroy to prevent memory leaks', fakeAsync(() => {
    const fixture = setup();
    tick(0);
    fixture.detectChanges();

    const { directive } = fixture.componentInstance;
    expect(asAny(directive).subscription).toBeTruthy();

    fixture.destroy();
    expect(asAny(directive).subscription?.closed).toBeTrue();
  }));

  it('isBetweenDutchTime returns false when start is empty', () => {
    const fixture = setup('', '2026-06-15T13:00:00');
    const { directive } = fixture.componentInstance;
    expect(asAny(directive).isBetweenDutchTime()).toBeFalse();
  });

  it('isBetweenDutchTime returns false when end is empty', () => {
    const fixture = setup('2026-06-15T11:00:00', '');
    const { directive } = fixture.componentInstance;
    expect(asAny(directive).isBetweenDutchTime()).toBeFalse();
  });

  it('getDutchNow returns a valid Date object', () => {
    const fixture = setup();
    const { directive } = fixture.componentInstance;
    const dutchNow = asAny(directive).getDutchNow();
    expect(dutchNow instanceof Date).toBeTrue();
    expect(isNaN(dutchNow.getTime())).toBeFalse();
  });
});
