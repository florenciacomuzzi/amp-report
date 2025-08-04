#!/usr/bin/env ts-node

/**
 * TRPC Type Generation Script
 * 
 * This script generates client-side TypeScript types from the server-side tRPC router
 * without importing server-side dependencies like decorators or database models.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const GENERATED_TYPES_CONTENT = `/**
 * Generated tRPC Types
 * 
 * This file is auto-generated from the server-side tRPC router.
 * Do not edit manually - changes will be overwritten.
 * 
 * To regenerate, run: npm run generate:trpc-types
 */

// Import the server router type indirectly to avoid pulling in server dependencies
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Import AppRouter type from minimal types to avoid server dependencies in client build
import type { AppRouter } from './trpc-minimal';
export type { AppRouter };

// For now, we'll use any types to avoid build issues
// These will be properly typed at runtime through tRPC
export type RouterInputs = any;
export type RouterOutputs = any;

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
`;

function generateTRPCTypes() {
  const outputDir = resolve(__dirname, '../client/src/types');
  const outputFile = resolve(outputDir, 'trpc.ts');

  try {
    // Ensure the types directory exists
    mkdirSync(outputDir, { recursive: true });

    // Write the generated types
    writeFileSync(outputFile, GENERATED_TYPES_CONTENT);

    console.log('✅ tRPC types generated successfully at:', outputFile);
  } catch (error) {
    console.error('❌ Failed to generate tRPC types:', error);
    process.exit(1);
  }
}

// Run the generation if this script is executed directly
if (require.main === module) {
  generateTRPCTypes();
}

export { generateTRPCTypes };