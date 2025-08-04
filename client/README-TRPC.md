# TRPC Client Setup Documentation

## Overview

This document explains the proper TRPC client setup that avoids importing server-side code directly into the client bundle, following best practices for type safety and build separation.

## Architecture

### 1. Type Definition Approach

Instead of importing server router types directly (which would pull in server dependencies), we use a client-side type definition file:

- **File**: `src/trpc-types.d.ts`
- **Purpose**: Defines the complete TRPC router interface based on the API specification
- **Benefits**: 
  - No server-side imports in client code
  - Type safety maintained
  - Clear contract definition
  - Build separation preserved

### 2. TRPC Client Configuration

#### Main TRPC Client (`src/trpc.ts`)
```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './trpc-types';

export const trpc = createTRPCReact<AppRouter>();
```

#### Standalone TRPC Client (`src/trpcStandalone.ts`)
```typescript
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from './trpc-types';

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink(),
    httpBatchLink({
      url: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/trpc` : '/trpc',
      fetch(input: RequestInfo | URL, init?: RequestInit) {
        return fetch(input, {
          ...init,
          credentials: 'include',
        });
      },
    }),
  ],
});
```

### 3. Provider Setup (`src/index.tsx`)

The TRPC provider is properly configured with React Query:

```typescript
const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/trpc`
        : '/trpc',
      fetch(input: RequestInfo | URL, init?: RequestInit) {
        return fetch(input, {
          ...init,
          credentials: 'include',
        });
      },
    }),
  ],
});

// In the render tree:
<QueryClientProvider client={queryClient}>
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    {/* App components */}
  </trpc.Provider>
</QueryClientProvider>
```

## Usage Examples

### 1. Using TRPC React Hooks

```typescript
import { trpc } from '../trpc';

function PropertyList() {
  const { data: properties, isLoading } = trpc.property.list.useQuery({
    limit: 10,
    offset: 0,
  });

  const createProperty = trpc.property.create.useMutation({
    onSuccess: () => {
      // Refetch the property list
    },
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        properties?.properties.map(property => (
          <div key={property.id}>{property.address.street}</div>
        ))
      )}
    </div>
  );
}
```

### 2. Using Standalone TRPC Client

```typescript
import { trpcClient } from '../trpcStandalone';

// In a service or utility function
export async function fetchProperty(id: string) {
  try {
    const property = await trpcClient.property.getById.query({ id });
    return property;
  } catch (error) {
    console.error('Failed to fetch property:', error);
    throw error;
  }
}

export async function createProperty(data: PropertyCreateInput) {
  try {
    const newProperty = await trpcClient.property.create.mutate(data);
    return newProperty;
  } catch (error) {
    console.error('Failed to create property:', error);
    throw error;
  }
}
```

## Type Generation Script

A type generation script is available at `scripts/generate-trpc-types.ts` for future automation:

```typescript
// This script can be used to automatically generate types from the server router
// Currently, we maintain types manually in sync with the API specification
```

## Build Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "prebuild": "npm run typecheck",
    "generate:trpc-types": "ts-node scripts/generate-trpc-types.ts"
  }
}
```

### Makefile Commands

```makefile
generate-types:
	npm run generate:trpc-types
```

## Best Practices

### 1. Type Safety
- Always use typed TRPC clients
- Maintain type definitions in sync with server API
- Use TypeScript strict mode

### 2. Error Handling
```typescript
const { data, error, isLoading } = trpc.property.getById.useQuery(
  { id: propertyId },
  {
    onError: (error) => {
      console.error('TRPC Error:', error);
      // Handle error appropriately
    },
  }
);
```

### 3. Query Invalidation
```typescript
const utils = trpc.useContext();

const createProperty = trpc.property.create.useMutation({
  onSuccess: () => {
    // Invalidate and refetch property list
    utils.property.list.invalidate();
  },
});
```

### 4. Optimistic Updates
```typescript
const updateProperty = trpc.property.update.useMutation({
  onMutate: async (newProperty) => {
    // Cancel any outgoing refetches
    await utils.property.getById.cancel({ id: newProperty.id });

    // Snapshot the previous value
    const previousProperty = utils.property.getById.getData({ id: newProperty.id });

    // Optimistically update to the new value
    utils.property.getById.setData({ id: newProperty.id }, newProperty);

    return { previousProperty };
  },
  onError: (err, newProperty, context) => {
    // If the mutation fails, use the context to roll back
    utils.property.getById.setData(
      { id: newProperty.id },
      context?.previousProperty
    );
  },
  onSettled: () => {
    // Always refetch after error or success
    utils.property.getById.invalidate({ id: newProperty.id });
  },
});
```

## Environment Configuration

Ensure the following environment variables are set:

```env
# .env file
REACT_APP_API_URL=http://localhost:3000
```

## Troubleshooting

### 1. Type Errors
- Ensure `trpc-types.d.ts` is up to date with server API
- Check that imports use `./trpc-types` not server paths
- Verify TypeScript configuration

### 2. Network Errors
- Check API URL configuration
- Verify CORS settings on server
- Ensure credentials are included for authentication

### 3. Build Errors
- Avoid importing server-side code in client
- Use type-only imports: `import type { ... }`
- Keep client and server dependencies separate

## Migration from Direct Server Imports

If migrating from direct server imports:

1. Remove any imports from `../../src/trpc/routers`
2. Update imports to use `./trpc-types`
3. Ensure type definitions match server API
4. Test all TRPC operations
5. Update any custom type declarations

This setup ensures proper separation of concerns while maintaining full type safety and developer experience.