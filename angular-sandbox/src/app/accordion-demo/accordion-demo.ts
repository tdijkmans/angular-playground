import { Component } from '@angular/core';
import { AccordionGroup } from '../accordion/accordion-group';
import { AccordionItem } from '../accordion/accordion-item';

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [AccordionGroup, AccordionItem],
  templateUrl: './accordion-demo.html',
  styleUrl: './accordion-demo.scss',
})
export class AccordionDemo {}
