# Tech Stack & Architecture Documentation

## Overview
AMP Report is built using a modern, type-safe tech stack focusing on developer experience, performance, and scalability. The application follows a monorepo architecture with clear separation between frontend and backend concerns.

## Core Technologies

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **React Router v6** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **tRPC v10** - End-to-end typesafe APIs
- **PostgreSQL** - Primary database
- **Neon** - Serverless PostgreSQL hosting
- **Prisma** - Type-safe ORM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### External Services
- **Google Maps Platform**
  - Maps JavaScript API
  - Places API
  - Geocoding API
- **OpenAI API** - GPT-4 for tenant profiling
- **Google Cloud Storage** - File storage
- **SendGrid** or **Google Cloud Email API** - Email service
- **Google Cloud Run** - Deployment platform

## Project Structure

```
amp-report/
├── .specs/                    # Project specifications
├── src/
│   ├── client/               # React frontend
│   │   ├── components/       # UI components
│   │   │   ├── ui/          # Base UI components
│   │   │   ├── features/    # Feature-specific components
│   │   │   └── layouts/     # Layout components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── styles/          # Global styles
│   │   ├── types/           # TypeScript types
│   │   └── main.tsx         # Entry point
│   ├── server/              # Express backend
│   │   ├── api/             # API routes
│   │   │   ├── routers/     # tRPC routers
│   │   │   └── trpc.ts      # tRPC setup
│   │   ├── db/              # Database setup
│   │   │   ├── schema.prisma
│   │   │   └── client.ts
│   │   ├── services/        # Business logic
│   │   ├── lib/             # Server utilities
│   │   └── index.ts         # Server entry point
│   └── shared/              # Shared types/utilities
├── public/                  # Static assets
├── prisma/                  # Database migrations
├── tests/                   # Test files
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Architecture Patterns

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
├─────────────────────────────────────────────────────────┤
│                    Component Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │  Features   │  │     UI      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                    State Management                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ React Query │  │   Zustand   │  │   Context   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│                      API Layer                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              tRPC Client with React Query        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
├─────────────────────────────────────────────────────────┤
│                    Middleware Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   CORS   │  │   Auth   │  │   Rate   │  │ Logger │ │
│  │          │  │          │  │  Limit   │  │        │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
├─────────────────────────────────────────────────────────┤
│                     tRPC Layer                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │               tRPC Router & Procedures           │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Property │  │  Tenant  │  │ Amenity  │  │  Auth  │ │
│  │ Service  │  │ Service  │  │ Service  │  │Service │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
├─────────────────────────────────────────────────────────┤
│                   Data Access Layer                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Prisma ORM with PostgreSQL          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Key Dependencies

### package.json
```json
{
  "name": "amp-report",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "tsx watch src/server/index.ts",
    "dev:client": "vite",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives",
    "typecheck": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    // Frontend
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.12.0",
    "@trpc/client": "^10.44.0",
    "@trpc/react-query": "^10.44.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "framer-motion": "^10.16.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-toast": "^1.1.5",
    "lucide-react": "^0.294.0",
    
    // Backend
    "express": "^4.18.0",
    "@trpc/server": "^10.44.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "@prisma/client": "^5.7.0",
    "dotenv": "^16.3.0",
    
    // External APIs
    "@googlemaps/js-api-loader": "^1.16.0",
    "openai": "^4.20.0",
    
    // Google Cloud
    "@google-cloud/storage": "^7.7.0",
    
    // Utilities
    "date-fns": "^2.30.0",
    "uuid": "^9.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "prisma": "^5.7.0",
    "tsx": "^4.6.0",
    "concurrently": "^8.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0"
  }
}
```

## Environment Variables

### .env.example
```env
# Server
NODE_ENV=development
PORT=3000
SERVER_URL=http://localhost:3000

# Client
VITE_API_URL=http://localhost:3000/trpc

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/amp_report"

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_PLACES_API_KEY=your-google-places-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@amp-report.com

# Google Cloud Storage
GCS_BUCKET_NAME=amp-report-uploads
GCS_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development Workflow

### Initial Setup
```bash
# Clone repository
git clone https://github.com/yourusername/amp-report.git
cd amp-report

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Set up database
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/tenant-profile
# Make changes
git add .
git commit -m "feat: implement tenant profile generation"
git push origin feature/tenant-profile
# Create PR on GitHub
```

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits for clear history

## Google Cloud Run Deployment

### Prerequisites
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash

# Initialize gcloud
gcloud init

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### Dockerfile for Cloud Run
```dockerfile
# Multi-stage build for optimized image
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Cloud Run expects PORT env var
EXPOSE 8080
CMD ["node", "dist/server/index.js"]
```

### Cloud Build Configuration
```yaml
# cloudbuild.yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/amp-report:$COMMIT_SHA', '.']
  
  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/amp-report:$COMMIT_SHA']
  
  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'amp-report'
      - '--image'
      - 'gcr.io/$PROJECT_ID/amp-report:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'NODE_ENV=production'
      - '--set-secrets'
      - 'DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,OPENAI_API_KEY=openai-key:latest,GOOGLE_MAPS_API_KEY=maps-api-key:latest'

images:
  - 'gcr.io/$PROJECT_ID/amp-report:$COMMIT_SHA'

timeout: '1200s'
```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

# Build and deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml

# Or deploy directly
gcloud run deploy amp-report \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets "DATABASE_URL=database-url:latest" \
  --set-secrets "JWT_SECRET=jwt-secret:latest" \
  --set-secrets "OPENAI_API_KEY=openai-key:latest" \
  --set-secrets "GOOGLE_MAPS_API_KEY=maps-api-key:latest"
```

### Cloud Run Service Configuration
```yaml
# service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: amp-report
  annotations:
    run.googleapis.com/launch-stage: GA
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '1'
        autoscaling.knative.dev/maxScale: '100'
        run.googleapis.com/cpu-throttling: 'false'
    spec:
      containerConcurrency: 1000
      timeoutSeconds: 300
      serviceAccountName: amp-report-sa@YOUR_PROJECT.iam.gserviceaccount.com
      containers:
        - image: gcr.io/YOUR_PROJECT/amp-report
          resources:
            limits:
              cpu: '2'
              memory: '2Gi'
          env:
            - name: NODE_ENV
              value: production
          ports:
            - containerPort: 8080
```

### Database Setup on Google Cloud

#### Using Neon Postgres (managed)
```bash
# Create Neon project
# Neon project and database creation can be done directly from the Neon dashboard or CLI.
# See https://neon.tech/docs/get-started for details.
```

#### Deploy to Cloud Run (Neon Postgres)
```bash
# The Neon connection string should be stored as a secret or environment variable
# called DATABASE_URL (e.g. postgresql://user:pass@ep-silent-mouse-123456.eu-central-1.aws.neon.tech/db?sslmode=require)

gcloud run deploy amp-report \
  --set-env-vars="DATABASE_URL=${NEON_DATABASE_URL}"
```

### Secrets Management
```bash
# Create secrets in Secret Manager
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-openai-key" | gcloud secrets create openai-key --data-file=-
echo -n "your-maps-key" | gcloud secrets create maps-api-key --data-file=-
echo -n "postgresql://..." | gcloud secrets create database-url --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:amp-report-sa@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### CI/CD with GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE: amp-report
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v3

      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Authorize Docker
        run: gcloud auth configure-docker

      - name: Build and Push Container
        run: |
          docker build -t gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA .
          docker push gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy $SERVICE \
            --image gcr.io/$PROJECT_ID/$SERVICE:$GITHUB_SHA \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated
```

### Monitoring & Logging

#### Cloud Monitoring Setup
```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime create amp-report-health \
  --resource-type="gae-app" \
  --resource-labels="project_id=$PROJECT_ID" \
  --display-name="AMP Report Health Check"
```

#### Logging
```typescript
// Use structured logging
import { Logging } from '@google-cloud/logging';

const logging = new Logging();
const log = logging.log('amp-report');

export const logger = {
  info: (message: string, metadata?: any) => {
    const entry = log.entry(metadata, message);
    log.write(entry);
  },
  error: (message: string, error?: any) => {
    const entry = log.entry({ severity: 'ERROR', error }, message);
    log.write(entry);
  }
};
```

### Cost Optimization

#### Cloud Run Configuration
- Set minimum instances to 0 for dev/staging
- Use CPU allocation only during request processing
- Configure appropriate memory limits

#### Database Optimization
- Use connection pooling
- Consider Cloud SQL Proxy for local development
- Schedule automated backups during low-traffic periods

#### Storage Optimization
- Use lifecycle policies for Cloud Storage
- Compress images before storage
- Implement CDN for static assets

### Security Best Practices

#### Service Account Setup
```bash
# Create service account
gcloud iam service-accounts create amp-report-sa \
  --display-name="AMP Report Service Account"

# Grant minimal required permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:amp-report-sa@$PROJECT_ID.iam.gserviceaccount.com" \
```

#### Network Security
- Use Cloud Armor for DDoS protection
- Configure Cloud CDN for static assets
- Implement rate limiting at application level

#### Secret Rotation
- Rotate secrets regularly
- Use Secret Manager versions
- Audit secret access logs

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization with next-gen formats
- Bundle size optimization
- Lighthouse CI for performance monitoring

### Backend
- Query optimization with Prisma
- Redis caching for frequent queries
- Rate limiting per user/IP
- Connection pooling for PostgreSQL

### Caching Strategy
- React Query for client-side caching
- Redis for server-side caching
- CDN for static assets
- Service Worker for offline support

## Testing Strategy

### Unit Tests
```typescript
// Example test
describe('TenantService', () => {
  it('should generate tenant profile', async () => {
    const profile = await generateTenantProfile(mockProperty);
    expect(profile).toHaveProperty('demographics');
    expect(profile.confidence).toBeGreaterThan(0.7);
  });
});
```

### Integration Tests
- API endpoint testing
- Database operations
- External service mocks

### E2E Tests
- Critical user flows
- Cross-browser testing
- Mobile responsiveness