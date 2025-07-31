import { TestBed } from '@angular/core/testing';
import { KeyboardShortcutsService } from '../keyboard-shortcuts.service';
import { KeyboardShortcut } from '../../models/keyboard-shortcut.model';

describe('KeyboardShortcutsService', () => {
  let service: KeyboardShortcutsService;
  let mockAction: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyboardShortcutsService]
    });
    service = TestBed.inject(KeyboardShortcutsService);
    mockAction = jasmine.createSpy('mockAction');
  });

  afterEach(() => {
    // Clean up event listeners
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a shortcut', () => {
    const shortcut: KeyboardShortcut = {
      id: 'test',
      keys: 'ctrl+k',
      description: 'Test shortcut',
      action: mockAction
    };

    service.registerShortcut(shortcut);
    const shortcuts = service.allShortcuts();
    
    expect(shortcuts).toContain(shortcut);
    expect(shortcuts.length).toBe(1);
  });

  it('should register multiple shortcuts', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        id: 'test1',
        keys: 'ctrl+k',
        description: 'Test shortcut 1',
        action: mockAction
      },
      {
        id: 'test2',
        keys: 'ctrl+j',
        description: 'Test shortcut 2',
        action: mockAction
      }
    ];

    service.registerShortcuts(shortcuts);
    const allShortcuts = service.allShortcuts();
    
    expect(allShortcuts.length).toBe(2);
    expect(allShortcuts).toContain(shortcuts[0]);
    expect(allShortcuts).toContain(shortcuts[1]);
  });

  it('should update existing shortcut when registering with same id', () => {
    const originalShortcut: KeyboardShortcut = {
      id: 'test',
      keys: 'ctrl+k',
      description: 'Original',
      action: mockAction
    };

    const updatedShortcut: KeyboardShortcut = {
      id: 'test',
      keys: 'ctrl+j',
      description: 'Updated',
      action: mockAction
    };

    service.registerShortcut(originalShortcut);
    service.registerShortcut(updatedShortcut);
    
    const shortcuts = service.allShortcuts();
    expect(shortcuts.length).toBe(1);
    expect(shortcuts[0].description).toBe('Updated');
    expect(shortcuts[0].keys).toBe('ctrl+j');
  });

  it('should unregister a shortcut', () => {
    const shortcut: KeyboardShortcut = {
      id: 'test',
      keys: 'ctrl+k',
      description: 'Test shortcut',
      action: mockAction
    };

    service.registerShortcut(shortcut);
    expect(service.allShortcuts().length).toBe(1);

    service.unregisterShortcut('test');
    expect(service.allShortcuts().length).toBe(0);
  });

  it('should filter enabled shortcuts', () => {
    const enabledShortcut: KeyboardShortcut = {
      id: 'enabled',
      keys: 'ctrl+k',
      description: 'Enabled shortcut',
      action: mockAction,
      enabled: true
    };

    const disabledShortcut: KeyboardShortcut = {
      id: 'disabled',
      keys: 'ctrl+j',
      description: 'Disabled shortcut',
      action: mockAction,
      enabled: false
    };

    service.registerShortcuts([enabledShortcut, disabledShortcut]);
    
    const enabledShortcuts = service.enabledShortcuts();
    expect(enabledShortcuts.length).toBe(1);
    expect(enabledShortcuts[0].id).toBe('enabled');
  });

  it('should group shortcuts by category', () => {
    const generalShortcut: KeyboardShortcut = {
      id: 'general',
      keys: 'ctrl+k',
      description: 'General shortcut',
      category: 'General',
      action: mockAction
    };

    const navigationShortcut: KeyboardShortcut = {
      id: 'navigation',
      keys: 'ctrl+j',
      description: 'Navigation shortcut',
      category: 'Navigation',
      action: mockAction
    };

    const uncategorizedShortcut: KeyboardShortcut = {
      id: 'uncategorized',
      keys: 'ctrl+l',
      description: 'Uncategorized shortcut',
      action: mockAction
    };

    service.registerShortcuts([generalShortcut, navigationShortcut, uncategorizedShortcut]);
    
    const categories = service.shortcutsByCategory();
    expect(Object.keys(categories)).toContain('General');
    expect(Object.keys(categories)).toContain('Navigation');
    expect(Object.keys(categories)).toContain('General'); // Uncategorized goes to General
    
    expect(categories['General']).toContain(generalShortcut);
    expect(categories['Navigation']).toContain(navigationShortcut);
  });

  it('should toggle shortcut enabled state', () => {
    const shortcut: KeyboardShortcut = {
      id: 'test',
      keys: 'ctrl+k',
      description: 'Test shortcut',
      action: mockAction,
      enabled: true
    };

    service.registerShortcut(shortcut);
    expect(service.enabledShortcuts().length).toBe(1);

    service.toggleShortcut('test', false);
    expect(service.enabledShortcuts().length).toBe(0);

    service.toggleShortcut('test', true);
    expect(service.enabledShortcuts().length).toBe(1);
  });

  it('should update configuration', () => {
    const newConfig = {
      enabled: false,
      showFeedback: false,
      feedbackDuration: 1000,
      enableInInputs: true
    };

    service.updateConfig(newConfig);
    const config = service.getConfig();
    
    expect(config.enabled).toBe(false);
    expect(config.showFeedback).toBe(false);
    expect(config.feedbackDuration).toBe(1000);
    expect(config.enableInInputs).toBe(true);
  });

  it('should be enabled by default', () => {
    expect(service.isEnabled()).toBe(true);
  });
});