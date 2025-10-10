import { Component, output, signal } from '@angular/core';
import { FocusDirective } from '../../focusmanagement/focus.directive';
import { FocusManagerService } from '../../focusmanagement/focus.service';

@Component({
  selector: 'app-modal',
  imports: [FocusDirective],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  closed = output<void>();
  isOpen = signal(true);

  constructor(private focusManager: FocusManagerService) {}

  close() {
    this.isOpen.set(false);
    this.closed.emit();
    this.focusManager.returnToAnchor();
  }

  focusLookAtMe() {
    this.focusManager.focus('look-at-me');
  }

  goOn() {
    this.isOpen.set(false);
    this.closed.emit();
    this.focusManager.focus('go-on');
  }
}
