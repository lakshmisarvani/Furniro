/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Response, NextFunction } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from './cartController';
import { AuthRequest } from '../middleware/authMiddleware';

jest.mock('../models/Cart', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

import Cart from '../models/Cart';

const asMock = (fn: any): any => fn;

describe('Cart Controller', () => {
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

  // ─── getCart ──────────────────────────────────────────────────────────────

  describe('getCart', () => {
    it('should return empty cart object when no cart exists', async () => {
      asMock(Cart.findOne).mockResolvedValue(null);
      await getCart(makeReq(), res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.cart.items).toEqual([]);
    });

    it('should return 200 with existing cart', async () => {
      const mockCart = { user: userId, items: [{ productId: 'p1', quantity: 2 }] };
      asMock(Cart.findOne).mockResolvedValue(mockCart);
      await getCart(makeReq(), res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Cart fetched successfully' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Cart.findOne).mockRejectedValue(new Error('DB error'));
      await getCart(makeReq(), res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── addToCart ────────────────────────────────────────────────────────────

  describe('addToCart', () => {
    it('should call next with 400 if productId is missing', async () => {
      const req = makeReq({ body: { name: 'Chair', price: 100 } });
      await addToCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if name is missing', async () => {
      const req = makeReq({ body: { productId: 'p1', price: 100 } });
      await addToCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if price is missing', async () => {
      const req = makeReq({ body: { productId: 'p1', name: 'Chair' } });
      await addToCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if quantity is less than 1', async () => {
      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100, quantity: 0 } });
      await addToCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should create a new cart when no cart exists', async () => {
      const newCart = { user: userId, items: [{ productId: 'p1', name: 'Chair', price: 100, quantity: 1 }] };
      asMock(Cart.findOne).mockResolvedValue(null);
      asMock(Cart.create).mockResolvedValue(newCart);

      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100 } });
      await addToCart(req, res as Response, next as unknown as NextFunction);

      expect(Cart.create).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Item added to cart' })
      );
    });

    it('should increment quantity for existing item in cart', async () => {
      const item = { productId: 'p1', name: 'Chair', price: 100, quantity: 2 };
      const mockCart = {
        user: userId,
        items: [item],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Cart.findOne).mockResolvedValue(mockCart);

      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100, quantity: 3 } });
      await addToCart(req, res as Response, next as unknown as NextFunction);

      expect(item.quantity).toBe(5);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should push a new item to an existing cart', async () => {
      const mockCart = {
        user: userId,
        items: [{ productId: 'p1', name: 'Chair', price: 100, quantity: 1 }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Cart.findOne).mockResolvedValue(mockCart);

      const req = makeReq({ body: { productId: 'p2', name: 'Table', price: 200, quantity: 1 } });
      await addToCart(req, res as Response, next as unknown as NextFunction);

      expect(mockCart.items).toHaveLength(2);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should call next with error on DB failure', async () => {
      asMock(Cart.findOne).mockRejectedValue(new Error('DB error'));
      const req = makeReq({ body: { productId: 'p1', name: 'Chair', price: 100 } });
      await addToCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── updateCartItem ───────────────────────────────────────────────────────

  describe('updateCartItem', () => {
    it('should call next with 400 if quantity is 0', async () => {
      const req = makeReq({ params: { productId: 'p1' }, body: { quantity: 0 } });
      await updateCartItem(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if quantity is missing', async () => {
      const req = makeReq({ params: { productId: 'p1' }, body: {} });
      await updateCartItem(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 404 if cart not found', async () => {
      asMock(Cart.findOne).mockResolvedValue(null);
      const req = makeReq({ params: { productId: 'p1' }, body: { quantity: 3 } });
      await updateCartItem(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should call next with 404 if item not in cart', async () => {
      const mockCart = { items: [], save: jest.fn() };
      asMock(Cart.findOne).mockResolvedValue(mockCart);
      const req = makeReq({ params: { productId: 'p99' }, body: { quantity: 3 } });
      await updateCartItem(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should update quantity and return 200', async () => {
      const item = { productId: 'p1', quantity: 1 };
      const mockCart = { items: [item], save: (jest.fn() as any).mockResolvedValue(undefined) };
      asMock(Cart.findOne).mockResolvedValue(mockCart);

      const req = makeReq({ params: { productId: 'p1' }, body: { quantity: 5 } });
      await updateCartItem(req, res as Response, next as unknown as NextFunction);

      expect(item.quantity).toBe(5);
      expect(mockCart.save).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it('should call next with error on DB failure', async () => {
      asMock(Cart.findOne).mockRejectedValue(new Error('DB error'));
      const req = makeReq({ params: { productId: 'p1' }, body: { quantity: 2 } });
      await updateCartItem(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── removeFromCart ───────────────────────────────────────────────────────

  describe('removeFromCart', () => {
    it('should call next with 404 if cart not found', async () => {
      asMock(Cart.findOne).mockResolvedValue(null);
      const req = makeReq({ params: { productId: 'p1' } });
      await removeFromCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should remove item and return 200', async () => {
      const mockCart = {
        items: [{ productId: 'p1' }, { productId: 'p2' }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Cart.findOne).mockResolvedValue(mockCart);

      const req = makeReq({ params: { productId: 'p1' } });
      await removeFromCart(req, res as Response, next as unknown as NextFunction);

      expect(mockCart.items).toHaveLength(1);
      expect(mockCart.items[0].productId).toBe('p2');
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it('should call next with error on DB failure', async () => {
      asMock(Cart.findOne).mockRejectedValue(new Error('DB error'));
      const req = makeReq({ params: { productId: 'p1' } });
      await removeFromCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── clearCart ────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('should call next with 404 if cart not found', async () => {
      asMock(Cart.findOne).mockResolvedValue(null);
      await clearCart(makeReq(), res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should clear items and return 200', async () => {
      const mockCart = {
        items: [{ productId: 'p1' }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Cart.findOne).mockResolvedValue(mockCart);
      await clearCart(makeReq(), res as Response, next as unknown as NextFunction);

      expect(mockCart.items).toHaveLength(0);
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Cart cleared' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Cart.findOne).mockRejectedValue(new Error('DB error'));
      await clearCart(makeReq(), res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── syncCart ─────────────────────────────────────────────────────────────

  describe('syncCart', () => {
    it('should call next with 400 if items is not an array', async () => {
      const req = makeReq({ body: { items: 'invalid' } });
      await syncCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should create new cart if none exists', async () => {
      const items = [{ productId: 'p1', name: 'Chair', price: 100, quantity: 1 }];
      const newCart = { user: userId, items };
      asMock(Cart.findOne).mockResolvedValue(null);
      asMock(Cart.create).mockResolvedValue(newCart);

      const req = makeReq({ body: { items } });
      await syncCart(req, res as Response, next as unknown as NextFunction);

      expect(Cart.create).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Cart synced' })
      );
    });

    it('should replace items in existing cart', async () => {
      const newItems = [{ productId: 'p3', name: 'Lamp', price: 50, quantity: 1 }];
      const mockCart = {
        items: [{ productId: 'p1' }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Cart.findOne).mockResolvedValue(mockCart);

      const req = makeReq({ body: { items: newItems } });
      await syncCart(req, res as Response, next as unknown as NextFunction);

      expect(mockCart.items).toEqual(newItems);
      expect(mockCart.save).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it('should call next with error on DB failure', async () => {
      asMock(Cart.findOne).mockRejectedValue(new Error('DB error'));
      const req = makeReq({ body: { items: [] } });
      await syncCart(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
