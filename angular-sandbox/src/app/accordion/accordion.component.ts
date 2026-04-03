import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() open = false;
  @Input() disabled = false;

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  onSummaryClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
    }
  }
}
