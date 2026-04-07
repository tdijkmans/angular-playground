import { Component, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilKeyChanged } from 'rxjs';

import {
    ContainerQueryDirective,
    CqBreakpoint,
    CqState,
} from '../../directives/container-query.directive';

const WIDTH_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'compact' },
  { name: 'comfortable', width: 360 },
  { name: 'expanded', width: 560 },
];

const HEIGHT_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'short' },
  { name: 'tall', height: 240 },
];

const PANEL_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'stack' },
  { name: 'balanced', width: 420, height: 240 },
  { name: 'spread', width: 560, height: 320 },

];

const BOTH_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'narrow-short' },
  { name: 'wide-short', width: 360 },
  { name: 'narrow-tall', height: 240 },
  { name: 'wide-tall', width: 360, height: 240 },
];

const TARGET_BREAKPOINTS: CqBreakpoint[] = [
  { name: 'narrow' },
  { name: 'mid', width: 300 },
  { name: 'wide', width: 500 },
];

@Component({
  selector: 'app-container-query-demo',
  imports: [ContainerQueryDirective],
  templateUrl: './container-query-demo.html',
  styleUrl: './container-query-demo.scss',
})
export class ContainerQueryDemoComponent {
  private widthCq = viewChild.required<ContainerQueryDirective>('widthCq');
  private bothCq = viewChild.required<ContainerQueryDirective>('bothCq');
  private panelCq = viewChild.required<ContainerQueryDirective>('panelCq');

  private destroyRef = inject(DestroyRef);

  protected readonly widthBreakpoints = WIDTH_BREAKPOINTS;
  protected readonly heightBreakpoints = HEIGHT_BREAKPOINTS;
  protected readonly panelBreakpoints = PANEL_BREAKPOINTS;
  protected readonly bothBreakpoints = BOTH_BREAKPOINTS;
  protected readonly targetBreakpoints = TARGET_BREAKPOINTS;

  /** Stores the last CqState received via the (cqChange) output binding. */
  protected readonly lastWidthEvent = signal<CqState | null>(null);

  constructor() {
    effect(() => {
      this.widthCq().state$
        .pipe(distinctUntilKeyChanged('breakpoint'), takeUntilDestroyed(this.destroyRef))
        .subscribe(s => console.log(`[width] breakpoint=${s.breakpoint} width=${s.width}px`));

      this.bothCq().state$
        .pipe(distinctUntilKeyChanged('breakpoint'), takeUntilDestroyed(this.destroyRef))
        .subscribe(s => console.log(`[both] breakpoint=${s.breakpoint} ${s.width}x${s.height}`));

      this.panelCq().state$
        .pipe(distinctUntilKeyChanged('breakpoint'), takeUntilDestroyed(this.destroyRef))
        .subscribe(s => console.log(`[panel] breakpoint=${s.breakpoint} ${s.width}x${s.height}`));
    });
  }

  /** Handler wired to (cqChange) in the template – demonstrates output-signal consumption. */
  protected onWidthChange(state: CqState): void {
    this.lastWidthEvent.set(state);
  }
}