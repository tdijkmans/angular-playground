import { Component, signal, computed } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';

@Component({
  selector: 'app-keyboard-shortcuts-help',
  standalone: true,
  imports: [CommonModule, KeyValuePipe],
  templateUrl: './keyboard-shortcuts-help.component.html',
  styleUrl: './keyboard-shortcuts-help.component.scss'
})
export class KeyboardShortcutsHelpComponent {
  isVisible = signal(false);

  shortcutsByCategory = computed(() => this.keyboardService.shortcutsByCategory());

  constructor(private keyboardService: KeyboardShortcutsService) {}

  show(): void {
    this.isVisible.set(true);
  }

  hide(): void {
    this.isVisible.set(false);
  }

  toggle(): void {
    this.isVisible.update(visible => !visible);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.hide();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hide();
      event.preventDefault();
    }
  }

  formatKeys(keys: string): string {
    return keys.split('+')
      .map(key => key.trim())
      .map(key => {
        // Format common keys for better display
        switch (key.toLowerCase()) {
          case 'ctrl':
          case 'control':
            return 'Ctrl';
          case 'alt':
            return 'Alt';
          case 'shift':
            return 'Shift';
          case 'meta':
          case 'cmd':
          case 'command':
            return '⌘';
          default:
            return key.toUpperCase();
        }
      })
      .join(' + ');
  }

  // Helper method to check if shortcuts object is empty
  hasNoShortcuts(): boolean {
    return Object.keys(this.shortcutsByCategory()).length === 0;
  }
}