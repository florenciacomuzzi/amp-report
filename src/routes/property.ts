import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth';
import * as propertyController from '../controllers/propertyController';

const router = Router();

router.get('/', optionalAuth, propertyController.getProperties);
router.get('/:id', optionalAuth, propertyController.getProperty);

router.post('/',
  optionalAuth,
  body('address').isObject(),
  body('details').isObject(),
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  propertyController.createProperty
);

router.put('/:id',
  authenticate,
  propertyController.updateProperty
);

router.delete('/:id',
  authenticate,
  propertyController.deleteProperty
);

router.post('/geocode',
  body('address').notEmpty(),
  propertyController.geocodeAddress
);

router.get('/:id/nearby-places',
  optionalAuth,
  propertyController.getNearbyPlaces
);

export default router;