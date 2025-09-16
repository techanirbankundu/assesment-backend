import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || 'localhost',

  // Database configuration
  database: {
    uri: process.env.DB_URI || 'postgresql://postgres:password@localhost:5432/ragilly'
  },


  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',

  // Email configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@ragilly.com',
    fromName: process.env.FROM_NAME || 'Ragilly'
  },

  // File upload configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
  uploadPath: process.env.UPLOAD_PATH || 'uploads/',

  // Rate limiting configuration
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Session configuration
  sessionSecret: process.env.SESSION_SECRET || 'fallback-session-secret',

  // Redis configuration (optional)
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Cloudinary configuration (optional)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET'];

if (config.nodeEnv === 'production') {
  requiredEnvVars.push('DB_URI');
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

export { config };
