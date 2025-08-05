# AMP Report

AMP Report is a web application that helps property managers and real estate professionals determine ideal tenant profiles and suggest appropriate amenities for multifamily properties based on location, property characteristics, and AI-powered market analysis.

## Features

- **Property Management**: Input and manage property details with Google Maps integration
- **AI-Powered Tenant Profiling**: Generate ideal tenant profiles using OpenAI GPT-4
- **Amenity Recommendations**: Get data-driven amenity suggestions with ROI estimates
- **Market Analysis**: Comprehensive insights and competitive analysis
- **Report Generation**: Export professional reports in PDF format
- **Interactive Maps**: Satellite imagery and nearby places analysis

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon managed)
- **AI**: OpenAI API (GPT-4)
- **Maps**: Google Maps API
- **Authentication**: JWT
- **ORM**: Sequelize with TypeScript

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Google Maps API Key
- OpenAI API Key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/florenciacomuzzi/amp-report.git
cd amp-report
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amp_report
DB_USER=postgres
DB_PASSWORD=yourpassword

# APIs
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENAI_API_KEY=your_openai_key

# JWT
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
```bash
# Create database
createdb amp_report

# Run migrations and seed data
npm run db:seed
```

**Note:** The seed command will:
- Create all necessary tables
- Populate amenities data
- Create a test user (test@example.com / testpass123)

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Test User Credentials

For development and testing purposes, a test user is available:

- **Email:** test@example.com
- **Password:** testpass123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Properties
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/geocode` - Geocode address
- `GET /api/properties/:id/nearby-places` - Get nearby places

### Analysis
- `POST /api/analysis/tenant-profile` - Generate tenant profile
- `POST /api/analysis/chat` - Chat with AI assistant
- `POST /api/analysis/recommendations` - Get amenity recommendations
- `GET /api/analysis/report/:id` - Get analysis report
- `POST /api/analysis/report/:id/export` - Export report

### Amenities
- `GET /api/amenities` - List amenities
- `GET /api/amenities/categories` - Get amenity categories
- `GET /api/amenities/:id` - Get amenity details

## Project Structure

```
amp-report/
├── backend/            # Express + tRPC backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── trpc/           # tRPC routers and context
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── seeders/        # Database seeders
│   │   ├── app.ts          # Express app setup
│   │   └── index.ts        # Server entry point
│   ├── api/                # Vercel serverless function
│   ├── scripts/            # Backend utility scripts
│   ├── package.json
│   └── tsconfig.json
├── client/             # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── styles/         # Theme and styles
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   ├── public/             # Static assets
│   ├── package.json
│   └── tsconfig.json
├── api/                # Vercel API wrapper
├── nginx/              # Nginx configuration
├── scripts/            # Docker and deployment scripts
├── slides/             # MVP presentation
├── docker-compose.yml  # Docker configuration
├── Makefile            # Build automation
├── vercel.json         # Vercel deployment config
└── README.md
```

## Scripts

### Backend Scripts (run from `backend/` directory)
- `npm run dev` - Start backend development server with hot reload
- `npm run build` - Build TypeScript backend for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint on backend code
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:seed` - Seed database with initial data
- `npm run db:reset` - Reset and reseed database
- `npm run generate:trpc-types` - Generate tRPC type definitions
- `npm run dev:all` - Run backend and frontend concurrently

### Frontend Scripts (run from `client/` directory)
- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm run lint` - Run ESLint on frontend code
- `npm run typecheck` - Run TypeScript type checking

### Makefile Commands (run from root directory)
- `make install` - Install backend dependencies
- `make client-install` - Install frontend dependencies
- `make db-seed` - Seed database via Makefile
- `make docker-up` - Start Docker development environment
- `make docker-down` - Stop Docker containers
- `make docker-logs` - View Docker container logs
- `make generate-types` - Generate tRPC type definitions
- `make slides` - Launch MVP presentation locally
- `make slides-export` - Export presentation as static HTML

### Backend Deployment (Google Cloud Run)
- `make show-config` - Display current GCP configuration
- `make gcp-auth` - Configure GCP authentication and enable required services
- `make deploy-backend` - Build and deploy backend to Cloud Run
- `make deploy-backend-env` - Deploy backend with environment variables from .env file

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Run migrations in production
4. Start the server:
```bash
NODE_ENV=production npm start
```

## Presentation Slides (MVP)

You can view or export the MVP presentation built with **reveal-md**.

### Local (host) workflow

```bash
# install dependencies (if you haven't already)
make install

# start slides in watch-mode on http://localhost:1948
make slides
```

### Export a static HTML deck

```bash
make slides-export   # outputs to docs/presentation by default
```

### Docker workflow

If you prefer using Docker, a `slides` service is now included in `docker-compose.dev.yml`.

```bash
# start database, app and slides services
make docker-up   # or   docker-compose -f docker-compose.dev.yml up -d

# access slides on http://localhost:1948
```

Stop services with `make docker-down`.

---

## Docker Setup

### Local Development with Docker

1. Copy environment template and adjust Docker-specific values:
```bash
cp .env.example .env
# then edit .env and make sure, for example:
# DB_HOST=postgres
# CORS_ORIGIN=http://localhost:3001
```

2. Start local development:
```bash
./scripts/docker-setup.sh local
# Or manually:
docker-compose up -d
```

3. Access services:
- Application: http://localhost:3000
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050 (optional, use `docker-compose --profile tools up -d`)

4. Seed the database (if running for the first time):
```bash
./scripts/docker-setup.sh seed
# Or manually:
docker exec amp-report-app node -r reflect-metadata dist/seeders/index.js
```

### Neon Postgres with Docker

1. Add your Neon connection string to `.env` as `DATABASE_URL`.
2. Start the stack normally (`docker-compose up -d` for local or production commands below).

### Production Setup

```bash
./scripts/docker-setup.sh production
# Or manually:
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Commands

```bash
# View logs
./scripts/docker-setup.sh logs [service-name]

# Stop all services
./scripts/docker-setup.sh stop

# Rebuild images
./scripts/docker-setup.sh build

# Seed database
./scripts/docker-setup.sh seed

# Access app shell
./scripts/docker-setup.sh shell

# Access PostgreSQL
./scripts/docker-setup.sh psql
```

## Deploying with Neon Postgres

1. Create (or reuse) a Neon project and database from https://console.neon.tech
2. Copy the connection string and add it to your deployment platform as `DATABASE_URL`
3. Ensure that `sslmode=require` is part of the URL (Neon enforces TLS)
4. You’re now ready to deploy the stack using the usual container image or Cloud Run commands.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deploying to Vercel

The project now includes a **zero-config Vercel setup** that deploys both the Express + tRPC API and the React front-end as a single project.

### 1. One-time project setup

```bash
npm i -g vercel          # install CLI if you don't have it yet
vercel link               # link the local folder to your Vercel project
```

Follow the prompts or choose an existing Vercel project.

### 2. Required files (already committed)

| Path            | Purpose                                                  |
|-----------------|----------------------------------------------------------|
| `vercel.json`   | Build & routing rules. /api/* → serverless function; all other paths → CRA static build |
| `api/index.ts`  | Thin wrapper that initialises the database **once** and forwards every request to the Express app |

No further changes are needed—you only push to `main` and Vercel handles the rest.

### 3. Environment variables (add them in the Vercel dashboard)

```
DATABASE_URL         # or the individual DB_* vars
OPENAI_API_KEY       # required for AI features
OPENAI_MODEL         # optional, defaults to gpt-4
CORS_ORIGIN          # e.g. https://<your-project>.vercel.app
JWT_SECRET           # same value used locally
GOOGLE_MAPS_API_KEY  # maps / geocoding features
```

If you are using Neon Postgres (recommended) simply paste its connection string into `DATABASE_URL` (includes `sslmode=require`).

### 4. Deploying

For the frontend, push code to the git repository.
For backend, `make deploy-backend`.

### 5. Local development remains unchanged

```
make docker-up        # database + supporting services
npm run dev:all       # concurrently starts Express (3000) & CRA (3001)
```

---

## License

This project is licensed under the MIT License.
