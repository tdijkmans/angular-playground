import { Component, signal, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editable-subject-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editable-subject-form.component.html',
  styleUrl: './editable-subject-form.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableSubjectFormComponent),
      multi: true
    }
  ]
})
export class EditableSubjectFormComponent implements ControlValueAccessor {
  // Internal signals for state management
  value = signal<string>('');
  disabled = signal<boolean>(false);
  editingActive = signal<boolean>(false);
  
  // Callbacks for form integration
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // UI interaction methods
  startEditing(): void {
    if (this.disabled()) return;
    this.editingActive.set(true);
  }

  cancelEditing(): void {
    this.editingActive.set(false);
    this.onTouched();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    const newValue = input.value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  onBlur(): void {
    this.editingActive.set(false);
    this.onTouched();
  }

  get remainingChars(): number {
    return 300 - this.value().length;
  }
}
