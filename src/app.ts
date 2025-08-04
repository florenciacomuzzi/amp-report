import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/property';
import analysisRoutes from './routes/analysis';
import amenityRoutes from './routes/amenity';
import tenantProfileRoutes from './routes/tenantProfile';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/routers';
import { createContext } from './trpc/context';

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({ 
    message: 'AMP Report API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      properties: '/api/properties',
      analysis: '/api/analysis',
      amenities: '/api/amenities',
      tenantProfiles: '/api/tenant-profiles'
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/tenant-profiles', tenantProfileRoutes);

// tRPC endpoint
app.use('/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
}));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.use(errorHandler);

export default app;