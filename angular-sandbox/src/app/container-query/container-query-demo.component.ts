import { Component } from '@angular/core';
import { ContainerQueryDirective } from './container-query.directive';

@Component({
  selector: 'app-container-query-demo',
  standalone: true,
  imports: [ContainerQueryDirective],
  styles: [
    `
      .demo-wrapper {
        padding: 2rem;
        font-family: sans-serif;
      }

      h1 {
        margin-bottom: 1.5rem;
      }

      .resize-hint {
        color: #666;
        margin-bottom: 1rem;
        font-size: 0.9rem;
      }

      .responsive-box {
        resize: horizontal;
        overflow: auto;
        border: 2px dashed #aaa;
        padding: 1rem;
        min-width: 150px;
        max-width: 100%;
        background: #f9f9f9;
        border-radius: 4px;
        transition: background 0.3s;
      }

      .responsive-box.sm {
        border-color: #4caf50;
        background: #e8f5e9;
      }

      .responsive-box.md {
        border-color: #2196f3;
        background: #e3f2fd;
      }

      .responsive-box.lg {
        border-color: #9c27b0;
        background: #f3e5f5;
      }

      .breakpoint-status {
        margin-top: 0.75rem;
        font-size: 0.85rem;
        color: #333;
      }

      .badges {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }

      .badge {
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: bold;
        background: #e0e0e0;
        color: #555;
      }

      .badge.active {
        background: #1976d2;
        color: #fff;
      }

      .breakpoint-table {
        margin-top: 1.5rem;
        border-collapse: collapse;
        width: 100%;
        max-width: 400px;
        font-size: 0.85rem;
      }

      .breakpoint-table th,
      .breakpoint-table td {
        text-align: left;
        padding: 0.4rem 0.75rem;
        border: 1px solid #ddd;
      }

      .breakpoint-table th {
        background: #eeeeee;
      }
    `,
  ],
  template: `
    <div class="demo-wrapper">
      <h1>Container Query Directive</h1>
      <p class="resize-hint">
        Drag the right edge of the box below to resize it. Breakpoint classes
        are applied automatically.
      </p>

      <div
        [appContainerQuery]="breakpoints"
        #cq="containerQuery"
        class="responsive-box"
      >
        <strong>Container width triggers breakpoints:</strong>
        <div class="breakpoint-status">
          <div class="badges">
            @for (entry of breakpointEntries; track entry.name) {
              <span
                class="badge"
                [class.active]="cq.activeBreakpoints().includes(entry.name)"
              >
                {{ entry.name }} (&ge;{{ entry.minWidth }}px)
              </span>
            }
          </div>
        </div>
      </div>

      <table class="breakpoint-table">
        <thead>
          <tr>
            <th>Breakpoint</th>
            <th>Min-width</th>
            <th>CSS class applied</th>
          </tr>
        </thead>
        <tbody>
          @for (entry of breakpointEntries; track entry.name) {
            <tr>
              <td>{{ entry.name }}</td>
              <td>{{ entry.minWidth }}px</td>
              <td>
                <code>{{ entry.name }}</code>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ContainerQueryDemoComponent {
  readonly breakpoints: Record<string, number> = { sm: 300, md: 500, lg: 700 };

  readonly breakpointEntries = Object.entries(this.breakpoints).map(
    ([name, minWidth]) => ({ name, minWidth })
  );
}
