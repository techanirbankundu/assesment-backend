import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

// Create connection using URI
const connectionString = config.database.uri;

const client = postgres(connectionString);
const db = drizzle(client);

// Migration SQL
const migrations = [
  // Create enums
  `CREATE TYPE industry_type AS ENUM ('tour', 'travel', 'logistics', 'other');`,
  `CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');`,
  `CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');`,
  `CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'partially_refunded');`,
  `CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer');`,

  // Create users table
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    industry_type industry_type NOT NULL DEFAULT 'other',
    avatar VARCHAR(500),
    phone VARCHAR(20),
    address JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    lock_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  // Create industry profile tables
  `CREATE TABLE IF NOT EXISTS tour_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(100),
    license_number VARCHAR(50),
    specialties JSONB,
    languages JSONB,
    certifications JSONB,
    experience INTEGER,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_tours INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS travel_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_name VARCHAR(100),
    iata_number VARCHAR(50),
    specialties JSONB,
    destinations JSONB,
    certifications JSONB,
    experience INTEGER,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS logistics_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(100),
    license_number VARCHAR(50),
    specialties JSONB,
    vehicle_types JSONB,
    coverage_areas JSONB,
    certifications JSONB,
    experience INTEGER,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_shipments INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  // Create products table
  `CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL,
    industry_type industry_type NOT NULL,
    brand VARCHAR(50),
    sku VARCHAR(100) UNIQUE,
    images JSONB,
    inventory JSONB,
    specifications JSONB,
    tags JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_digital BOOLEAN NOT NULL DEFAULT false,
    digital_file JSONB,
    seo JSONB,
    ratings JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  // Create industry-specific product tables
  `CREATE TABLE IF NOT EXISTS tour_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    duration INTEGER,
    max_participants INTEGER,
    min_participants INTEGER,
    difficulty VARCHAR(20),
    includes JSONB,
    excludes JSONB,
    itinerary JSONB,
    pickup_locations JSONB,
    requirements JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS travel_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    service_type VARCHAR(50),
    origin VARCHAR(100),
    destination VARCHAR(100),
    departure_date DATE,
    return_date DATE,
    passengers INTEGER,
    class VARCHAR(20),
    amenities JSONB,
    policies JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS logistics_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    service_type VARCHAR(50),
    origin VARCHAR(100),
    destination VARCHAR(100),
    weight DECIMAL(10,2),
    dimensions JSONB,
    vehicle_type VARCHAR(50),
    delivery_time INTEGER,
    tracking BOOLEAN DEFAULT true,
    insurance BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  // Create orders table
  `CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    industry_type industry_type NOT NULL,
    items JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    payment JSONB NOT NULL,
    shipping JSONB NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status_history JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_industry_type ON users(industry_type);`,
  `CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_products_industry_type ON products(industry_type);`,
  `CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`
];

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    for (const migration of migrations) {
      await client.unsafe(migration);
      logger.info('Migration executed successfully');
    }
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
