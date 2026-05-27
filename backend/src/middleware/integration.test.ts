import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Response, NextFunction } from 'express';
import { protect } from '../middleware/authMiddleware';
import { errorHandler, createError } from '../middleware/errorHandler';

describe('Backend Controllers and Middleware', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { headers: {}, user: undefined, body: {} };
    mockRes = {
      status: jest.fn().mockReturnValue({
        json: jest.fn().mockReturnValue(undefined),
      }),
    } as any;
    mockNext = jest.fn();
  });

  describe('Error Handler', () => {
    it('should handle errors with status code', () => {
      const error = createError('Not found', 404);
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create errors with different status codes', () => {
      expect(createError('Bad request', 400).statusCode).toBe(400);
      expect(createError('Unauthorized', 401).statusCode).toBe(401);
      expect(createError('Server error', 500).statusCode).toBe(500);
    });

    it('should handle error responses', () => {
      const error = createError('Test error', 404);
      errorHandler(error, mockReq, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Auth Middleware', () => {
    it('should return 401 without authorization header', () => {
      protect(mockReq, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should require Bearer token format', () => {
      mockReq.headers.authorization = 'InvalidFormat token';
      protect(mockReq, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
