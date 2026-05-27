import { Response, NextFunction } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';

export const placeOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shippingAddress, paymentMethod = 'bank' } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return next(createError('Shipping address is required', 400));
    }

    const cart = await Cart.findOne({ user: req.user!.id }).populate(
      'items.product'
    );

    if (!cart || cart.items.length === 0) {
      return next(createError('Cart is empty. Add items before placing an order.', 400));
    }

    let totalAmount = 0;
    const orderItems: { product: unknown; quantity: number; price: number }[] = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(createError(`Product not found: ${item.productId}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(createError(`Insufficient stock for: ${product.name}`, 400));
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user!.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    cart.items = [];
    await cart.save();

    await order.populate('items.product', 'name price image category');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!.id })
      .populate('items.product', 'name price image category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: { count: orders.length, orders },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!.id,
    }).populate('items.product', 'name price image category');

    if (!order) {
      return next(createError('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
