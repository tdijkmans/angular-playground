import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditableSubjectFormComponent } from '../editable-subject-form/editable-subject-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-based-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditableSubjectFormComponent],
  template: `
    <div class="page-container">
      <h1>EditableSubjectFormComponent - Form-Integrated Version</h1>
      <p class="description">
        This version implements ControlValueAccessor and integrates seamlessly with Angular Reactive Forms.
        It supports form validation, disabled state, and two-way binding with form controls.
      </p>
      
      <div class="demo-section">
        <h3>Example 1: Integrated with Reactive Form</h3>
        <form [formGroup]="demoForm" class="form-demo">
          <div class="form-group">
            <label>Subject (Required, Min 5 chars):</label>
            <app-editable-subject-form formControlName="subject"></app-editable-subject-form>
            @if (demoForm.get('subject')?.invalid && demoForm.get('subject')?.touched) {
              <div class="validation-error">
                @if (demoForm.get('subject')?.errors?.['required']) {
                  Subject is required
                }
                @if (demoForm.get('subject')?.errors?.['minlength']) {
                  Subject must be at least 5 characters
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label>Description (Optional):</label>
            <app-editable-subject-form formControlName="description"></app-editable-subject-form>
          </div>

          <div class="form-actions">
            <button type="button" (click)="submitForm()" [disabled]="demoForm.invalid">
              Submit Form
            </button>
            <button type="button" (click)="resetForm()">
              Reset Form
            </button>
            <button type="button" (click)="toggleDisabled()">
              {{ demoForm.disabled ? 'Enable' : 'Disable' }} Form
            </button>
            <button type="button" (click)="fillSampleData()">
              Fill Sample Data
            </button>
          </div>
        </form>

        <div class="form-state">
          <h4>Form State:</h4>
          <pre>{{ getFormState() }}</pre>
        </div>
      </div>

      <div class="submissions">
        <h3>Form Submissions:</h3>
        <div class="submissions-content">
          @for (submission of submissions; track $index) {
            <div class="submission-entry">
              <strong>Submitted at {{ submission.timestamp }}:</strong>
              <pre>{{ submission.data }}</pre>
            </div>
          }
          @empty {
            <div class="empty-state">No submissions yet...</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      color: #333;
      margin-bottom: 0.5rem;
    }

    .description {
      color: #666;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .demo-section {
      margin-bottom: 2rem;

      h3 {
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        color: #555;
      }
    }

    .form-demo {
      background-color: #f8f9fa;
      padding: 1.5rem;
      border-radius: 4px;
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #333;
      }

      app-editable-subject-form {
        display: block;
      }
    }

    .validation-error {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      button {
        padding: 0.5rem 1rem;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;

        &:hover:not(:disabled) {
          background-color: #218838;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &:nth-child(2) {
          background-color: #6c757d;
          
          &:hover:not(:disabled) {
            background-color: #5a6268;
          }
        }

        &:nth-child(3) {
          background-color: #ffc107;
          color: #333;
          
          &:hover:not(:disabled) {
            background-color: #e0a800;
          }
        }

        &:nth-child(4) {
          background-color: #17a2b8;
          
          &:hover:not(:disabled) {
            background-color: #138496;
          }
        }
      }
    }

    .form-state {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 4px;

      h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }

      pre {
        margin: 0;
        font-family: monospace;
        font-size: 0.875rem;
        white-space: pre-wrap;
      }
    }

    .submissions {
      margin-top: 3rem;

      h3 {
        margin-bottom: 1rem;
      }

      .submissions-content {
        max-height: 400px;
        overflow-y: auto;
      }

      .submission-entry {
        padding: 1rem;
        margin-bottom: 1rem;
        background-color: #f8f9fa;
        border-left: 3px solid #28a745;
        border-radius: 4px;

        strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        pre {
          margin: 0;
          font-family: monospace;
          font-size: 0.875rem;
          white-space: pre-wrap;
        }
      }

      .empty-state {
        color: #999;
        font-style: italic;
        padding: 2rem;
        text-align: center;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
    }
  `]
})
export class FormBasedPageComponent {
  demoForm = new FormGroup({
    subject: new FormControl('', [Validators.required, Validators.minLength(5)]),
    description: new FormControl('')
  });

  submissions: Array<{ timestamp: string; data: string }> = [];

  submitForm() {
    if (this.demoForm.valid) {
      const timestamp = new Date().toLocaleTimeString();
      this.submissions.unshift({
        timestamp,
        data: JSON.stringify(this.demoForm.value, null, 2)
      });
    }
  }

  resetForm() {
    this.demoForm.reset();
  }

  toggleDisabled() {
    if (this.demoForm.disabled) {
      this.demoForm.enable();
    } else {
      this.demoForm.disable();
    }
  }

  fillSampleData() {
    this.demoForm.patchValue({
      subject: 'Sample subject for testing the form integration',
      description: 'This is a sample description to demonstrate the form-based editable component with ControlValueAccessor.'
    });
  }

  getFormState() {
    return JSON.stringify({
      value: this.demoForm.value,
      valid: this.demoForm.valid,
      pristine: this.demoForm.pristine,
      touched: this.demoForm.touched,
      disabled: this.demoForm.disabled
    }, null, 2);
  }
}
