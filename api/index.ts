import 'reflect-metadata';
import app from '../src/app';
import sequelize from '../src/config/database';
import logger from '../src/utils/logger';
import models from '../src/models';

// Initialize the database connection once when the serverless function is first loaded.
// Subsequent invocations will reuse the same connection (if supported by the Vercel runtime).
let initialized = false;

async function initDatabase() {
  if (initialized) return;
  try {
    sequelize.addModels(models);
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // In the serverless environment we generally avoid destructive syncs, but
    // keeping the logic consistent with local dev. Guard with NODE_ENV check.
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    initialized = true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
}

export default async function handler(req: any, res: any) {
  await initDatabase();
  // Delegate request handling to the Express app instance
  return app(req, res);
}
