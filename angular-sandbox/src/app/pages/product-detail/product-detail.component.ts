import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, filter, map, switchMap } from 'rxjs';
import { ApiService, Product } from '../../services/api.service';

@Component({
  selector: 'app-product-detail',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);

  readonly product$: Observable<Product | undefined> = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter((id): id is string => id !== null),
    switchMap(id => this.apiService.getProduct(id)),
  );
}
