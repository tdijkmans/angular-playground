# Keyboard Shortcuts Documentation

## Overview

This Angular application now includes a comprehensive keyboard shortcuts system that enhances accessibility and user experience through global event listeners, configurable keybindings, and clear visual feedback.

## Available Shortcuts

### General
- `?` - Show keyboard shortcuts help dialog
- `F1` - Show keyboard shortcuts help dialog (alternative)
- `ESC` - Close help dialog (when open)

### Navigation
- `Ctrl+1` - Focus the single select combobox
- `Ctrl+2` - Focus the multiple select combobox

### Actions
- `Ctrl+Shift+1` - Clear the single select combobox selection
- `Ctrl+Shift+2` - Clear the multiple select combobox selection

## Features

### 🎯 Core Functionality
- **Global Event Listeners**: Keyboard events are captured at the document level
- **Smart Input Detection**: Shortcuts automatically disabled when typing in input elements
- **Real-time Feedback**: Visual notifications show when shortcuts are activated
- **Category Organization**: Shortcuts are grouped logically for better discoverability

### ♿ Accessibility
- **ARIA Compliant**: Proper labels and screen reader support
- **Keyboard Navigation**: Full keyboard accessibility for all components
- **Focus Management**: Intelligent focus handling that works with existing components
- **No Conflicts**: Shortcuts designed to not interfere with existing keyboard navigation

### ⚡ Performance
- **Efficient Event Handling**: Minimal performance overhead
- **Memory Management**: Proper cleanup and event listener management
- **Debounced Feedback**: Optimized visual feedback system

### 🎨 User Experience
- **Beautiful Help Dialog**: Modern, responsive design with dark mode support
- **Visual Feedback**: Toast-style notifications for shortcut activation
- **Progressive Disclosure**: Help hint visible on page, full help on demand
- **Escape Hatch**: Multiple ways to close dialogs and cancel actions

## Architecture

### KeyboardShortcutsService
The core service that manages all keyboard shortcuts:
- Registers and unregisters shortcuts
- Handles global keyboard events
- Provides configuration options
- Manages enabled/disabled state

### KeyboardShortcutsHelpComponent
A modal component that displays available shortcuts:
- Organized by category
- Keyboard-accessible
- Responsive design
- Easy to extend

### Type Safety
Full TypeScript support with:
- `KeyboardShortcut` interface
- `ShortcutConfig` interface
- `ShortcutKeyEvent` interface

## Usage

### Registering Shortcuts
```typescript
this.keyboardService.registerShortcut({
  id: 'my-shortcut',
  keys: 'ctrl+k',
  description: 'My custom shortcut',
  category: 'Custom',
  action: () => this.myAction()
});
```

### Configuration
```typescript
this.keyboardService.updateConfig({
  enabled: true,
  showFeedback: true,
  feedbackDuration: 2000,
  enableInInputs: false
});
```

## Testing

Comprehensive test coverage includes:
- Unit tests for the keyboard shortcuts service
- Component tests for the help dialog
- Manual testing of all shortcuts
- Accessibility testing
- Performance testing

## Browser Support

Works in all modern browsers that support:
- ES6+ features
- Angular 20
- CSS Grid and Flexbox
- Modern keyboard event handling

## Contributing

When adding new shortcuts:
1. Choose non-conflicting key combinations
2. Add appropriate categories
3. Provide clear descriptions
4. Test for accessibility
5. Update documentation