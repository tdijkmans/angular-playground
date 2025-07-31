import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Combobox } from "./combobox/combobox.component";
import { ComboboxOption } from "./combobox/combobox.model";
import { KeyboardShortcutsHelpComponent } from "./components/keyboard-shortcuts-help/keyboard-shortcuts-help.component";
import { KeyboardShortcutsService } from "./services/keyboard-shortcuts.service";

import { signal } from '@angular/core';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Combobox, KeyboardShortcutsHelpComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'angular-sandbox';

  @ViewChild('singleCombobox', { read: ElementRef }) singleComboboxRef?: ElementRef;
  @ViewChild('multiCombobox', { read: ElementRef }) multiComboboxRef?: ElementRef;
  @ViewChild(KeyboardShortcutsHelpComponent) helpComponent?: KeyboardShortcutsHelpComponent;

  selectedCity = signal<ComboboxOption | null>(null);
  selectedCities = signal<ComboboxOption[]>([]);

  constructor(private keyboardService: KeyboardShortcutsService) {}

  ngOnInit(): void {
    this.setupKeyboardShortcuts();
  }

  // Example async search function
  searchCities = (searchTerm: string): Observable<ComboboxOption[]> => {
    const allCities: ComboboxOption[] = [
      { value: 'NYC', label: 'New York City' },
      { value: 'LA', label: 'Los Angeles' },
      { value: 'CHI', label: 'Chicago' },
      { value: 'HOU', label: 'Houston' },
      { value: 'PHX', label: 'Phoenix' },
      { value: 'LDN', label: 'London' },
      { value: 'PAR', label: 'Paris' },
      { value: 'TOK', label: 'Tokyo' },
      { value: 'BER', label: 'Berlin' },
      { value: 'AMS', label: 'Amsterdam' },
      { value: 'LEI', label: 'Leiden' },
      { value: 'ROT', label: 'Rotterdam' },
      { value: 'UTR', label: 'Utrecht' },
      { value: 'HAG', label: 'The Hague' },
      { value: 'EHV', label: 'Eindhoven' },
    ];

    // Simulate an API call with a delay
    return new Observable<ComboboxOption[]>(observer => {
      setTimeout(() => {
        const filtered = allCities.filter(city =>
          city.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        observer.next(filtered);
        observer.complete();
      }, 300); // Simulate network delay
    });
  };

  onCitySelected(option: ComboboxOption | ComboboxOption[] | null): void {
    const isArray = Array.isArray(option);
    this.selectedCity.set(isArray ? option[0] || null : option);
    console.log('Selected option:', option);
  }

  onCitiesSelected(options: ComboboxOption[] | ComboboxOption | null): void {
    if (Array.isArray(options)) {
      this.selectedCities.set(options);
    } else if (options && typeof options === 'object') {
      this.selectedCities.set([options]);
    } else {
      this.selectedCities.set([]);
    }
    console.log('Selected cities:', options);
  }

  private setupKeyboardShortcuts(): void {
    this.keyboardService.registerShortcuts([
      {
        id: 'help',
        keys: '?',
        description: 'Show keyboard shortcuts help',
        category: 'General',
        action: () => this.helpComponent?.toggle()
      },
      {
        id: 'help-alt',
        keys: 'F1',
        description: 'Show keyboard shortcuts help',
        category: 'General',
        action: () => this.helpComponent?.toggle()
      },
      {
        id: 'focus-single-search',
        keys: 'ctrl+1',
        description: 'Focus single select combobox',
        category: 'Navigation',
        action: () => this.focusCombobox('single')
      },
      {
        id: 'focus-multi-search',
        keys: 'ctrl+2',
        description: 'Focus multiple select combobox',
        category: 'Navigation',
        action: () => this.focusCombobox('multi')
      },
      {
        id: 'clear-single',
        keys: 'ctrl+shift+1',
        description: 'Clear single select combobox',
        category: 'Actions',
        action: () => this.clearSelection('single')
      },
      {
        id: 'clear-multi',
        keys: 'ctrl+shift+2',
        description: 'Clear multiple select combobox',
        category: 'Actions',
        action: () => this.clearSelection('multi')
      },
      {
        id: 'close-help',
        keys: 'escape',
        description: 'Close help dialog',
        category: 'General',
        action: () => this.helpComponent?.hide(),
        enabled: false // Will be enabled dynamically when help is open
      }
    ]);
  }

  private focusCombobox(type: 'single' | 'multi'): void {
    const ref = type === 'single' ? this.singleComboboxRef : this.multiComboboxRef;
    if (ref?.nativeElement) {
      const input = ref.nativeElement.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  }

  private clearSelection(type: 'single' | 'multi'): void {
    if (type === 'single') {
      this.selectedCity.set(null);
    } else {
      this.selectedCities.set([]);
    }
  }
}
