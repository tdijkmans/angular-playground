# Best Practice Data Fetching Pattern

This document outlines the best practice pattern for handling API interactions (CRUD operations) in Angular applications using an abstract, reusable service layer.

## Overview

The Resource API pattern provides a strongly-typed, reusable abstraction layer for REST API interactions, minimizing boilerplate code in components and ensuring consistency across the application.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Component Layer                      │
│  (ProductExampleComponent, OrderComponent, etc.)        │
└──────────────────┬──────────────────────────────────────┘
                   │ Inject & Use
┌──────────────────▼──────────────────────────────────────┐
│                  Concrete Services                       │
│  (ProductService, OrderService, CustomerService)        │
└──────────────────┬──────────────────────────────────────┘
                   │ Extends
┌──────────────────▼──────────────────────────────────────┐
│             AbstractResourceService<T>                   │
│  (Generic CRUD operations: getAll, getById, create,     │
│   update, patch, delete)                                │
└──────────────────┬──────────────────────────────────────┘
                   │ Uses
┌──────────────────▼──────────────────────────────────────┐
│                  Angular HttpClient                      │
│  (HTTP communication with backend API)                   │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Entity Interfaces (`models/product.ts`)

Define strongly-typed interfaces for your entities:

- **Entity Interface** (`Product`): Complete structure of the resource
- **Create Payload** (`ProductCreatePayload`): Data required to create a new resource
- **Update Payload** (`ProductUpdatePayload`): Data for updating an existing resource

```typescript
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

### 2. Abstract Base Resource Service (`services/resource.service.ts`)

The core of the pattern providing generic CRUD operations:

#### Generic Type Parameters:
- `T`: The entity type (e.g., `Product`)
- `TCreate`: The payload type for creating entities (defaults to `Partial<T>`)
- `TUpdate`: The payload type for updating entities (defaults to `Partial<T>`)

#### Methods:
- `getAll(config?)`: Retrieve all entities
- `getById(id, config?)`: Retrieve a single entity by ID
- `create(payload, config?)`: Create a new entity
- `update(id, payload, config?)`: Update an entity (PUT)
- `patch(id, payload, config?)`: Partially update an entity (PATCH)
- `delete(id, config?)`: Delete an entity

#### Configuration Options:
Each method accepts an optional `ResourceServiceConfig` parameter for:
- Custom HTTP headers
- Query parameters

### 3. Concrete Service Implementation (`services/product.service.ts`)

Extend the abstract service for specific entities:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService extends AbstractResourceService<
  Product, 
  ProductCreatePayload, 
  ProductUpdatePayload
> {
  constructor(http: HttpClient) {
    super(http, '/api/products');
  }

  // Add custom methods specific to products
  getByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}`, {
      params: { category }
    });
  }
}
```

### 4. Component Usage (`examples/product-example.component.ts`)

Demonstrates best practices for using the service in components:

```typescript
@Component({
  selector: 'app-product-list',
  standalone: true
})
export class ProductListComponent {
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private productService: ProductService) {}

  loadProducts(): void {
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

## Benefits

1. **Type Safety**: Full TypeScript support with generics ensures compile-time type checking
2. **DRY Principle**: Eliminates repetitive CRUD code across services
3. **Consistency**: Standardized API interaction patterns across the application
4. **Maintainability**: Changes to API interaction logic happen in one place
5. **Extensibility**: Easy to add custom methods while inheriting base functionality
6. **Testability**: Abstract pattern makes unit testing straightforward
7. **Scalability**: Works well in large applications with many entities

## Usage Examples

### Basic CRUD Operations

```typescript
// Get all products
productService.getAll().subscribe(products => {
  console.log('Products:', products);
});

// Get single product
productService.getById(123).subscribe(product => {
  console.log('Product:', product);
});

// Create product
const newProduct: ProductCreatePayload = {
  name: 'Laptop',
  price: 999.99
};
productService.create(newProduct).subscribe(product => {
  console.log('Created:', product);
});

// Update product
const updates: ProductUpdatePayload = {
  price: 899.99
};
productService.update(123, updates).subscribe(product => {
  console.log('Updated:', product);
});

// Delete product
productService.delete(123).subscribe(() => {
  console.log('Deleted successfully');
});
```

### Advanced Usage with Configuration

```typescript
// Custom headers and query parameters
const config: ResourceServiceConfig = {
  headers: { 'X-Custom-Header': 'value' },
  params: { include: 'details', sort: 'name' }
};

productService.getAll(config).subscribe(products => {
  console.log('Products with config:', products);
});
```

### Custom Methods

```typescript
// Domain-specific operations
productService.getByCategory('Electronics').subscribe(products => {
  console.log('Electronics:', products);
});

productService.search('laptop').subscribe(products => {
  console.log('Search results:', products);
});
```

## Creating New Resource Services

To create a service for a new entity (e.g., `Order`):

1. **Define interfaces** (`models/order.ts`):
```typescript
export interface Order {
  id: number;
  customerId: number;
  total: number;
  status: string;
}

export interface OrderCreatePayload {
  customerId: number;
  items: OrderItem[];
}

export interface OrderUpdatePayload {
  status?: string;
}
```

2. **Create service** (`services/order.service.ts`):
```typescript
@Injectable({ providedIn: 'root' })
export class OrderService extends AbstractResourceService<
  Order,
  OrderCreatePayload,
  OrderUpdatePayload
> {
  constructor(http: HttpClient) {
    super(http, '/api/orders');
  }

  // Add custom methods as needed
  getByCustomer(customerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}`, {
      params: { customerId }
    });
  }
}
```

3. **Use in components**:
```typescript
constructor(private orderService: OrderService) {}

ngOnInit() {
  this.orderService.getAll().subscribe(orders => {
    // Handle orders
  });
}
```

## Testing

The pattern is designed for easy testing with Angular's `HttpTestingController`:

```typescript
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

  it('should retrieve all products', () => {
    const mockProducts: Product[] = [/* ... */];

    service.getAll().subscribe(products => {
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});
```

## Best Practices

1. **Always use strong typing**: Define explicit interfaces for all entities and payloads
2. **Handle errors gracefully**: Use RxJS error handling operators or subscribe error callbacks
3. **Use signals for state**: Leverage Angular signals for reactive state management
4. **Keep components thin**: Delegate business logic to services
5. **Add custom methods wisely**: Extend base services with domain-specific operations
6. **Test thoroughly**: Write comprehensive unit tests for all services
7. **Configure base URLs**: Use environment variables for API endpoints in production

## Environment Configuration

In real applications, configure base URLs through environment files:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// product.service.ts
constructor(http: HttpClient) {
  super(http, `${environment.apiUrl}/products`);
}
```

## Migration Guide

If you have existing services without this pattern:

1. Create entity interfaces from existing types
2. Change service to extend `AbstractResourceService`
3. Remove duplicate CRUD method implementations
4. Keep any custom methods specific to the entity
5. Update tests to use the new structure
6. Verify all components still work correctly

## Reference

This pattern is inspired by the Resource API concept described in:
[Angular Resource API: Modern Data Fetching Made Simple](https://medium.com/@arulmurugan-madheswaran/angular-resource-api-modern-data-fetching-made-simple-61fc1c939072)

## File Structure

```
src/app/
├── models/
│   └── product.ts                    # Entity interfaces
├── services/
│   ├── resource.service.ts           # Abstract base service
│   ├── product.service.ts            # Concrete product service
│   └── product.service.spec.ts       # Service tests
└── examples/
    └── product-example.component.ts  # Usage demonstration
```

## Conclusion

This pattern provides a scalable, maintainable foundation for API interactions in Angular applications. By centralizing common CRUD operations in an abstract service, you reduce code duplication, improve type safety, and create a consistent API for your components to consume.
