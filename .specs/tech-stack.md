# Tech Stack & Architecture Documentation

## Overview
AMP Report is built using a modern, type-safe tech stack focusing on developer experience, performance, and scalability. The application follows a client-server architecture with clear separation between frontend and backend concerns.

## Core Technologies

### Frontend
- **React 18.2.0** - UI library with hooks and functional components
- **TypeScript 4.9.5** - Type safety and better developer experience
- **Create React App** - Build tool and development server
- **Material-UI (MUI) 5.14.20** - Component library and design system
- **React Router v6** - Client-side routing
- **Redux Toolkit 1.9.7** - State management (authentication)
- **React Hook Form 7.48.2** - Form handling
- **Axios 1.6.2** - HTTP client
- **@tanstack/react-query 4.35.0** - Server state management
- **tRPC Client 10.0.0** - Type-safe API client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **TypeScript 5.3.3** - Type safety
- **tRPC v10** - End-to-end typesafe APIs
- **PostgreSQL** - Primary database
- **Sequelize 6.35.2** - ORM with TypeScript support
- **sequelize-typescript 2.1.6** - TypeScript decorators for Sequelize
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 2.4.3** - Password hashing
- **Zod 3.22.4** - Schema validation

### External Services
- **Google Maps Platform**
  - Maps JavaScript API (@react-google-maps/api)
  - Places API
  - Geocoding API (@googlemaps/google-maps-services-js)
- **OpenAI API 4.24.7** - GPT-4 for tenant profiling and analysis
- **Neon PostgreSQL** - Managed database hosting

### Development Tools
- **Nodemon 3.0.2** - Auto-restart development server
- **ts-node 10.9.2** - TypeScript execution
- **ESLint** - Code linting
- **Jest 29.7.0** - Testing framework
- **Concurrently 8.2.2** - Run multiple commands
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **reveal-md 6.1.4** - Presentation slides

## Project Structure

```
amp-report/
├── .specs/                    # Project specifications
├── src/                       # Backend source code
│   ├── app.ts                # Express app setup
│   ├── index.ts              # Server entry point
│   ├── config/               # Configuration
│   │   └── database.ts       # Database config
│   ├── controllers/          # REST API controllers
│   │   ├── authController.ts
│   │   ├── propertyController.ts
│   │   ├── tenantProfileController.ts
│   │   ├── amenityController.ts
│   │   └── analysisController.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   └── errorHandler.ts  # Global error handling
│   ├── models/              # Sequelize models
│   │   ├── User.ts
│   │   ├── Property.ts
│   │   ├── TenantProfile.ts
│   │   ├── Amenity.ts
│   │   ├── Analysis.ts
│   │   └── AnalysisAmenity.ts
│   ├── routes/              # REST API routes
│   │   ├── auth.ts
│   │   ├── property.ts
│   │   ├── tenantProfile.ts
│   │   ├── amenity.ts
│   │   └── analysis.ts
│   ├── services/            # Business logic
│   │   ├── googleMapsService.ts
│   │   ├── openaiService.ts
│   │   ├── amenityRecommendation.service.ts
│   │   └── rentEstimationService.ts
│   ├── trpc/                # tRPC setup
│   │   ├── context.ts       # Request context
│   │   ├── core.ts          # Router setup
│   │   └── routers/         # tRPC routers
│   ├── seeders/             # Database seeders
│   │   ├── userSeeder.ts
│   │   └── amenitySeeder.ts
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
│       ├── logger.ts
│       └── calculateConfidence.ts
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AddressAutocomplete.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   ├── PropertyMap.tsx
│   │   │   └── TenantProfileChat.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Properties.tsx
│   │   │   ├── PropertyDetail.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── AnalysisTRPC.tsx
│   │   ├── services/       # API services
│   │   │   ├── api.ts      # Axios setup
│   │   │   ├── authService.ts
│   │   │   ├── propertyService.ts
│   │   │   ├── amenityService.ts
│   │   │   ├── analysisService.ts
│   │   │   └── tenantProfileService.ts
│   │   ├── store/          # Redux store
│   │   │   └── slices/
│   │   │       └── authSlice.ts
│   │   ├── styles/         # Styling
│   │   │   └── theme.ts    # MUI theme
│   │   ├── types/          # TypeScript types
│   │   ├── trpc.ts         # tRPC client setup
│   │   ├── App.tsx         # Root component
│   │   └── index.tsx       # Entry point
│   ├── public/             # Static assets
│   ├── package.json
│   └── tsconfig.json
├── scripts/                 # Utility scripts
│   ├── docker-setup.sh
│   └── generate-trpc-types.ts
├── nginx/                   # Nginx configuration
├── docs/                    # Documentation
├── docker-compose.yml       # Docker services
├── Dockerfile              # Container definition
├── Makefile                # Build commands
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Patterns

### Backend Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
├─────────────────────────────────────────────────────────┤
│                    Middleware Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    CORS     │  │   Helmet    │  │     Auth    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                      API Layer                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │    REST Routes      │  │    tRPC Routes      │      │
│  └─────────────────────┘  └─────────────────────┘      │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  OpenAI  │  │  Google  │  │  Amenity │  │  Rent  │ │
│  │ Service  │  │   Maps   │  │  Recomm. │  │  Est.  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
├─────────────────────────────────────────────────────────┤
│                    Data Layer                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Sequelize ORM + PostgreSQL             │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
├─────────────────────────────────────────────────────────┤
│                    Component Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │ Components  │  │   Layouts   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                    State Management                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │React Query  │  │Redux Toolkit│  │Local State  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                      API Layer                          │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │   REST (Axios)   │  │   tRPC Client + React Query│  │
│  └──────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

The application uses PostgreSQL with Sequelize ORM. Key models include:

- **User** - Authentication and user management
- **Property** - Property information with address and details
- **TenantProfile** - AI-generated tenant profiles
- **Amenity** - Available amenities with categories
- **Analysis** - Market analysis and recommendations
- **AnalysisAmenity** - Many-to-many relationship

## API Architecture

The application supports both REST and tRPC APIs:

### REST API
- Traditional REST endpoints for compatibility
- Express routes with controllers
- JWT middleware for authentication
- Comprehensive error handling

### tRPC API
- Type-safe end-to-end API calls
- Automatic TypeScript type generation
- React Query integration for caching
- Zod schema validation

## Security

- **Authentication**: JWT tokens with secure httpOnly cookies
- **Password Security**: bcrypt hashing with salt rounds
- **API Security**: Helmet.js for security headers
- **CORS**: Configured for specific origins
- **Input Validation**: Zod schemas and express-validator
- **SQL Injection Protection**: Parameterized queries via Sequelize
- **Environment Variables**: Sensitive data in .env files

## Deployment

### Development
- Docker Compose for local development
- Hot reloading with Nodemon
- Concurrent frontend/backend development

### Production
- Docker containers for consistency
- Nginx reverse proxy
- SSL/TLS termination
- Environment-based configuration
- Health checks and monitoring

### Supported Platforms
- **Vercel**: Serverless deployment with zero-config
- **Google Cloud Run**: Container-based deployment
- **Traditional VPS**: Docker Compose deployment

## Performance Optimizations

- **Database**: Connection pooling, indexed queries
- **API**: Response caching, query optimization
- **Frontend**: Code splitting, lazy loading
- **Assets**: CDN distribution, image optimization
- **State Management**: Selective re-renders, memoization

## Development Workflow

1. **Local Development**
   ```bash
   make docker-up     # Start services
   npm run dev:all    # Start both frontend and backend
   ```

2. **Testing**
   ```bash
   npm test           # Run tests
   npm run lint       # Lint code
   npm run typecheck  # Type checking
   ```

3. **Building**
   ```bash
   npm run build      # Build backend
   npm run build:all  # Build everything
   ```

4. **Deployment**
   ```bash
   vercel --prod      # Deploy to Vercel
   # OR
   docker-compose -f docker-compose.prod.yml up -d
   ```