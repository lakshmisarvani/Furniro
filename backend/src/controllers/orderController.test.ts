/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Response, NextFunction } from 'express';
import { placeOrder, getUserOrders, getOrderById } from './orderController';
import { AuthRequest } from '../middleware/authMiddleware';

jest.mock('../models/Order', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../models/Cart', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('../models/Product', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';

const asMock = (fn: any): any => fn;

describe('Order Controller', () => {
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  const userId = 'user1';
  const makeReq = (overrides: Record<string, unknown> = {}): AuthRequest =>
    ({ user: { id: userId }, body: {}, params: {}, ...overrides } as any);

  const mockShipping = { street: '123 Main St', city: 'Springfield', zip: '12345', country: 'USA' };

  beforeEach(() => {
    jest.clearAllMocks();
    jsonSpy = jest.fn().mockReturnValue(undefined);
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    res = { status: statusSpy } as any;
    next = jest.fn();
  });

  // ─── placeOrder ───────────────────────────────────────────────────────────

  describe('placeOrder', () => {
    it('should call next with 400 if shippingAddress is missing', async () => {
      const req = makeReq({ body: { paymentMethod: 'bank' } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if shippingAddress.street is missing', async () => {
      const req = makeReq({ body: { shippingAddress: { city: 'Springfield' } } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if shippingAddress.city is missing', async () => {
      const req = makeReq({ body: { shippingAddress: { street: '123 Main St' } } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if cart is null', async () => {
      asMock(Cart.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(null) });
      const req = makeReq({ body: { shippingAddress: mockShipping } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if cart is empty', async () => {
      const emptyCart = { items: [], save: jest.fn() };
      asMock(Cart.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(emptyCart) });
      const req = makeReq({ body: { shippingAddress: mockShipping } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 404 if product not found', async () => {
      const cart = { items: [{ productId: 'p1', quantity: 1 }], save: jest.fn() };
      asMock(Cart.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(cart) });
      asMock(Product.findById).mockResolvedValue(null);

      const req = makeReq({ body: { shippingAddress: mockShipping } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should call next with 400 if product has insufficient stock', async () => {
      const cart = { items: [{ productId: 'p1', quantity: 10 }], save: jest.fn() };
      asMock(Cart.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(cart) });
      const mockProduct = { _id: 'p1', name: 'Chair', price: 100, stock: 5, save: jest.fn() };
      asMock(Product.findById).mockResolvedValue(mockProduct);

      const req = makeReq({ body: { shippingAddress: mockShipping } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should place order successfully and return 201', async () => {
      const cart = {
        items: [{ productId: 'p1', quantity: 2 }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Cart.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(cart) });

      const mockProduct = {
        _id: 'p1', name: 'Chair', price: 100, stock: 10,
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Product.findById).mockResolvedValue(mockProduct);

      const mockOrder = {
        _id: 'order1',
        populate: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Order.create).mockResolvedValue(mockOrder);

      const req = makeReq({ body: { shippingAddress: mockShipping, paymentMethod: 'bank' } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);

      expect(mockProduct.stock).toBe(8);
      expect(cart.save).toHaveBeenCalled();
      expect(cart.items).toHaveLength(0);
      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Order placed successfully' })
      );
    });

    it('should use default paymentMethod "bank" when not provided', async () => {
      const cart = {
        items: [{ productId: 'p1', quantity: 1 }],
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Cart.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(cart) });

      const mockProduct = {
        _id: 'p1', name: 'Chair', price: 100, stock: 5,
        save: (jest.fn() as any).mockResolvedValue(undefined),
      };
      asMock(Product.findById).mockResolvedValue(mockProduct);

      const mockOrder = { _id: 'order1', populate: (jest.fn() as any).mockResolvedValue(undefined) };
      asMock(Order.create).mockResolvedValue(mockOrder);

      const req = makeReq({ body: { shippingAddress: mockShipping } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);

      const createCall = asMock(Order.create).mock.calls[0][0] as any;
      expect(createCall.paymentMethod).toBe('bank');
    });

    it('should call next with error on DB failure', async () => {
      asMock(Cart.findOne).mockReturnValue({
        populate: (jest.fn() as any).mockRejectedValue(new Error('DB error')),
      });
      const req = makeReq({ body: { shippingAddress: mockShipping } });
      await placeOrder(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── getUserOrders ────────────────────────────────────────────────────────

  describe('getUserOrders', () => {
    it('should return 200 with orders list', async () => {
      const mockOrders = [{ _id: 'o1', totalAmount: 200 }];
      const mockSort = (jest.fn() as any).mockResolvedValue(mockOrders);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      asMock(Order.find).mockReturnValue({ populate: mockPopulate });

      await getUserOrders(makeReq(), res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Orders fetched successfully' })
      );
      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.count).toBe(1);
    });

    it('should return empty orders array when user has no orders', async () => {
      const mockSort = (jest.fn() as any).mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      asMock(Order.find).mockReturnValue({ populate: mockPopulate });

      await getUserOrders(makeReq(), res as Response, next as unknown as NextFunction);

      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.count).toBe(0);
      expect(data.data.orders).toEqual([]);
    });

    it('should call next with error on DB failure', async () => {
      const mockSort = (jest.fn() as any).mockRejectedValue(new Error('DB error'));
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      asMock(Order.find).mockReturnValue({ populate: mockPopulate });

      await getUserOrders(makeReq(), res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── getOrderById ─────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    it('should call next with 404 if order not found', async () => {
      asMock(Order.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(null) });
      const req = makeReq({ params: { id: 'order1' } });
      await getOrderById(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should return 200 with order data', async () => {
      const mockOrder = { _id: 'order1', totalAmount: 200 };
      asMock(Order.findOne).mockReturnValue({ populate: (jest.fn() as any).mockResolvedValue(mockOrder) });
      const req = makeReq({ params: { id: 'order1' } });
      await getOrderById(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Order fetched successfully' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Order.findOne).mockReturnValue({
        populate: (jest.fn() as any).mockRejectedValue(new Error('DB error')),
      });
      const req = makeReq({ params: { id: 'order1' } });
      await getOrderById(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
