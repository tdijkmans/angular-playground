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
    this.fm.monitor(document.body, true).subscribe((origin) => {
      this._focusedEl.set(
        origin ? (document.activeElement as HTMLElement) : null
      );
    });
  }

  ngOnDestroy(): void {
    this.fm.stopMonitoring(document.body);
  }

  // --- Public API ---

  focus(target: string | HTMLElement | null): void {
    const el =
      typeof target === 'string'
        ? this.registry.get(target)?.el ?? null
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
    this._focusAnchor = element === undefined ? this._focusedEl() : element;
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

  // --- Registration ---
  register(entry: FocusEntry) {
    // Check for duplicate IDs
    if (this.registry.has(entry.id)) {
      console.warn(
        `Duplicate focusId "${entry.id}" detected. Please ensure all focusId values are unique to avoid unexpected behavior.`
      );
    }
    this.registry.set(entry.id, entry);
  }

  unregister(id: string) {
    // Clear focus if the unregistered element was focused
    if (this.isFocused(this.registry.get(id)?.el ?? null)) {
      this._focusedEl.set(null);
    }
    this.registry.delete(id);
  }

  // --- 1D Navigation ---

  navigate(currentId: string, direction: 1 | -1, loop: boolean): void {
    const current = this.registry.get(currentId);
    if (!current) return;

    const items = [...this.registry.values()]
      .filter((x) => x.group === current.group)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const i = items.findIndex((x) => x.id === currentId);
    if (i === -1) return;

    let targetIndex = i + direction;

    if (loop) {
      targetIndex = (targetIndex + items.length) % items.length;
    } else if (targetIndex < 0 || targetIndex >= items.length) {
      return; // Stop at the edge
    }

    this.focus(items[targetIndex]?.el);
  }

  // --- 2D Navigation ---

  navigate2D(
    currentId: string,
    rowDelta: -1 | 0 | 1,
    colDelta: -1 | 0 | 1,
    loop = true // optionally configurable
  ): void {
    const current = this.registry.get(currentId);
    if (!current || current.row === undefined || current.col === undefined)
      return;

    const items = [...this.registry.values()]
      .filter((x) => x.group === current.group)
      .sort((a, b) =>
        a.row === b.row
          ? (a.col ?? 0) - (b.col ?? 0)
          : (a.row ?? 0) - (b.row ?? 0)
      );

    // Find max rows and cols
    const rows = [...new Set(items.map((x) => x.row ?? 0))].sort(
      (a, b) => a - b
    );
    const cols = [...new Set(items.map((x) => x.col ?? 0))].sort(
      (a, b) => a - b
    );

    const rowIndex = rows.indexOf(current.row);
    const colIndex = cols.indexOf(current.col);

    let targetRowIndex = rowIndex + rowDelta;
    let targetColIndex = colIndex + colDelta;

    // Handle looping
    if (loop) {
      if (targetRowIndex < 0) targetRowIndex = rows.length - 1;
      if (targetRowIndex >= rows.length) targetRowIndex = 0;
      if (targetColIndex < 0) targetColIndex = cols.length - 1;
      if (targetColIndex >= cols.length) targetColIndex = 0;
    } else {
      // Stop at edges
      if (
        targetRowIndex < 0 ||
        targetRowIndex >= rows.length ||
        targetColIndex < 0 ||
        targetColIndex >= cols.length
      ) {
        return;
      }
    }

    const targetRow = rows[targetRowIndex];
    const targetCol = cols[targetColIndex];

    // Find the element at the new row/col
    const target = items.find(
      (item) => item.row === targetRow && item.col === targetCol
    );

    if (target) this.focus(target.el);
  }
}
