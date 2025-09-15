# Yardstick Server

A multi-tenant SaaS Notes Application API built with Node.js, Express, TypeScript, and MongoDB.

## 🏗️ Multi-Tenant Architecture

This application implements a **shared schema with tenant ID column** approach for multi-tenancy:

### Chosen Approach: Shared Schema with Tenant ID
- **Single Database**: All tenants share the same MongoDB database
- **Tenant Isolation**: Each document includes a `tenantId` field for data isolation
- **Performance**: Optimized with compound indexes on `tenantId` for fast queries
- **Cost Effective**: Minimal infrastructure overhead compared to schema-per-tenant or database-per-tenant

### Why This Approach?
1. **Simplicity**: Single database connection and schema management
2. **Cost Efficiency**: Shared resources reduce infrastructure costs
3. **Scalability**: MongoDB's horizontal scaling capabilities
4. **Maintenance**: Easier backups, migrations, and monitoring
5. **Performance**: Compound indexes ensure fast tenant-specific queries

### Data Isolation Strategy
All models include `tenantId` references with compound indexes:
- `Note`: `{ tenantId: 1, authorId: 1 }` and `{ tenantId: 1, createdAt: -1 }`
- `User`: `{ email: 1, tenantId: 1 }`
- `RefreshToken`: Includes `tenantId` for session isolation

## ✨ Features

- **Multi-tenant Architecture**: Complete data isolation per tenant with subscription limits
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Role-based Access Control**: Admin and member roles with different permissions
- **Rate Limiting**: API rate limiting for security and performance
- **CORS Support**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js for comprehensive security headers
- **Cookie-based Auth**: Secure HTTP-only cookies for token storage
- **Plan Management**: Free and Pro subscription tiers with note limits
- **Vercel Deployment**: Serverless deployment configuration

## 🚀 Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with async/await patterns
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with refresh token rotation
- **Security**: Helmet, CORS, bcryptjs, Rate Limiting
- **Development**: ts-node-dev for hot reloading
- **Deployment**: Vercel serverless functions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance (local or cloud)
- pnpm package manager

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the server root:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/yardstick-notes

   # JWT Configuration
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # CORS Origins
   CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
   ```

### Development

**Start development server with hot reload:**
```bash
pnpm dev
```

**Available Scripts:**
```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Compile TypeScript to JavaScript
pnpm start        # Start production server
pnpm type-check   # Run TypeScript compiler check
pnpm seed         # Seed database with sample data (if available)
```

### Production Build

**Build and start production server:**
```bash
pnpm build
pnpm start
```

### Deployment (Vercel)

The server is configured for Vercel serverless deployment:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Environment Variables:**
   Configure the same environment variables in your Vercel dashboard.

## API Documentation

### Base URL
```
http://localhost:3001/api/v1
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
  "plan": "pro"
}
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

- **Free**: Up to 3 notes per tenant
- **Pro**: Up to 100 notes per tenant

Plan limits are enforced at the API level with real-time validation.

## 📁 Project Structure

```
server/
├── api/
│   └── index.js           # Vercel serverless entry point
├── src/
│   ├── config/            # Database and environment configuration
│   ├── controllers/       # Route handlers and business logic
│   ├── middleware/        # Custom middleware (auth, tenant, validation)
│   ├── models/            # Mongoose schemas and models
│   │   ├── Note.ts        # Note model with tenant isolation
│   │   ├── User.ts        # User model with role management
│   │   ├── Tenant.ts      # Tenant model with subscription plans
│   │   └── RefreshToken.ts # JWT refresh token storage
│   ├── routes/            # API route definitions
│   ├── scripts/           # Database seeding and utility scripts
│   ├── utils/             # Helper functions and utilities
│   ├── app.ts             # Express app configuration
│   └── server.ts          # Server entry point
├── dist/                  # Compiled JavaScript output
├── .env                   # Environment variables
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment configuration
└── package.json           # Dependencies and scripts
```

## 🗄️ Database Models

### User Model
```typescript
interface IUser {
  email: string;           // Unique email address
  password: string;        // Bcrypt hashed password
  role: 'admin' | 'member'; // Role-based permissions
  tenantId: ObjectId;      // Tenant association
  createdAt: Date;
  updatedAt: Date;
}
```

### Tenant Model
```typescript
interface ITenant {
  name: string;            // Organization name
  slug: string;            // Unique URL-friendly identifier
  plan: 'free' | 'pro';    // Subscription plan
  maxNotes: number;        // Plan-based note limit
  createdAt: Date;
  updatedAt: Date;
}
```

### Note Model
```typescript
interface INote {
  title: string;           // Note title (max 200 chars)
  content: string;         // Note content (max 10,000 chars)
  authorId: ObjectId;      // User who created the note
  tenantId: ObjectId;      // Tenant isolation
  createdAt: Date;
  updatedAt: Date;
}
```

### RefreshToken Model
```typescript
interface IRefreshToken {
  token: string;           // JWT refresh token
  userId: ObjectId;        // Associated user
  tenantId: ObjectId;      // Tenant isolation
  expiresAt: Date;         // Automatic expiration
  createdAt: Date;
}
```

## 🔒 Multi-Tenant Security

### Tenant Isolation
- **Data Separation**: All queries automatically filter by `tenantId`
- **Route Protection**: Middleware validates tenant access on every request
- **Index Optimization**: Compound indexes ensure fast tenant-specific queries
- **Session Isolation**: Refresh tokens include tenant context

### Security Middleware Stack
1. **Helmet**: Security headers and XSS protection
2. **CORS**: Configurable cross-origin resource sharing
3. **Rate Limiting**: Per-IP request throttling
4. **JWT Validation**: Token verification and refresh rotation
5. **Tenant Validation**: Automatic tenant context injection
6. **Role Authorization**: Admin/member permission checks

### Plan Enforcement
- **Real-time Limits**: Note creation blocked when plan limits reached
- **Upgrade Flow**: Seamless plan upgrade with immediate limit increases
- **Usage Tracking**: Efficient note counting per tenant

## 🧪 Testing

### Manual Testing
Use tools like Postman or curl to test the API endpoints. Remember to:
1. Login to get authentication tokens
2. Include the `X-Tenant-Slug` header for tenant-specific requests
3. Use proper `Authorization: Bearer <token>` headers

### Database Seeding
If available, use the seed script to populate test data:
```bash
pnpm seed
```

## 🚀 Performance Optimizations

### Database Indexes
- **Compound Indexes**: Optimized for tenant-specific queries
- **TTL Indexes**: Automatic cleanup of expired refresh tokens
- **Unique Constraints**: Email uniqueness per tenant

### Caching Strategy
- **JWT Tokens**: Stateless authentication reduces database queries
- **Mongoose Connection**: Single connection pool for efficiency
- **Query Optimization**: Lean queries and projection for better performance

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Server
PORT=3001
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/yardstick

# JWT
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Optional Environment Variables
```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window

# Security
BCRYPT_ROUNDS=12             # Password hashing rounds
```

## 📄 License

This project is part of the Yardstick application suite. See the main project README for license information.