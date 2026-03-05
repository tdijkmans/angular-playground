import {
  Directive,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  input,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';

/**
 * Structural directive that renders an element only when the current Dutch time
 * (Europe/Amsterdam timezone) falls between two ISO date strings.
 *
 * Usage example:
 * ```html
 * <svg
 *   *appShowBetweenDutchTime
 *   appShowBetweenDutchTimeStart="2026-03-01T00:00:00"
 *   appShowBetweenDutchTimeEnd="2026-03-31T23:59:59"
 *   xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
 *   <circle cx="50" cy="50" r="40" />
 * </svg>
 * ```
 */
@Directive({
  selector: '[appShowBetweenDutchTime]',
  standalone: true,
})
export class ShowBetweenDutchTimeDirective implements OnInit, OnDestroy {
  /** ISO date-time string representing the start of the visible window (e.g. '2026-03-01T00:00:00'). */
  readonly appShowBetweenDutchTimeStart = input('');
  /** ISO date-time string representing the end of the visible window (e.g. '2026-03-31T23:59:59'). */
  readonly appShowBetweenDutchTimeEnd = input('');

  private subscription?: Subscription;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    // Check immediately, then re-check every 30 seconds.
    this.subscription = timer(0, 30_000).subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(): void {
    if (this.isBetweenDutchTime()) {
      if (this.viewContainerRef.length === 0) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainerRef.clear();
    }
  }

  /**
   * Returns true when the current Dutch time is within [start, end].
   */
  private isBetweenDutchTime(): boolean {
    if (!this.appShowBetweenDutchTimeStart() || !this.appShowBetweenDutchTimeEnd()) {
      return false;
    }
    const dutchNow = this.getDutchNow();
    const start = new Date(this.appShowBetweenDutchTimeStart());
    const end = new Date(this.appShowBetweenDutchTimeEnd());
    return dutchNow >= start && dutchNow <= end;
  }

  /**
   * Returns the current wall-clock time as seen in the Europe/Amsterdam timezone,
   * expressed as a plain (timezone-free) Date object so that it can be compared
   * directly against the ISO strings supplied via the inputs.
   */
  private getDutchNow(): Date {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Amsterdam',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? '00';
    return new Date(
      `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`,
    );
  }
}
