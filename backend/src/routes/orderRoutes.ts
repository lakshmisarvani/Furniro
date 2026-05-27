import { Router } from 'express';
import {
  placeOrder,
  getUserOrders,
  getOrderById,
} from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', placeOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

export default router;
