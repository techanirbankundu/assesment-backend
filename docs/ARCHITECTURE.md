# T-Model Architecture Documentation

## Overview

This document outlines the T-Model architecture implementation for the multi-industry platform supporting Tour, Travel, and Logistics businesses. The architecture follows a layered approach with a common base layer and industry-specific vertical layers.

## Architecture Principles

### T-Model Structure
- **Base Layer**: Common features shared across all industries (authentication, user management, payments, etc.)
- **Vertical Layers**: Industry-specific dashboards, business logic, and data models

### Key Design Decisions
1. **Database**: PostgreSQL with Drizzle ORM for type safety and performance
2. **Industry Selection**: Stored in user profile to determine dashboard routing
3. **Modular Design**: Industry-specific services and middleware for maintainability
4. **Shared Core**: Common authentication, validation, and error handling

## Database Schema

### Core Tables
- `users`: Base user information with industry type
- `tour_profiles`: Tour industry specific data
- `travel_profiles`: Travel industry specific data  
- `logistics_profiles`: Logistics industry specific data
- `products`: Base product/service table with industry type
- `orders`: Unified order system with industry context

### Industry-Specific Extensions
- `tour_packages`: Tour-specific product details
- `travel_services`: Travel-specific service details
- `logistics_services`: Logistics-specific service details

## API Structure

### Base Routes
- `/api/auth/*` - Authentication and user management
- `/api/users/*` - User profile management
- `/api/dashboard/*` - Industry-specific dashboards

### Industry-Specific Routes
- `/api/dashboard/tour` - Tour industry dashboard
- `/api/dashboard/travel` - Travel industry dashboard
- `/api/dashboard/logistics` - Logistics industry dashboard

## Service Layer Architecture

### IndustryService
Central service for managing industry-specific logic:
- Profile management per industry
- Dashboard data aggregation
- Navigation menu generation
- Industry validation

### Middleware Stack
- `authenticate`: JWT token validation
- `getDashboardRoute`: Route determination based on industry
- `loadDashboardData`: Industry-specific data loading
- `validateIndustryAccess`: Industry-specific access control

## User Flow

### Registration Flow
1. User registers with basic information + industry type
2. System creates base user record
3. Industry-specific profile created based on selection
4. User redirected to appropriate dashboard

### Login Flow
1. User authenticates with credentials
2. System validates user and loads industry type
3. Dashboard route determined based on industry
4. Industry-specific data and navigation loaded
5. User redirected to appropriate dashboard

### Dashboard Routing
```
User Login → Industry Check → Dashboard Route
├── Tour → /dashboard/tour
├── Travel → /dashboard/travel  
├── Logistics → /dashboard/logistics
└── Other → /dashboard/generic
```

## Industry-Specific Features

### Tour Industry
- Tour package management
- Booking system
- Customer management
- Destination analytics
- Guide scheduling

### Travel Industry
- Flight/hotel booking
- Travel itinerary management
- Customer service
- Destination management
- Travel analytics

### Logistics Industry
- Shipment tracking
- Route optimization
- Vehicle management
- Delivery scheduling
- Logistics analytics

## Security Considerations

### Authentication
- JWT-based authentication with refresh tokens
- Industry-specific access control
- Role-based permissions (user, admin, moderator)

### Data Isolation
- Industry-specific data separation
- User can only access their industry's features
- Admin access for cross-industry management

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Industry-specific service isolation

### Vertical Scaling
- Modular architecture allows independent scaling
- Industry-specific optimizations
- Caching strategies per industry

## Future Enhancements

### Planned Features
1. Industry-specific plugins system
2. Cross-industry collaboration tools
3. Advanced analytics and reporting
4. Multi-tenant architecture support
5. API versioning for industry-specific changes

### Extension Points
- New industry types can be added by:
  1. Adding new enum values
  2. Creating industry-specific tables
  3. Implementing industry service methods
  4. Adding dashboard routes

## Development Guidelines

### Adding New Industry
1. Update `industryTypeEnum` in schema
2. Create industry-specific profile table
3. Add service methods in `IndustryService`
4. Create dashboard route and middleware
5. Update navigation and validation

### Code Organization
- Industry-specific code in dedicated modules
- Shared utilities in common modules
- Clear separation of concerns
- Consistent error handling and logging
