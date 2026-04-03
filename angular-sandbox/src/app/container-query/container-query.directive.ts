import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';

/**
 * Directive that applies CSS classes to the host element based on its own width,
 * implementing container query behaviour via ResizeObserver.
 *
 * Usage:
 * ```html
 * <div [containerQuery]="{ sm: 400, md: 600, lg: 900 }">…</div>
 * ```
 * When the host element's content width is ≥ a breakpoint value the corresponding
 * class name is added; it is removed when the width drops below the value.
 */
@Directive({
  selector: '[containerQuery]',
  standalone: true,
})
export class ContainerQueryDirective implements OnInit, OnDestroy {
  /** Map of breakpoint name → minimum width in pixels. */
  @Input() containerQuery: Record<string, number> = {};

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.updateClasses(entry.contentRect.width);
      }
    });
    this.resizeObserver.observe(this.el.nativeElement);
    this.updateClasses(
      (this.el.nativeElement as HTMLElement).offsetWidth
    );
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private updateClasses(width: number): void {
    for (const [name, minWidth] of Object.entries(this.containerQuery)) {
      if (width >= minWidth) {
        this.renderer.addClass(this.el.nativeElement, name);
      } else {
        this.renderer.removeClass(this.el.nativeElement, name);
      }
    }
  }
}
