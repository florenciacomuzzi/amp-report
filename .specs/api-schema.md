# API Schema Specification

## tRPC Router Structure

### Root Router
```typescript
export const appRouter = router({
  auth: authRouter,
  property: propertyRouter,
  tenant: tenantRouter,
  amenity: amenityRouter,
  analysis: analysisRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
```

## Authentication Router

### Procedures
```typescript
export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
    }))
    .mutation(async ({ input }) => {
      // Create user with hashed password
      // Return user and JWT token
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Verify credentials
      // Return user and JWT token
    }),

  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Invalidate session
      // Return success
    }),

  refreshToken: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Generate new JWT token
      // Return new token
    }),

  forgotPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      // Send password reset email
      // Return success
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      // Verify token and update password
      // Return success
    }),
});
```

## Property Router

### Procedures
```typescript
export const propertyRouter = router({
  create: protectedProcedure
    .input(z.object({
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string().default("US"),
      }),
      numberOfUnits: z.number().positive(),
      propertyType: z.enum(['apartment', 'condo', 'townhouse', 'single-family']),
      yearBuilt: z.number().optional(),
      currentAmenities: z.array(z.string()).optional(),
      targetRentRange: z.object({
        min: z.number(),
        max: z.number(),
      }).optional(),
      preferences: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Geocode address using Google Maps
      // Save property to database
      // Return property with coordinates
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        address: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          zipCode: z.string(),
        }).optional(),
        numberOfUnits: z.number().optional(),
        propertyType: z.enum(['apartment', 'condo', 'townhouse', 'single-family']).optional(),
        yearBuilt: z.number().optional(),
        currentAmenities: z.array(z.string()).optional(),
        targetRentRange: z.object({
          min: z.number(),
          max: z.number(),
        }).optional(),
        preferences: z.string().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      // Update property
      // Re-geocode if address changed
      // Return updated property
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Soft delete property
      // Return success
    }),

  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Fetch property with related data
      // Return property
    }),

  list: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Fetch user's properties
      // Return paginated list
    }),

  validateAddress: publicProcedure
    .input(z.object({
      address: z.string(),
    }))
    .query(async ({ input }) => {
      // Use Google Places API to validate
      // Return validation result and suggestions
    }),

  getNearbyPlaces: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      types: z.array(z.string()).optional(),
      radius: z.number().default(1000),
    }))
    .query(async ({ input }) => {
      // Use Google Places API
      // Return nearby places
    }),
});
```

## Tenant Profile Router

### Procedures
```typescript
export const tenantRouter = router({
  generateProfile: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional(),
      preferences: z.object({
        targetDemographic: z.string().optional(),
        incomeRange: z.object({
          min: z.number(),
          max: z.number(),
        }).optional(),
        lifestylePreferences: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Call OpenAI API for analysis
      // Generate tenant profile
      // Save to database
      // Return profile
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      id: z.string(),
      updates: z.object({
        demographics: z.object({
          ageRange: z.string(),
          incomeRange: z.string(),
          education: z.string(),
          occupation: z.array(z.string()),
        }).partial(),
        preferences: z.object({
          amenities: z.array(z.string()),
          location: z.array(z.string()),
          housing: z.array(z.string()),
        }).partial(),
        lifestyle: z.array(z.string()).optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      // Update tenant profile
      // Recalculate confidence scores
      // Return updated profile
    }),

  getByProperty: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Fetch latest tenant profile
      // Return profile with metadata
    }),

  chatWithAI: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      message: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      // Call OpenAI API for chat
      // Process response
      // Return AI response
    }),

  exportProfile: protectedProcedure
    .input(z.object({
      profileId: z.string(),
      format: z.enum(['pdf', 'json', 'csv']),
    }))
    .query(async ({ input, ctx }) => {
      // Generate export file
      // Return download URL
    }),
});
```

## Amenity Router

### Procedures
```typescript
export const amenityRouter = router({
  getRecommendations: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      tenantProfileId: z.string(),
      budget: z.object({
        min: z.number(),
        max: z.number(),
      }).optional(),
      categories: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Analyze tenant profile
      // Match with amenity database
      // Calculate scores and costs
      // Return recommendations
    }),

  getCategories: publicProcedure
    .query(async () => {
      // Return amenity categories
      return [
        { id: 'fitness', name: 'Fitness & Wellness', icon: 'dumbbell' },
        { id: 'technology', name: 'Technology', icon: 'laptop' },
        { id: 'community', name: 'Community', icon: 'users' },
        { id: 'convenience', name: 'Convenience', icon: 'clock' },
        { id: 'sustainability', name: 'Sustainability', icon: 'leaf' },
        { id: 'luxury', name: 'Luxury', icon: 'gem' },
      ];
    }),

  getDetails: protectedProcedure
    .input(z.object({
      amenityId: z.string(),
      propertyId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Fetch amenity details
      // Calculate property-specific costs
      // Return detailed information
    }),

  calculateROI: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      amenityIds: z.array(z.string()),
      implementationCosts: z.record(z.string(), z.number()),
    }))
    .query(async ({ input, ctx }) => {
      // Calculate potential rent increases
      // Estimate payback period
      // Return ROI analysis
    }),

  compareWithCompetitors: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      radius: z.number().default(2000),
    }))
    .query(async ({ input, ctx }) => {
      // Find nearby properties
      // Compare amenities
      // Return competitive analysis
    }),
});
```

## Analysis Router

### Procedures
```typescript
export const analysisRouter = router({
  createAnalysis: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      tenantProfileId: z.string(),
      selectedAmenities: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create comprehensive analysis
      // Generate insights
      // Save to database
      // Return analysis
    }),

  getAnalysis: protectedProcedure
    .input(z.object({
      analysisId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Fetch analysis with all related data
      // Return complete analysis
    }),

  generateReport: protectedProcedure
    .input(z.object({
      analysisId: z.string(),
      format: z.enum(['pdf', 'excel', 'powerpoint']),
      sections: z.array(z.enum([
        'executive-summary',
        'property-overview',
        'tenant-profile',
        'amenity-recommendations',
        'cost-analysis',
        'roi-projections',
        'competitive-analysis',
        'implementation-timeline',
      ])),
    }))
    .mutation(async ({ input, ctx }) => {
      // Generate report
      // Upload to storage
      // Return download URL
    }),

  getMarketInsights: protectedProcedure
    .input(z.object({
      propertyId: z.string(),
      radius: z.number().default(5000),
    }))
    .query(async ({ input, ctx }) => {
      // Fetch market data
      // Analyze trends
      // Return insights
    }),
});
```

## User Router

### Procedures
```typescript
export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      // Return user profile
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
      preferences: z.object({
        defaultPropertyType: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Update user profile
      // Return updated profile
    }),

  deleteAccount: protectedProcedure
    .input(z.object({
      confirmation: z.literal('DELETE'),
    }))
    .mutation(async ({ input, ctx }) => {
      // Soft delete user account
      // Return success
    }),

  getActivity: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      // Fetch user activity history
      // Return paginated results
    }),
});
```

## Database Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Properties Table
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  address_street VARCHAR(255) NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_state VARCHAR(50) NOT NULL,
  address_zip VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  number_of_units INTEGER NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  year_built INTEGER,
  target_rent_min DECIMAL(10, 2),
  target_rent_max DECIMAL(10, 2),
  preferences TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

### Tenant Profiles Table
```sql
CREATE TABLE tenant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  demographics JSONB NOT NULL,
  preferences JSONB NOT NULL,
  lifestyle JSONB NOT NULL,
  confidence_score DECIMAL(3, 2),
  ai_conversation JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Amenities Table
```sql
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  base_cost_low DECIMAL(10, 2),
  base_cost_high DECIMAL(10, 2),
  implementation_time VARCHAR(50),
  impact_score DECIMAL(3, 2),
  popularity_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Analyses Table
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tenant_profile_id UUID REFERENCES tenant_profiles(id),
  selected_amenities JSONB,
  market_insights JSONB,
  competitive_analysis JSONB,
  roi_projections JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Property Amenities Table (Many-to-Many)
```sql
CREATE TABLE property_amenities (
  property_id UUID REFERENCES properties(id),
  amenity_id UUID REFERENCES amenities(id),
  status VARCHAR(50) DEFAULT 'existing',
  added_date DATE,
  PRIMARY KEY (property_id, amenity_id)
);
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Activity Log Table
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Error codes
enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // External API errors
  GOOGLE_API_ERROR = 'GOOGLE_API_ERROR',
  OPENAI_API_ERROR = 'OPENAI_API_ERROR',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
```

## Rate Limiting

```typescript
// Rate limit configuration
const rateLimits = {
  auth: {
    login: { window: '15m', max: 5 },
    register: { window: '1h', max: 3 },
    forgotPassword: { window: '1h', max: 3 },
  },
  api: {
    openai: { window: '1m', max: 10 },
    googleMaps: { window: '1m', max: 30 },
    general: { window: '1m', max: 100 },
  },
};
```