import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Configuration options for the Resource Service
 */
export interface ResourceServiceConfig {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
}

/**
 * Abstract Base Resource Service
 * 
 * This service provides a reusable, strongly-typed abstraction layer for REST API interactions.
 * It implements common CRUD operations (Create, Read, Update, Delete) with minimal boilerplate.
 * 
 * Generic Type Parameters:
 * @template T - The entity type (e.g., Product)
 * @template TCreate - The payload type for creating entities (e.g., ProductCreatePayload)
 * @template TUpdate - The payload type for updating entities (e.g., ProductUpdatePayload)
 * 
 * Usage:
 * Extend this class in concrete service implementations and provide the base URL.
 * 
 * @example
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class ProductService extends AbstractResourceService<Product, ProductCreatePayload, ProductUpdatePayload> {
 *   constructor(http: HttpClient) {
 *     super(http, '/api/products');
 *   }
 * }
 * ```
 */
export abstract class AbstractResourceService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  
  /**
   * Constructor
   * @param http - Angular HttpClient for making HTTP requests
   * @param baseUrl - Base URL for the resource endpoint (e.g., '/api/products')
   */
  constructor(
    protected http: HttpClient,
    protected baseUrl: string
  ) {}

  /**
   * Retrieves all entities from the resource endpoint
   * 
   * @param config - Optional configuration for headers and query parameters
   * @returns Observable of an array of entities
   * 
   * @example
   * ```typescript
   * productService.getAll().subscribe(products => {
   *   console.log('All products:', products);
   * });
   * ```
   */
  getAll(config?: ResourceServiceConfig): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl, {
      headers: config?.headers,
      params: config?.params
    });
  }

  /**
   * Retrieves a single entity by its ID
   * 
   * @param id - Unique identifier of the entity
   * @param config - Optional configuration for headers and query parameters
   * @returns Observable of the entity
   * 
   * @example
   * ```typescript
   * productService.getById(123).subscribe(product => {
   *   console.log('Product:', product);
   * });
   * ```
   */
  getById(id: number | string, config?: ResourceServiceConfig): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`, {
      headers: config?.headers,
      params: config?.params
    });
  }

  /**
   * Creates a new entity
   * 
   * @param payload - Data for creating the entity
   * @param config - Optional configuration for headers and query parameters
   * @returns Observable of the created entity
   * 
   * @example
   * ```typescript
   * const newProduct: ProductCreatePayload = {
   *   name: 'Laptop',
   *   price: 999.99
   * };
   * 
   * productService.create(newProduct).subscribe(product => {
   *   console.log('Created product:', product);
   * });
   * ```
   */
  create(payload: TCreate, config?: ResourceServiceConfig): Observable<T> {
    return this.http.post<T>(this.baseUrl, payload, {
      headers: config?.headers,
      params: config?.params
    });
  }

  /**
   * Updates an existing entity
   * 
   * @param id - Unique identifier of the entity to update
   * @param payload - Data for updating the entity
   * @param config - Optional configuration for headers and query parameters
   * @returns Observable of the updated entity
   * 
   * @example
   * ```typescript
   * const updates: ProductUpdatePayload = {
   *   price: 899.99
   * };
   * 
   * productService.update(123, updates).subscribe(product => {
   *   console.log('Updated product:', product);
   * });
   * ```
   */
  update(id: number | string, payload: TUpdate, config?: ResourceServiceConfig): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, payload, {
      headers: config?.headers,
      params: config?.params
    });
  }

  /**
   * Partially updates an existing entity
   * 
   * @param id - Unique identifier of the entity to update
   * @param payload - Partial data for updating the entity
   * @param config - Optional configuration for headers and query parameters
   * @returns Observable of the updated entity
   * 
   * @example
   * ```typescript
   * const updates: ProductUpdatePayload = {
   *   inStock: false
   * };
   * 
   * productService.patch(123, updates).subscribe(product => {
   *   console.log('Patched product:', product);
   * });
   * ```
   */
  patch(id: number | string, payload: Partial<TUpdate>, config?: ResourceServiceConfig): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${id}`, payload, {
      headers: config?.headers,
      params: config?.params
    });
  }

  /**
   * Deletes an entity
   * 
   * @param id - Unique identifier of the entity to delete
   * @param config - Optional configuration for headers and query parameters
   * @returns Observable of void
   * 
   * @example
   * ```typescript
   * productService.delete(123).subscribe(() => {
   *   console.log('Product deleted successfully');
   * });
   * ```
   */
  delete(id: number | string, config?: ResourceServiceConfig): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: config?.headers,
      params: config?.params
    });
  }
}
