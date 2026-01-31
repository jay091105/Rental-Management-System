import { Router } from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:bookingId', authenticate, chatController.getMessages);
router.post('/', authenticate, chatController.sendMessage);

export default router;
