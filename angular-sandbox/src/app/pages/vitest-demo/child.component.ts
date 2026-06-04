import { Component, input, output } from '@angular/core';

import { GrandchildComponent } from './grandchild.component';

@Component({
  selector: 'app-child',
  standalone: true,
  imports: [GrandchildComponent],
  template: `
    <div class="child">
      <p>Label: {{ label() }}</p>
      <app-grandchild (action)="onGrandchildAction()" />
    </div>
  `,
})
export class ChildComponent {
  readonly label = input<string>('');
  readonly childAction = output<void>();

  onGrandchildAction(): void {
    this.childAction.emit();
  }
}
