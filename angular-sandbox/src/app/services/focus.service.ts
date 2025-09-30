import { Injectable, ElementRef, QueryList } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FocusService {
  private lastFocused?: ElementRef;

  constructor(private focusMonitor: FocusMonitor, private router: Router) {
    // Track route changes to restore focus when navigating
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Optionally restore focus after route change
        // Can be enabled/disabled based on app needs
      });
  }

  /** Set focus on an element and remember it */
  focus(el: ElementRef, origin: 'keyboard' | 'mouse' | 'program' = 'program') {
    this.lastFocused = el;
    this.focusMonitor.focusVia(el, origin);
  }

  /** Restore focus to the last remembered element */
  restoreFocus() {
    if (this.lastFocused) {
      this.focusMonitor.focusVia(this.lastFocused, 'program');
    }
  }

  /** Focus the first element in a QueryList */
  focusFirst(elements: QueryList<ElementRef>) {
    const first = elements.first;
    if (first) {
      this.focus(first, 'program');
    }
  }

  /** Focus the first invalid form field */
  focusFirstInvalid(formGroup: FormGroup, elements: QueryList<ElementRef>) {
    const controls = Object.keys(formGroup.controls);
    const elementArray = elements.toArray();

    for (let i = 0; i < controls.length; i++) {
      const control = formGroup.get(controls[i]);
      if (control && control.invalid && control.touched) {
        const element = elementArray[i];
        if (element) {
          this.focus(element, 'program');
          return;
        }
      }
    }
  }

  /** Focus a specific element by index */
  focusAtIndex(elements: QueryList<ElementRef>, index: number) {
    const element = elements.toArray()[index];
    if (element) {
      this.focus(element, 'program');
    }
  }

  /** Clear the last focused element */
  clearLastFocused() {
    this.lastFocused = undefined;
  }

  /** Stop monitoring an element */
  stopMonitoring(el: ElementRef) {
    this.focusMonitor.stopMonitoring(el);
  }
}
