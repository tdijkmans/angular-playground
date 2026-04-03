import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
  input,
  signal,
} from '@angular/core';

@Directive({
  selector: '[appContainerQuery]',
  standalone: true,
  exportAs: 'containerQuery',
})
export class ContainerQueryDirective implements OnInit, OnDestroy {
  readonly appContainerQuery = input<Record<string, number>>({});

  readonly activeBreakpoints = signal<string[]>([]);

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private observer: ResizeObserver | null = null;

  ngOnInit(): void {
    this.observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const breakpoints = this.appContainerQuery();
      const active: string[] = [];

      for (const [name, minWidth] of Object.entries(breakpoints)) {
        if (width >= minWidth) {
          this.renderer.addClass(this.el.nativeElement, name);
          active.push(name);
        } else {
          this.renderer.removeClass(this.el.nativeElement, name);
        }
      }

      this.activeBreakpoints.set(active);
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
