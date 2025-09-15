# Yardstick Client

A modern Next.js application for note management with multi-tenant support and authentication.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Authentication**: JWT-based auth with refresh tokens
- **Package Manager**: pnpm

## 📁 Project Structure

```
client/
├── app/                    # Next.js App Router pages and layouts
│   ├── (auth)/            # Authentication route group
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # Reusable React components
│   ├── admin/             # Admin-specific components for tenant management
│   ├── auth/              # Authentication components and guards
│   ├── layout/            # Layout components (header, sidebar, etc.)
│   ├── notes/             # Note management components (CRUD operations)
│   └── ui/                # Base UI components from Shadcn/ui
├── hooks/                 # Custom React hooks for data fetching and state
├── lib/                   # Utility functions and API configuration
├── providers/             # React context providers (theme, query client)
├── public/                # Static assets (images, icons, etc.)
├── services/              # API service classes for backend communication
└── types/                 # TypeScript type definitions and interfaces
```

## 🏗️ Architecture Overview

### Components Structure
- **UI Components**: Base components from Shadcn/ui for consistent design
- **Feature Components**: Domain-specific components organized by feature (notes, auth, admin)
- **Layout Components**: Reusable layout elements with responsive design

### Data Management
- **Services**: Clean API abstraction layer with TypeScript interfaces
- **Hooks**: Custom hooks for data fetching, caching, and state management
- **Types**: Centralized type definitions for API responses and data models

### Authentication Flow
- JWT-based authentication with automatic token refresh
- Route protection with auth guards
- Multi-tenant support with role-based access control

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm package manager

### Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Configure your environment variables
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Tailwind CSS
Configured with custom theme extensions and Shadcn/ui integration.

### ESLint
Custom ESLint configuration with Next.js and TypeScript rules.

## 📦 Key Dependencies

- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation with Zod integration
- **lucide-react**: Modern icon library
- **next-themes**: Theme switching functionality
- **tailwindcss**: Utility-first CSS framework

## 🎨 UI/UX Features

- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessible Components**: ARIA-compliant UI components
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages and fallbacks

## 🔐 Security Features

- **Authentication Guards**: Protected routes and components
- **Token Management**: Automatic refresh and secure storage
- **Input Validation**: Client-side validation with Zod schemas
- **XSS Protection**: Sanitized user inputs and secure rendering

## 📱 Features

### Notes Management
- Create, read, update, and delete notes
- Real-time updates with optimistic UI
- Search and filter functionality

### Multi-Tenant Support
- Tenant-based data isolation
- Plan-based feature restrictions
- Admin panel for tenant management

### User Management
- Role-based access control (admin/member)
- User invitation system
- Profile management

## 🚀 Deployment

The application is configured for deployment on Vercel with automatic builds and previews.

### Build Optimization
- Automatic code splitting
- Image optimization with Next.js Image component
- Bundle analysis and optimization

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for all new code
3. Add proper type definitions for new features
4. Test components in isolation
5. Follow the established Git workflow

## 📄 License

This project is part of the Yardstick application suite.