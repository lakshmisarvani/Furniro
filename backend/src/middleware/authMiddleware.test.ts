import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jsonSpy = jest.fn().mockReturnValue(undefined);
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    req = {
      headers: {},
    };

    res = {
      status: statusSpy,
    } as any;

    next = jest.fn();
  });

  describe('protect middleware', () => {
    it('should return 401 if no authorization header', () => {
      req.headers = {};

      protect(req as AuthRequest, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized. No token provided.',
        data: null,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      req.headers = { authorization: 'Basic token' };

      protect(req as AuthRequest, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized. No token provided.',
        data: null,
      });
    });

    it('should return 500 if JWT_SECRET is not configured', () => {
      req.headers = { authorization: 'Bearer validtoken' };
      process.env.JWT_SECRET = '';

      protect(req as AuthRequest, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Server configuration error.',
        data: null,
      });
    });

    it('should verify token and call next on valid token', () => {
      process.env.JWT_SECRET = 'test-secret';
      req.headers = { authorization: 'Bearer validtoken' };

      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });

      protect(req as AuthRequest, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith('validtoken', 'test-secret');
      expect((req as AuthRequest).user).toEqual({ id: 'user123' });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 on invalid token', () => {
      process.env.JWT_SECRET = 'test-secret';
      req.headers = { authorization: 'Bearer invalidtoken' };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      protect(req as AuthRequest, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized. Invalid token.',
        data: null,
      });
    });

    it('should extract token correctly from Bearer header', () => {
      process.env.JWT_SECRET = 'test-secret';
      const testToken = 'test-token-12345';
      req.headers = { authorization: `Bearer ${testToken}` };

      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });

      protect(req as AuthRequest, res as Response, next);

      expect(jwt.verify).toHaveBeenCalledWith(testToken, 'test-secret');
    });
  });
});
