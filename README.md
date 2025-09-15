## 🔗 Links

- **[Client README](./client/README.md)** - Frontend documentation
- **[Server README](./server/README.md)** - Backend documentation
- **[API Documentation](./server/README.md#api-endpoints)** - API reference
- **[Deployment Guide](./server/README.md#deployment)** - Production deployment

# Yardstick Fullstack Application

A modern fullstack note management application with multi-tenant architecture, built with Next.js and Node.js.

## 🏗️ Architecture Overview

This is a monorepo containing both frontend and backend applications:

- **Client**: Next.js 14+ application with TypeScript and Tailwind CSS
- **Server**: Node.js/Express API with MongoDB and JWT authentication

## 📁 Project Structure

```
yardstick-fullstack/
├── client/                 # Next.js frontend application
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service layer
│   └── types/             # TypeScript definitions
├── server/                # Node.js backend API
│   ├── src/               # Source code
│   ├── api/               # API routes and controllers
│   └── dist/              # Compiled JavaScript
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- MongoDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yardstick-fullstack
   ```

2. **Install dependencies for both client and server**
   ```bash
   # Install client dependencies
   cd client
   pnpm install
   
   # Install server dependencies
   cd ../server
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Configure client environment
   cd client
   cp .env.local.example .env.local
   
   # Configure server environment
   cd ../server
   cp .env.example .env
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Start the backend server
   cd server
   pnpm dev
   
   # Terminal 2: Start the frontend client
   cd client
   pnpm dev
   ```

5. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)

## 📚 Documentation

### Detailed Documentation
- **[Client Documentation](./client/README.md)** - Frontend application setup, architecture, and development guide
- **[Server Documentation](./server/README.md)** - Backend API setup, endpoints, and database configuration

### Key Features
- **Multi-Tenant Architecture**: Isolated data and features per tenant
- **Authentication & Authorization**: JWT-based auth with role management
- **Notes Management**: Full CRUD operations with real-time updates
- **Plan Management**: Free and Pro tiers with feature restrictions
- **Admin Panel**: Tenant and user management interface
- **Responsive Design**: Mobile-first UI with dark/light mode

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation

### Backend (Server)
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schemas
- **Deployment**: Vercel serverless functions

## 🔧 Development Workflow

### Running Both Applications
```bash
# Option 1: Run separately (recommended for development)
# Terminal 1
cd server && pnpm dev

# Terminal 2  
cd client && pnpm dev

# Option 2: Use workspace commands (if configured)
pnpm dev:client
pnpm dev:server
```

### Building for Production
```bash
# Build client
cd client && pnpm build

# Build server
cd server && pnpm build
```

### Testing
```bash
# Test client
cd client && pnpm test

# Test server
cd server && pnpm test
```

## 🚀 Deployment

### Client (Vercel)
The Next.js application is optimized for Vercel deployment with automatic builds and previews.

### Server (Vercel Serverless)
The Express API is configured to run as Vercel serverless functions.

### Environment Variables
Ensure all required environment variables are configured in your deployment platform:

**Client Variables:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

**Server Variables:**
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV`

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the coding standards** defined in each application
4. **Test your changes** in both client and server
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Standards
- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper error handling
- Include type definitions
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the individual application README files for more details.

## 🆘 Support

For issues and questions:
1. Check the individual application README files
2. Review the existing issues in the repository
3. Create a new issue with detailed information

