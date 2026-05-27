import { Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });

    res.status(200).json({
      success: true,
      message: 'Cart fetched successfully',
      data: { cart: cart || { user: req.user!.id, items: [] } },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, name, price, image, quantity = 1, color = '', size = '' } = req.body;

    if (!productId || !name || price === undefined) {
      return next(createError('productId, name and price are required', 400));
    }

    if (quantity < 1) {
      return next(createError('Quantity must be at least 1', 400));
    }

    let cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user!.id,
        items: [{ productId: String(productId), name, price, image, quantity, color, size }],
      });
    } else {
      const pid = String(productId);
      const existing = cart.items.find(i => i.productId === pid);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ productId: pid, name, price, image, quantity, color, size });
      }

      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(createError('Quantity must be at least 1', 400));
    }

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) return next(createError('Cart not found', 404));

    const item = cart.items.find(i => i.productId === productId);
    if (!item) return next(createError('Item not found in cart', 404));

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) return next(createError('Cart not found', 404));

    cart.items = cart.items.filter(i => i.productId !== productId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });
    if (!cart) return next(createError('Cart not found', 404));

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const syncCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return next(createError('items must be an array', 400));
    }

    let cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user!.id, items });
    } else {
      cart.items = items;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart synced',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};
