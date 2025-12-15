/**
 * Product entity interface
 * Represents the complete structure of a Product resource
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  inStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payload interface for creating a new Product
 * Excludes auto-generated fields like id, createdAt, updatedAt
 */
export interface ProductCreatePayload {
  name: string;
  price: number;
  description?: string;
  category?: string;
  inStock?: boolean;
}

/**
 * Payload interface for updating an existing Product
 * All fields are optional except those required for business logic
 */
export interface ProductUpdatePayload {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  inStock?: boolean;
}
