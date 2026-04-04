import {
    Directive,
    booleanAttribute,
    inject,
    input,
    model,
} from '@angular/core';

@Directive({
    selector: 'details[appAccordionDetails]',
    standalone: true,
    host: {
        class: 'accordion-details',
        '[class.is-disabled]': 'disabled()',
        // 1. Keeps the native HTML element in sync with your Signal
        '[open]': 'open()', 
        // 2. Listens for when the user clicks the summary to update the Signal
        '(toggle)': 'onToggle($event)', 
    },
})
export class AccordionDetailsDirective {
    readonly disabled = input(false, {
        alias: 'appAccordionDisabled',
        transform: booleanAttribute,
    });

    open = model(false, { alias: 'appAccordionOpen' });

    protected onToggle(event: Event): void {
        const isNowOpen = (event.target as HTMLDetailsElement).open;
        
        if (isNowOpen !== this.open()) {
            this.open.set(isNowOpen);
        }
    }
}

@Directive({
    selector: 'summary[appAccordionSummary]',
    host: {
        class: 'accordion-summary',
        '[attr.aria-disabled]': "details?.disabled() ? 'true' : null",
        '[class.is-disabled]': 'details?.disabled()',
        '(click)': 'handleEvent($event)',
        '(keydown.enter)': 'handleEvent($event)',
        '(keydown.space)': 'handleEvent($event)',
    },
})
export class AccordionSummaryDirective {
    protected readonly details = inject(AccordionDetailsDirective, { optional: true });

    protected handleEvent(event: Event): void {
        if (this.details?.disabled()) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}

@Directive({
    selector: '[appAccordionMarker]',
    host: {
        class: 'accordion-marker',
        'aria-hidden': 'true',
    },
})
export class AccordionMarkerDirective { }

@Directive({
    selector: '[appAccordionLeft]',
    host: {
        class: 'accordion-left',
    },
})
export class AccordionLeftDirective { }

@Directive({
    selector: '[appAccordionRight]',
    host: {
        class: 'accordion-right',
    },
})
export class AccordionRightDirective { }
