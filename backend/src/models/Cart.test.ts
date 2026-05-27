import { describe, it, expect } from '@jest/globals';
import Cart from '../models/Cart';

describe('Cart Model', () => {
  describe('Cart Schema', () => {
    it('should exist', () => {
      expect(Cart).toBeDefined();
      expect(Cart.schema).toBeDefined();
    });

    it('should have user and items fields', () => {
      const schema = Cart.schema;
      expect(schema.paths.user).toBeDefined();
      expect(schema.paths.items).toBeDefined();
    });

    it('should reference User model', () => {
      const userPath = Cart.schema.paths.user as any;
      expect(userPath.options.ref).toBe('User');
      expect(userPath.options.unique).toBe(true);
    });

    it('should have timestamps', () => {
      const schema = Cart.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('CartItem Schema', () => {
    it('should have valid item structure', () => {
      const schema = Cart.schema;
      expect(schema.paths.items).toBeDefined();
    });
  });
});
