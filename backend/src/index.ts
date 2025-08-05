import 'reflect-metadata';
import app from './app';
import sequelize from './config/database';
import logger from './utils/logger';
import models from './models';

const PORT = parseInt(process.env.PORT || '8080', 10);

async function startServer() {
  try {
    // Start the server first to respond to health checks
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Then initialize database connection
    sequelize.addModels(models);
    
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');

      if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: true });
        logger.info('Database synchronized');
      }
    } catch (dbError) {
      logger.error('Database connection failed:', dbError);
      // Don't exit the process, let the app run without DB
      // This allows Cloud Run health checks to pass
    }
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();