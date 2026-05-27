import { describe, it, expect } from '@jest/globals';
import Order from '../models/Order';

describe('Order Model', () => {
  describe('Order Schema', () => {
    it('should exist', () => {
      expect(Order).toBeDefined();
      expect(Order.schema).toBeDefined();
    });

    it('should have main order fields', () => {
      const schema = Order.schema;
      expect(schema.paths.user).toBeDefined();
      expect(schema.paths.items).toBeDefined();
      expect(schema.paths.totalAmount).toBeDefined();
      expect(schema.paths.shippingAddress).toBeDefined();
    });

    it('should have status field', () => {
      const schema = Order.schema;
      expect(schema.paths.status).toBeDefined();
    });

    it('should have paymentMethod field', () => {
      const schema = Order.schema;
      expect(schema.paths.paymentMethod).toBeDefined();
    });

    it('should have timestamps', () => {
      const schema = Order.schema;
      expect(schema.options.timestamps).toBe(true);
    });
  });

  describe('Order Relationships', () => {
    it('should reference User model', () => {
      const userPath = Order.schema.paths.user as any;
      expect(userPath.options.ref).toBe('User');
    });
  });
});
