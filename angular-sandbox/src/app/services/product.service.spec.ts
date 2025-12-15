import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { Product, ProductCreatePayload, ProductUpdatePayload } from '../models/product';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/products';

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should retrieve all products', () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Product 1', price: 100, description: 'Test product 1', category: 'Electronics', inStock: true },
        { id: 2, name: 'Product 2', price: 200, description: 'Test product 2', category: 'Books', inStock: false }
      ];

      service.getAll().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should handle error when retrieving all products fails', () => {
      service.getAll().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getById', () => {
    it('should retrieve a single product by id', () => {
      const mockProduct: Product = {
        id: 1,
        name: 'Product 1',
        price: 100,
        description: 'Test product',
        category: 'Electronics',
        inStock: true
      };

      service.getById(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product.id).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should handle error when product not found', () => {
      service.getById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new product', () => {
      const newProduct: ProductCreatePayload = {
        name: 'New Product',
        price: 150,
        description: 'New test product',
        category: 'Electronics',
        inStock: true
      };

      const createdProduct: Product = {
        id: 3,
        ...newProduct
      };

      service.create(newProduct).subscribe(product => {
        expect(product).toEqual(createdProduct);
        expect(product.id).toBe(3);
        expect(product.name).toBe('New Product');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(createdProduct);
    });

    it('should handle validation error when creating product', () => {
      const invalidProduct: ProductCreatePayload = {
        name: '',
        price: -10
      };

      service.create(invalidProduct).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('update', () => {
    it('should update an existing product', () => {
      const updates: ProductUpdatePayload = {
        price: 120,
        inStock: false
      };

      const updatedProduct: Product = {
        id: 1,
        name: 'Product 1',
        price: 120,
        description: 'Test product',
        category: 'Electronics',
        inStock: false
      };

      service.update(1, updates).subscribe(product => {
        expect(product).toEqual(updatedProduct);
        expect(product.price).toBe(120);
        expect(product.inStock).toBe(false);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(updatedProduct);
    });
  });

  describe('patch', () => {
    it('should partially update an existing product', () => {
      const partialUpdate: Partial<ProductUpdatePayload> = {
        inStock: false
      };

      const patchedProduct: Product = {
        id: 1,
        name: 'Product 1',
        price: 100,
        description: 'Test product',
        category: 'Electronics',
        inStock: false
      };

      service.patch(1, partialUpdate).subscribe(product => {
        expect(product).toEqual(patchedProduct);
        expect(product.inStock).toBe(false);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(partialUpdate);
      req.flush(patchedProduct);
    });
  });

  describe('delete', () => {
    it('should delete a product', () => {
      service.delete(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting non-existent product', () => {
      service.delete(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Custom methods', () => {
    it('should filter products by category', () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Laptop', price: 999, category: 'Electronics', inStock: true },
        { id: 2, name: 'Mouse', price: 25, category: 'Electronics', inStock: true }
      ];

      service.getByCategory('Electronics').subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}?category=Electronics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should search products', () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Laptop Pro', price: 1299, category: 'Electronics', inStock: true },
        { id: 2, name: 'Laptop Basic', price: 799, category: 'Electronics', inStock: true }
      ];

      service.search('Laptop').subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/search?q=Laptop`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should create products in bulk', () => {
      const newProducts: ProductCreatePayload[] = [
        { name: 'Product A', price: 100 },
        { name: 'Product B', price: 200 }
      ];

      const createdProducts: Product[] = [
        { id: 1, name: 'Product A', price: 100, inStock: true },
        { id: 2, name: 'Product B', price: 200, inStock: true }
      ];

      service.createBulk(newProducts).subscribe(products => {
        expect(products).toEqual(createdProducts);
        expect(products.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/bulk`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProducts);
      req.flush(createdProducts);
    });
  });
});
