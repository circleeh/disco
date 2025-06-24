# Disco API Documentation

## Overview

The Disco API is a RESTful service that provides endpoints for managing vinyl
record collections. It integrates with Google OAuth2 for authentication and
Google Sheets for data storage.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-backend-domain.com`

## Authentication

The API uses Google OAuth2 for authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Authentication Flow

1. **Initiate OAuth2 Flow**

   ```text
   GET /api/auth/google
   ```

2. **OAuth2 Callback**

   ```text
   GET /api/auth/google/callback
   ```

3. **Logout**

   ```text
   GET /api/auth/logout
   ```

4. **Get Current User**

   ```texdt
   GET /api/auth/me
   ```

### Using JWT Tokens

Include the JWT token in the Authorization header:

```text
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

#### GET /api/health

Check if the API is running.

**Response:**

```json
{
  "status": "OK",
  "message": "Disco API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Authentication Endpoints

#### GET /api/auth/google

Initiates Google OAuth2 authentication flow.

**Response:** Redirects to Google OAuth2 consent screen.

#### GET /api/auth/google/callback

Handles the OAuth2 callback from Google.

**Query Parameters:**

- `code` (string, required): Authorization code from Google
- `state` (string, optional): State parameter for CSRF protection

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://example.com/avatar.jpg"
  },
  "token": "jwt_token_here"
}
```

#### GET /api/auth/logout

Logs out the current user.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me

Get information about the current authenticated user.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Response:**

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://example.com/avatar.jpg",
  "googleId": "google_user_id"
}
```

### Vinyl Collection Endpoints

#### GET /api/vinyl

Get all vinyl records with filtering and pagination.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50)
- `artist` (optional): Filter by artist name
- `genre` (optional): Filter by genre
- `status` (optional): Filter by status
- `owner` (optional): Filter by owner
- `search` (optional): Search across artist and album names
- `sortBy` (optional): Sort field (artistName, albumName, year, price)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record_id",
        "artistName": "Pink Floyd",
        "albumName": "The Dark Side of the Moon",
        "year": 1973,
        "format": "Vinyl",
        "genre": "Rock",
        "price": 25.99,
        "owner": "John Doe",
        "status": "Owned",
        "notes": "Original pressing",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

#### GET /api/vinyl/:id

Get a specific vinyl record by ID.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Path Parameters:**

- `id` (string, required): Record ID

**Response:**

```json
{
  "id": "record_id",
  "artistName": "Pink Floyd",
  "albumName": "The Dark Side of the Moon",
  "year": 1973,
  "format": "Vinyl",
  "genre": "Rock",
  "price": 25.99,
  "owner": "John Doe",
  "status": "Owned",
  "notes": "Original pressing",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### POST /api/vinyl

Create a new vinyl record.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)
- `Content-Type: application/json`

**Request Body:**

```json
{
  "artistName": "Pink Floyd",
  "albumName": "The Dark Side of the Moon",
  "year": 1973,
  "format": "Vinyl",
  "genre": "Rock",
  "price": 25.99,
  "owner": "John Doe",
  "status": "Owned",
  "notes": "Original pressing"
}
```

**Response:**

```json
{
  "id": "new_record_id",
  "artistName": "Pink Floyd",
  "albumName": "The Dark Side of the Moon",
  "year": 1973,
  "format": "Vinyl",
  "genre": "Rock",
  "price": 25.99,
  "owner": "John Doe",
  "status": "Owned",
  "notes": "Original pressing",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### PUT /api/vinyl/:id

Update an existing vinyl record.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)
- `Content-Type: application/json`

**Path Parameters:**

- `id` (string, required): Record ID

**Request Body:**

```json
{
  "artistName": "Pink Floyd",
  "albumName": "The Dark Side of the Moon",
  "year": 1973,
  "format": "Vinyl",
  "genre": "Rock",
  "price": 30.00,
  "owner": "John Doe",
  "status": "Owned",
  "notes": "Original pressing, mint condition"
}
```

**Response:**

```json
{
  "id": "record_id",
  "artistName": "Pink Floyd",
  "albumName": "The Dark Side of the Moon",
  "year": 1973,
  "format": "Vinyl",
  "genre": "Rock",
  "price": 30.00,
  "owner": "John Doe",
  "status": "Owned",
  "notes": "Original pressing, mint condition",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### DELETE /api/vinyl/:id

Delete a vinyl record.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Path Parameters:**

- `id` (string, required): Record ID

**Response:**

```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

#### GET /api/vinyl/stats

Get collection statistics.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Response:**

```json
{
  "totalRecords": 150,
  "totalValue": 3750.50,
  "byStatus": {
    "Owned": 120,
    "Wanted": 20,
    "Borrowed": 5,
    "Loaned": 3,
    "Re-purchase Necessary": 2
  },
  "byFormat": {
    "Vinyl": 100,
    "CD": 30,
    "Cassette": 15,
    "Digital": 5
  },
  "byGenre": {
    "Rock": 50,
    "Jazz": 30,
    "Classical": 25,
    "Pop": 20,
    "Other": 25
  },
  "averagePrice": 25.00,
  "mostExpensive": {
    "id": "record_id",
    "artistName": "The Beatles",
    "albumName": "Sgt. Pepper's Lonely Hearts Club Band",
    "price": 150.00
  }
}
```

### Metadata Endpoints

#### GET /api/metadata/artists

Get all unique artist names.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Response:**

```json
[
  "Pink Floyd",
  "The Beatles",
  "Led Zeppelin",
  "Miles Davis",
  "John Coltrane"
]
```

#### GET /api/metadata/genres

Get all unique genres.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Response:**

```json
[
  "Rock",
  "Jazz",
  "Classical",
  "Pop",
  "Blues",
  "Folk"
]
```

#### GET /api/metadata/owners

Get all unique owners.

**Headers:**

- `Authorization: Bearer <jwt-token>` (required)

**Response:**

```json
[
  "John Doe",
  "Jane Smith",
  "Bob Johnson"
]
```

#### GET /api/metadata/search

Search for album metadata using a combined query.

**Query Parameters:**

- `query` (required): Search query
- `limit` (optional): Number of results (default: 5)

**Response:**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record_id",
        "artistName": "Pink Floyd",
        "albumName": "The Dark Side of the Moon",
        "year": 1973,
        "format": "Vinyl",
        "genre": "Rock",
        "price": 25.99,
        "owner": "John Doe",
        "status": "Owned",
        "notes": "Original pressing",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 100,
      "totalPages": 20
    }
  }
}
```

#### GET /api/metadata/artist/:artist

Search for albums by artist name only.

**Query Parameters:**

- `limit` (optional): Number of results (default: 5)

**Response:**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record_id",
        "artistName": "Pink Floyd",
        "albumName": "The Dark Side of the Moon",
        "year": 1973,
        "format": "Vinyl",
        "genre": "Rock",
        "price": 25.99,
        "owner": "John Doe",
        "status": "Owned",
        "notes": "Original pressing",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 100,
      "totalPages": 20
    }
  }
}
```

#### GET /api/metadata/album

Search for albums by album name only.

**Query Parameters:**

- `album` (required): Album name to search for
- `limit` (optional): Number of results (default: 5)

**Response:**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record_id",
        "artistName": "Pink Floyd",
        "albumName": "The Dark Side of the Moon",
        "year": 1973,
        "format": "Vinyl",
        "genre": "Rock",
        "price": 25.99,
        "owner": "John Doe",
        "status": "Owned",
        "notes": "Original pressing",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 100,
      "totalPages": 20
    }
  }
}
```

#### GET /api/metadata/artist-album

Search for albums using separate artist and album parameters.

**Query Parameters:**

- `artist` (required): Artist name
- `album` (required): Album name
- `limit` (optional): Number of results (default: 5)

**Response:**

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record_id",
        "artistName": "Pink Floyd",
        "albumName": "The Dark Side of the Moon",
        "year": 1973,
        "format": "Vinyl",
        "genre": "Rock",
        "price": 25.99,
        "owner": "John Doe",
        "status": "Owned",
        "notes": "Original pressing",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 100,
      "totalPages": 20
    }
  }
}
```

#### GET /api/metadata/release/:releaseId

Get detailed metadata for a specific release.

**Query Parameters:**

- `releaseId` (string, required): Release ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "record_id",
    "artistName": "Pink Floyd",
    "albumName": "The Dark Side of the Moon",
    "year": 1973,
    "format": "Vinyl",
    "genre": "Rock",
    "price": 25.99,
    "owner": "John Doe",
    "status": "Owned",
    "notes": "Original pressing",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Data Models

### VinylRecord

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
```

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}
```

### Pagination

```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "artistName",
      "message": "Artist name is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:

```text
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## CORS

The API supports CORS for cross-origin requests:

- **Allowed Origins**: Configured via environment variable
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization
- **Credentials**: true

## Google Sheets Integration

The API integrates with Google Sheets for data storage:

- **Service Account**: Used for server-to-server authentication
- **Batch Operations**: Multiple records are processed in batches
- **Caching**: Frequently accessed data is cached for performance
- **Error Handling**: Graceful handling of Google Sheets API errors

## Development

### Local Development

1. Start the development server:

   ```bash
   cd backend
   npm run dev
   ```

2. The API will be available at `http://localhost:5000`

3. Use the health check endpoint to verify the server is running:

   ```bash
   curl http://localhost:5000/api/health
   ```

### Environment Variables

Required environment variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Session Configuration
SESSION_SECRET=your_session_secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Testing

### Running Tests

```bash
cd backend
npm test
```

### API Testing

You can test the API using tools like:

- **Postman**: Import the collection from `docs/postman-collection.json`
- **curl**: Use the examples provided in this documentation
- **Insomnia**: Import the collection from `docs/insomnia-collection.json`

## Support

For API support and questions:

1. Check the error responses for specific error details
2. Review the request/response examples
3. Ensure all required headers and authentication are included
4. Verify environment variables are properly configured
