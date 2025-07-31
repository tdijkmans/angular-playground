import { Injectable, signal, computed } from '@angular/core';
import { KeyboardShortcut, ShortcutKeyEvent, ShortcutConfig } from '../models/keyboard-shortcut.model';

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private shortcuts = signal<KeyboardShortcut[]>([]);
  private config = signal<ShortcutConfig>({
    enabled: true,
    showFeedback: true,
    feedbackDuration: 2000,
    enableInInputs: false
  });

  private keydownListener?: (event: KeyboardEvent) => void;
  private isListening = false;

  // Public computed signals
  readonly allShortcuts = computed(() => this.shortcuts());
  readonly enabledShortcuts = computed(() => 
    this.shortcuts().filter(shortcut => shortcut.enabled !== false)
  );
  readonly shortcutsByCategory = computed(() => {
    const shortcuts = this.enabledShortcuts();
    const categories: Record<string, KeyboardShortcut[]> = {};
    
    shortcuts.forEach(shortcut => {
      const category = shortcut.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(shortcut);
    });
    
    return categories;
  });

  readonly isEnabled = computed(() => this.config().enabled);

  constructor() {
    this.startListening();
  }

  /**
   * Registers a new keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    const currentShortcuts = this.shortcuts();
    const existingIndex = currentShortcuts.findIndex(s => s.id === shortcut.id);
    
    if (existingIndex >= 0) {
      // Update existing shortcut
      const updated = [...currentShortcuts];
      updated[existingIndex] = { ...shortcut };
      this.shortcuts.set(updated);
    } else {
      // Add new shortcut
      this.shortcuts.set([...currentShortcuts, { ...shortcut }]);
    }
  }

  /**
   * Registers multiple shortcuts at once
   */
  registerShortcuts(shortcuts: KeyboardShortcut[]): void {
    shortcuts.forEach(shortcut => this.registerShortcut(shortcut));
  }

  /**
   * Unregisters a shortcut by ID
   */
  unregisterShortcut(id: string): void {
    const currentShortcuts = this.shortcuts();
    this.shortcuts.set(currentShortcuts.filter(s => s.id !== id));
  }

  /**
   * Updates the configuration
   */
  updateConfig(config: Partial<ShortcutConfig>): void {
    this.config.update(current => ({ ...current, ...config }));
  }

  /**
   * Gets current configuration
   */
  getConfig(): ShortcutConfig {
    return this.config();
  }

  /**
   * Enables or disables a specific shortcut
   */
  toggleShortcut(id: string, enabled?: boolean): void {
    const currentShortcuts = this.shortcuts();
    const index = currentShortcuts.findIndex(s => s.id === id);
    
    if (index >= 0) {
      const updated = [...currentShortcuts];
      updated[index] = { 
        ...updated[index], 
        enabled: enabled !== undefined ? enabled : !updated[index].enabled 
      };
      this.shortcuts.set(updated);
    }
  }

  /**
   * Starts listening for keyboard events
   */
  private startListening(): void {
    if (this.isListening) return;

    this.keydownListener = (event: KeyboardEvent) => {
      if (!this.config().enabled) return;

      // Check if shortcuts should work in input elements
      if (!this.config().enableInInputs && this.isInputElement(event.target)) {
        return;
      }

      const shortcutEvent: ShortcutKeyEvent = {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      };

      this.handleKeyboardEvent(event, shortcutEvent);
    };

    document.addEventListener('keydown', this.keydownListener, true);
    this.isListening = true;
  }

  /**
   * Stops listening for keyboard events
   */
  private stopListening(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener, true);
      this.keydownListener = undefined;
      this.isListening = false;
    }
  }

  /**
   * Handles keyboard events and triggers matching shortcuts
   */
  private handleKeyboardEvent(event: KeyboardEvent, shortcutEvent: ShortcutKeyEvent): void {
    const enabledShortcuts = this.enabledShortcuts();
    
    for (const shortcut of enabledShortcuts) {
      if (this.matchesShortcut(shortcut, shortcutEvent)) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        if (shortcut.stopPropagation !== false) {
          event.stopPropagation();
        }
        
        try {
          shortcut.action();
          this.showFeedback(shortcut);
        } catch (error) {
          console.error('Error executing keyboard shortcut:', error);
        }
        
        break; // Only execute the first matching shortcut
      }
    }
  }

  /**
   * Checks if a keyboard event matches a shortcut
   */
  private matchesShortcut(shortcut: KeyboardShortcut, event: ShortcutKeyEvent): boolean {
    const keys = shortcut.keys.toLowerCase();
    const parts = keys.split('+').map(p => p.trim());
    
    let hasCtrl = false;
    let hasAlt = false;
    let hasShift = false;
    let hasMeta = false;
    let mainKey = '';
    
    parts.forEach(part => {
      switch (part) {
        case 'ctrl':
        case 'control':
          hasCtrl = true;
          break;
        case 'alt':
          hasAlt = true;
          break;
        case 'shift':
          hasShift = true;
          break;
        case 'meta':
        case 'cmd':
        case 'command':
          hasMeta = true;
          break;
        default:
          mainKey = part;
          break;
      }
    });
    
    // Check modifiers match
    if (event.ctrlKey !== hasCtrl) return false;
    if (event.altKey !== hasAlt) return false;
    if (event.shiftKey !== hasShift) return false;
    if (event.metaKey !== hasMeta) return false;
    
    // Check main key matches
    const eventKey = event.key.toLowerCase();
    return eventKey === mainKey || event.code.toLowerCase() === mainKey.toLowerCase();
  }

  /**
   * Checks if the target is an input element
   */
  private isInputElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Element)) return false;
    
    const tagName = target.tagName.toLowerCase();
    return ['input', 'textarea', 'select'].includes(tagName) ||
           target.hasAttribute('contenteditable') ||
           target.getAttribute('role') === 'textbox';
  }

  /**
   * Shows visual feedback for a triggered shortcut
   */
  private showFeedback(shortcut: KeyboardShortcut): void {
    if (!this.config().showFeedback) return;
    
    // Create a simple toast notification
    const feedback = document.createElement('div');
    feedback.className = 'keyboard-shortcut-feedback';
    feedback.textContent = `${shortcut.keys.toUpperCase()}: ${shortcut.description}`;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    `;
    
    document.body.appendChild(feedback);
    
    // Fade in
    setTimeout(() => {
      feedback.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 200);
    }, this.config().feedbackDuration);
  }

  /**
   * Cleanup method to be called when service is destroyed
   */
  ngOnDestroy(): void {
    this.stopListening();
  }
}