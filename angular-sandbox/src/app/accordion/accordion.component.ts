import { Component, Input, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent implements OnInit {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() open = false;
  @Input() disabled = false;

  protected isOpen = signal(false);

  ngOnInit(): void {
    this.isOpen.set(this.open);
  }

  onToggle(event: Event): void {
    const details = event.target as HTMLDetailsElement;
    this.isOpen.set(details.open);
  }

  onSummaryClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
    }
  }
}
