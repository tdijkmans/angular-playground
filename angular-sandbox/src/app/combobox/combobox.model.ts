import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input, Output, EventEmitter, WritableSignal, signal, computed } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, of } from "rxjs";
import { ComboboxOption } from "./ComboboxOption";

@Component({
  selector: 'app-combobox',
  imports: [FormsModule],
  templateUrl: './combobox.html',
  styleUrl: './combobox.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Combobox implements OnInit, OnDestroy {
  @Input() id: string = 'combobox';
  @Input() label: string = 'Select an Option';
  @Input() placeholder: string = 'Search or select...';
  @Input() debounceTimeMs: number = 300;
  @Input() searchFn!: (searchTerm: string) => Observable<ComboboxOption[]>;

  @Output() selectedOptionChange = new EventEmitter<ComboboxOption | null>();

  searchTerm: string = '';
  private searchTerm$: Subject<string> = new Subject<string>();

  isDropdownOpen: WritableSignal<boolean> = signal(false);
  options: WritableSignal<ComboboxOption[]> = signal([]);
  activeOptionIndex: WritableSignal<number> = signal(-1);
  selectedOption: WritableSignal<ComboboxOption | null> = signal(null);

  // Computed signal for the active option's ID for ARIA
  activeOptionId = computed(() => {
    const index = this.activeOptionIndex();
    return index !== -1 ? `${this.id}-option-${index}` : '';
  });

  // Computed signal for filtering options based on search term
  // This will be used if searchFn is not provided, falling back to client-side filtering
  // However, for async search, this will just reflect the options loaded by searchFn
  filteredOptions = computed(() => {
    const term = this.searchTerm.toLowerCase();
    const currentOptions = this.options();
    if (!term) {
      return currentOptions;
    }
    // If searchFn is provided, options will already be filtered by the async search.
    // This client-side filter acts as a fallback or for initial display if needed.
    return currentOptions.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.searchTerm$
      .pipe(
        debounceTime(this.debounceTimeMs),
        distinctUntilChanged(),
        switchMap(term => {
          if (this.searchFn) {
            return this.searchFn(term);
          } else {
            // Fallback for demonstration if searchFn is not provided
            // In a real async scenario, searchFn must be provided.
            console.warn('searchFn not provided. Async search will not work.');
            return of([]);
          }
        })
      )
      .subscribe(results => {
        this.options.set(results);
        this.resetActiveOption();
      });
  }

  ngOnDestroy(): void {
    this.searchTerm$.complete();
  }

  onSearchTermChange(term: Event): void {
    this.searchTerm = term as unknown as string;
    this.searchTerm$.next(this.searchTerm);
    this.openDropdown();
    this.selectedOption.set(null); // Deselect when typing
    this.selectedOptionChange.emit(null);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(isOpen => !isOpen);
    if (this.isDropdownOpen()) {
      this.resetActiveOption();
    }
  }

  openDropdown(): void {
    if (!this.isDropdownOpen()) {
      this.isDropdownOpen.set(true);
      this.resetActiveOption();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
    this.resetActiveOption();
  }

  selectOption(option: ComboboxOption): void {
    this.selectedOption.set(option);
    this.searchTerm = option.label; // Set input value to selected option's label
    this.selectedOptionChange.emit(option);
    this.closeDropdown();
  }

  onKeydownArrowDown(event: Event): void {
    if (!this.isDropdownOpen()) {
      this.openDropdown();
      return;
    }
    event.preventDefault(); // Prevent page scrolling
    const currentOptions = this.filteredOptions();
    if (currentOptions.length > 0) {
      this.activeOptionIndex.update(index =>
        Math.min(index + 1, currentOptions.length - 1)
      );
      this.scrollActiveOptionIntoView();
    }
  }

  onKeydownArrowUp(event: Event): void {
    if (!this.isDropdownOpen()) {
      return;
    }
    event.preventDefault(); // Prevent page scrolling
    if (this.filteredOptions().length > 0) {
      this.activeOptionIndex.update(index => Math.max(index - 1, 0));
      this.scrollActiveOptionIntoView();
    }
  }

  onKeydownEnter(event: Event): void {
    if (this.isDropdownOpen() && this.activeOptionIndex() !== -1) {
      const activeOption = this.filteredOptions()[this.activeOptionIndex()];
      if (activeOption) {
        this.selectOption(activeOption);
        event.preventDefault(); // Prevent form submission if applicable
      }
    } else if (!this.isDropdownOpen() && this.searchTerm.length > 0) {
      // If pressing enter on a closed combobox with text, and no option selected,
      // you might want to consider it a "search and select first result" or similar.
      // For now, it just closes if no active option.
      this.closeDropdown();
    } else {
      this.toggleDropdown(); // If no search term and enter, just toggle
    }
  }

  onInputBlur(): void {
    // A small delay to allow click events on options to register before closing
    setTimeout(() => {
      if (!document.activeElement?.closest('.combobox-container')) {
        this.closeDropdown();
      }
    }, 100);
  }

  private resetActiveOption(): void {
    this.activeOptionIndex.set(-1);
  }

  setActiveOption(index: number): void {
    this.activeOptionIndex.set(index);
  }

  private scrollActiveOptionIntoView(): void {
    setTimeout(() => {
      const activeElement = document.getElementById(this.activeOptionId());
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });
  }
}