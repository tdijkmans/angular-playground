import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { Observable, filter, map, switchMap } from 'rxjs';
import { ApiService, Color } from '../../services/api.service';

@Component({
  selector: 'app-color-detail',
  imports: [AsyncPipe, RouterLink, RouterOutlet],
  templateUrl: './color-detail.component.html',
})
export class ColorDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);

  readonly color$: Observable<Color | undefined> = this.route.paramMap.pipe(
    map(params => params.get('colorId')),
    filter((id): id is string => id !== null),
    switchMap(id => this.apiService.getColor(id)),
  );
}
