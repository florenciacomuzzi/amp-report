import { Router } from 'express';
import { body } from 'express-validator';
import { optionalAuth } from '../middleware/auth';
import * as analysisController from '../controllers/analysisController';

const router = Router();

router.post('/tenant-profile',
  optionalAuth,
  body('propertyId').isUUID(),
  analysisController.generateTenantProfile
);

router.post('/chat',
  optionalAuth,
  body('propertyId').isUUID(),
  body('message').notEmpty(),
  analysisController.chatWithAI
);

router.post('/recommendations',
  optionalAuth,
  body('propertyId').isUUID(),
  body('tenantProfileId').isUUID(),
  analysisController.generateRecommendations
);

router.get('/report/:analysisId',
  optionalAuth,
  analysisController.getAnalysisReport
);

router.post('/report/:analysisId/export',
  optionalAuth,
  body('format').isIn(['pdf', 'excel']),
  analysisController.exportReport
);

export default router;