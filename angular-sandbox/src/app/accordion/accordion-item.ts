import { Component, Input } from '@angular/core';

/**
 * AccordionItem — compound-component leaf.
 *
 * Renders a native <details>/<summary> pair so open/close behaviour
 * is fully handled by the browser — zero JavaScript state machine.
 * Visual styling is inherited from the parent <app-accordion-group>
 * via scoped CSS custom properties.
 *
 * @example
 * <app-accordion-item summary="Section title">
 *   <p>Body content goes here.</p>
 * </app-accordion-item>
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  templateUrl: './accordion-item.html',
  styleUrl: './accordion-item.scss',
})
export class AccordionItem {
  /** Text shown in the clickable summary / header row */
  @Input() summary = '';

  /** Whether the item starts in the expanded state */
  @Input() open = false;
}
