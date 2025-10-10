// focus-manager.service.ts
import { FocusMonitor } from '@angular/cdk/a11y';
import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FocusManagerService implements OnDestroy {
  /** The currently focused element. Exposed as a readonly signal. */
  private readonly _focusedEl = signal<HTMLElement | null>(null);
  readonly focusedEl = this._focusedEl.asReadonly();

  /** A manually set element to return focus to later. */
  private _focusAnchor: HTMLElement | null = null;

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

  /**
   * Programmatically focus by ID or element. The state will be updated reactively
   * by the FocusMonitor.
   */
  focus(target: string | HTMLElement | null): void {
    const el =
      typeof target === 'string' ? this.registry.get(target) || null : target;

    if (!el) return;
    // We only trigger the focus event. The monitor will handle the state update.
    el.focus();
  }

  /**
   * Sets a specific element as the focus return point (anchor).
   * If no element is provided, it uses the currently focused element.
   * Call with `null` to clear the anchor.
   * @param target The target element or ID to set as the anchor, or null to clear
   */
  setFocusAnchor(target?: string | HTMLElement | null): void {
    if (target === null) {
      this._focusAnchor = null;
      return;
    }
    const element =
      typeof target === 'string' ? this.registry.get(target) : target;

    // Default to the currently focused element if none provided.
    const elToSet = element === undefined ? this._focusedEl() : element;
    this._focusAnchor = elToSet;
  }

  /**
   * Restores focus to the element previously saved as the anchor.
   * The anchor is cleared after use.
   */
  returnToAnchor(): void {
    if (this._focusAnchor) {
      this.focus(this._focusAnchor);
      this._focusAnchor = null; // Clear the anchor after returning to it
    }
  }

  /** Checks if the given element is currently focused. */
  isFocused(el: HTMLElement | null): boolean {
    return el === this._focusedEl();
  }

  /** A simple registry to map string IDs to elements for easier focus management. */
  private registry = new Map<string, HTMLElement>();

  /** Register an element by ID */
  register(id: string, el: HTMLElement) {
    this.registry.set(id, el);
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
}
