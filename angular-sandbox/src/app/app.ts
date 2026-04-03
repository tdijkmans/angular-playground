import { AsyncPipe } from '@angular/common';
import { Component, effect, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { type CqBreakpointsInput, ContainerQueryDirective } from './directives/container-query.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, ContainerQueryDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'angular-sandbox';

  private readonly cqBasic = viewChild<ContainerQueryDirective>('cqBasic');

  protected readonly basicBreakpoints: CqBreakpointsInput = {
    compact: { maxWidth: 479 },
    regular: { minWidth: 480, maxWidth: 839 },
    wide: { minWidth: 840 },
  };

  protected readonly cardBreakpoints: CqBreakpointsInput = [
    { name: 'xs', maxWidth: 299 },
    { name: 'sm', minWidth: 300, maxWidth: 499 },
    { name: 'md', minWidth: 500, maxWidth: 799 },
    { name: 'lg', minWidth: 800 },
  ];

  protected readonly sizeBreakpoints: CqBreakpointsInput = {
    short: { maxHeight: 239 },
    tall: { minHeight: 240 },
  };

  protected readonly bothBreakpoints: CqBreakpointsInput = {
    'small-short': { maxWidth: 459, maxHeight: 229 },
    'small-tall': { maxWidth: 459, minHeight: 230 },
    'wide-short': { minWidth: 460, maxHeight: 229 },
    'wide-tall': { minWidth: 460, minHeight: 230 },
  };

  constructor() {
    effect((onCleanup) => {
      const cq = this.cqBasic();
      if (!cq) {
        return;
      }

      const subscription = cq.state$.subscribe((state) => {
          console.log('[cqBasic state$]', state);
        });

      onCleanup(() => {
        subscription.unsubscribe();
      });
    });
  }

  protected logFromComponent(cq: ContainerQueryDirective, label: string): void {
    const size = cq.dimensions();
    console.log(`[${label}]`, {
      breakpoint: cq.breakpoint(),
      width: size.width,
      height: size.height,
      state: cq.state(),
    });
  }
}
