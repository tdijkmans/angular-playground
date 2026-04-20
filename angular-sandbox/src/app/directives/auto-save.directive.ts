import {
  Directive,
  DestroyRef,
  inject,
  input,
  output,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroupDirective } from '@angular/forms';
import { debounceTime } from 'rxjs';

import { FormPersistenceService } from '../services/form-persistence.service';

export type AutoSaveStatus = 'saving' | 'saved';

@Directive({
  selector: '[appAutoSave]',
})
export class AutoSaveDirective implements OnInit {
  readonly formId = input.required<string>();
  readonly caseId = input.required<string>();

  /** Emits when a previously saved draft is loaded into the form. */
  readonly draftLoaded = output<void>();

  /** Emits the current persistence status. */
  readonly autoSaveStatus = output<AutoSaveStatus>();

  private formGroupDirective = inject(FormGroupDirective);
  private persistence = inject(FormPersistenceService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.hydrate();
    this.listenForChanges();
  }

  private hydrate(): void {
    const saved = this.persistence.getItem(this.formId(), this.caseId());
    if (saved) {
      this.formGroupDirective.form.patchValue(saved, { emitEvent: false });
      this.draftLoaded.emit();
    }
  }

  private listenForChanges(): void {
    this.formGroupDirective.form.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.autoSaveStatus.emit('saving');
        this.persistence.setItem(
          this.formId(),
          this.caseId(),
          value as Record<string, unknown>,
        );
        this.autoSaveStatus.emit('saved');
      });
  }
}
