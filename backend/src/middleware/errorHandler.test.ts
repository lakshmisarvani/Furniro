import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, createError, AppError } from '../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    jsonSpy = jest.fn().mockReturnValue(undefined);
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    req = {};
    res = {
      status: statusSpy,
    } as any;

    next = jest.fn();
  });

  describe('errorHandler middleware', () => {
    it('should handle error with statusCode', () => {
      const error: AppError = new Error('Test error');
      error.statusCode = 404;

      errorHandler(error, req as Request, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Test error',
        data: null,
      });
    });

    it('should use 500 as default statusCode', () => {
      const error: AppError = new Error('Internal error');

      errorHandler(error, req as Request, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Internal error',
        data: null,
      });
    });

    it('should use default message if error message is empty', () => {
      const error: AppError = new Error();
      error.statusCode = 500;

      errorHandler(error, req as Request, res as Response, next);

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error',
        data: null,
      });
    });

    it('should log error to console', () => {
      const error: AppError = new Error('Test error');
      error.statusCode = 404;

      errorHandler(error, req as Request, res as Response, next);

      expect(console.error).toHaveBeenCalledWith('[ERROR] 404 - Test error');
    });

    it('should handle error without statusCode', () => {
      const error: AppError = new Error('Generic error');

      errorHandler(error, req as Request, res as Response, next);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: 'Generic error',
        data: null,
      });
    });
  });

  describe('createError function', () => {
    it('should create an error with message and statusCode', () => {
      const error = createError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error).toBeInstanceOf(Error);
    });

    it('should create an error with custom message', () => {
      const customMessage = 'User not found';
      const error = createError(customMessage, 404);

      expect(error.message).toBe(customMessage);
    });

    it('should support different status codes', () => {
      expect(createError('message', 400).statusCode).toBe(400);
      expect(createError('message', 401).statusCode).toBe(401);
      expect(createError('message', 403).statusCode).toBe(403);
      expect(createError('message', 500).statusCode).toBe(500);
    });

    it('should create error that is instance of AppError', () => {
      const error = createError('test', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBeDefined();
    });
  });
});
