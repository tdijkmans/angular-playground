import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditableSubjectComponent } from './editable-subject.component';

describe('EditableSubjectComponent', () => {
  let component: EditableSubjectComponent;
  let fixture: ComponentFixture<EditableSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableSubjectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditableSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.subject()).toBe('');
    expect(component.patchUrl()).toBeUndefined();
    expect(component.patchKey()).toBe('subject');
    expect(component.editingActive()).toBe(false);
    expect(component.saving()).toBe(false);
  });

  it('should initialize internal signals from subject input', () => {
    fixture = TestBed.createComponent(EditableSubjectComponent);
    fixture.componentRef.setInput('subject', 'Test Subject');
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.initialValue()).toBe('Test Subject');
    expect(component.currentValue()).toBe('Test Subject');
  });

  it('should compute changed correctly', () => {
    component.ngOnInit();
    expect(component.changed()).toBe(false);

    component.currentValue.set('New Value');
    expect(component.changed()).toBe(true);
  });

  it('should compute remainingChars correctly', () => {
    component.currentValue.set('Hello');
    expect(component.remainingChars()).toBe(295); // 300 - 5

    component.currentValue.set('a'.repeat(250));
    expect(component.remainingChars()).toBe(50);
  });

  it('should start editing mode', () => {
    component.startEditing();
    expect(component.editingActive()).toBe(true);
    expect(component.statusMessage()).toBe('');
  });

  it('should cancel editing and reset value', () => {
    component.initialValue.set('Original');
    component.currentValue.set('Modified');
    component.editingActive.set(true);

    spyOn(component.subjectReset, 'emit');

    component.cancelEditing();

    expect(component.currentValue()).toBe('Original');
    expect(component.editingActive()).toBe(false);
    expect(component.statusMessage()).toBe('');
    expect(component.subjectReset.emit).toHaveBeenCalled();
  });

  it('should update current value', () => {
    component.updateCurrentValue('New Value');
    expect(component.currentValue()).toBe('New Value');
  });

  it('should emit subjectSaved event on successful save', async () => {
    component.initialValue.set('Old');
    component.currentValue.set('New');

    spyOn(component.subjectSaved, 'emit');

    await component.saveChanges();

    expect(component.initialValue()).toBe('New');
    expect(component.editingActive()).toBe(false);
    expect(component.subjectSaved.emit).toHaveBeenCalledWith('New');
  });

  it('should not save if nothing changed', async () => {
    component.initialValue.set('Same');
    component.currentValue.set('Same');

    spyOn(component.subjectSaved, 'emit');

    await component.saveChanges();

    expect(component.subjectSaved.emit).not.toHaveBeenCalled();
  });

  it('should render view mode by default', () => {
    component.editingActive.set(false);
    component.currentValue.set('Test Subject');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.view-mode')).toBeTruthy();
    expect(compiled.querySelector('.subject-text')?.textContent).toContain('Test Subject');
  });

  it('should render edit mode when editing', () => {
    component.editingActive.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.edit-mode')).toBeTruthy();
    expect(compiled.querySelector('textarea')).toBeTruthy();
  });

  it('should disable save button when nothing changed', () => {
    component.editingActive.set(true);
    component.initialValue.set('Same');
    component.currentValue.set('Same');
    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('.save-button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable save button when value changed', () => {
    component.editingActive.set(true);
    component.initialValue.set('Old');
    component.currentValue.set('New');
    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('.save-button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
  });
});
