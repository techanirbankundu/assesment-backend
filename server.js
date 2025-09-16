import app from './app.js';
// import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';
import { config } from './config/config.js';

const PORT = config.port || 8000;
const HOST = config.host || '0.0.0.0';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});


console.log('Starting server...');


// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`API Documentation: http://${HOST}:${PORT}/api-docs`);
  console.log(`Environment: ${config.nodeEnv}`);
  logger.info(`Server running on http://${HOST}:${PORT}`);
  logger.info(`API Documentation: http://${HOST}:${PORT}/api-docs`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

export default server;
