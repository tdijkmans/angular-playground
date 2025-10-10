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

  /** Register element with ID, optional group, and order */
  register(id: string, el: HTMLElement, group?: string, order = 0) {
    this.registry.set(id, { id, el, group, order });
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
  // 🔄 Focus Navigation
  // -----------------------------------------------------------

  private navigate(currentId: string, direction: 1 | -1, loop: boolean): void {
    const current = this.registry.get(currentId);
    if (!current) return;

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

  /** Move to next item in the same group */
  focusNext(currentId: string, loop = true) {
    this.navigate(currentId, 1, loop);
  }

  /** Move to previous item in the same group */
  focusPrevious(currentId: string, loop = true) {
    this.navigate(currentId, -1, loop);
  }
}
