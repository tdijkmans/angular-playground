import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Product {
  id: string;
  name: string;
  description: string;
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Product Alpha', description: 'A premium product in the Alpha series.' },
  { id: '2', name: 'Product Beta', description: 'A versatile item from the Beta collection.' },
  { id: '3', name: 'Product Gamma', description: 'The latest addition to the Gamma lineup.' },
];

@Injectable({ providedIn: 'root' })
export class ApiService {
  getProducts(): Observable<Product[]> {
    return of(PRODUCTS).pipe(delay(100));
  }

  getProduct(id: string): Observable<Product | undefined> {
    return of(PRODUCTS.find(p => p.id === id)).pipe(delay(100));
  }

  getProductName(id: string): Observable<string> {
    const product = PRODUCTS.find(p => p.id === id);
    return of(product?.name ?? `Product ${id}`).pipe(delay(100));
  }
}
