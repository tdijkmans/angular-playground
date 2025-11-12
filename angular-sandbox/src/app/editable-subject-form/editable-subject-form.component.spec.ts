import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditableSubjectFormComponent } from './editable-subject-form.component';

describe('EditableSubjectFormComponent', () => {
  let component: EditableSubjectFormComponent;
  let fixture: ComponentFixture<EditableSubjectFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableSubjectFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditableSubjectFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.value()).toBe('');
    expect(component.disabled()).toBe(false);
    expect(component.editingActive()).toBe(false);
  });

  it('should write value through ControlValueAccessor', () => {
    component.writeValue('Test Value');
    expect(component.value()).toBe('Test Value');
  });

  it('should handle null writeValue', () => {
    component.writeValue(null as any);
    expect(component.value()).toBe('');
  });

  it('should register onChange callback', () => {
    const onChange = jasmine.createSpy('onChange');
    component.registerOnChange(onChange);
    
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: { value: 'New Value' } });
    component.onInput(event);
    
    expect(onChange).toHaveBeenCalledWith('New Value');
  });

  it('should register onTouched callback', () => {
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnTouched(onTouched);
    
    component.onBlur();
    
    expect(onTouched).toHaveBeenCalled();
  });

  it('should set disabled state', () => {
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
    
    component.setDisabledState(false);
    expect(component.disabled()).toBe(false);
  });

  it('should start editing mode', () => {
    component.startEditing();
    expect(component.editingActive()).toBe(true);
  });

  it('should not start editing when disabled', () => {
    component.setDisabledState(true);
    component.startEditing();
    expect(component.editingActive()).toBe(false);
  });

  it('should cancel editing and call onTouched', () => {
    const onTouched = jasmine.createSpy('onTouched');
    component.registerOnTouched(onTouched);
    component.editingActive.set(true);
    
    component.cancelEditing();
    
    expect(component.editingActive()).toBe(false);
    expect(onTouched).toHaveBeenCalled();
  });

  it('should calculate remaining characters', () => {
    component.writeValue('Hello');
    expect(component.remainingChars).toBe(295);
    
    component.writeValue('a'.repeat(250));
    expect(component.remainingChars).toBe(50);
  });

  it('should render view mode by default', () => {
    component.value.set('Test Subject');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.view-mode')).toBeTruthy();
    expect(compiled.querySelector('.subject-text')?.textContent?.trim()).toBe('Test Subject');
  });

  it('should render edit mode when editing', () => {
    component.editingActive.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.edit-mode')).toBeTruthy();
    expect(compiled.querySelector('textarea')).toBeTruthy();
  });

  it('should update value on input', () => {
    const onChange = jasmine.createSpy('onChange');
    component.registerOnChange(onChange);
    component.editingActive.set(true);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Updated Value';
    textarea.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('Updated Value');
    expect(onChange).toHaveBeenCalledWith('Updated Value');
  });
});
