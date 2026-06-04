import { DebugElement, Type } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Extracts a child component's TypeScript instance from within a DebugElement tree.
 */
export function getChildInstance<T>(el: DebugElement, componentClass: Type<T>): T {
  const found = el.query(By.directive(componentClass));
  if (!found) {
    throw new Error(`getChildInstance: no element found for ${componentClass.name}`);
  }
  return found.componentInstance as T;
}

/**
 * Extracts a child component's DebugElement for further nested harnessing.
 */
export function getChildEl(el: DebugElement, componentClass: Type<unknown>): DebugElement {
  const found = el.query(By.directive(componentClass));
  if (!found) {
    throw new Error(`getChildEl: no element found for ${componentClass.name}`);
  }
  return found;
}

/**
 * Queries a native HTMLElement by its `data-testid` attribute.
 */
export function getByTestId(el: DebugElement, testId: string): HTMLElement {
  const found = el.query(By.css(`[data-testid="${testId}"]`));
  if (!found) {
    throw new Error(`getByTestId: no element found with data-testid="${testId}"`);
  }
  return found.nativeElement as HTMLElement;
}
