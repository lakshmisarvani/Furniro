import { Router } from 'express';
import { getWishlist, toggleWishlist, syncWishlist } from '../controllers/wishlistController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.post('/sync', syncWishlist);

export default router;
