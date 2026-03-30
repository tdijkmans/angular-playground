import { Component, Input } from '@angular/core';

export type AccordionVariant = 'parent' | 'child';

/**
 * AccordionGroup — compound-component container.
 *
 * Wraps one or more <app-accordion-item> elements and provides the
 * visual design context (variant) for them via scoped CSS custom
 * properties.  Open/close behaviour is entirely delegated to the
 * native <details> element inside each item.
 *
 * @example
 * <app-accordion-group variant="parent" label="FAQ">
 *   <app-accordion-item summary="Question 1">Answer 1</app-accordion-item>
 * </app-accordion-group>
 */
@Component({
  selector: 'app-accordion-group',
  standalone: true,
  templateUrl: './accordion-group.html',
  styleUrl: './accordion-group.scss',
})
export class AccordionGroup {
  /** Visual variant — 'parent' (bold, elevated) or 'child' (subtle, nested) */
  @Input() variant: AccordionVariant = 'parent';

  /** Accessible label for the group region */
  @Input() label = '';
}
