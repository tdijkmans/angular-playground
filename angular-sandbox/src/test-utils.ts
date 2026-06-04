import { DebugElement, Type } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Extracts a child component's TypeScript instance from within a DebugElement tree.
 */
export function getChildInstance<T>(el: DebugElement, componentClass: Type<T>): T {
  return el.query(By.directive(componentClass)).componentInstance as T;
}

/**
 * Extracts a child component's DebugElement for further nested harnessing.
 */
export function getChildEl(el: DebugElement, componentClass: Type<unknown>): DebugElement {
  return el.query(By.directive(componentClass));
}

/**
 * Queries a native HTMLElement by its `data-testid` attribute.
 */
export function getByTestId(el: DebugElement, testId: string): HTMLElement {
  return el.query(By.css(`[data-testid="${testId}"]`)).nativeElement as HTMLElement;
}
