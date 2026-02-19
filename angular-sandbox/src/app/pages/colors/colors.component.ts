import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService, Color } from '../../services/api.service';

@Component({
  selector: 'app-colors',
  imports: [AsyncPipe, RouterLink, RouterOutlet],
  templateUrl: './colors.component.html',
})
export class ColorsComponent {
  private readonly apiService = inject(ApiService);
  readonly colors$: Observable<Color[]> = this.apiService.getColors();
}
