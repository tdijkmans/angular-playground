import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { getChildEl } from '../../../test-utils';
import { ChildComponent } from './child.component';
import { ChildHarness } from './child.harness';

export class ParentHarness {
  constructor(private readonly el: DebugElement) {}

  get statusElement(): HTMLElement {
    return this.el.query(By.css('[role="status"]')).nativeElement as HTMLElement;
  }

  get child(): ChildHarness {
    return new ChildHarness(getChildEl(this.el, ChildComponent));
  }
}
