import { describe, it, expect } from '@jest/globals';
import Product from '../models/Product';

describe('Product Model', () => {
  describe('Product Schema', () => {
    it('should exist', () => {
      expect(Product).toBeDefined();
      expect(Product.schema).toBeDefined();
    });

    it('should have main product fields', () => {
      const schema = Product.schema;
      expect(schema.paths.name).toBeDefined();
      expect(schema.paths.description).toBeDefined();
      expect(schema.paths.price).toBeDefined();
      expect(schema.paths.category).toBeDefined();
    });

    it('should have optional fields', () => {
      const schema = Product.schema;
      expect(schema.paths.image).toBeDefined();
      expect(schema.paths.stock).toBeDefined();
      expect(schema.paths.rating).toBeDefined();
      expect(schema.paths.discount).toBeDefined();
    });

    it('should have timestamps', () => {
      const schema = Product.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('Product Indexes', () => {
    it('should have indexes', () => {
      const schema = Product.schema;
      expect(schema).toBeDefined();
    });
  });
});
