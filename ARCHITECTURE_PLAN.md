# Disco - Vinyl Collection Management App

- [Disco - Vinyl Collection Management App](#disco---vinyl-collection-management-app)
  - [Architecture Plan](#architecture-plan)
    - [Overview](#overview)
    - [Technology Stack](#technology-stack)
      - [Frontend](#frontend)
      - [Backend](#backend)
      - [Infrastructure](#infrastructure)
    - [Data Schema](#data-schema)
      - [Google Sheets Structure](#google-sheets-structure)
      - [Application Data Models](#application-data-models)
    - [Application Architecture](#application-architecture)
      - [Frontend Architecture](#frontend-architecture)
      - [Backend Architecture](#backend-architecture)
    - [API Design](#api-design)
      - [Authentication Endpoints](#authentication-endpoints)
      - [Vinyl Collection Endpoints](#vinyl-collection-endpoints)
      - [Metadata Endpoints](#metadata-endpoints)
    - [Key Features](#key-features)
      - [MVP Features](#mvp-features)
      - [Future Enhancements](#future-enhancements)
    - [Security Considerations](#security-considerations)
    - [Performance Considerations](#performance-considerations)
    - [Development Workflow](#development-workflow)
    - [File Structure](#file-structure)
    - [Next Steps](#next-steps)

## Architecture Plan

### Overview

Disco is a mobile-first web application for managing vinyl record collections.
The MVP will feature OAuth2 authentication with Google and use Google Sheets as
the primary data store.

### Technology Stack

#### Frontend

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for mobile-first responsive design
- **State Management**: React Query (TanStack Query) for server state
- **UI Components**: Headless UI + custom components
- **Authentication**: React OAuth2 with Google
- **Build Tool**: Vite for fast development and optimized builds
- **PWA Support**: Service workers for offline capabilities

#### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Google OAuth2 strategy
- **Google Sheets API**: Google Sheets API v4
- **Validation**: Joi for request validation
- **CORS**: Express CORS middleware
- **Environment**: dotenv for configuration

#### Infrastructure

- **Hosting**: Self-hosted containers (frontend and backend)
- **Database**: Google Sheets (primary data store)
- **Authentication**: Google OAuth2
- **Environment**: Development, Staging, Production
- **Containerization**: Docker for both frontend and backend deployment

### Data Schema

#### Google Sheets Structure

```text
Sheet: "Vinyl Collection"
Columns:
- Artist Name (dropdown)
- Album Name (text)
- Year (number)
- Format (dropdown: Vinyl, CD, Cassette, Digital)
- Genre (dropdown)
- Price (currency)
- Owner (dropdown)
- Status (dropdown: Owned, Wanted, Borrowed, Loaned, Re-purchase Necessary)
- Notes (text)
- Created Date (auto-generated)
- Last Modified (auto-generated)
```

#### Application Data Models

```typescript
interface VinylRecord {
  id: string;
  artistName: string;
  albumName: string;
  year: number;
  format: 'Vinyl' | 'CD' | 'Cassette' | 'Digital';
  genre: string;
  price: number;
  owner: string;
  status: 'Owned' | 'Wanted' | 'Borrowed' | 'Loaned' | 'Re-purchase Necessary';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}
```

### Application Architecture

#### Frontend Architecture

```text
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   ├── layout/       # Layout components
│   └── vinyl/        # Vinyl-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and configurations
├── pages/            # Page components
├── services/         # API service functions
├── stores/           # Client-side state management
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

#### Backend Architecture

```text
src/
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── routes/           # API route definitions
├── services/         # Business logic and external API calls
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
└── config/           # Configuration files
```

### API Design

#### Authentication Endpoints

```text
POST /api/auth/google
GET  /api/auth/callback
GET  /api/auth/logout
GET  /api/auth/me
```

#### Vinyl Collection Endpoints

```text
GET    /api/vinyl              # Get all records (with filtering)
GET    /api/vinyl/:id          # Get single record
POST   /api/vinyl              # Create new record
PUT    /api/vinyl/:id          # Update record
DELETE /api/vinyl/:id          # Delete record
GET    /api/vinyl/stats        # Get collection statistics
```

#### Metadata Endpoints

```text
GET /api/metadata/artists      # Get all artists
GET /api/metadata/genres       # Get all genres
GET /api/metadata/owners       # Get all owners
```

### Key Features

#### MVP Features

1. **Authentication**
   - Google OAuth2 login/logout
   - Session management
   - Protected routes

2. **Vinyl Management**
   - View all records in a responsive grid/list
   - Add new vinyl records
   - Edit existing records
   - Delete records
   - Search and filter functionality

3. **Mobile-First Design**
   - Responsive design optimized for mobile devices
   - Touch-friendly interface
   - Progressive Web App capabilities

4. **Data Synchronization**
   - Real-time sync with Google Sheets
   - Offline support with local caching
   - Conflict resolution

#### Future Enhancements

1. **Advanced Features**
   - Barcode scanning for vinyl records
   - Image upload for album covers
   - Wishlist management
   - Collection analytics and statistics
   - Export/import functionality

2. **Social Features**
   - Share collections
   - Follow other collectors
   - Recommendations based on collection

### Security Considerations

1. **Authentication**
   - Secure OAuth2 implementation
   - JWT token management
   - Session timeout handling

2. **Data Protection**
   - HTTPS enforcement
   - Input validation and sanitization
   - Rate limiting
   - CORS configuration

3. **Google Sheets Access**
   - Service account with minimal permissions
   - Secure credential management
   - API rate limiting compliance

### Performance Considerations

1. **Frontend**
   - Code splitting and lazy loading
   - Image optimization
   - Caching strategies
   - Progressive Web App features

2. **Backend**
   - Request caching
   - Database query optimization
   - API response compression
   - Connection pooling

3. **Google Sheets Integration**
   - Batch operations for multiple records
   - Caching frequently accessed data
   - Efficient pagination

### Development Workflow

1. **Setup Phase**
   - Initialize frontend and backend projects
   - Configure Google OAuth2 credentials
   - Set up Google Sheets API access
   - Configure development environment

2. **Development Phase**
   - Implement authentication flow
   - Create basic CRUD operations
   - Build responsive UI components
   - Integrate Google Sheets API

3. **Testing Phase**
   - Unit tests for components and services
   - Integration tests for API endpoints
   - End-to-end testing
   - Mobile device testing

4. **Deployment Phase**
   - Deploy frontend and backend as Docker containers to self-hosted infrastructure
   - Configure production environment
   - Set up monitoring and logging

### File Structure

```text
disco/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
├── scripts/
│   ├── setup.sh
│   └── deploy.sh
└── README.md
```

### Next Steps

1. **Immediate Actions**
   - Set up Google OAuth2 credentials
   - Configure Google Sheets API access
   - Initialize frontend and backend projects
   - Create basic project structure

2. **Development Priorities**
   - Implement authentication system
   - Create basic vinyl CRUD operations
   - Build responsive mobile UI
   - Integrate Google Sheets API

3. **Testing Strategy**
   - Set up testing framework
   - Create unit and integration tests
   - Perform mobile device testing
   - Security testing
