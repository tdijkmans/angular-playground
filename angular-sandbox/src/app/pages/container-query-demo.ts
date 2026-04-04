import { Component, DestroyRef, effect, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilKeyChanged } from 'rxjs';

import {
  ContainerQueryDirective,
  CqBreakpoint,
} from '../directives/container-query.directive';

const WIDTH_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'compact', maxWidth: 359 },
  { name: 'comfortable', minWidth: 360, maxWidth: 559 },
  { name: 'expanded', minWidth: 560 },
];

const HEIGHT_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'short', maxHeight: 239 },
  { name: 'tall', minHeight: 240 },
];

const PANEL_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'stack', maxWidth: 419, maxHeight: 239 },
  { name: 'balanced', minWidth: 420, minHeight: 240 },
];

const TARGET_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'narrow', maxWidth: 299 },
  { name: 'mid', minWidth: 300, maxWidth: 499 },
  { name: 'wide', minWidth: 500 },
];

@Component({
  selector: 'app-container-query-demo',
  imports: [ContainerQueryDirective],
  templateUrl: './container-query-demo.html',
  styleUrl: './container-query-demo.scss',
})
export class ContainerQueryDemoComponent {
  private widthCq = viewChild.required<ContainerQueryDirective>('widthCq');
  private panelCq = viewChild.required<ContainerQueryDirective>('panelCq');

  private destroyRef = inject(DestroyRef);

  protected readonly widthBreakpoints = WIDTH_BREAKPOINTS;
  protected readonly heightBreakpoints = HEIGHT_BREAKPOINTS;
  protected readonly panelBreakpoints = PANEL_BREAKPOINTS;
  protected readonly targetBreakpoints = TARGET_BREAKPOINTS;

  constructor() {
    effect(() => {
      this.widthCq().state$
        .pipe(distinctUntilKeyChanged('breakpoint'), takeUntilDestroyed(this.destroyRef))
        .subscribe(s => console.log(`[width] breakpoint=${s.breakpoint} width=${s.width}px`));

      this.panelCq().state$
        .pipe(distinctUntilKeyChanged('breakpoint'), takeUntilDestroyed(this.destroyRef))
        .subscribe(s => console.log(`[panel] breakpoint=${s.breakpoint} ${s.width}x${s.height}`));
    });
  }
}