import {
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostListener,
  input,
} from '@angular/core';
import { FocusManagerService } from './focus.service';

@Directive({ selector: '[appFocus]', standalone: true })
export class FocusDirective {
  autoFocus = input(false);
  focusId = input<string | null>(null);
  focusGroup = input<string | null>(null);
  focusOrder = input(0);
  selectText = input(false);
  scrollIntoView = input(false);
  orientation = input<'vertical' | 'horizontal'>('vertical');
  loop = input(true);

  constructor(
    private el: ElementRef<HTMLElement>,
    private focusManager: FocusManagerService,
    destroyRef: DestroyRef
  ) {
    const nativeEl = this.el.nativeElement;
    let prev = false;

    // Register element
    effect(() => {
      const id = this.focusId();
      const group = this.focusGroup();
      const order = this.focusOrder();
      if (id) {
        this.focusManager.register(id, nativeEl, group ?? undefined, order);
      }
    });

    // AutoFocus reactive effect
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

    // Cleanup
    destroyRef.onDestroy(() => {
      const id = this.focusId();
      if (id) this.focusManager.unregister(id);
      this.focusManager.clearIfFocused(nativeEl);
    });
  }

  @HostListener('keydown.ArrowDown', ['$event'])
  onArrowDown(e: Event) {
    if (this.orientation() === 'vertical') {
      const id = this.focusId();
      if (id) {
        e.preventDefault();
        this.focusManager.focusNext(id, this.loop());
      }
    }
  }

  @HostListener('keydown.ArrowUp', ['$event'])
  onArrowUp(e: Event) {
    if (this.orientation() === 'vertical') {
      const id = this.focusId();
      if (id) {
        e.preventDefault();
        this.focusManager.focusPrevious(id, this.loop());
      }
    }
  }

  @HostListener('keydown.ArrowRight', ['$event'])
  onArrowRight(e: Event) {
    if (this.orientation() === 'horizontal') {
      const id = this.focusId();
      if (id) {
        e.preventDefault();
        this.focusManager.focusNext(id, this.loop());
      }
    }
  }

  @HostListener('keydown.ArrowLeft', ['$event'])
  onArrowLeft(e: Event) {
    if (this.orientation() === 'horizontal') {
      const id = this.focusId();
      if (id) {
        e.preventDefault();
        this.focusManager.focusPrevious(id, this.loop());
      }
    }
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
