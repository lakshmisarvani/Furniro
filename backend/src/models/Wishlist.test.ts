import { describe, it, expect } from '@jest/globals';
import Wishlist from '../models/Wishlist';

describe('Wishlist Model', () => {
  describe('Wishlist Schema', () => {
    it('should exist', () => {
      expect(Wishlist).toBeDefined();
      expect(Wishlist.schema).toBeDefined();
    });

    it('should have user and items fields', () => {
      const schema = Wishlist.schema;
      expect(schema.paths.user).toBeDefined();
      expect(schema.paths.items).toBeDefined();
    });

    it('should reference User model', () => {
      const userPath = Wishlist.schema.paths.user as any;
      expect(userPath.options.ref).toBe('User');
      expect(userPath.options.unique).toBe(true);
    });

    it('should have timestamps', () => {
      const schema = Wishlist.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('WishlistItem Schema', () => {
    it('should have valid item structure', () => {
      const schema = Wishlist.schema;
      expect(schema.paths.items).toBeDefined();
    });
  });
});
