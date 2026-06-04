import { Component, inject, OnInit, signal } from '@angular/core';

import { ChildComponent } from './child.component';
import { AppData, DataService } from './data.service';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ChildComponent],
  template: `
    @if (isLoading()) {
      <p role="status">Loading...</p>
    } @else {
      <p role="status">{{ statusMessage() }}</p>
      <app-child [label]="data()?.message ?? ''" (childAction)="onChildAction()" />
    }
  `,
})
export class ParentComponent implements OnInit {
  private readonly dataService = inject(DataService);

  readonly isLoading = signal(true);
  readonly data = signal<AppData | null>(null);
  readonly statusMessage = signal('Ready');

  ngOnInit(): void {
    this.dataService.fetchData().subscribe(result => {
      this.data.set(result);
      this.isLoading.set(false);
    });
  }

  onChildAction(): void {
    this.statusMessage.set('Action triggered');
  }
}
