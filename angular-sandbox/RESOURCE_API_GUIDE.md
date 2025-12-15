# Angular Resource API Pattern - Implementation Guide

This guide demonstrates the best practice for handling API interactions in Angular using the Resource API pattern.

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Implementation Steps](#implementation-steps)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)
7. [Advanced Topics](#advanced-topics)

## Overview

The Resource API pattern provides a strongly-typed, reusable abstraction for REST API interactions. It eliminates boilerplate code and ensures consistency across your application.

### Key Benefits
- **Type Safety**: Full TypeScript generics support
- **DRY Principle**: Write CRUD logic once, reuse everywhere
- **Consistency**: Standardized patterns across all API interactions
- **Maintainability**: Changes in one place affect all services
- **Testability**: Easy to mock and test
- **Scalability**: Works for applications of any size

## Quick Start

### 1. View the Example
See a working implementation in:
```
src/app/examples/product-example.component.ts
```

This component demonstrates all CRUD operations with error handling and state management.

### 2. Run the Example
To see the example component in action, add it to your app routes:

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProductExampleComponent } from './examples/product-example.component';

export const routes: Routes = [
  { path: 'products', component: ProductExampleComponent },
  // ... other routes
];
```

Then navigate to `/products` in your browser.

## Architecture

```
┌─────────────────────────────────────┐
│        Component Layer              │
│   Uses services, manages state      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Concrete Services             │
│   ProductService, OrderService      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   AbstractResourceService<T>        │
│   Generic CRUD operations           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Angular HttpClient             │
└─────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Define Entity Interfaces

Create interfaces for your entity in `src/app/models/`:

```typescript
// models/product.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  inStock?: boolean;
}

export interface ProductCreatePayload {
  name: string;
  price: number;
  description?: string;
  category?: string;
  inStock?: boolean;
}

export interface ProductUpdatePayload {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  inStock?: boolean;
}
```

**Key Points:**
- Main interface includes all fields (with `id`)
- Create payload excludes auto-generated fields
- Update payload has all optional fields

### Step 2: Create Concrete Service

Create a service that extends `AbstractResourceService`:

```typescript
// services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractResourceService } from './resource.service';
import { Product, ProductCreatePayload, ProductUpdatePayload } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService extends AbstractResourceService<
  Product, 
  ProductCreatePayload, 
  ProductUpdatePayload
> {
  constructor(http: HttpClient) {
    super(http, '/api/products');
  }
  
  // Add custom methods as needed
  getByCategory(category: string) {
    return this.http.get<Product[]>(`${this.baseUrl}`, {
      params: { category }
    });
  }
}
```

**Key Points:**
- Use `@Injectable({ providedIn: 'root' })` for automatic DI
- Pass base URL to `super()` constructor
- Add domain-specific methods as needed

### Step 3: Use in Components

Inject and use the service in your components:

```typescript
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule]
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
```

**Key Points:**
- Use signals for reactive state (Angular 16+)
- Always handle errors in subscribe
- Set loading states for better UX

## Usage Examples

### Basic CRUD Operations

#### Fetch All Records
```typescript
productService.getAll().subscribe({
  next: (products) => console.log(products),
  error: (err) => console.error(err)
});
```

#### Fetch Single Record
```typescript
productService.getById(123).subscribe({
  next: (product) => console.log(product),
  error: (err) => console.error(err)
});
```

#### Create Record
```typescript
const newProduct: ProductCreatePayload = {
  name: 'Laptop',
  price: 999.99
};

productService.create(newProduct).subscribe({
  next: (product) => console.log('Created:', product),
  error: (err) => console.error(err)
});
```

#### Update Record (PUT)
```typescript
const updates: ProductUpdatePayload = {
  price: 899.99,
  inStock: false
};

productService.update(123, updates).subscribe({
  next: (product) => console.log('Updated:', product),
  error: (err) => console.error(err)
});
```

#### Partial Update (PATCH)
```typescript
productService.patch(123, { price: 899.99 }).subscribe({
  next: (product) => console.log('Patched:', product),
  error: (err) => console.error(err)
});
```

#### Delete Record
```typescript
productService.delete(123).subscribe({
  next: () => console.log('Deleted'),
  error: (err) => console.error(err)
});
```

### Advanced Usage

#### Custom Headers and Query Parameters
```typescript
const config: ResourceServiceConfig = {
  headers: { 
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value' 
  },
  params: { 
    include: 'details',
    sort: 'name',
    limit: 50 
  }
};

productService.getAll(config).subscribe(...);
```

#### Using Custom Methods
```typescript
// Filter by category
productService.getByCategory('Electronics').subscribe({
  next: (products) => console.log(products)
});

// Search
productService.search('laptop').subscribe({
  next: (products) => console.log(products)
});

// Bulk operations
const bulkProducts: ProductCreatePayload[] = [
  { name: 'Product 1', price: 100 },
  { name: 'Product 2', price: 200 }
];

productService.createBulk(bulkProducts).subscribe({
  next: (products) => console.log('Bulk created:', products)
});
```

## Testing

### Unit Testing Services

The pattern is designed for easy testing with Angular's `HttpTestingController`:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all products', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Test', price: 100 }
    ];

    service.getAll().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});
```

### Component Testing

```typescript
describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let service: jasmine.SpyObj<ProductService>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('ProductService', ['getAll']);
    
    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: serviceSpy }
      ]
    });

    service = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    component = TestBed.createComponent(ProductListComponent).componentInstance;
  });

  it('should load products on init', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Test', price: 100 }
    ];
    service.getAll.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(service.getAll).toHaveBeenCalled();
    expect(component.products()).toEqual(mockProducts);
  });
});
```

## Advanced Topics

### Environment Configuration

Use environment files for API URLs:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// product.service.ts
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService extends AbstractResourceService<...> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/products`);
  }
}
```

### Error Handling

Implement global error handling with interceptors:

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle errors globally
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
  }
}
```

### Caching

Add caching to your services:

```typescript
export class ProductService extends AbstractResourceService<...> {
  private cache = new Map<string, Observable<Product[]>>();

  getAll(config?: ResourceServiceConfig): Observable<Product[]> {
    const key = JSON.stringify(config);
    
    if (!this.cache.has(key)) {
      this.cache.set(key, super.getAll(config).pipe(
        shareReplay(1)
      ));
    }
    
    return this.cache.get(key)!;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

### Pagination

Handle paginated responses:

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ProductService extends AbstractResourceService<...> {
  getPaginated(page: number, pageSize: number): Observable<PaginatedResponse<Product>> {
    return this.http.get<PaginatedResponse<Product>>(this.baseUrl, {
      params: { page, pageSize }
    });
  }
}
```

## Creating Additional Resource Services

To create a service for another entity (e.g., Order):

1. **Define interfaces** (`models/order.ts`)
2. **Create service** (`services/order.service.ts`)
3. **Extend AbstractResourceService** with proper types
4. **Add custom methods** as needed
5. **Write tests** following the pattern

Example:

```typescript
// models/order.ts
export interface Order {
  id: number;
  customerId: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
}

export interface OrderCreatePayload {
  customerId: number;
  items: OrderItem[];
}

export interface OrderUpdatePayload {
  status?: 'pending' | 'completed' | 'cancelled';
}

// services/order.service.ts
@Injectable({ providedIn: 'root' })
export class OrderService extends AbstractResourceService<
  Order,
  OrderCreatePayload,
  OrderUpdatePayload
> {
  constructor(http: HttpClient) {
    super(http, '/api/orders');
  }

  getByCustomer(customerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`, {
      params: { customerId }
    });
  }

  getByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`, {
      params: { status }
    });
  }
}
```

## Best Practices

1. **Always define explicit interfaces** - Don't use `any` or loose types
2. **Handle errors gracefully** - Always provide error handlers in subscriptions
3. **Use signals for state** - Leverage Angular's signals for reactive state management
4. **Keep components thin** - Business logic belongs in services
5. **Write comprehensive tests** - Test all CRUD operations and custom methods
6. **Use environment variables** - Don't hardcode API URLs
7. **Document custom methods** - Add JSDoc comments to explain behavior
8. **Follow naming conventions** - Use consistent naming across all services

## Migration from Existing Services

If you have existing services that don't follow this pattern:

1. Extract entity types into interface files
2. Identify CRUD operations that can be replaced by base service
3. Change service to extend `AbstractResourceService`
4. Remove duplicate CRUD implementations
5. Keep custom/domain-specific methods
6. Update tests to reflect new structure
7. Update components if needed (usually minimal changes)

## Reference Implementation

For a complete, working reference implementation, see:

- **Models**: `src/app/models/product.ts`
- **Base Service**: `src/app/services/resource.service.ts`
- **Concrete Service**: `src/app/services/product.service.ts`
- **Tests**: `src/app/services/product.service.spec.ts`
- **Example Component**: `src/app/examples/product-example.component.ts`
- **Documentation**: `src/app/README.md`

## Additional Resources

- [Angular HttpClient Documentation](https://angular.io/guide/http)
- [RxJS Observable Guide](https://rxjs.dev/guide/observable)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Article: Angular Resource API Pattern](https://medium.com/@arulmurugan-madheswaran/angular-resource-api-modern-data-fetching-made-simple-61fc1c939072)

## Support

For questions or issues with this pattern:
1. Check the example component implementation
2. Review the comprehensive tests
3. Refer to the inline JSDoc documentation
4. Consult the Angular documentation

---

**Last Updated**: December 2025  
**Angular Version**: 20.x  
**TypeScript Version**: 5.9.x
