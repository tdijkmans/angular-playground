import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { AutoSaveDirective } from './auto-save.directive';
import { FormPersistenceService } from '../services/form-persistence.service';

@Component({
  imports: [ReactiveFormsModule, AutoSaveDirective],
  template: `
    <form
      [formGroup]="form"
      appAutoSave
      [formId]="formId"
      [caseId]="caseId"
      (draftLoaded)="onDraftLoaded()"
      (autoSaveStatus)="onStatus($event)"
    >
      <input formControlName="name" />
      <input formControlName="email" />
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
  });
  formId = 'test_form';
  caseId = 'case_1';
  draftWasLoaded = false;
  lastStatus: string | null = null;

  onDraftLoaded() {
    this.draftWasLoaded = true;
  }

  onStatus(status: string) {
    this.lastStatus = status;
  }
}

describe('AutoSaveDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let persistence: FormPersistenceService;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    persistence = TestBed.inject(FormPersistenceService);
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create the directive', () => {
    fixture.detectChanges();
    expect(host).toBeTruthy();
  });

  it('should hydrate the form from sessionStorage on init', () => {
    persistence.setItem('test_form', 'case_1', { name: 'Jane', email: 'jane@example.com' });

    fixture.detectChanges(); // triggers ngOnInit

    expect(host.form.value).toEqual({ name: 'Jane', email: 'jane@example.com' });
    expect(host.draftWasLoaded).toBeTrue();
  });

  it('should not emit draftLoaded when no draft exists', () => {
    fixture.detectChanges();

    expect(host.draftWasLoaded).toBeFalse();
  });

  it('should auto-save to sessionStorage after debounce', fakeAsync(() => {
    fixture.detectChanges();

    host.form.controls['name'].setValue('Alice');
    tick(500); // not yet
    expect(persistence.getItem('test_form', 'case_1')).toBeNull();

    tick(600); // 1100ms total — debounce fires
    expect(persistence.getItem('test_form', 'case_1')).toEqual({
      name: 'Alice',
      email: '',
    });
    expect(host.lastStatus).toBe('saved');
  }));

  it('should debounce rapid typing', fakeAsync(() => {
    fixture.detectChanges();

    host.form.controls['name'].setValue('A');
    tick(500);
    host.form.controls['name'].setValue('Al');
    tick(500);
    host.form.controls['name'].setValue('Ali');
    tick(1100);

    const saved = persistence.getItem('test_form', 'case_1');
    expect(saved).toEqual({ name: 'Ali', email: '' });
  }));

  it('should isolate drafts between different caseIds', fakeAsync(() => {
    persistence.setItem('test_form', 'case_1', { name: 'Case1', email: '' });
    persistence.setItem('test_form', 'case_2', { name: 'Case2', email: '' });

    fixture.detectChanges();

    // host.caseId is 'case_1', so it should hydrate from case_1
    expect(host.form.value).toEqual({ name: 'Case1', email: '' });
  }));

  it('should use patchValue so extra stored fields do not crash', () => {
    persistence.setItem('test_form', 'case_1', {
      name: 'Jane',
      email: 'j@example.com',
      nonexistent: 'extra',
    });

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(host.form.value).toEqual({ name: 'Jane', email: 'j@example.com' });
  });

  it('should clear the draft via the service removeItem method', fakeAsync(() => {
    fixture.detectChanges();

    host.form.controls['name'].setValue('Draft');
    tick(1100);
    expect(persistence.getItem('test_form', 'case_1')).not.toBeNull();

    persistence.removeItem('test_form', 'case_1');
    expect(persistence.getItem('test_form', 'case_1')).toBeNull();
  }));
});
