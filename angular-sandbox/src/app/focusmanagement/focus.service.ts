// focus-manager.service.ts
import { FocusMonitor } from '@angular/cdk/a11y';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { FocusEntry } from './focus.interface';

@Injectable({ providedIn: 'root' })
export class FocusManagerService implements OnDestroy {
  private readonly _focusedEl = signal<HTMLElement | null>(null);
  readonly focusedEl = this._focusedEl.asReadonly();

  private _focusAnchor: HTMLElement | null = null;
  private registry = new Map<string, FocusEntry>();

  constructor(private fm: FocusMonitor) {
    // Monitor focus changes on the entire document.
    this.fm.monitor(document.body, true).subscribe((origin) => {
      // The FocusMonitor is now the single source of truth for focus state.
      if (origin) {
        this.setFocused(document.activeElement as HTMLElement);
        console.log('Focus changed to:', this._focusedEl());
      } else {
        // This handles the case where the window loses focus (e.g., user clicks another app).
        this.setFocused(null);
      }
    });
  }

  /** Unsubscribe from the monitor when the service is destroyed. */
  ngOnDestroy(): void {
    this.fm.stopMonitoring(document.body);
  }

  /**
   * Updates the internal state when focus changes. This should only be called
   * by the FocusMonitor subscription.
   */
  private setFocused(el: HTMLElement | null): void {
    // Avoid redundant updates if the element hasn't changed.
    if (el !== this._focusedEl()) {
      this._focusedEl.set(el);
    }
  }

  /** Programmatically focus by ID or element */
  focus(target: string | HTMLElement | null): void {
    const el =
      typeof target === 'string'
        ? this.registry.get(target)?.el || null
        : target;
    if (el) el.focus();
  }

  setFocusAnchor(target?: string | HTMLElement | null) {
    if (target === null) {
      this._focusAnchor = null;
      return;
    }
    const element =
      typeof target === 'string' ? this.registry.get(target)?.el : target;
    const elToSet = element === undefined ? this._focusedEl() : element;
    this._focusAnchor = elToSet;
  }

  returnToAnchor(): void {
    if (this._focusAnchor) {
      this.focus(this._focusAnchor);
      this._focusAnchor = null;
    }
  }

  isFocused(el: HTMLElement | null): boolean {
    return el === this._focusedEl();
  }

  /** * Register element for 1D navigation (used by FocusDirective).
   * Sets default 2D properties (row/col) to 0.
   */
  register(id: string, el: HTMLElement, group?: string, order = 0) {
    // Note: Default row/col values are added for type safety in the unified registry
    this.registry.set(id, { id, el, group, order, row: 0, col: 0 });
  }

  /** * Register element for 2D navigation (used by Focus2DDirective).
   * Sets default 1D property (order) to 0.
   */
  register2D(
    id: string,
    el: HTMLElement,
    row: number,
    col: number,
    group?: string
  ) {
    // Note: Default order is added for type safety in the unified registry
    this.registry.set(id, { id, el, group, order: 0, row, col });
  }

  /** Unregister on destroy */
  unregister(id: string) {
    this.registry.delete(id);
  }

  /** Internal helper for directive cleanup */
  clearIfFocused(el: HTMLElement) {
    if (this.isFocused(el)) {
      this.setFocused(null);
    }
  }

  // -----------------------------------------------------------
  // 🔄 1D Focus Navigation (Used by FocusDirective)
  // -----------------------------------------------------------

  private navigate(currentId: string, direction: 1 | -1, loop: boolean): void {
    const current = this.registry.get(currentId);
    if (!current) return;

    // 1D navigation filters by group and sorts by 'order'
    const items = [...this.registry.values()]
      .filter((x) => x.group === current.group)
      .sort((a, b) => a.order - b.order);

    const i = items.findIndex((x) => x.id === currentId);
    let targetIndex = i + direction;

    if (loop) {
      targetIndex = (targetIndex + items.length) % items.length;
    } else {
      if (targetIndex < 0 || targetIndex >= items.length) return;
    }

    const target = items[targetIndex];
    if (target) this.focus(target.el);
  }

  /** Move to next item in the same group (1D) */
  focusNext(currentId: string, loop = true) {
    this.navigate(currentId, 1, loop);
  }

  /** Move to previous item in the same group (1D) */
  focusPrevious(currentId: string, loop = true) {
    this.navigate(currentId, -1, loop);
  }

  // -----------------------------------------------------------
  // 🌐 2D Focus Navigation (New, used by Focus2DDirective)
  // -----------------------------------------------------------

  /**
   * Finds the next element in a 2D grid structure (table-like navigation).
   * @param currentId The ID of the currently focused element.
   * @param rowDelta Change in row index (-1, 0, or 1).
   * @param colDelta Change in col index (-1, 0, or 1).
   */
  navigate2D(
    currentId: string,
    rowDelta: -1 | 0 | 1,
    colDelta: -1 | 0 | 1
  ): void {
    const current = this.registry.get(currentId);
    if (!current) return;

    // 2D navigation filters by group
    const items = [...this.registry.values()].filter(
      (x) => x.group === current.group
    );

    if (items.length === 0) return;

    const targetRow = current.row + rowDelta;
    const targetCol = current.col + colDelta;

    // Look for the target element using the calculated (row, col) indices
    const target = items.find(
      (item) => item.row === targetRow && item.col === targetCol
    );

    if (target) {
      this.focus(target.el);
    }
    // No action if a target at the new coordinate is not found (i.e., edge of the grid)
  }
}
