import { Component, signal } from '@angular/core';
import { Combobox } from '../combobox/combobox.component';
import { ComboboxOption } from '../combobox/combobox.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-combobox-demo',
  imports: [Combobox],
  templateUrl: './combobox-demo.html',
  styleUrl: './combobox-demo.scss'
})
export class ComboboxDemo {
  selectedCity = signal<ComboboxOption | null>(null);
  selectedCities = signal<ComboboxOption[]>([]);

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
    if (Array.isArray(option)) {
      return;
    }
    this.selectedCity.set(option);
  }

  onCitiesSelected(options: ComboboxOption[] | ComboboxOption | null): void {
    if (options === null) {
      this.selectedCities.set([]);
    } else if (Array.isArray(options)) {
      this.selectedCities.set(options);
    }
  }
}
