import express from 'express';
import { 
  getProducts, 
  getProductById, 
  getVendorProducts,
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getProducts);
router.get('/vendor', authenticate, getVendorProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, upload.array('photos', 10), createProduct);
router.put('/:id', authenticate, upload.array('photos', 10), updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;