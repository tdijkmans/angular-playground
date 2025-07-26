import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Combobox } from "./combobox/combobox.model";
import { ComboboxOption } from "./combobox/ComboboxOption";

import { signal, WritableSignal, computed } from '@angular/core';
import { Observable } from 'rxjs';

import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Combobox],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App  {
  protected title = 'angular-sandbox';

  selectedCity = signal<ComboboxOption | null>(null);

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

  onCitySelected(option: ComboboxOption | null): void {
    this.selectedCity.set(option);
    console.log('Selected option:', option);
  }
}
