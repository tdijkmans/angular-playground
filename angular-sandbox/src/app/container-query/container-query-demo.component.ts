import { Component } from '@angular/core';
import { ContainerQueryDirective } from './container-query.directive';

@Component({
  selector: 'app-container-query-demo',
  standalone: true,
  imports: [ContainerQueryDirective],
  template: `
    <div class="demo-wrapper">
      <h2>Container Query Directive Demo</h2>
      <p>Resize the coloured box below to see breakpoint classes applied.</p>

      <div
        class="resizable-box"
        [containerQuery]="breakpoints"
      >
        <p class="hint">Drag the bottom-right corner to resize.</p>
        <ul class="active-classes">
          <li>Active classes are shown here via CSS.</li>
        </ul>
      </div>

      <h3>Breakpoints</h3>
      <table class="breakpoint-table">
        <thead>
          <tr><th>Class</th><th>Min width (px)</th></tr>
        </thead>
        <tbody>
          @for (bp of breakpointEntries; track bp[0]) {
            <tr>
              <td><code>{{ bp[0] }}</code></td>
              <td>{{ bp[1] }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .demo-wrapper {
      padding: 2rem;
      font-family: sans-serif;
    }

    .resizable-box {
      resize: horizontal;
      overflow: auto;
      min-width: 120px;
      width: 300px;
      max-width: 100%;
      padding: 1rem;
      border: 2px solid #333;
      background: #f4f4f4;
      transition: background 0.3s;
    }

    .resizable-box.cq-sm  { background: #d0e8ff; }
    .resizable-box.cq-md  { background: #a0c8ff; }
    .resizable-box.cq-lg  { background: #60a0ff; }
    .resizable-box.cq-xl  { background: #3070e0; color: #fff; }

    .hint { margin: 0 0 0.5rem; font-size: 0.85rem; color: #555; }

    .breakpoint-table { border-collapse: collapse; margin-top: 0.5rem; }
    .breakpoint-table th,
    .breakpoint-table td { border: 1px solid #ccc; padding: 0.4rem 1rem; }
    .breakpoint-table th  { background: #eee; }
  `],
})
export class ContainerQueryDemoComponent {
  readonly breakpoints: Record<string, number> = {
    'cq-sm': 200,
    'cq-md': 400,
    'cq-lg': 600,
    'cq-xl': 800,
  };

  get breakpointEntries(): [string, number][] {
    return Object.entries(this.breakpoints);
  }
}