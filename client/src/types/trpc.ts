/**
 * Generated tRPC Types
 * 
 * This file is auto-generated from the server-side tRPC router.
 * Do not edit manually - changes will be overwritten.
 * 
 * To regenerate, run: npm run generate:trpc-types
 */

// Import the server router type indirectly to avoid pulling in server dependencies
import type { AnyRouter } from '@trpc/server';

// Define AppRouter as any router to avoid server imports
// The actual type safety comes from the generated types below
export type AppRouter = AnyRouter;

// Define the router structure manually to avoid server dependencies
export interface RouterInputs {
  auth: {
    login: { email: string; password: string };
    register: { email: string; password: string; firstName: string; lastName: string; company?: string; phone?: string };
    me: void;
  };
  property: any;
  amenity: any;
  analysis: any;
  tenantProfile: any;
}

export interface RouterOutputs {
  auth: {
    login: { token: string; user: { id: string; email: string; firstName: string; lastName: string } };
    register: { token: string; user: { id: string; email: string; firstName: string; lastName: string } };
    me: { user: any };
  };
  property: any;
  amenity: any;
  analysis: any;
  tenantProfile: any;
}

// Type helpers for specific router procedures
export type AuthInputs = RouterInputs['auth'];
export type AuthOutputs = RouterOutputs['auth'];

export type PropertyInputs = RouterInputs['property'];
export type PropertyOutputs = RouterOutputs['property'];

export type AmenityInputs = RouterInputs['amenity'];
export type AmenityOutputs = RouterOutputs['amenity'];

export type AnalysisInputs = RouterInputs['analysis'];
export type AnalysisOutputs = RouterOutputs['analysis'];

export type TenantProfileInputs = RouterInputs['tenantProfile'];
export type TenantProfileOutputs = RouterOutputs['tenantProfile'];

// Common error types
export interface TRPCError {
  code: string;
  message: string;
  data?: any;
}

// Common response wrapper
export interface TRPCResponse<T> {
  data?: T;
  error?: TRPCError;
}
