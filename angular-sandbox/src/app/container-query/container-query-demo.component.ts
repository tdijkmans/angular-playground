import { Component } from '@angular/core';
import { ContainerQueryDirective } from './container-query.directive';

@Component({
  selector: 'app-container-query-demo',
  standalone: true,
  imports: [ContainerQueryDirective],
  template: `
    <div class="demo-page">
      <h1>Container Query Directive</h1>
      <p class="subtitle">
        Resize the cards below – classes are applied based on each
        <em>container's</em> own width, not the viewport.
      </p>

      <section class="demo-grid">
        <!-- Resizable card 1 -->
        <div
          class="resizable-box"
          #card1="containerQuery"
          [containerQuery]="breakpoints"
        >
          <div class="card">
            <h2>Card A</h2>
            <p class="status">
              Active:
              @for (entry of activeEntries(card1); track entry.key) {
                <span class="badge">{{ entry.key }}</span>
              }
              @if (activeEntries(card1).length === 0) {
                <span class="badge none">none</span>
              }
            </p>
            <p class="hint">Drag the right edge ↔ to resize this container.</p>
          </div>
        </div>

        <!-- Narrower card to contrast behaviour -->
        <div
          class="resizable-box narrow"
          #card2="containerQuery"
          [containerQuery]="breakpoints"
        >
          <div class="card">
            <h2>Card B</h2>
            <p class="status">
              Active:
              @for (entry of activeEntries(card2); track entry.key) {
                <span class="badge">{{ entry.key }}</span>
              }
              @if (activeEntries(card2).length === 0) {
                <span class="badge none">none</span>
              }
            </p>
            <p class="hint">This card starts narrower.</p>
          </div>
        </div>
      </section>

      <section class="breakpoint-table">
        <h2>Configured breakpoints</h2>
        <table>
          <thead>
            <tr>
              <th>Class applied</th>
              <th>Min width (px)</th>
            </tr>
          </thead>
          <tbody>
            @for (bp of breakpointEntries; track bp.key) {
              <tr>
                <td><code>cq-{{ bp.key }}</code></td>
                <td>{{ bp.value }}px</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    .demo-page {
      font-family: sans-serif;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 { margin-bottom: 0.25rem; }

    .subtitle {
      color: #555;
      margin-top: 0;
      margin-bottom: 2rem;
    }

    .demo-grid {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }

    /* Make the boxes resizable by the user */
    .resizable-box {
      resize: horizontal;
      overflow: auto;
      min-width: 180px;
      max-width: 100%;
      width: 500px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 0.25rem;
      box-sizing: border-box;
    }

    .resizable-box.narrow { width: 220px; }

    /* The inner card changes layout at each breakpoint */
    .card {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      transition: background 0.2s;
    }

    /* sm ≥ 300px  → tinted background */
    :host-context(.cq-sm) .card,
    .resizable-box.cq-sm .card { background: #e8f4fd; }

    /* md ≥ 480px  → larger padding */
    .resizable-box.cq-md .card {
      background: #d4edda;
      padding: 1.5rem;
    }

    /* lg ≥ 700px  → horizontal layout */
    .resizable-box.cq-lg .card {
      background: #fff3cd;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    h2 { margin: 0 0 0.5rem; }

    .status {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin: 0.5rem 0;
    }

    .badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      background: #0d6efd;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge.none {
      background: #6c757d;
    }

    .hint {
      font-size: 0.8rem;
      color: #888;
      margin: 0.5rem 0 0;
    }

    .breakpoint-table table {
      border-collapse: collapse;
      min-width: 280px;
    }

    .breakpoint-table th,
    .breakpoint-table td {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      text-align: left;
    }

    .breakpoint-table th { background: #f1f3f5; }
  `],
})
export class ContainerQueryDemoComponent {
  readonly breakpoints: Record<string, number> = { sm: 300, md: 480, lg: 700 };

  readonly breakpointEntries = Object.entries(this.breakpoints).map(
    ([key, value]) => ({ key, value })
  );

  activeEntries(dir: ContainerQueryDirective<Record<string, number>>): { key: string }[] {
    const map = dir.activeBreakpoints();
    return Object.entries(map)
      .filter(([, active]) => active)
      .map(([key]) => ({ key }));
  }
}
