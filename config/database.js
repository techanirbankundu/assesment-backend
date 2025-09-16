import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from './config.js';
import { logger } from '../utils/logger.js';

// Create connection using URI
const connectionString = config.database.uri;
const sql = neon(connectionString);

// Create drizzle instance
export const db = drizzle(sql);

// Test database connection
export const connectDB = async () => {
  try {
    console.log('Attempting to connect to Neon PostgreSQL...');
    console.log('Connection string:', config.database.uri ? 'Set' : 'Not set');
    await sql`SELECT 1`;
    console.log('Neon PostgreSQL Connected Successfully');
    logger.info('Neon PostgreSQL Connected Successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.log('Connection string:', config.database.uri);
    console.log('\n📋 To fix this issue:');
    console.log('1. Check your DB_URI in .env file');
    console.log('2. Verify Neon database is accessible');
    console.log('3. Check network connectivity');
    console.log('\n🔄 Continuing without database connection for now...\n');
    logger.warn('Database connection failed, continuing without database');
    // Don't exit in development mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Database connection closed');
  process.exit(0);
});

export default db;