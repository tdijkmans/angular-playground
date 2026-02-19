import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Product {
  id: string;
  name: string;
  description: string;
}

export interface Color {
  id: string;
  name: string;
}

export interface Size {
  id: string;
  name: string;
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Alpha', description: 'A premium product in the Alpha series.' },
  { id: '2', name: 'Beta', description: 'A versatile item from the Beta collection.' },
  { id: '3', name: 'Gamma', description: 'The latest addition to the Gamma lineup.' },
];

const COLORS: Color[] = [
  { id: '1', name: 'Red' },
  { id: '2', name: 'Blue' },
  { id: '3', name: 'Yellow' },
  { id: '4', name: 'Green' },
];

const SIZES: Size[] = [
  { id: '1', name: 'Small' },
  { id: '2', name: 'Medium' },
  { id: '3', name: 'Large' },
];

@Injectable({ providedIn: 'root' })
export class ApiService {
  getProducts(): Observable<Product[]> {
    return of(PRODUCTS).pipe(delay(100));
  }

  getProduct(id: string): Observable<Product | undefined> {
    return of(PRODUCTS.find(p => p.id === id)).pipe(delay(100));
  }

  getColors(): Observable<Color[]> {
    return of(COLORS).pipe(delay(100));
  }

  getColor(id: string): Observable<Color | undefined> {
    return of(COLORS.find(c => c.id === id)).pipe(delay(100));
  }

  getSizes(): Observable<Size[]> {
    return of(SIZES).pipe(delay(100));
  }

  getSize(id: string): Observable<Size | undefined> {
    return of(SIZES.find(s => s.id === id)).pipe(delay(100));
  }

  getLabel(resource: string, id: string): Observable<string> {
    switch (resource) {
      case 'product': {
        const product = PRODUCTS.find(p => p.id === id);
        return of(product?.name ?? `Product ${id}`).pipe(delay(100));
      }
      case 'color': {
        const color = COLORS.find(c => c.id === id);
        return of(color?.name ?? `Color ${id}`).pipe(delay(100));
      }
      case 'size': {
        const size = SIZES.find(s => s.id === id);
        return of(size?.name ?? `Size ${id}`).pipe(delay(100));
      }
      default:
        return of(id).pipe(delay(100));
    }
  }
}
