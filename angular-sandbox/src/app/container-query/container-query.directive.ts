import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
  signal,
} from '@angular/core';

/**
 * A standalone directive that implements container query behaviour using
 * ResizeObserver.
 *
 * Usage:
 * ```html
 * <div [containerQuery]="{ sm: 400, md: 600, lg: 900 }">…</div>
 * ```
 *
 * For each breakpoint key whose value (in pixels) is ≤ the element's current
 * width the directive adds the CSS class `cq-<key>` to the host element and
 * removes it when the element shrinks below the threshold.
 *
 * The signal `activeBreakpoints` is updated on every resize so that you can
 * bind to it inside a template:
 * ```html
 * <div #cq="containerQuery" [containerQuery]="{ sm: 400 }">
 *   @if (cq.activeBreakpoints()['sm']) { … }
 * </div>
 * ```
 */
@Directive({
  selector: '[containerQuery]',
  standalone: true,
  exportAs: 'containerQuery',
})
export class ContainerQueryDirective<T extends Record<string, number>>
  implements OnInit, OnDestroy
{
  /** Map of breakpoint name → minimum width (px) at which that breakpoint is active. */
  @Input({ required: true }) containerQuery!: T;

  /** Reactive map of breakpoint name → whether it is currently active. */
  readonly activeBreakpoints = signal<Partial<Record<keyof T, boolean>>>({});

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private observer?: ResizeObserver;

  ngOnInit(): void {
    this.observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? this.el.nativeElement.offsetWidth;
      this.applyBreakpoints(width);
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private applyBreakpoints(width: number): void {
    const next: Partial<Record<keyof T, boolean>> = {};

    for (const key of Object.keys(this.containerQuery) as (keyof T & string)[]) {
      const minWidth = this.containerQuery[key];
      const active = width >= minWidth;
      next[key] = active;

      if (active) {
        this.renderer.addClass(this.el.nativeElement, `cq-${key}`);
      } else {
        this.renderer.removeClass(this.el.nativeElement, `cq-${key}`);
      }
    }

    this.activeBreakpoints.set(next);
  }
}
