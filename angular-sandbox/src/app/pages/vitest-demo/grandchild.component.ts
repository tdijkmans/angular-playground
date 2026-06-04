import { Component, output } from '@angular/core';

@Component({
  selector: 'app-grandchild',
  standalone: true,
  template: `
    <button data-testid="grandchild-btn" (click)="action.emit()">
      Take Action
    </button>
  `,
})
export class GrandchildComponent {
  readonly action = output<void>();
}
