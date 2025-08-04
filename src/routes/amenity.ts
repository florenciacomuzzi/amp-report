import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as amenityController from '../controllers/amenityController';

const router = Router();

router.get('/', amenityController.getAmenities);
router.get('/categories', amenityController.getCategories);
router.get('/:id', amenityController.getAmenity);

router.post('/', authenticate, amenityController.createAmenity);
router.put('/:id', authenticate, amenityController.updateAmenity);
router.delete('/:id', authenticate, amenityController.deleteAmenity);

export default router;