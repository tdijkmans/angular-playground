import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardShortcutsHelpComponent } from '../keyboard-shortcuts-help.component';
import { KeyboardShortcutsService } from '../../../services/keyboard-shortcuts.service';
import { signal } from '@angular/core';

describe('KeyboardShortcutsHelpComponent', () => {
  let component: KeyboardShortcutsHelpComponent;
  let fixture: ComponentFixture<KeyboardShortcutsHelpComponent>;
  let mockKeyboardService: jasmine.SpyObj<KeyboardShortcutsService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('KeyboardShortcutsService', [], {
      shortcutsByCategory: signal({
        'General': [
          {
            id: 'help',
            keys: '?',
            description: 'Show help',
            action: () => {}
          }
        ],
        'Navigation': [
          {
            id: 'focus',
            keys: 'ctrl+1',
            description: 'Focus first input',
            action: () => {}
          }
        ]
      })
    });

    await TestBed.configureTestingModule({
      imports: [KeyboardShortcutsHelpComponent],
      providers: [
        { provide: KeyboardShortcutsService, useValue: spy }
      ]
    }).compileComponents();

    mockKeyboardService = TestBed.inject(KeyboardShortcutsService) as jasmine.SpyObj<KeyboardShortcutsService>;
    fixture = TestBed.createComponent(KeyboardShortcutsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start hidden', () => {
    expect(component.isVisible()).toBe(false);
  });

  it('should show when show() is called', () => {
    component.show();
    expect(component.isVisible()).toBe(true);
  });

  it('should hide when hide() is called', () => {
    component.show();
    component.hide();
    expect(component.isVisible()).toBe(false);
  });

  it('should toggle visibility when toggle() is called', () => {
    expect(component.isVisible()).toBe(false);
    
    component.toggle();
    expect(component.isVisible()).toBe(true);
    
    component.toggle();
    expect(component.isVisible()).toBe(false);
  });

  it('should hide when clicking backdrop', () => {
    component.show();
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: event.currentTarget, writable: false });
    Object.defineProperty(event, 'currentTarget', { value: event.currentTarget, writable: false });
    
    component.onBackdropClick(event);
    expect(component.isVisible()).toBe(false);
  });

  it('should not hide when clicking inside modal', () => {
    component.show();
    const event = new MouseEvent('click');
    const mockCurrentTarget = document.createElement('div');
    const mockTarget = document.createElement('div');
    Object.defineProperty(event, 'target', { value: mockTarget, writable: false });
    Object.defineProperty(event, 'currentTarget', { value: mockCurrentTarget, writable: false });
    
    component.onBackdropClick(event);
    expect(component.isVisible()).toBe(true);
  });

  it('should hide when Escape key is pressed', () => {
    component.show();
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(event, 'preventDefault');
    
    component.onKeydown(event);
    expect(component.isVisible()).toBe(false);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not hide for other keys', () => {
    component.show();
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    
    component.onKeydown(event);
    expect(component.isVisible()).toBe(true);
  });

  it('should format keys correctly', () => {
    expect(component.formatKeys('ctrl+k')).toBe('CTRL + K');
    expect(component.formatKeys('alt+f1')).toBe('ALT + F1');
    expect(component.formatKeys('shift+enter')).toBe('SHIFT + ENTER');
    expect(component.formatKeys('?')).toBe('?');
  });

  it('should format special keys', () => {
    expect(component.formatKeys('meta+k')).toBe('⌘ + K');
    expect(component.formatKeys('cmd+k')).toBe('⌘ + K');
    expect(component.formatKeys('command+k')).toBe('⌘ + K');
  });

  it('should detect when there are no shortcuts', () => {
    // Override the service to return empty shortcuts
    mockKeyboardService.shortcutsByCategory = signal({});
    component = new KeyboardShortcutsHelpComponent(mockKeyboardService);
    
    expect(component.hasNoShortcuts()).toBe(true);
  });

  it('should detect when there are shortcuts', () => {
    expect(component.hasNoShortcuts()).toBe(false);
  });
});