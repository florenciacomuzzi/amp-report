# AMP Report Features Specification

## Overview
AMP Report is a web application that helps property managers and real estate professionals determine ideal tenant profiles and suggest appropriate amenities for multifamily properties based on location, property characteristics, and AI-powered market analysis.

## Core Features

### 1. User Authentication & Management
**Description:** Secure user registration and authentication system.

**Implemented Features:**
- Email/password registration with validation
- JWT-based authentication
- Secure login with bcrypt password hashing
- Protected routes requiring authentication
- User profile management (first name, last name, company, phone)
- Session management with lastLoginAt tracking
- Active/inactive user status

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### 2. Property Management
**Description:** Comprehensive property information input and management system.

**Implemented Features:**
- Create, read, update, and delete (CRUD) operations for properties
- Property ownership tied to authenticated users
- Soft delete functionality (isActive flag)
- Detailed property information storage:
  - Address (street, city, state, zip, country)
  - Property details (units, type, year built, amenities)
  - Geographic coordinates (latitude/longitude)
  - Target rent range with automatic estimation
  - Special features and nearby landmarks

**Property Types Supported:**
- Apartment
- Condo
- Townhouse
- Other

**API Endpoints:**
- `GET /api/properties` - List user's properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Soft delete property

### 3. Google Maps Integration
**Description:** Full integration with Google Maps for location services.

**Implemented Features:**
- Address geocoding to get coordinates
- Google Maps display with property location
- Nearby places search functionality
- Static map URL generation
- Fallback to mock data when API key not configured
- Default coordinates (Brooklyn) for missing locations

**Services Used:**
- Google Maps JavaScript API
- Google Geocoding API
- Google Places API

**API Endpoints:**
- `POST /api/properties/geocode` - Geocode address
- `GET /api/properties/:id/nearby-places` - Get nearby places

### 4. AI-Powered Tenant Profile Generation
**Description:** Generate ideal tenant profiles using OpenAI GPT-4.

**Implemented Features:**
- Interactive chat interface for profile generation
- Context-aware AI conversations
- Tenant profile data includes:
  - Demographics (age range, income level)
  - Lifestyle preferences
  - Family composition
  - Professional background
  - Pet preferences
  - Transportation needs
- Profile storage linked to properties
- Multiple profiles per property support

**API Endpoints:**
- `POST /api/tenant-profiles` - Create tenant profile
- `GET /api/tenant-profiles/:id` - Get tenant profile
- `POST /api/tenant-profiles/chat` - Chat with AI assistant

### 5. Amenity Recommendations System
**Description:** AI-powered amenity recommendations based on property and tenant profiles.

**Implemented Features:**
- Pre-seeded database of 50+ amenities
- Categorized amenities:
  - Fitness & Wellness
  - Technology & Connectivity
  - Community & Social
  - Convenience & Services
  - Outdoor & Recreation
  - Safety & Security
  - Sustainability & Green
  - Luxury & Premium
  - Pet-Friendly
  - Transportation & Parking
- AI-driven recommendation scoring
- ROI estimation for each amenity
- Cost range estimates (min/max)
- Implementation timeline estimates
- Filtering by category and budget

**API Endpoints:**
- `GET /api/amenities` - List all amenities
- `GET /api/amenities/categories` - Get categories
- `POST /api/amenities/recommendations` - Get AI recommendations

### 6. Market Analysis & Insights
**Description:** Comprehensive market analysis combining all data points.

**Implemented Features:**
- Analysis creation linking property, tenant profile, and amenities
- Market insights generation
- Competitive analysis
- Confidence scoring for recommendations
- Historical analysis tracking
- Export functionality (planned)

**API Endpoints:**
- `POST /api/analysis` - Create analysis
- `GET /api/analysis/:id` - Get analysis details
- `GET /api/analysis/report/:id` - Get analysis report

### 7. Rent Estimation Service
**Description:** AI-powered rent range estimation based on property details.

**Implemented Features:**
- Automatic rent estimation when creating properties
- Considers property location, size, type, and amenities
- Provides min/max rent range
- Confidence scoring
- Fallback to reasonable defaults
- Validation of user-provided rent ranges

### 8. Frontend User Interface
**Description:** React-based single-page application with Material-UI.

**Implemented Pages:**
- **Login/Register** - User authentication
- **Dashboard** - Overview of user's properties
- **Properties List** - Manage all properties
- **Property Detail** - View single property with all data
- **Property Form** - Create/edit properties
- **Reports** - View analysis reports
- **Analysis (tRPC)** - Interactive analysis workflow

**Key Components:**
- `AddressAutocomplete` - Google Places integration
- `PropertyMap` - Interactive map display
- `TenantProfileChat` - AI chat interface
- `Layout` - Consistent app layout with navigation
- `PrivateRoute` - Protected route wrapper

### 9. API Architecture
**Description:** Dual API system for flexibility and type safety.

**REST API:**
- Traditional REST endpoints
- Express.js routing
- Controller-based architecture
- JWT middleware authentication

**tRPC API:**
- Type-safe end-to-end API
- Automatic TypeScript type generation
- React Query integration
- Zod schema validation
- Procedures for all major operations

### 10. Development & Deployment Features
**Description:** Modern development and deployment setup.

**Development Features:**
- Docker and Docker Compose setup
- Hot reloading with Nodemon
- Concurrent frontend/backend development
- Database seeding with test data
- TypeScript throughout
- ESLint and type checking

**Deployment Support:**
- Vercel zero-config deployment
- Docker production builds
- Environment-based configuration
- Nginx reverse proxy setup
- Health check endpoints

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Property
```typescript
interface Property {
  id: string;
  userId: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  details: {
    numberOfUnits: number;
    propertyType: string;
    yearBuilt: number;
    currentAmenities?: string[];
    specialFeatures?: string;
    targetRentRange: {
      min: number;
      max: number;
    };
    nearbyLandmarks?: string[];
  };
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### TenantProfile
```typescript
interface TenantProfile {
  id: string;
  propertyId: string;
  profileData: {
    demographics: object;
    lifestyle: object;
    preferences: object;
  };
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Amenity
```typescript
interface Amenity {
  id: string;
  name: string;
  category: string;
  description: string;
  averageCost: number;
  minCost: number;
  maxCost: number;
  implementationTime: string;
  monthlyMaintenance?: number;
  popularityScore: number;
  impactScore: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Analysis
```typescript
interface Analysis {
  id: string;
  propertyId: string;
  tenantProfileId: string;
  marketInsights?: string;
  confidenceScore: number;
  recommendations?: object;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Associated amenities through AnalysisAmenity
}
```

## Security Features

- JWT authentication with secure token handling
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection via Sequelize ORM
- CORS configuration
- Helmet.js security headers
- Environment variable protection
- API rate limiting (planned)

## Performance Features

- Database connection pooling
- Lazy loading of associations
- Efficient query optimization
- Frontend code splitting
- API response caching (planned)
- CDN integration (planned)

## Future Enhancements

1. **PDF Report Generation** - Export analyses as professional PDFs
2. **Email Notifications** - Property updates and analysis completion
3. **Team Collaboration** - Share properties and analyses
4. **Market Data Integration** - Real-time market data feeds
5. **Mobile App** - Native mobile applications
6. **Advanced Analytics** - Detailed ROI calculations and projections
7. **Multi-language Support** - Internationalization
8. **API Rate Limiting** - Protect against abuse
9. **Webhook Support** - Integration with external systems
10. **Batch Operations** - Bulk property imports/exports