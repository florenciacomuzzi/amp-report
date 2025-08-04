/**
 * TRPC Client Configuration
 * This file provides a minimal TRPC setup that works for both development and production builds
 * without importing server-side code.
 */

import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

// Create the React Query integration without type parameter to avoid conflicts
export const trpc = createTRPCReact() as any;

// Create standalone client for non-React contexts
export const trpcClient = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/trpc` : '/trpc',
      fetch(input: RequestInfo | URL, init?: RequestInit) {
        const token = localStorage.getItem('token');
        return fetch(input, {
          ...init,
          credentials: 'include',
          headers: {
            ...init?.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      },
    }),
  ],
}) as any;