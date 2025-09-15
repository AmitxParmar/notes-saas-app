# Notes API Server

A multi-tenant SaaS Notes Application API built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Multi-tenant Architecture**: Isolated data per tenant with subscription-based limits
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Role-based Access Control**: Admin and user roles with different permissions
- **Rate Limiting**: API rate limiting for security and performance
- **CORS Support**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Cookie-based Auth**: Secure HTTP-only cookies for token storage

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: ts-node-dev for hot reloading

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB instance
- pnpm package manager

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/notes-app

# JWT Secrets
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Development

Start the development server:
```bash
pnpm dev
```

### Production

Build and start the production server:
```bash
pnpm build
pnpm start
```

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All authenticated endpoints require either:
- `Authorization: Bearer <access_token>` header, or
- `accessToken` cookie (set automatically on login)

### Endpoints

#### Health Check
```http
GET /health
```
Returns server health status.

#### Authentication

##### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user"
    },
    "tenant": {
      "id": "tenant_id",
      "name": "Company Name",
      "slug": "company-slug",
      "plan": "free",
      "maxNotes": 10
    }
  }
}
```

##### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user"
    },
    "tenant": {
      "id": "tenant_id",
      "name": "Company Name",
      "slug": "company-slug",
      "plan": "free",
      "maxNotes": 10
    }
  }
}
```

##### Refresh Token
```http
POST /api/v1/auth/refreshToken
Content-Type: application/json

{
  "refreshToken": "refresh_token_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully"
}
```

##### Logout
```http
POST /api/v1/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Notes

##### Get All Notes
```http
GET /api/v1/notes
Authorization: Bearer <access_token>
X-Tenant-Slug: company-slug
```

##### Create Note
```http
POST /api/v1/notes
Authorization: Bearer <access_token>
X-Tenant-Slug: company-slug
Content-Type: application/json

{
  "title": "Note Title",
  "content": "Note content here..."
}
```

##### Get Note by ID
```http
GET /api/v1/notes/:id
Authorization: Bearer <access_token>
X-Tenant-Slug: company-slug
```

##### Update Note
```http
PUT /api/v1/notes/:id
Authorization: Bearer <access_token>
X-Tenant-Slug: company-slug
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

##### Delete Note
```http
DELETE /api/v1/notes/:id
Authorization: Bearer <access_token>
X-Tenant-Slug: company-slug
```

#### Tenant Management

##### Upgrade Tenant Plan
```http
POST /api/v1/tenant/upgrade
Authorization: Bearer <access_token>
X-Tenant-Slug: company-slug
Content-Type: application/json

{
  "plan": "premium"
}
```

### Multi-Tenant Headers

For tenant-specific operations, include the tenant slug in the request header:
```
X-Tenant-Slug: your-tenant-slug
```

### Error Responses

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Rate Limiting

The API implements rate limiting:
- **Default**: 100 requests per 15 minutes per IP
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

### Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **JWT**: Secure token-based authentication
- **HTTP-only Cookies**: Secure token storage
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Request validation and sanitization

### Subscription Plans

- **Free**: Up to 10 notes
- **Premium**: Up to 100 notes
- **Enterprise**: Unlimited notes

### Development

#### Project Structure
```
src/
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── app.ts          # Express app configuration
└── server.ts       # Server entry point
```

#### Environment Variables
See `.env.example` for all required environment variables.

#### Database Models
- **User**: User accounts with authentication
- **Tenant**: Multi-tenant organizations
- **Note**: User notes with tenant isolation
- **RefreshToken**: JWT refresh token storage

## License

This project is licensed under the MIT License.