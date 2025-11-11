import { Component, EventEmitter, Output, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editable-subject',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editable-subject.component.html',
  styleUrl: './editable-subject.component.scss'
})
export class EditableSubjectComponent {
  // Input signals
  subject = input('');
  patchUrl = input<string | undefined>(undefined);
  patchKey = input('subject');

  // Output EventEmitters
  @Output() subjectSaved = new EventEmitter<string>();
  @Output() subjectReset = new EventEmitter<void>();

  // Internal signals
  initialValue = signal('');
  currentValue = signal('');
  editingActive = signal(false);
  saving = signal(false);
  statusMessage = signal('');

  // Computed signals
  changed = computed(() => this.currentValue() !== this.initialValue());
  remainingChars = computed(() => 300 - this.currentValue().length);

  constructor() {
    // Initialize signals when subject input changes
    // Using effect would be more appropriate here, but keeping it simple
    // The initialization will happen through the template or lifecycle
  }

  ngOnInit() {
    // Initialize the signals with the input value
    const subjectValue = this.subject();
    this.initialValue.set(subjectValue);
    this.currentValue.set(subjectValue);
  }

  startEditing() {
    this.editingActive.set(true);
    this.statusMessage.set('');
  }

  cancelEditing() {
    this.currentValue.set(this.initialValue());
    this.editingActive.set(false);
    this.statusMessage.set('');
    this.subjectReset.emit();
  }

  async saveChanges() {
    if (!this.changed()) {
      return;
    }

    this.saving.set(true);
    this.statusMessage.set('Saving...');

    try {
      const url = this.patchUrl();
      if (url) {
        // Perform PATCH request
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [this.patchKey()]: this.currentValue()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save');
        }
      }

      // Update the initial value to the saved value
      this.initialValue.set(this.currentValue());
      this.editingActive.set(false);
      this.statusMessage.set('Saved successfully!');
      this.subjectSaved.emit(this.currentValue());

      // Clear status message after 3 seconds
      setTimeout(() => {
        this.statusMessage.set('');
      }, 3000);
    } catch (error) {
      this.statusMessage.set('Error saving changes');
      console.error('Error saving subject:', error);
    } finally {
      this.saving.set(false);
    }
  }

  updateCurrentValue(value: string) {
    this.currentValue.set(value);
  }
}
