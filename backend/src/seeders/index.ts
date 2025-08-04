import 'reflect-metadata';
import sequelize from '../config/database';
import models from '../models';
import { seedAmenities } from './amenitySeeder';
import { seedUsers } from './userSeeder';
import logger from '../utils/logger';

export const seedDatabase = async () => {
  try {
    sequelize.addModels(models);
    
    await sequelize.authenticate();
    logger.info('Database connection established');

    await sequelize.sync({ force: true });
    logger.info('Database synchronized');

    await seedAmenities();
    await seedUsers();
    logger.info('Database seeded successfully');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}