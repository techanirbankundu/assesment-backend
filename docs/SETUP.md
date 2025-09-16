# Setup Guide

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

### 3. Start Server (Without Database)
```bash
npm run dev
```

The server will start on `http://localhost:3000` even without PostgreSQL.

## Database Setup (PostgreSQL)

### Option 1: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name ragilly-postgres \
  -e POSTGRES_DB=ragilly \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Run migrations
npm run migrate
```

### Option 2: Local PostgreSQL Installation

#### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Start PostgreSQL service
4. Open pgAdmin or command line
5. Create database: `CREATE DATABASE ragilly;`

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
createdb ragilly
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres createdb ragilly
```

### 3. Update Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ragilly
DB_SSL=false
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Start Server
```bash
npm run dev
```

## Verification

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2025-09-13T02:15:35.318Z",
  "uptime": 19.5064885,
  "environment": "development",
  "database": "connected"
}
```

### API Documentation
Visit: http://localhost:3000/api-docs

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check connection credentials in `.env`
- Verify database exists
- Check firewall settings

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or change PORT in .env
```

### Permission Issues
- Ensure you have write permissions for logs directory
- Check file permissions in project directory

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code

### Project Structure
```
backend/
├── config/          # Configuration files
├── db/             # Database schema
├── docs/           # Documentation
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── scripts/        # Database migrations
```

## Next Steps

1. Set up PostgreSQL database
2. Run migrations to create tables
3. Test API endpoints
4. Configure industry-specific features
5. Deploy to production

## Support

If you encounter issues:
1. Check the logs in `logs/` directory
2. Verify all environment variables
3. Ensure all dependencies are installed
4. Check database connection
