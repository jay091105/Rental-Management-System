import { Router } from 'express';
import * as propertyController from '../controllers/propertyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', authenticate, propertyController.createProperty);
router.put('/:id', authenticate, propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);

export default router;