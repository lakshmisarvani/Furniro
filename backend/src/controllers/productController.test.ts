/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  getAllProducts,
  compareProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from './productController';

jest.mock('../models/Product', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}));

import Product from '../models/Product';

const asMock = (fn: any): any => fn;

const buildFindChain = (resolvedValue: any) => {
  const limitMock = (jest.fn() as any).mockResolvedValue(resolvedValue);
  const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
  const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
  return { sort: sortMock };
};

describe('Product Controller', () => {
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  const mockProduct = {
    _id: 'prod1',
    name: 'Modern Sofa',
    description: 'A comfy sofa',
    price: 499,
    category: 'Living Room',
    stock: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jsonSpy = jest.fn().mockReturnValue(undefined);
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    res = { status: statusSpy } as any;
    next = jest.fn();
  });

  // ─── getAllProducts ────────────────────────────────────────────────────────

  describe('getAllProducts', () => {
    it('should return 200 with default pagination', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([mockProduct]));
      asMock(Product.countDocuments).mockResolvedValue(1);

      const req = { query: {} } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Products fetched successfully' })
      );
    });

    it('should apply search filter when search param is provided', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([]));
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { search: 'sofa' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      const callArg = asMock(Product.find).mock.calls[0][0] as any;
      expect(callArg.$or).toBeDefined();
    });

    it('should apply category filter when category param is provided', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([]));
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { category: 'Bedroom' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      const callArg = asMock(Product.find).mock.calls[0][0] as any;
      expect(callArg.category).toBe('Bedroom');
    });

    it('should apply minPrice filter', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([]));
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { minPrice: '100' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      const callArg = asMock(Product.find).mock.calls[0][0] as any;
      expect(callArg.price.$gte).toBe(100);
    });

    it('should apply maxPrice filter', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([]));
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { maxPrice: '500' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      const callArg = asMock(Product.find).mock.calls[0][0] as any;
      expect(callArg.price.$lte).toBe(500);
    });

    it('should apply price_asc sort', async () => {
      const chain = buildFindChain([]);
      asMock(Product.find).mockReturnValue(chain);
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { sort: 'price_asc' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      expect(chain.sort).toHaveBeenCalledWith({ price: 1 });
    });

    it('should apply price_desc sort', async () => {
      const chain = buildFindChain([]);
      asMock(Product.find).mockReturnValue(chain);
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { sort: 'price_desc' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      expect(chain.sort).toHaveBeenCalledWith({ price: -1 });
    });

    it('should apply name sort', async () => {
      const chain = buildFindChain([]);
      asMock(Product.find).mockReturnValue(chain);
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { sort: 'name' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      expect(chain.sort).toHaveBeenCalledWith({ name: 1 });
    });

    it('should apply newest sort', async () => {
      const chain = buildFindChain([]);
      asMock(Product.find).mockReturnValue(chain);
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { sort: 'newest' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should clamp page to minimum 1', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([]));
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { page: '-5', limit: '10' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.currentPage).toBe(1);
    });

    it('should clamp limit to maximum 100', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([]));
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: { limit: '999' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.limit).toBe(100);
    });

    it('should calculate totalPages correctly', async () => {
      asMock(Product.find).mockReturnValue(buildFindChain([]));
      asMock(Product.countDocuments).mockResolvedValue(50);

      const req = { query: { limit: '16' } } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);

      const data = (jsonSpy.mock.calls[0] as any[])[0] as any;
      expect(data.data.totalPages).toBe(4);
    });

    it('should call next with error on DB failure', async () => {
      asMock(Product.find).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: (jest.fn() as any).mockRejectedValue(new Error('DB error')),
          }),
        }),
      });
      asMock(Product.countDocuments).mockResolvedValue(0);

      const req = { query: {} } as unknown as Request;
      await getAllProducts(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── compareProducts ──────────────────────────────────────────────────────

  describe('compareProducts', () => {
    it('should call next with 400 if ids param is missing', async () => {
      const req = { query: {} } as unknown as Request;
      await compareProducts(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if fewer than 2 ids', async () => {
      const req = { query: { ids: 'id1' } } as unknown as Request;
      await compareProducts(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with 400 if more than 4 ids', async () => {
      const req = { query: { ids: 'id1,id2,id3,id4,id5' } } as unknown as Request;
      await compareProducts(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should return 200 with 2 products', async () => {
      asMock(Product.find).mockResolvedValue([mockProduct, { ...mockProduct, _id: 'prod2' }]);
      const req = { query: { ids: 'id1,id2' } } as unknown as Request;
      await compareProducts(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Products fetched for comparison' })
      );
    });

    it('should return 200 with up to 4 products', async () => {
      asMock(Product.find).mockResolvedValue([mockProduct]);
      const req = { query: { ids: 'id1,id2,id3,id4' } } as unknown as Request;
      await compareProducts(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it('should call next with error on DB failure', async () => {
      asMock(Product.find).mockRejectedValue(new Error('DB error'));
      const req = { query: { ids: 'id1,id2' } } as unknown as Request;
      await compareProducts(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── getProductById ───────────────────────────────────────────────────────

  describe('getProductById', () => {
    it('should call next with 404 if product not found', async () => {
      asMock(Product.findById).mockResolvedValue(null);
      const req = { params: { id: 'nonexistent' } } as unknown as Request;
      await getProductById(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should return 200 with product', async () => {
      asMock(Product.findById).mockResolvedValue(mockProduct);
      const req = { params: { id: 'prod1' } } as unknown as Request;
      await getProductById(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Product fetched successfully' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Product.findById).mockRejectedValue(new Error('DB error'));
      const req = { params: { id: 'prod1' } } as unknown as Request;
      await getProductById(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── createProduct ────────────────────────────────────────────────────────

  describe('createProduct', () => {
    it('should return 201 with created product', async () => {
      asMock(Product.create).mockResolvedValue(mockProduct);
      const req = { body: mockProduct } as Request;
      await createProduct(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Product created successfully' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Product.create).mockRejectedValue(new Error('Validation error'));
      const req = { body: {} } as Request;
      await createProduct(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── updateProduct ────────────────────────────────────────────────────────

  describe('updateProduct', () => {
    it('should call next with 404 if product not found', async () => {
      asMock(Product.findByIdAndUpdate).mockResolvedValue(null);
      const req = { params: { id: 'prod1' }, body: { price: 599 } } as unknown as Request;
      await updateProduct(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should return 200 with updated product', async () => {
      const updated = { ...mockProduct, price: 599 };
      asMock(Product.findByIdAndUpdate).mockResolvedValue(updated);
      const req = { params: { id: 'prod1' }, body: { price: 599 } } as unknown as Request;
      await updateProduct(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Product updated successfully' })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Product.findByIdAndUpdate).mockRejectedValue(new Error('DB error'));
      const req = { params: { id: 'prod1' }, body: {} } as unknown as Request;
      await updateProduct(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ─── deleteProduct ────────────────────────────────────────────────────────

  describe('deleteProduct', () => {
    it('should call next with 404 if product not found', async () => {
      asMock(Product.findByIdAndDelete).mockResolvedValue(null);
      const req = { params: { id: 'prod1' } } as unknown as Request;
      await deleteProduct(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should return 200 on successful deletion', async () => {
      asMock(Product.findByIdAndDelete).mockResolvedValue(mockProduct);
      const req = { params: { id: 'prod1' } } as unknown as Request;
      await deleteProduct(req, res as Response, next as unknown as NextFunction);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Product deleted successfully', data: null })
      );
    });

    it('should call next with error on DB failure', async () => {
      asMock(Product.findByIdAndDelete).mockRejectedValue(new Error('DB error'));
      const req = { params: { id: 'prod1' } } as unknown as Request;
      await deleteProduct(req, res as Response, next as unknown as NextFunction);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
