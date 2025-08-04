/**
 * Minimal TRPC type definitions for client build
 * This avoids importing server code while maintaining type compatibility
 */

export type AppRouter = {
  _config: any;
  _def: any;
  auth: any;
  property: any;
  amenity: any;
  analysis: any;
  tenantProfile: any;
};