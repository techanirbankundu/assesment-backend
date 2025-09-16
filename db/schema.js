import { pgTable, uuid, varchar, text, timestamp, boolean, integer, json, pgEnum, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const industryTypeEnum = pgEnum('industry_type', ['tour', 'travel', 'logistics', 'other']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer']);

// Base Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  industryType: industryTypeEnum('industry_type').notNull().default('other'),
  avatar: varchar('avatar', { length: 500 }),
  phone: varchar('phone', { length: 20 }),
  address: json('address'),
  isActive: boolean('is_active').notNull().default(true),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  emailVerificationExpires: timestamp('email_verification_expires'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  lastLogin: timestamp('last_login'),
  loginAttempts: integer('login_attempts').notNull().default(0),
  lockUntil: timestamp('lock_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Industry-specific profiles
export const tourProfiles = pgTable('tour_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 100 }),
  licenseNumber: varchar('license_number', { length: 50 }),
  specialties: json('specialties'), // Array of tour types
  languages: json('languages'), // Array of supported languages
  certifications: json('certifications'), // Array of certifications
  experience: integer('experience'), // Years of experience
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalTours: integer('total_tours').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const travelProfiles = pgTable('travel_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agencyName: varchar('agency_name', { length: 100 }),
  iataNumber: varchar('iata_number', { length: 50 }),
  specialties: json('specialties'), // Array of travel services
  destinations: json('destinations'), // Array of covered destinations
  certifications: json('certifications'),
  experience: integer('experience'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalBookings: integer('total_bookings').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const logisticsProfiles = pgTable('logistics_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 100 }),
  licenseNumber: varchar('license_number', { length: 50 }),
  specialties: json('specialties'), // Array of logistics services
  vehicleTypes: json('vehicle_types'), // Array of vehicle types
  coverageAreas: json('coverage_areas'), // Array of coverage areas
  certifications: json('certifications'),
  experience: integer('experience'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalShipments: integer('total_shipments').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Base Products/Services Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  category: varchar('category', { length: 50 }).notNull(),
  industryType: industryTypeEnum('industry_type').notNull(),
  brand: varchar('brand', { length: 50 }),
  sku: varchar('sku', { length: 100 }).unique(),
  images: json('images'),
  inventory: json('inventory'),
  specifications: json('specifications'),
  tags: json('tags'),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  isDigital: boolean('is_digital').notNull().default(false),
  digitalFile: json('digital_file'),
  seo: json('seo'),
  ratings: json('ratings'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Industry-specific product extensions
export const tourPackages = pgTable('tour_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  duration: integer('duration'), // Days
  maxParticipants: integer('max_participants'),
  minParticipants: integer('min_participants'),
  difficulty: varchar('difficulty', { length: 20 }),
  includes: json('includes'), // Array of included items
  excludes: json('excludes'), // Array of excluded items
  itinerary: json('itinerary'), // Detailed itinerary
  pickupLocations: json('pickup_locations'),
  requirements: json('requirements'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const travelServices = pgTable('travel_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  serviceType: varchar('service_type', { length: 50 }), // flight, hotel, car_rental, etc.
  origin: varchar('origin', { length: 100 }),
  destination: varchar('destination', { length: 100 }),
  departureDate: date('departure_date'),
  returnDate: date('return_date'),
  passengers: integer('passengers'),
  class: varchar('class', { length: 20 }),
  amenities: json('amenities'),
  policies: json('policies'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const logisticsServices = pgTable('logistics_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  serviceType: varchar('service_type', { length: 50 }), // shipping, warehousing, etc.
  origin: varchar('origin', { length: 100 }),
  destination: varchar('destination', { length: 100 }),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  dimensions: json('dimensions'),
  vehicleType: varchar('vehicle_type', { length: 50 }),
  deliveryTime: integer('delivery_time'), // Hours
  tracking: boolean('tracking').default(true),
  insurance: boolean('insurance').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id),
  industryType: industryTypeEnum('industry_type').notNull(),
  items: json('items').notNull(),
  shippingAddress: json('shipping_address').notNull(),
  billingAddress: json('billing_address'),
  payment: json('payment').notNull(),
  shipping: json('shipping').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0.00'),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).notNull().default('0.00'),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  statusHistory: json('status_history'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tourProfile: one(tourProfiles),
  travelProfile: one(travelProfiles),
  logisticsProfile: one(logisticsProfiles),
  products: many(products),
  orders: many(orders)
}));

export const tourProfilesRelations = relations(tourProfiles, ({ one }) => ({
  user: one(users, {
    fields: [tourProfiles.userId],
    references: [users.id]
  })
}));

export const travelProfilesRelations = relations(travelProfiles, ({ one }) => ({
  user: one(users, {
    fields: [travelProfiles.userId],
    references: [users.id]
  })
}));

export const logisticsProfilesRelations = relations(logisticsProfiles, ({ one }) => ({
  user: one(users, {
    fields: [logisticsProfiles.userId],
    references: [users.id]
  })
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id]
  }),
  tourPackage: one(tourPackages),
  travelService: one(travelServices),
  logisticsService: one(logisticsServices)
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  })
}));
