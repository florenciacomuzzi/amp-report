import User from '../models/User';
import logger from '../utils/logger';

export const seedUsers = async () => {
  try {
    // Create test user - password will be hashed by the User model
    const testUser = await User.create({
      email: 'test@example.com',
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      company: 'Test Company',
      phone: '555-1234'
    });

    logger.info('Test user created successfully');
    logger.info(`Test user credentials: email: test@example.com, password: testpass123`);
    
    return testUser;
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};