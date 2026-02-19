import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService, Size } from '../../services/api.service';

@Component({
  selector: 'app-sizes',
  imports: [AsyncPipe, RouterLink, RouterOutlet],
  templateUrl: './sizes.component.html',
})
export class SizesComponent {
  private readonly apiService = inject(ApiService);
  readonly sizes$: Observable<Size[]> = this.apiService.getSizes();
}
