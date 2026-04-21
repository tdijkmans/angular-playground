import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AutoSaveDirective, AutoSaveStatus } from '../../directives/auto-save.directive';
import { FormPersistenceService } from '../../services/form-persistence.service';

@Component({
  selector: 'app-auto-save-demo',
  imports: [ReactiveFormsModule, AutoSaveDirective],
  templateUrl: './auto-save-demo.html',
  styleUrl: './auto-save-demo.scss',
})
export class AutoSaveDemoComponent {
  private persistence = inject(FormPersistenceService);

  protected readonly formId = 'assessment_v1';
  protected readonly caseId = 'case_42';

  protected form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    notes: new FormControl(''),
  });

  protected draftNotice = false;
  protected status: AutoSaveStatus | null = null;

  onDraftLoaded(): void {
    this.draftNotice = true;
  }

  onStatusChange(status: AutoSaveStatus): void {
    this.status = status;
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Simulate successful submission
      this.persistence.removeItem(this.formId, this.caseId);
      this.form.reset();
      this.draftNotice = false;
      this.status = null;
    }
  }

  dismissNotice(): void {
    this.draftNotice = false;
  }
}
