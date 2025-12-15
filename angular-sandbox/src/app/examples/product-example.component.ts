import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Product, ProductCreatePayload, ProductUpdatePayload } from '../models/product';

/**
 * Product Example Component
 * 
 * Demonstrates best practices for using the AbstractResourceService pattern
 * with the ProductService to perform CRUD operations.
 * 
 * Key patterns demonstrated:
 * 1. Injecting the service through the constructor
 * 2. Using signals for reactive state management
 * 3. Handling observables with subscribe
 * 4. Error handling for API calls
 * 5. Type-safe operations with strong typing
 */
@Component({
  selector: 'app-product-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-example">
      <h2>Product Management Example</h2>
      
      <section class="example-section">
        <h3>All Products</h3>
        <button (click)="loadAllProducts()">Load All Products</button>
        @if (loading()) {
          <p>Loading...</p>
        }
        @if (error()) {
          <p class="error">Error: {{ error() }}</p>
        }
        <ul>
          @for (product of products(); track product.id) {
            <li>
              <strong>{{ product.name }}</strong> - {{ '$' + product.price }}
              <button (click)="loadProductById(product.id)">View Details</button>
              <button (click)="updateProduct(product.id)">Update</button>
              <button (click)="deleteProduct(product.id)">Delete</button>
            </li>
          }
        </ul>
      </section>

      <section class="example-section">
        <h3>Selected Product Details</h3>
        @if (selectedProduct()) {
          <div class="product-details">
            <p><strong>ID:</strong> {{ selectedProduct()?.id }}</p>
            <p><strong>Name:</strong> {{ selectedProduct()?.name }}</p>
            <p><strong>Price:</strong> {{ '$' + selectedProduct()?.price }}</p>
            <p><strong>Description:</strong> {{ selectedProduct()?.description }}</p>
            <p><strong>Category:</strong> {{ selectedProduct()?.category }}</p>
            <p><strong>In Stock:</strong> {{ selectedProduct()?.inStock ? 'Yes' : 'No' }}</p>
          </div>
        } @else {
          <p>No product selected</p>
        }
      </section>

      <section class="example-section">
        <h3>Create New Product</h3>
        <button (click)="createNewProduct()">Create Sample Product</button>
      </section>

      <section class="example-section">
        <h3>Search & Filter</h3>
        <button (click)="searchProducts()">Search "Laptop"</button>
        <button (click)="filterByCategory()">Filter by Electronics</button>
      </section>
    </div>
  `,
  styles: [`
    .product-example {
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .example-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }

    button {
      margin: 5px;
      padding: 8px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0056b3;
    }

    .error {
      color: red;
      font-weight: bold;
    }

    ul {
      list-style-type: none;
      padding: 0;
    }

    li {
      padding: 10px;
      margin: 5px 0;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .product-details {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
    }
  `]
})
export class ProductExampleComponent implements OnInit {
  // Reactive state using signals (Angular 16+)
  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  /**
   * Constructor with ProductService injection
   * The service is automatically provided at the root level
   */
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Optionally load products on component initialization
    // this.loadAllProducts();
  }

  /**
   * Example 1: Fetching all products
   * Demonstrates the getAll() method from AbstractResourceService
   */
  loadAllProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
        console.log('Loaded products:', products);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load products');
        this.loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  /**
   * Example 2: Fetching a single product by ID
   * Demonstrates the getById() method from AbstractResourceService
   */
  loadProductById(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.selectedProduct.set(product);
        this.loading.set(false);
        console.log('Loaded product:', product);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load product');
        this.loading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  /**
   * Example 3: Creating a new product
   * Demonstrates the create() method from AbstractResourceService
   */
  createNewProduct(): void {
    const newProduct: ProductCreatePayload = {
      name: 'Sample Laptop',
      price: 999.99,
      description: 'High-performance laptop for developers',
      category: 'Electronics',
      inStock: true
    };

    this.loading.set(true);
    this.error.set(null);

    this.productService.create(newProduct).subscribe({
      next: (product) => {
        // Add the new product to the list
        this.products.update(products => [...products, product]);
        this.loading.set(false);
        console.log('Created product:', product);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to create product');
        this.loading.set(false);
        console.error('Error creating product:', err);
      }
    });
  }

  /**
   * Example 4: Updating an existing product
   * Demonstrates the update() method from AbstractResourceService
   */
  updateProduct(id: number): void {
    const updates: ProductUpdatePayload = {
      price: 899.99,
      inStock: false
    };

    this.loading.set(true);
    this.error.set(null);

    this.productService.update(id, updates).subscribe({
      next: (updatedProduct) => {
        // Update the product in the list
        this.products.update(products => 
          products.map(p => p.id === id ? updatedProduct : p)
        );
        this.loading.set(false);
        console.log('Updated product:', updatedProduct);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to update product');
        this.loading.set(false);
        console.error('Error updating product:', err);
      }
    });
  }

  /**
   * Example 5: Deleting a product
   * Demonstrates the delete() method from AbstractResourceService
   */
  deleteProduct(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.delete(id).subscribe({
      next: () => {
        // Remove the product from the list
        this.products.update(products => products.filter(p => p.id !== id));
        this.loading.set(false);
        console.log('Deleted product with id:', id);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to delete product');
        this.loading.set(false);
        console.error('Error deleting product:', err);
      }
    });
  }

  /**
   * Example 6: Custom method - Search products
   * Demonstrates extending the base service with custom methods
   */
  searchProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.search('Laptop').subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
        console.log('Search results:', products);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to search products');
        this.loading.set(false);
        console.error('Error searching products:', err);
      }
    });
  }

  /**
   * Example 7: Custom method - Filter by category
   * Demonstrates extending the base service with custom methods
   */
  filterByCategory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getByCategory('Electronics').subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
        console.log('Filtered products:', products);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to filter products');
        this.loading.set(false);
        console.error('Error filtering products:', err);
      }
    });
  }
}
