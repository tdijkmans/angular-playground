import {
  DestroyRef,
  Directive,
  ElementRef,
  effect,
  input,
} from '@angular/core';
import { FocusManagerService } from './focus.service';

@Directive({ selector: '[appFocus]', standalone: true })
export class FocusDirective {
  /** If true, focuses the element when the directive is initialized. */
  autoFocus = input(false);

  /** Optional ID to register the element for programmatic focus. */
  focusId = input<string | null>(null);

  /** If true, selects the text content of the element upon focus (for inputs/textareas). */
  selectText = input(false);

  /** If true, scrolls the element into the center of the viewport upon focus. */
  scrollIntoView = input(false);

  constructor(
    private el: ElementRef<HTMLElement>,
    private focusManager: FocusManagerService,
    destroyRef: DestroyRef
  ) {
    const nativeEl = this.el.nativeElement;
    let prev = false;

    effect(() => {
      const id = this.focusId();
      if (id) {
        this.focusManager.register(id, nativeEl);
      }
    });

    effect(() => {
      const curr = this.autoFocus();
      if (curr && !prev) {
        this.focusManager.focus(nativeEl);

        if (this.selectText()) {
          this.handleSelection(nativeEl);
        }

        if (this.scrollIntoView()) {
          nativeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      prev = curr;
    });

    destroyRef.onDestroy(() => {
      const id = this.focusId();
      if (id) this.focusManager.unregister(id);
      this.focusManager.clearIfFocused(nativeEl);
    });
  }

  private handleSelection(nativeEl: HTMLElement): void {
    if (
      nativeEl instanceof HTMLInputElement ||
      nativeEl instanceof HTMLTextAreaElement
    ) {
      // Defer select() to a microtask to ensure the element has fully received focus.
      queueMicrotask(() => {
        nativeEl.select();
      });
    }
  }
}
