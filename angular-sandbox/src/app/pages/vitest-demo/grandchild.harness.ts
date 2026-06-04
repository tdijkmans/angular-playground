import { DebugElement } from '@angular/core';

import { getByTestId } from '../../../test-utils';

export class GrandchildHarness {
  constructor(private readonly el: DebugElement) {}

  get actionButton(): HTMLElement {
    return getByTestId(this.el, 'grandchild-btn');
  }

  clickActionButton(): void {
    this.actionButton.click();
  }
}
