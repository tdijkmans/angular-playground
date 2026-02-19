import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Product } from '../../services/api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  private readonly apiService = inject(ApiService);
  readonly products$: Observable<Product[]> = this.apiService.getProducts();
}
