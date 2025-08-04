import 'reflect-metadata';
import app from './app';
import sequelize from './config/database';
import logger from './utils/logger';
import models from './models';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    sequelize.addModels(models);
    
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();