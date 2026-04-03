import { Component } from '@angular/core';
import { AccordionComponent } from '../accordion/accordion';

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [AccordionComponent],
  templateUrl: './accordion-demo.html',
  styleUrl: './accordion-demo.scss',
})
export class AccordionDemoComponent {}
