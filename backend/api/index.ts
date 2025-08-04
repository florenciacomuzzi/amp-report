import 'reflect-metadata';
import app from '../src/app';
import sequelize from '../src/config/database';
import logger from '../src/utils/logger';
import models from '../src/models';

let initialized = false;

async function initDatabase() {
  if (initialized) return;
  try {
    sequelize.addModels(models);
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

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
  return app(req, res);
}
