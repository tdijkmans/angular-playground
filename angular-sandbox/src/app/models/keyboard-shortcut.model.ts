export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  
  /** Human-readable description of what the shortcut does */
  description: string;
  
  /** Key combination (e.g., 'ctrl+k', 'alt+h', '?') */
  keys: string;
  
  /** Category for grouping shortcuts in help displays */
  category?: string;
  
  /** Function to execute when shortcut is triggered */
  action: () => void;
  
  /** Whether this shortcut is currently enabled */
  enabled?: boolean;
  
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
}

export interface ShortcutKeyEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export interface ShortcutConfig {
  /** Whether keyboard shortcuts are globally enabled */
  enabled: boolean;
  
  /** Whether to show visual feedback when shortcuts are triggered */
  showFeedback: boolean;
  
  /** Duration in ms to show feedback messages */
  feedbackDuration: number;
  
  /** Whether shortcuts work when input elements are focused */
  enableInInputs: boolean;
}