/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Response, NextFunction } from 'express';
import { getWishlist, toggleWishlist, syncWishlist } from './wishlistController';
import { AuthRequest } from '../middleware/authMiddleware';

jest.mock('../models/Wishlist', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

import Wishlist from '../models/Wishlist';

const asMock = (fn: any): any => fn;

describe('Wishlist Controller', () => {
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  const userId = 'user1';
  const makeReq = (overrides: Record<string, unknown> = {}): AuthRequest =>
    ({ user: { id: userId }, body: {}, params: {}, ...overrides } as any);

  beforeEach(() => {
    jest.clearAllMocks();
    jsonSpy = jest.fn().mockReturnValue(undefined);
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    res = { status: statusSpy } as any;
    next = jest.fn();
  });

  // ─── getWishlist ──────────────────────────────────────────────────────────

  describe('getWishlist', () => {
    it('should return empty wishlist when none exists', async () => {
      asMock(Wishlist.findOne).mockResolvedValue(null);
      await getWishlist(makeReq(), res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.wishlist.items).toEqual([]);
    });

    it('should return 200 with existing wishlist', async () => {
      const mockWishlist = { user: userId, items: [{ productId: 'p1', name: 'Chair', price: 100 }] };
      asMock(Wishlist.findOne).mockResolvedValue(mockWishlist);
      await getWishlist(makeReq(), res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Wishlist fetched successfully' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Wishlist.findOne).mockRejectedValue(new Error('DB error'));
      await getWishlist(makeReq(), res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── toggleWishlist ───────────────────────────────────────────────────────

  describe('toggleWishlist', () => {
    it('should call next with 400 if productId is missing', async () => {
      const req = makeReq({ body: { name: 'Chair', price: 100 } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if name is missing', async () => {
      const req = makeReq({ body: { productId: 'p1', price: 100 } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if price is missing', async () => {
      const req = makeReq({ body: { productId: 'p1', name: 'Chair' } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should create wishlist and add item when no wishlist exists', async () => {
      const newWishlist = {
        user: userId,
        items: [{ productId: 'p1', name: 'Chair', price: 100, image: '' }],
      };
      asMock(Wishlist.findOne).mockResolvedValue(null);
      asMock(Wishlist.create).mockResolvedValue(newWishlist);

      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100 } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);

      expect(Wishlist.create).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.action).toBe('added');
      expect(data.message).toBe('Product added to wishlist');
    });

    it('should remove item if it already exists in wishlist', async () => {
      const mockWishlist = {
        user: userId,
        items: [{ productId: 'p1', name: 'Chair', price: 100, image: '' }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Wishlist.findOne).mockResolvedValue(mockWishlist);

      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100 } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);

      expect(mockWishlist.items).toHaveLength(0);
      expect(mockWishlist.save).toHaveBeenCalled();
      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.action).toBe('removed');
      expect(data.message).toBe('Product removed from wishlist');
    });

    it('should add item when it does not exist in wishlist', async () => {
      const mockWishlist = {
        user: userId,
        items: [{ productId: 'p2', name: 'Table', price: 200, image: '' }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Wishlist.findOne).mockResolvedValue(mockWishlist);

      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100 } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);

      expect(mockWishlist.items).toHaveLength(2);
      expect(mockWishlist.save).toHaveBeenCalled();
      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.action).toBe('added');
    });

    it('should use empty string for image when not provided', async () => {
      const newWishlist = { user: userId, items: [] };
      asMock(Wishlist.findOne).mockResolvedValue(null);
      asMock(Wishlist.create).mockResolvedValue(newWishlist);

      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100 } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);

      const createArg = asMock(Wishlist.create).mock.calls[0][0] as any;
      expect(createArg.items[0].image).toBe('');
    });

    it('should call next with error on DB failure', async () => {
      asMock(Wishlist.findOne).mockRejectedValue(new Error('DB error'));
      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100 } });
      await toggleWishlist(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── syncWishlist ─────────────────────────────────────────────────────────

  describe('syncWishlist', () => {
    it('should call next with 400 if items is not an array', async () => {
      const req = makeReq({ body: { items: 'invalid' } });
      await syncWishlist(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should create new wishlist if none exists', async () => {
      const items = [{ productId: 'p1', name: 'Chair', price: 100, image: '' }];
      const newWishlist = { user: userId, items };
      asMock(Wishlist.findOne).mockResolvedValue(null);
      asMock(Wishlist.create).mockResolvedValue(newWishlist);

      const req = makeReq({ body: { items } });
      await syncWishlist(req, res as Response, next as unknown as NextFunction);

      expect(Wishlist.create).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Wishlist synced' })
      );
    });

    it('should replace items in existing wishlist', async () => {
      const newItems = [{ productId: 'p3', name: 'Lamp', price: 50, image: '' }];
      const mockWishlist = {
        items: [{ productId: 'p1' }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Wishlist.findOne).mockResolvedValue(mockWishlist);

      const req = makeReq({ body: { items: newItems } });
      await syncWishlist(req, res as Response, next as unknown as NextFunction);

      expect(mockWishlist.items).toEqual(newItems);
      expect(mockWishlist.save).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it('should sync with empty items array', async () => {
      const mockWishlist = {
        items: [{ productId: 'p1' }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Wishlist.findOne).mockResolvedValue(mockWishlist);

      const req = makeReq({ body: { items: [] } });
      await syncWishlist(req, res as Response, next as unknown as NextFunction);

      expect(mockWishlist.items).toHaveLength(0);
    });

    it('should call next with error on DB failure', async () => {
      asMock(Wishlist.findOne).mockRejectedValue(new Error('DB error'));
      const req = makeReq({ body: { items: [] } });
      await syncWishlist(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
