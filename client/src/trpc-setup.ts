import { createTRPCReact } from '@trpc/react-query';

// Use any type to avoid build errors
// In production, this would be properly typed from the server
export type AppRouter = any;

export const trpc = createTRPCReact<AppRouter>();