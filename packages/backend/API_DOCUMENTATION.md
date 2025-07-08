# PKM SaaS API Documentation

## Overview

The PKM (Personal Knowledge Management) SaaS API is a comprehensive backend service built with NestJS that provides user authentication, note management, and knowledge organization capabilities.

## Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Swagger Documentation**: `http://localhost:3000/api/v1/docs`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Authentication Flow

1. **Register** or **Login** to get access and refresh tokens
2. Include the access token in the Authorization header: `Bearer <access_token>`
3. Use the refresh token to get new access tokens when they expire

### Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg" // optional
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/v1/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

#### POST /api/v1/auth/logout
Logout and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

#### GET /api/v1/auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "role": "USER",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Notes Endpoints

All notes endpoints require authentication (`Authorization: Bearer <access_token>`).

#### POST /api/v1/notes
Create a new note.

**Request Body:**
```json
{
  "title": "My First Note",
  "content": "# Hello World\nThis is my first note!",
  "isPublic": false,
  "isPinned": false,
  "tagIds": ["550e8400-e29b-41d4-a716-446655440000"],
  "metadata": {
    "category": "personal",
    "priority": "high"
  }
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "My First Note",
  "slug": "my-first-note",
  "content": "# Hello World\nThis is my first note!",
  "summary": "Hello World This is my first note!",
  "isPublic": false,
  "isPinned": false,
  "isArchived": false,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "version": 1,
  "tags": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "personal",
      "color": "#ff0000"
    }
  ],
  "links": [],
  "metadata": {
    "category": "personal",
    "priority": "high"
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### GET /api/v1/notes
Get all notes for the authenticated user with optional filtering and pagination.

**Query Parameters:**
- `isArchived` (boolean): Filter by archived status
- `isPinned` (boolean): Filter by pinned status
- `tagId` (string): Filter by tag ID
- `search` (string): Search in title and content
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Example:**
```
GET /api/v1/notes?search=hello&isPinned=true&page=1&limit=20
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "My First Note",
      "slug": "my-first-note",
      "content": "# Hello World\nThis is my first note!",
      "summary": "Hello World This is my first note!",
      "isPublic": false,
      "isPinned": true,
      "isArchived": false,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "version": 1,
      "tags": [],
      "links": [],
      "metadata": {},
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### GET /api/v1/notes/:id
Get a specific note by ID.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "My First Note",
  "slug": "my-first-note",
  "content": "# Hello World\nThis is my first note!",
  "summary": "Hello World This is my first note!",
  "isPublic": false,
  "isPinned": false,
  "isArchived": false,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "version": 1,
  "tags": [],
  "links": [],
  "metadata": {},
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### PATCH /api/v1/notes/:id
Update a note.

**Request Body:**
```json
{
  "title": "Updated Note Title",
  "content": "# Updated Content\nThis note has been updated!",
  "isPinned": true,
  "addTagIds": ["550e8400-e29b-41d4-a716-446655440000"],
  "removeTagIds": ["550e8400-e29b-41d4-a716-446655440001"]
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated Note Title",
  "slug": "updated-note-title",
  "content": "# Updated Content\nThis note has been updated!",
  "summary": "Updated Content This note has been updated!",
  "isPublic": false,
  "isPinned": true,
  "isArchived": false,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "version": 2,
  "tags": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "personal",
      "color": "#ff0000"
    }
  ],
  "links": [],
  "metadata": {},
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:01.000Z"
}
```

#### DELETE /api/v1/notes/:id
Delete a note.

**Response (204):**
No content

#### POST /api/v1/notes/:id/archive
Archive a note.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "My First Note",
  "slug": "my-first-note",
  "content": "# Hello World\nThis is my first note!",
  "summary": "Hello World This is my first note!",
  "isPublic": false,
  "isPinned": false,
  "isArchived": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "version": 1,
  "tags": [],
  "links": [],
  "metadata": {},
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:01.000Z"
}
```

#### POST /api/v1/notes/:id/unarchive
Unarchive a note.

**Response (200):**
Similar to archive response but with `isArchived: false`

#### POST /api/v1/notes/:id/pin
Pin a note.

**Response (200):**
Similar to archive response but with `isPinned: true`

#### POST /api/v1/notes/:id/unpin
Unpin a note.

**Response (200):**
Similar to archive response but with `isPinned: false`

## Error Responses

The API uses standard HTTP status codes and returns error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 10 requests per minute per IP
- **General endpoints**: 100 requests per minute per IP
- **File upload endpoints**: 5 requests per minute per user

## Data Validation

All request bodies are validated using class-validator decorators:

- **Email**: Must be a valid email format
- **Password**: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- **UUID**: Must be valid UUID v4 format
- **Required fields**: Cannot be empty or null

## Database Seeding

For development purposes, you can seed the database with sample data:

```bash
npm run seed
```

This will create:
- 10 sample users
- 15 predefined tags
- 50 sample notes with various content
- Proper relationships between users, notes, and tags

## Swagger Documentation

Interactive API documentation is available at:
- `http://localhost:3000/api/docs` (Development)

The Swagger UI provides:
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication testing

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Argon2 for secure password storage
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Account Locking**: Automatic account locking after failed attempts

## Development

### Running the API

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
```

## Support

For issues and questions:
- Check the Swagger documentation at `/api/docs`
- Review the error responses for detailed error information
- Ensure proper authentication headers are included
- Verify request body structure matches the expected schema