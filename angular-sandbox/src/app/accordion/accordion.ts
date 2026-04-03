import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-accordion',
  standalone: true,
  templateUrl: './accordion.html',
  styleUrl: './accordion.scss',
})
export class AccordionComponent {
  @Input() title = '';
  @Input() open = false;
}
