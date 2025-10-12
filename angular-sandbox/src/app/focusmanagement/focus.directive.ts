import {
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostListener,
  input,
  Signal,
} from '@angular/core';
import { FocusManagerService } from './focus.service';

type NavigationMode = '1D' | '2D';

@Directive({ selector: '[appFocus]', standalone: true })
export class FocusDirective {
  // --- Identity & Grouping ---
  focusId = input.required<string>();
  focusGroup = input<string | null>(null);

  // --- 1D Navigation Inputs ---
  focusOrder = input<number>();
  orientation = input<'vertical' | 'horizontal'>('vertical');
  loop = input(true);

  // --- 2D Navigation Inputs ---
  focusRow = input<number>();
  focusCol = input<number>();

  // --- Behavior Inputs ---
  autoFocus = input(false);
  selectText = input(false);
  scrollIntoView = input(false);

  // --- Internal State ---
  private navigationMode: Signal<NavigationMode>;

  constructor(
    private el: ElementRef<HTMLElement>,
    private focusManager: FocusManagerService,
    destroyRef: DestroyRef
  ) {
    const nativeEl = this.el.nativeElement;

    // Infer navigation mode from inputs
    this.navigationMode = computed(() =>
      typeof this.focusRow() === 'number' && typeof this.focusCol() === 'number'
        ? '2D'
        : '1D'
    );

    // Registration Effect
    effect(() => {
      this.focusManager.register({
        id: this.focusId(),
        el: nativeEl,
        group: this.focusGroup() ?? undefined,
        order: this.focusOrder(),
        row: this.focusRow(),
        col: this.focusCol(),
      });
    });

    // AutoFocus Effect
    effect((onCleanup) => {
      const isAutoFocus = this.autoFocus();
      if (isAutoFocus) {
        // Use a microtask to ensure the element is focusable after rendering
        queueMicrotask(() => {
          this.focusManager.focus(nativeEl);
          if (this.selectText()) this.selectTextContent(nativeEl);
          if (this.scrollIntoView()) {
            nativeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    });

    // Cleanup
    destroyRef.onDestroy(() => {
      this.focusManager.unregister(this.focusId());
    });
  }

  // --- Host Listeners (Conditional Logic) ---

  @HostListener('keydown.ArrowDown', ['$event'])
  onArrowDown(e: Event) {
    e.preventDefault();
    if (this.navigationMode() === '2D') {
      this.focusManager.navigate2D(this.focusId(), 1, 0, this.loop()); // Down: +1 Row
    } else if (this.orientation() === 'vertical') {
      this.focusManager.navigate(this.focusId(), 1, this.loop()); // Next item
    }
  }

  @HostListener('keydown.ArrowUp', ['$event'])
  onArrowUp(e: Event) {
    e.preventDefault();
    if (this.navigationMode() === '2D') {
      this.focusManager.navigate2D(this.focusId(), -1, 0, this.loop()); // Up: -1 Row
    } else if (this.orientation() === 'vertical') {
      this.focusManager.navigate(this.focusId(), -1, this.loop()); // Previous item
    }
  }

  @HostListener('keydown.ArrowRight', ['$event'])
  onArrowRight(e: Event) {
    e.preventDefault();
    if (this.navigationMode() === '2D') {
      this.focusManager.navigate2D(this.focusId(), 0, 1, this.loop()); // Right: +1 Col
    } else if (this.orientation() === 'horizontal') {
      this.focusManager.navigate(this.focusId(), 1, this.loop()); // Next item
    }
  }

  @HostListener('keydown.ArrowLeft', ['$event'])
  onArrowLeft(e: Event) {
    e.preventDefault();
    if (this.navigationMode() === '2D') {
      this.focusManager.navigate2D(this.focusId(), 0, -1, this.loop()); // Left: -1 Col
    } else if (this.orientation() === 'horizontal') {
      this.focusManager.navigate(this.focusId(), -1, this.loop()); // Previous item
    }
  }

  // --- Private Helpers ---

  private selectTextContent(nativeEl: HTMLElement): void {
    if (
      nativeEl instanceof HTMLInputElement ||
      nativeEl instanceof HTMLTextAreaElement
    ) {
      queueMicrotask(() => nativeEl.select());
    }
  }
}
