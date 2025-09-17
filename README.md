# Ragilly Backend - T-Model Multi-Industry Platform

A comprehensive Express.js backend application built with a T-Model architecture to support multiple industries (Tour, Travel, Logistics) with industry-specific dashboards and business logic.

## Architecture Overview

This application follows the T-Model approach:
- **Base Layer**: Common features shared across all industries (authentication, user management, payments)
- **Vertical Layers**: Industry-specific dashboards, business logic, and data models

## Features

### Core Features
- JWT-based authentication with refresh tokens
- Industry-specific user profiles and dashboards
- PostgreSQL database with Drizzle ORM
- Comprehensive input validation and sanitization
- Rate limiting and security middleware
- Structured logging with Winston
- API documentation with Swagger
- Error handling and monitoring

### Industry-Specific Features
- **Tour Industry**: Tour package management, booking system, customer management
- **Travel Industry**: Flight/hotel booking, itinerary management, destination management
- **Logistics Industry**: Shipment tracking, route optimization, delivery management

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator + Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
backend/
├── config/
│   ├── config.js          # Environment configuration
│   ├── database.js        # Database connection
│   └── swagger.js         # API documentation
├── db/
│   └── schema.js          # Database schema definitions
├── docs/
│   ├── ARCHITECTURE.md    # Architecture documentation
│   └── FLOW_DIAGRAMS.md   # Flow diagrams
├── middleware/
│   ├── authMiddleware.js  # Authentication middleware
│   ├── dashboardMiddleware.js # Dashboard routing
│   ├── errorMiddleware.js # Error handling
│   ├── requestLogger.js   # Request logging
│   └── validation.js      # Input validation
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── userRoutes.js      # User management routes
│   └── dashboardRoutes.js # Dashboard routes
├── services/
│   └── IndustryService.js # Industry-specific services
├── utils/
│   ├── jwt.js            # JWT utilities
│   └── logger.js         # Logging utilities
├── app.js                # Express application
├── server.js             # Server entry point
└── package.json          # Dependencies and scripts
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Server (Works without database)
```bash
npm run dev
```

The server will start on `http://localhost:3000` even without PostgreSQL.

## Database Setup (PostgreSQL with Drizzle + Neon Serverless)

### Option A: Local Postgres via Docker (for local dev)
```bash
# Start PostgreSQL with Docker
docker run --name ragilly-postgres \
  -e POSTGRES_DB=ragilly \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Run migrations with Drizzle Kit
npx drizzle-kit generate
npx drizzle-kit push
```

### Option B: Local Installation
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Start PostgreSQL service
3. Create database: `createdb ragilly`
4. Update `.env` with database credentials
5. Run migrations:
   - `npx drizzle-kit generate`
   - `npx drizzle-kit push`

### Option C: Neon Serverless (Production Recommended)

Use Neon’s serverless Postgres with the Neon HTTP driver for serverless environments (Vercel):

1. Get a Neon connection string (ensure it includes `sslmode=require`), e.g.
   `postgres://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
2. Set `DB_URI` to that value in your environment.
3. Configure Drizzle to use Neon HTTP driver at runtime.

Example Drizzle config (`drizzle.config.ts`):
```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './backend/db/schema.ts',
  out: './backend/drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DB_URI! },
} satisfies Config;
```

Example runtime client (`backend/config/database.ts`):
```ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DB_URI!); // DB_URI must include sslmode=require
export const db = drizzle(sql);
```

Run migrations against Neon in CI before deploy:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

For detailed setup instructions, see [docs/SETUP.md](docs/SETUP.md).

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration (prefer single URI)
DB_URI=postgres://user:password@localhost:5432/ragilly
# For Neon production, e.g.
# DB_URI=postgres://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@ragilly.com
FROM_NAME=Ragilly

# Security
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your-super-secret-session-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Dashboard
- `GET /api/dashboard` - Get user's dashboard (industry-specific)
- `GET /api/dashboard/tour` - Tour industry dashboard
- `GET /api/dashboard/travel` - Travel industry dashboard
- `GET /api/dashboard/logistics` - Logistics industry dashboard
- `GET /api/dashboard/profile` - Get industry profile
- `PUT /api/dashboard/profile` - Update industry profile
- `GET /api/dashboard/navigation` - Get industry navigation

### Health Check
- `GET /health` - Server health check

## Industry Types

The system supports the following industry types:
- `tour` - Tour and travel guide services
- `travel` - Travel agency services
- `logistics` - Logistics and shipping services
- `other` - Generic business type

## Database Schema

### Core Tables
- `users` - Base user information with industry type
- `tour_profiles` - Tour industry specific data
- `travel_profiles` - Travel industry specific data
- `logistics_profiles` - Logistics industry specific data
- `products` - Base product/service table
- `orders` - Unified order system

### Industry-Specific Extensions
- `tour_packages` - Tour-specific product details
- `travel_services` - Travel-specific service details
- `logistics_services` - Logistics-specific service details

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier

### Adding New Industry

1. Update `industryTypeEnum` in `db/schema.js`
2. Create industry-specific profile table
3. Add service methods in `services/IndustryService.js`
4. Create dashboard route in `routes/dashboardRoutes.js`
5. Update navigation and validation

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet for security headers
- XSS protection
- SQL injection prevention

## Logging

The application uses Winston for structured logging:
- Console output in development
- File logging in production
- Separate log files for errors and combined logs
- Request/response logging

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
