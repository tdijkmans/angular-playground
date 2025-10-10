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

  menu = [
    { id: 1, label: 'Home' },
    { id: 2, label: 'About' },
    { id: 3, label: 'Services' },
    { id: 4, label: 'Contact' },
  ];

  tabs = [
    { id: 1, label: 'Tab 1' },
    { id: 2, label: 'Tab 2' },
    { id: 3, label: 'Tab 3' },
    { id: 4, label: 'Tab 4' },
  ];

  getGrid(rows: number, cols: number) {
    const grid: { label: string; row: number; col: number; id: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.push({
          label: `Cell ${r + 1}-${c + 1}`,
          row: r,
          col: c,
          id: r * cols + c + 1,
        });
      }
    }
    return grid;
  }

  grid = this.getGrid(4, 4);

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
