/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { register, login, getProfile, updateProfile } from './authController';
import { AuthRequest } from '../middleware/authMiddleware';

jest.mock('../models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

import User from '../models/User';
import jwt from 'jsonwebtoken';

const asMock = (fn: any): any => fn;
const mockFn = (): any => jest.fn() as any;

describe('Auth Controller', () => {
  let res: Partial<Response>;
  let next: any;
  let jsonSpy: any;
  let statusSpy: any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';

    jsonSpy = mockFn().mockReturnValue(undefined);
    statusSpy = mockFn().mockReturnValue({ json: jsonSpy });
    res = { status: statusSpy } as any;
    next = jest.fn();
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should call next with 400 if name is missing', async () => {
      const req = { body: { email: 'a@b.com', password: 'pass123' } } as Request;
      await register(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if email is missing', async () => {
      const req = { body: { name: 'Alice', password: 'pass123' } } as Request;
      await register(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if password is missing', async () => {
      const req = { body: { name: 'Alice', email: 'a@b.com' } } as Request;
      await register(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 409 if user already exists', async () => {
      asMock(User.findOne).mockResolvedValue({ _id: 'existing', email: 'a@b.com' });
      const req = { body: { name: 'Alice', email: 'a@b.com', password: 'pass123' } } as Request;
      await register(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
    });

    it('should return 201 on successful registration', async () => {
      asMock(User.findOne).mockResolvedValue(null);
      asMock(User.create).mockResolvedValue({ _id: 'newid', name: 'Alice', email: 'a@b.com' });
      asMock(jwt.sign).mockReturnValue('fake-token');

      const req = { body: { name: 'Alice', email: 'a@b.com', password: 'pass123' } } as Request;
      await register(req, res as Response, next as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith({ success: true, message: 'Registration successful' });
    });

    it('should call next with error on DB failure', async () => {
      asMock(User.findOne).mockRejectedValue(new Error('DB error'));
      const req = { body: { name: 'Alice', email: 'a@b.com', password: 'pass123' } } as Request;
      await register(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should call next with 400 if email is missing', async () => {
      const req = { body: { password: 'pass123' } } as Request;
      await login(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if password is missing', async () => {
      const req = { body: { email: 'a@b.com' } } as Request;
      await login(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 401 if user not found', async () => {
      asMock(User.findOne).mockReturnValue({ select: mockFn().mockResolvedValue(null) });
      const req = { body: { email: 'noone@b.com', password: 'pass123' } } as Request;
      await login(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should call next with 401 if password does not match', async () => {
      const mockUser = {
        _id: 'user1',
        name: 'Alice',
        email: 'a@b.com',
        comparePassword: mockFn().mockResolvedValue(false),
      };
      asMock(User.findOne).mockReturnValue({ select: mockFn().mockResolvedValue(mockUser) });
      const req = { body: { email: 'a@b.com', password: 'wrong' } } as Request;
      await login(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('should return 200 with token on successful login', async () => {
      const mockUser = {
        _id: 'user1',
        name: 'Alice',
        email: 'a@b.com',
        comparePassword: mockFn().mockResolvedValue(true),
      };
      asMock(User.findOne).mockReturnValue({ select: mockFn().mockResolvedValue(mockUser) });
      asMock(jwt.sign).mockReturnValue('fake-token');

      const req = { body: { email: 'a@b.com', password: 'pass123' } } as Request;
      await login(req, res as Response, next as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Login successful' })
      );
      const responseData = jsonSpy.mock.calls[0][0] as any;
      expect(responseData.data.token).toBe('fake-token');
      expect(responseData.data.user.email).toBe('a@b.com');
    });

    it('should call next with error on DB failure', async () => {
      asMock(User.findOne).mockReturnValue({
        select: mockFn().mockRejectedValue(new Error('DB error')),
      });
      const req = { body: { email: 'a@b.com', password: 'pass123' } } as Request;
      await login(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── getProfile ───────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should call next with 404 if user not found', async () => {
      asMock(User.findById).mockReturnValue({ select: mockFn().mockResolvedValue(null) });
      const req = { user: { id: 'user1' } } as AuthRequest;
      await getProfile(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should return 200 with user profile', async () => {
      const mockUser = { _id: 'user1', name: 'Alice', email: 'a@b.com' };
      asMock(User.findById).mockReturnValue({ select: mockFn().mockResolvedValue(mockUser) });
      const req = { user: { id: 'user1' } } as AuthRequest;
      await getProfile(req, res as Response, next as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Profile fetched successfully' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(User.findById).mockReturnValue({
        select: mockFn().mockRejectedValue(new Error('DB error')),
      });
      const req = { user: { id: 'user1' } } as AuthRequest;
      await getProfile(req, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── updateProfile ────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should call next with 404 if user not found', async () => {
      asMock(User.findById).mockResolvedValue(null);
      const req = { user: { id: 'user1' }, body: { name: 'Bob' } } as any;
      await updateProfile(req as AuthRequest, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should update name and return 200', async () => {
      const mockUser = {
        _id: 'user1', name: 'Alice', email: 'a@b.com', password: 'hashed',
        save: mockFn().mockResolvedValue(undefined),
      };
      asMock(User.findById).mockResolvedValue(mockUser);
      const req = { user: { id: 'user1' }, body: { name: 'Bob' } } as any;
      await updateProfile(req as AuthRequest, res as Response, next as NextFunction);

      expect(mockUser.name).toBe('Bob');
      expect(mockUser.save).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Profile updated successfully' })
      );
    });

    it('should update email when provided', async () => {
      const mockUser = {
        _id: 'user1', name: 'Alice', email: 'old@b.com', password: 'hashed',
        save: mockFn().mockResolvedValue(undefined),
      };
      asMock(User.findById).mockResolvedValue(mockUser);
      const req = { user: { id: 'user1' }, body: { email: 'new@b.com' } } as any;
      await updateProfile(req as AuthRequest, res as Response, next as NextFunction);
      expect(mockUser.email).toBe('new@b.com');
    });

    it('should update password when provided', async () => {
      const mockUser = {
        _id: 'user1', name: 'Alice', email: 'a@b.com', password: 'oldpass',
        save: mockFn().mockResolvedValue(undefined),
      };
      asMock(User.findById).mockResolvedValue(mockUser);
      const req = { user: { id: 'user1' }, body: { password: 'newpass123' } } as any;
      await updateProfile(req as AuthRequest, res as Response, next as NextFunction);
      expect(mockUser.password).toBe('newpass123');
    });

    it('should not change fields that are not provided', async () => {
      const mockUser = {
        _id: 'user1', name: 'Alice', email: 'a@b.com', password: 'hashed',
        save: mockFn().mockResolvedValue(undefined),
      };
      asMock(User.findById).mockResolvedValue(mockUser);
      const req = { user: { id: 'user1' }, body: {} } as any;
      await updateProfile(req as AuthRequest, res as Response, next as NextFunction);
      expect(mockUser.name).toBe('Alice');
      expect(mockUser.email).toBe('a@b.com');
    });

    it('should call next with error on DB failure', async () => {
      asMock(User.findById).mockRejectedValue(new Error('DB error'));
      const req = { user: { id: 'user1' }, body: {} } as any;
      await updateProfile(req as AuthRequest, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
