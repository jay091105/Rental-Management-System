import { Router } from 'express';
import * as authController from '../controllers/authController';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/register', upload.single('companyLogo'), authController.register);
router.post('/login', authController.login);

export default router;