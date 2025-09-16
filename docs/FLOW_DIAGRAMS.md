# Flow Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    T-Model Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  Industry-Specific Layers (Vertical)                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Tour     │ │   Travel    │ │  Logistics  │          │
│  │  Dashboard  │ │  Dashboard  │ │  Dashboard  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Common Base Layer (Horizontal)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Auth     │ │   Users     │ │  Payments   │          │
│  │  Service    │ │  Service    │ │  Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Database Layer (PostgreSQL + Drizzle ORM)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Users     │ │  Products   │ │   Orders    │          │
│  │   Tables    │ │   Tables    │ │   Tables    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## User Registration Flow

```
User Registration
        │
        ▼
┌─────────────────┐
│  Fill Form      │
│  + Industry     │
│  Selection      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Validate       │
│  Input Data     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Create User    │
│  Record         │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Create Industry│
│  Profile        │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Generate JWT   │
│  Tokens         │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Redirect to    │
│  Dashboard      │
└─────────────────┘
```

## User Login Flow

```
User Login
        │
        ▼
┌─────────────────┐
│  Enter          │
│  Credentials    │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Validate       │
│  Credentials    │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Load User      │
│  + Industry     │
│  Type           │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Determine      │
│  Dashboard      │
│  Route          │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Load Industry  │
│  Data &         │
│  Navigation     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Redirect to    │
│  Industry       │
│  Dashboard      │
└─────────────────┘
```

## Dashboard Routing Logic

```
User Access Dashboard
        │
        ▼
┌─────────────────┐
│  Check User     │
│  Industry Type  │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Route Based    │
│  on Industry    │
└─────────────────┘
        │
        ├─── Tour ────► /dashboard/tour
        ├─── Travel ──► /dashboard/travel
        ├─── Logistics ► /dashboard/logistics
        └─── Other ────► /dashboard/generic
```

## Industry Profile Management

```
Profile Update
        │
        ▼
┌─────────────────┐
│  User Updates   │
│  Profile Data   │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Validate       │
│  Industry Type  │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Update Base    │
│  User Record    │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Update/Create  │
│  Industry       │
│  Profile        │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Return Updated │
│  Profile Data   │
└─────────────────┘
```

## Database Schema Relationships

```
users (Base Table)
├── id (Primary Key)
├── industry_type (Enum)
├── email, password, etc.
│
├── tour_profiles
│   ├── user_id (FK)
│   ├── company_name
│   ├── specialties
│   └── tour_specific_data
│
├── travel_profiles
│   ├── user_id (FK)
│   ├── agency_name
│   ├── iata_number
│   └── travel_specific_data
│
└── logistics_profiles
    ├── user_id (FK)
    ├── company_name
    ├── license_number
    └── logistics_specific_data

products (Base Table)
├── id (Primary Key)
├── industry_type (Enum)
├── name, price, etc.
│
├── tour_packages
│   ├── product_id (FK)
│   ├── duration
│   └── tour_specific_data
│
├── travel_services
│   ├── product_id (FK)
│   ├── service_type
│   └── travel_specific_data
│
└── logistics_services
    ├── product_id (FK)
    ├── service_type
    └── logistics_specific_data
```

## API Request Flow

```
Client Request
        │
        ▼
┌─────────────────┐
│  Rate Limiting  │
│  & Security     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Authentication │
│  Middleware     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Industry       │
│  Validation     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Load Industry  │
│  Data           │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Process        │
│  Request        │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Return         │
│  Response       │
└─────────────────┘
```

## Error Handling Flow

```
Error Occurs
        │
        ▼
┌─────────────────┐
│  Log Error      │
│  Details        │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Determine      │
│  Error Type     │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Format Error   │
│  Response       │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Return Error   │
│  to Client      │
└─────────────────┘
```
