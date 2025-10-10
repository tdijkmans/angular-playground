import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  BackgroundColorDirective,
  TextColorDirective,
} from '../design/color.directive';
import { Modal } from './components/modal/modal';
import { FocusDirective } from './focusmanagement/focus.directive';
import { FocusManagerService } from './focusmanagement/focus.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FocusDirective,
    Modal,
    BackgroundColorDirective,
    TextColorDirective,
  ],

  providers: [FocusManagerService],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  focusManageService = inject(FocusManagerService);
  isModalOpen = signal(false);

  appFocusId = signal<number>(2);

  changeFocus(id: number) {
    this.appFocusId.set(id === 2 ? 3 : 2);
  }

  openModal() {
    this.focusManageService.setFocusAnchor();
    this.isModalOpen.set(true);
  }

  openModal2() {
    this.focusManageService.setFocusAnchor();
    this.isModalOpen.set(true);
  }
}
