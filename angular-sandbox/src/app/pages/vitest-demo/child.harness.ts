import { DebugElement } from '@angular/core';

import { getChildEl } from '../../../test-utils';
import { GrandchildComponent } from './grandchild.component';
import { GrandchildHarness } from './grandchild.harness';

export class ChildHarness {
  constructor(private readonly el: DebugElement) {}

  get grandchild(): GrandchildHarness {
    return new GrandchildHarness(getChildEl(this.el, GrandchildComponent));
  }
}
