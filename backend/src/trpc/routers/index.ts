import { router } from '../core';
import { propertyRouter } from './property';
import { amenityRouter } from './amenity';
import { analysisRouter } from './analysis';
import { tenantProfileRouter } from './tenantProfile';
import { authRouter } from './auth';

export const appRouter = router({
  property: propertyRouter,
  amenity: amenityRouter,
  analysis: analysisRouter,
  tenantProfile: tenantProfileRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
