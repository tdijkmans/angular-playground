import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, switchMap } from 'rxjs';
import { ApiService, Size } from '../../services/api.service';

@Component({
  selector: 'app-size-detail',
  imports: [AsyncPipe],
  templateUrl: './size-detail.component.html',
})
export class SizeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);

  readonly size$: Observable<Size | undefined> = this.route.paramMap.pipe(
    map(params => params.get('sizeId')),
    filter((id): id is string => id !== null),
    switchMap(id => this.apiService.getSize(id)),
  );
}
