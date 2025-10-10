// focus.directive.ts (Expanded for 2D)
import {
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostListener,
  input,
} from '@angular/core';
import { FocusManagerService } from './focus.service';

@Directive({ selector: '[appFocus2D]', standalone: true }) // Changed selector to appFocus2D
export class Focus2DDirective {
  // --- 2D Registration Inputs ---
  focusId = input.required<string>(); // Focus ID is now required
  focusGroup = input<string | null>(null);
  focusRow = input.required<number>(); // New: Row Index
  focusCol = input.required<number>(); // New: Column Index

  // --- AutoFocus / Behavior Inputs ---
  autoFocus = input(false);
  selectText = input(false);
  scrollIntoView = input(false);

  constructor(
    private el: ElementRef<HTMLElement>,
    private focusManager: FocusManagerService,
    destroyRef: DestroyRef
  ) {
    const nativeEl = this.el.nativeElement;
    let prev = false;

    // --- 2D Registration Effect ---
    effect(() => {
      const id = this.focusId();
      const row = this.focusRow();
      const col = this.focusCol();
      const group = this.focusGroup();
      // Register with the 2D method
      this.focusManager.register2D(id, nativeEl, row, col, group ?? undefined);
    });

    // --- AutoFocus Effect (remains largely the same) ---
    effect(() => {
      const curr = this.autoFocus();
      if (curr && !prev) {
        this.focusManager.focus(nativeEl);
        if (this.selectText()) this.selectTextContent(nativeEl);
        if (this.scrollIntoView()) {
          nativeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      prev = curr;
    });

    // --- Cleanup ---
    destroyRef.onDestroy(() => {
      this.focusManager.unregister(this.focusId());
      this.focusManager.clearIfFocused(nativeEl);
    });
  }

  // --- 2D Host Listeners (Captures all four arrow keys) ---

  @HostListener('keydown.ArrowDown', ['$event'])
  onArrowDown(e: Event) {
    e.preventDefault();
    this.focusManager.navigate2D(this.focusId(), 1, 0); // Down: +1 Row, 0 Col
  }

  @HostListener('keydown.ArrowUp', ['$event'])
  onArrowUp(e: Event) {
    e.preventDefault();
    this.focusManager.navigate2D(this.focusId(), -1, 0); // Up: -1 Row, 0 Col
  }

  @HostListener('keydown.ArrowRight', ['$event'])
  onArrowRight(e: Event) {
    e.preventDefault();
    this.focusManager.navigate2D(this.focusId(), 0, 1); // Right: 0 Row, +1 Col
  }

  @HostListener('keydown.ArrowLeft', ['$event'])
  onArrowLeft(e: Event) {
    e.preventDefault();
    this.focusManager.navigate2D(this.focusId(), 0, -1); // Left: 0 Row, -1 Col
  }

  private selectTextContent(nativeEl: HTMLElement): void {
    if (
      nativeEl instanceof HTMLInputElement ||
      nativeEl instanceof HTMLTextAreaElement
    ) {
      queueMicrotask(() => nativeEl.select());
    }
  }
}
