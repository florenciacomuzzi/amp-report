# API Schema Specification

## tRPC Router Structure

### Root Router
```typescript
export const appRouter = router({
  auth: authRouter,
  property: propertyRouter,
  tenantProfile: tenantProfileRouter,
  amenity: amenityRouter,
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;
```

## Authentication Router

### Procedures
```typescript
export const authRouter = router({
  // Register a new user
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      company: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Create user with hashed password
      // Returns user data and JWT token
      return {
        token: string,
        user: {
          id: string,
          email: string,
          firstName: string,
          lastName: string,
        }
      }
    }),

  // User login
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // Validates credentials and checks if user is active
      // Updates lastLoginAt timestamp
      // Returns user data and JWT token
      return {
        token: string,
        user: {
          id: string,
          email: string,
          firstName: string,
          lastName: string,
        }
      }
    }),

  // Get current user
  me: protectedProcedure
    .query(({ ctx }) => {
      // Returns current authenticated user
      return { user: ctx.user }
    }),
});
```

## Property Router

### Procedures
```typescript
export const propertyRouter = router({
  // List user's properties
  list: protectedProcedure
    .query(async ({ ctx }) => {
      // Returns all active properties for the authenticated user
      return { properties: Property[] }
    }),

  // Get single property
  get: protectedProcedure
    .input(z.string()) // property ID
    .query(async ({ input, ctx }) => {
      // Returns property with tenant profiles and analyses
      // Checks ownership authorization
      return { property: Property }
    }),

  // Create new property
  create: protectedProcedure
    .input(z.object({
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string().optional(),
      }),
      details: z.object({
        numberOfUnits: z.number(),
        propertyType: z.enum(['apartment', 'condo', 'townhouse', 'other']),
        yearBuilt: z.number(),
        currentAmenities: z.array(z.string()).optional(),
        specialFeatures: z.string().optional(),
        targetRentRange: z.object({
          min: z.number(),
          max: z.number(),
        }),
        nearbyLandmarks: z.array(z.string()).optional(),
      }),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      name: z.string(),
      description: z.string().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Creates property with automatic rent estimation if needed
      // Sets default coordinates to Brooklyn if not provided
      return { property: Property }
    }),

  // Update property
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        // Same fields as create, but all optional
        address: AddressSchema.optional(),
        details: DetailsSchema.optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      // Updates property after ownership check
      return { property: Property }
    }),

  // Geocode address
  geocode: protectedProcedure
    .input(z.object({ address: z.string() }))
    .mutation(async ({ input }) => {
      // Uses Google Maps API or returns mock data if API key not configured
      return {
        result: {
          formattedAddress: string,
          latitude: number,
          longitude: number,
          placeId: string,
        }
      }
    }),

  // Estimate rent range
  estimateRent: protectedProcedure
    .input(z.object({
      address: AddressSchema,
      details: PropertyDetailsSchema,
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // AI-powered rent estimation based on property details
      return { 
        estimate: {
          min: number,
          max: number,
          confidence: number,
        }
      }
    }),

  // Get nearby places
  nearbyPlaces: protectedProcedure
    .input(z.object({ 
      id: z.string(), // property ID
      types: z.array(z.string()).optional() 
    }))
    .query(async ({ input }) => {
      // Returns nearby places and static map URL
      return { 
        nearbyPlaces: Place[],
        mapUrl: string 
      }
    }),

  // Soft delete property
  remove: protectedProcedure
    .input(z.string()) // property ID
    .mutation(async ({ input, ctx }) => {
      // Soft deletes property (sets isActive = false)
      // Checks ownership authorization
      return { success: true }
    }),
});
```

## Tenant Profile Router

### Procedures
```typescript
export const tenantProfileRouter = router({
  // Create tenant profile for property
  create: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      chatHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      // Generates AI-powered tenant profile based on chat
      return { profile: TenantProfile }
    }),

  // Get tenant profiles for property
  getByProperty: protectedProcedure
    .input(z.string()) // property ID
    .query(async ({ input, ctx }) => {
      // Returns all tenant profiles for the property
      return { profiles: TenantProfile[] }
    }),

  // Chat with AI for profile generation
  chat: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      message: z.string(),
      chatHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      // AI chat response for tenant profile questions
      return { 
        response: string,
        isComplete: boolean 
      }
    }),
});
```

## Amenity Router

### Procedures
```typescript
export const amenityRouter = router({
  // List all amenities
  list: publicProcedure
    .query(async () => {
      // Returns all active amenities grouped by category
      return { amenities: Amenity[] }
    }),

  // Get amenity categories
  categories: publicProcedure
    .query(async () => {
      // Returns unique amenity categories
      return { categories: string[] }
    }),

  // Get amenity recommendations
  recommend: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      tenantProfileId: z.string().optional(),
      budget: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
    }))
    .query(async ({ input }) => {
      // AI-powered amenity recommendations
      return { 
        recommendations: AmenityRecommendation[] 
      }
    }),
});
```

## Analysis Router

### Procedures
```typescript
export const analysisRouter = router({
  // Create comprehensive analysis
  create: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      tenantProfileId: z.string(),
      selectedAmenityIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      // Creates analysis with market insights
      return { analysis: Analysis }
    }),

  // Get analysis by ID
  get: protectedProcedure
    .input(z.string()) // analysis ID
    .query(async ({ input, ctx }) => {
      // Returns full analysis with associations
      return { analysis: Analysis }
    }),

  // List analyses for property
  listByProperty: protectedProcedure
    .input(z.string()) // property ID
    .query(async ({ input, ctx }) => {
      // Returns all analyses for the property
      return { analyses: Analysis[] }
    }),

  // Generate market insights
  generateInsights: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      tenantProfileId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // AI-generated market insights
      return { 
        insights: {
          marketOverview: string,
          competitiveAnalysis: string,
          recommendations: string[],
        }
      }
    }),

  // Export analysis as PDF
  export: protectedProcedure
    .input(z.string()) // analysis ID
    .query(async ({ input, ctx }) => {
      // Generates PDF report
      return { 
        pdfUrl: string,
        fileName: string 
      }
    }),
});
```

## REST API Endpoints (Legacy)

The application also maintains REST endpoints for compatibility:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/geocode` - Geocode address
- `GET /api/properties/:id/nearby-places` - Get nearby places

### Tenant Profiles
- `GET /api/tenant-profiles` - List tenant profiles
- `GET /api/tenant-profiles/:id` - Get tenant profile
- `POST /api/tenant-profiles` - Create tenant profile
- `PUT /api/tenant-profiles/:id` - Update tenant profile
- `DELETE /api/tenant-profiles/:id` - Delete tenant profile
- `POST /api/tenant-profiles/chat` - Chat with AI

### Amenities
- `GET /api/amenities` - List amenities
- `GET /api/amenities/categories` - Get categories
- `GET /api/amenities/:id` - Get amenity details
- `POST /api/amenities/recommendations` - Get recommendations

### Analysis
- `GET /api/analysis` - List analyses
- `GET /api/analysis/:id` - Get analysis
- `POST /api/analysis` - Create analysis
- `POST /api/analysis/report/:id/export` - Export PDF

## Data Types

### Common Types
```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

interface PropertyDetails {
  numberOfUnits: number;
  propertyType: 'apartment' | 'condo' | 'townhouse' | 'other';
  yearBuilt: number;
  currentAmenities?: string[];
  specialFeatures?: string;
  targetRentRange: {
    min: number;
    max: number;
  };
  nearbyLandmarks?: string[];
}

interface AmenityRecommendation {
  amenity: Amenity;
  score: number;
  reasoning: string;
  estimatedROI?: number;
  implementationCost: {
    min: number;
    max: number;
  };
}
```

## Error Handling

All tRPC procedures follow consistent error handling:

- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - User lacks permission for resource
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists (e.g., email in use)
- `BAD_REQUEST` - Invalid input data
- `INTERNAL_SERVER_ERROR` - Server error

## Authentication Context

Protected procedures have access to:
```typescript
interface Context {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
```