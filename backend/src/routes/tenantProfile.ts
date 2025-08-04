import { Router } from 'express';
import { tenantProfileController } from '../controllers/tenantProfileController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', tenantProfileController.createTenantProfile);
router.get('/property/:propertyId', tenantProfileController.getTenantProfileByProperty);
router.put('/:id', tenantProfileController.updateTenantProfile);
router.delete('/:id', tenantProfileController.deleteTenantProfile);
router.post('/chat', tenantProfileController.chatWithAI);
router.post('/:id/generate-summary', tenantProfileController.generateSummary);

export default router;