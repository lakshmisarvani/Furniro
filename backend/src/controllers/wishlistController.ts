import { Response, NextFunction } from 'express';
import Wishlist from '../models/Wishlist';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';

export const getWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id });

    res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: { wishlist: wishlist || { user: req.user!.id, items: [] } },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, name, price, image } = req.body;

    if (!productId || !name || price === undefined) {
      return next(createError('productId, name and price are required', 400));
    }

    const pid = String(productId);
    let wishlist = await Wishlist.findOne({ user: req.user!.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user!.id,
        items: [{ productId: pid, name, price, image: image || '' }],
      });

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        data: { wishlist, action: 'added' },
      });
      return;
    }

    const exists = wishlist.items.some(i => i.productId === pid);

    if (exists) {
      wishlist.items = wishlist.items.filter(i => i.productId !== pid);
      await wishlist.save();

      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: { wishlist, action: 'removed' },
      });
    } else {
      wishlist.items.push({ productId: pid, name, price, image: image || '' });
      await wishlist.save();

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        data: { wishlist, action: 'added' },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const syncWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return next(createError('items must be an array', 400));
    }

    let wishlist = await Wishlist.findOne({ user: req.user!.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user!.id, items });
    } else {
      wishlist.items = items;
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'Wishlist synced',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};
