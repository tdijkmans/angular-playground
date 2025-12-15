import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreatePayload, ProductUpdatePayload } from '../models/product';
import { AbstractResourceService, ResourceServiceConfig } from './resource.service';

/**
 * Product Service
 * 
 * Concrete implementation of AbstractResourceService for Product entities.
 * Inherits all CRUD operations from the base class with strong typing.
 * 
 * This service can be injected anywhere in the application and provides
 * type-safe methods for interacting with the Product API.
 * 
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-product-list',
 *   standalone: true
 * })
 * export class ProductListComponent {
 *   constructor(private productService: ProductService) {}
 * 
 *   ngOnInit() {
 *     this.productService.getAll().subscribe(products => {
 *       console.log('Products:', products);
 *     });
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService extends AbstractResourceService<Product, ProductCreatePayload, ProductUpdatePayload> {
  
  /**
   * Constructor
   * @param http - Angular HttpClient injected automatically
   */
  constructor(http: HttpClient) {
    // Configure the base URL for the Product API endpoint
    // In a real application, this would typically come from an environment configuration
    super(http, '/api/products');
  }

  /**
   * Example of a custom method specific to Product entities
   * Demonstrates how to extend the base service with domain-specific operations
   * 
   * @param category - Product category to filter by
   * @param config - Optional configuration
   * @returns Observable of products in the specified category
   */
  getByCategory(category: string, config?: ResourceServiceConfig): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}`, {
      params: { category, ...config?.params },
      headers: config?.headers
    });
  }

  /**
   * Example of another custom method for searching products
   * 
   * @param searchTerm - Search term to find products
   * @param config - Optional configuration
   * @returns Observable of products matching the search term
   */
  search(searchTerm: string, config?: ResourceServiceConfig): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/search`, {
      params: { q: searchTerm, ...config?.params },
      headers: config?.headers
    });
  }

  /**
   * Example of a method for bulk operations
   * 
   * @param products - Array of product create payloads
   * @param config - Optional configuration
   * @returns Observable of created products
   */
  createBulk(products: ProductCreatePayload[], config?: ResourceServiceConfig): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.baseUrl}/bulk`, products, {
      headers: config?.headers,
      params: config?.params
    });
  }
}
