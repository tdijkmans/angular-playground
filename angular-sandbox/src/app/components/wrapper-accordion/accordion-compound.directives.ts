import {
    Directive,
    HostBinding,
    HostListener,
    booleanAttribute,
    inject,
    input,
} from '@angular/core';

@Directive({
  selector: 'details[appAccordionDetails]',
  standalone: true,
  host: {
    class: 'accordion-details',
  },
})
export class AccordionDetailsDirective {
  readonly disabled = input(false, {
    alias: 'appAccordionDisabled',
    transform: booleanAttribute,
  });

  @HostBinding('class.is-disabled')
  get isDisabledClass(): boolean {
    return this.disabled();
  }
}

@Directive({
  selector: 'summary[appAccordionSummary]',
  standalone: true,
  host: {
    class: 'accordion-summary',
  },
})
export class AccordionSummaryDirective {
  private readonly details = inject(AccordionDetailsDirective, {
    optional: true,
    host: true,
  });

  @HostBinding('attr.aria-disabled')
  get ariaDisabled(): 'true' | null {
    return this.details?.disabled() ? 'true' : null;
  }

  @HostBinding('class.is-disabled')
  get isDisabledClass(): boolean {
    return !!this.details?.disabled();
  }

  @HostListener('click', ['$event'])
  protected onClick(event: MouseEvent): void {
    if (!this.details?.disabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.details?.disabled()) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }
}

@Directive({
  selector: '[appAccordionMarker]',
  standalone: true,
  host: {
    class: 'accordion-marker',
    'aria-hidden': 'true',
  },
})
export class AccordionMarkerDirective {}

@Directive({
  selector: '[appAccordionLeft]',
  standalone: true,
  host: {
    class: 'accordion-left',
  },
})
export class AccordionLeftDirective {}

@Directive({
  selector: '[appAccordionRight]',
  standalone: true,
  host: {
    class: 'accordion-right',
  },
})
export class AccordionRightDirective {}
