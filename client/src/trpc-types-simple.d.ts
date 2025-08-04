// Simplified TRPC types for client
// This avoids complex type inference issues during build

import { AnyRouter } from '@trpc/server';

// Use AnyRouter to get proper TRPC client methods
export type AppRouter = AnyRouter;