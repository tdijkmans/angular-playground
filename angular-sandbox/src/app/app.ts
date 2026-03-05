import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShowBetweenDutchTimeDirective } from './directives/show-between-dutch-time.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ShowBetweenDutchTimeDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'angular-sandbox';

  /** Demo: show the SVG between 2026-03-01 and 2026-12-31 (Dutch time). */
  protected svgStart = '2026-03-01T00:00:00';
  protected svgEnd = '2026-12-31T23:59:59';
}
