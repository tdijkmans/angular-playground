import { Component, ViewChildren, QueryList, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FocusService } from '../services/focus.service';

@Component({
  selector: 'app-focus-demo',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './focus-demo.component.html',
  styleUrl: './focus-demo.component.scss'
})
export class FocusDemoComponent {
  @ViewChildren('formInput') formInputs!: QueryList<ElementRef>;
  @ViewChildren('listItem') listItems!: QueryList<ElementRef>;
  @ViewChildren('dialogButton') dialogButtons!: QueryList<ElementRef>;
  @ViewChild('triggerButton') triggerButton!: ElementRef;
  @ViewChild('saveButton') saveButton!: ElementRef;

  showDialog = signal(false);
  showForm = signal(false);
  demoForm: FormGroup;
  formSubmitted = signal(false);

  constructor(
    private focusService: FocusService,
    private fb: FormBuilder
  ) {
    this.demoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  // Example 1: Dialog focus management
  openDialog() {
    this.showDialog.set(true);
    // Focus first element in dialog after it opens
    setTimeout(() => {
      this.focusService.focusFirst(this.dialogButtons);
    }, 0);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.focusService.restoreFocus();
  }

  // Example 2: Form validation focus
  toggleForm() {
    this.showForm.update(val => !val);
    if (this.showForm()) {
      setTimeout(() => {
        this.focusService.focusFirst(this.formInputs);
      }, 0);
    }
  }

  submitForm() {
    this.formSubmitted.set(true);
    Object.keys(this.demoForm.controls).forEach(key => {
      this.demoForm.get(key)?.markAsTouched();
    });

    if (this.demoForm.invalid) {
      // Focus the first invalid field
      setTimeout(() => {
        this.focusService.focusFirstInvalid(this.demoForm, this.formInputs);
      }, 0);
    } else {
      alert('Form submitted successfully!');
      this.demoForm.reset();
      this.formSubmitted.set(false);
    }
  }

  // Example 3: List navigation
  focusListItem(index: number) {
    this.focusService.focusAtIndex(this.listItems, index);
  }

  // Example 4: Save and restore focus
  saveCurrentFocus() {
    if (this.triggerButton) {
      this.focusService.focus(this.triggerButton);
    }
  }

  saveButtonFocus() {
    if (this.saveButton) {
      this.focusService.focus(this.saveButton);
    }
  }

  restoreSavedFocus() {
    this.focusService.restoreFocus();
  }

  // Example 5: Clear focus tracking
  clearFocus() {
    this.focusService.clearLastFocused();
  }
}
