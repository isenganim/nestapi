# API Documentation

## Base URL
`https://api.pkmsaas.com/v1`

## Authentication
All API endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Rate Limiting
- 1000 requests per hour per user
- 100 requests per minute per endpoint
- Headers:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (UTC)

## Endpoints

### Authentication

#### Login
```
POST /auth/login
```
Request:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Notes

#### Create Note
```
POST /notes
```
Request:
```json
{
  "title": "My First Note",
  "content": "This is my first note content.",
  "tags": ["important", "work"],
  "is_encrypted": false
}
```

#### Get Note
```
GET /notes/{noteId}
```

#### Update Note
```
PUT /notes/{noteId}
```

#### Delete Note
```
DELETE /notes/{noteId}
```

#### List Notes
```
GET /notes
```
Query Parameters:
- `page` (number)
- `limit` (number, max 100)
- `tag` (string)
- `search` (string)
- `sort` (string: 'created_at', '-created_at', 'updated_at', '-updated_at')

### Search

#### Full-text Search
```
GET /search
```
Query Parameters:
- `q` (string): Search query
- `limit` (number, default: 10)
- `offset` (number, default: 0)

### AI Features

#### Generate Tags
```
POST /ai/tags
```
Request:
```json
{
  "content": "Content to analyze for tags"
}
```

#### Summarize Text
```
POST /ai/summarize
```
Request:
```json
{
  "text": "Long text to summarize...",
  "length": "short" // 'short', 'medium', or 'long'
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 429 Too Many Requests
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retry_after": 60
  }
}
```

## Webhooks

### Events
- `note.created`
- `note.updated`
- `note.deleted`
- `user.registered`
- `user.deleted`

### Webhook Payload Example
```json
{
  "event": "note.created",
  "data": {
    "id": "note_123",
    "title": "New Note",
    "user_id": "user_123"
  },
  "timestamp": "2023-07-06T03:00:00Z"
}
```

## Versioning
API versioning is done through the URL path:
- Current version: `v1`
- Example: `https://api.pkmsaas.com/v1/notes`

Older versions will be maintained for at least 6 months after a new version is released.
