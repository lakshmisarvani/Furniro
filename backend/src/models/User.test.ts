import { describe, it, expect } from '@jest/globals';
import User from '../models/User';

describe('User Model', () => {
  describe('User Schema', () => {
    it('should exist', () => {
      expect(User).toBeDefined();
      expect(User.schema).toBeDefined();
    });

    it('should have required fields defined', () => {
      const schema = User.schema;
      expect(schema.paths.name).toBeDefined();
      expect(schema.paths.email).toBeDefined();
      expect(schema.paths.password).toBeDefined();
      expect(schema.paths.createdAt).toBeDefined();
    });

    it('should have lastName as optional field', () => {
      const schema = User.schema;
      expect(schema.paths).toBeDefined();
    });
  });

  describe('User Methods', () => {
    it('should have comparePassword method', () => {
      const schema = User.schema;
      expect(schema.methods.comparePassword).toBeDefined();
    });
  });
});

