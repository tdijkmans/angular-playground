# FocusService

A comprehensive Angular service for managing focus in your application using Angular CDK's FocusMonitor.

## Features

- **Focus Management**: Programmatically set and track focus on elements
- **Focus Restoration**: Remember and restore focus to previously focused elements
- **Form Validation**: Automatically focus invalid form fields
- **List Navigation**: Focus specific items in QueryLists
- **Focus Origin Tracking**: Track how focus was applied (keyboard, mouse, or programmatic)
- **Route Change Support**: Integration with Angular Router for focus management across navigation

## Installation

The service uses `@angular/cdk/a11y` which is already included in the project dependencies.

## Usage

### Basic Usage

```typescript
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FocusService } from './services/focus.service';

@Component({
  selector: 'app-example',
  template: `
    <button #myButton>Click me</button>
    <button (click)="focusFirstButton()">Focus First Button</button>
  `
})
export class ExampleComponent {
  @ViewChild('myButton') myButton!: ElementRef;

  constructor(private focusService: FocusService) {}

  focusFirstButton() {
    this.focusService.focus(this.myButton);
  }
}
```

### Dialog Focus Management

```typescript
openDialog() {
  // Save current focus
  this.focusService.focus(this.triggerButton);
  
  this.showDialog = true;
  
  // Focus first element in dialog
  setTimeout(() => {
    this.focusService.focusFirst(this.dialogButtons);
  }, 0);
}

closeDialog() {
  this.showDialog = false;
  // Restore focus to trigger button
  this.focusService.restoreFocus();
}
```

### Form Validation Focus

```typescript
submitForm() {
  if (this.form.invalid) {
    // Mark all fields as touched
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
    
    // Focus the first invalid field
    this.focusService.focusFirstInvalid(this.form, this.formInputs);
  }
}
```

### List Navigation

```typescript
@ViewChildren('listItem') listItems!: QueryList<ElementRef>;

focusItem(index: number) {
  this.focusService.focusAtIndex(this.listItems, index);
}
```

## API Reference

### Methods

#### `focus(el: ElementRef, origin?: 'keyboard' | 'mouse' | 'program')`
Set focus on an element and remember it for later restoration.

**Parameters:**
- `el`: The ElementRef to focus
- `origin`: How the focus should be applied (default: 'program')

#### `restoreFocus()`
Restore focus to the last remembered element.

#### `focusFirst(elements: QueryList<ElementRef>)`
Focus the first element in a QueryList.

**Parameters:**
- `elements`: QueryList of elements

#### `focusFirstInvalid(formGroup: FormGroup, elements: QueryList<ElementRef>)`
Focus the first invalid form field.

**Parameters:**
- `formGroup`: The FormGroup to check for invalid fields
- `elements`: QueryList of form input elements

#### `focusAtIndex(elements: QueryList<ElementRef>, index: number)`
Focus a specific element by index in a QueryList.

**Parameters:**
- `elements`: QueryList of elements
- `index`: Zero-based index of the element to focus

#### `clearLastFocused()`
Clear the reference to the last focused element.

#### `stopMonitoring(el: ElementRef)`
Stop monitoring an element for focus changes.

**Parameters:**
- `el`: The ElementRef to stop monitoring

## Examples

See the comprehensive examples in the Focus Service Demo page of the application.

## Best Practices

1. **Accessibility**: Always provide a logical focus order and restore focus appropriately
2. **Timing**: Use `setTimeout` when focusing elements that are conditionally rendered
3. **Cleanup**: Stop monitoring elements when they are destroyed to prevent memory leaks
4. **Origin**: Use appropriate focus origin ('keyboard' for tab navigation, 'mouse' for clicks, 'program' for programmatic focus)

## Integration with Angular CDK

This service leverages Angular CDK's `FocusMonitor` which provides:
- Focus origin detection
- Focus trap capabilities
- Cross-browser focus management
- Accessibility features

## License

Part of the angular-sandbox project.
