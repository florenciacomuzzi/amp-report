import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Preferred configuration for Neon (https://neon.tech) which exposes the database
 * through a standard PostgreSQL connection URL. When the `DATABASE_URL` (or
 * `NEON_DATABASE_URL`) environment variable is present we rely on it instead of
 * individual host / port credentials. This keeps local development unchanged
 * (still using the "postgres" service from docker-compose) while production can
 * point directly at the managed Neon instance.
 */
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

let sequelize: Sequelize;

if (DATABASE_URL) {
  // Neon requires SSL ("sslmode=require" in the URL) so we always enable it.
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: isProduction ? false : console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Fallback to individual parameters — useful for local development.
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'amp_report',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    logging: isProduction ? false : console.log,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

export default sequelize;