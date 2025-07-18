# Replit.md - Pageant Management System

## Overview

This is a comprehensive pageant management system built with React, Node.js/Express, and PostgreSQL. The application provides a complete solution for managing beauty pageants or talent competitions with features including participant registration, dynamic scoring, real-time analytics, and secure authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with proper error handling middleware
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth (mandatory for this platform)
- **Strategy**: OpenID Connect with Passport.js
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Role-based Access**: Three user roles - contestant, judge, admin

### Scoring System
- **Flexible Criteria**: Dynamic scoring categories (Interview, Talent, Evening Gown, etc.)
- **Weighted Calculations**: Configurable weight assignments per criterion
- **Multi-phase Competitions**: Support for preliminary rounds with score resets
- **Judge Management**: Multiple judges per event with score aggregation

### Event Management
- **Event Lifecycle**: Support for upcoming, active, and completed events
- **Contestant Management**: Registration, profile management, and status tracking
- **Phase Management**: Multi-stage competitions with progression controls

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Component Library**: Comprehensive UI components from Radix UI
- **Theming**: Dark/light mode support with CSS custom properties
- **Accessibility**: ARIA-compliant components and keyboard navigation

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OIDC provider validates credentials
3. User session created and stored in PostgreSQL
4. JWT-style claims stored in session for role-based access

### Scoring Flow
1. Admin creates event and defines scoring criteria
2. Judges are assigned to events
3. Contestants register and are approved
4. Judges submit scores for each criterion
5. System calculates weighted totals and rankings
6. Results are displayed in real-time

### Event Management Flow
1. Admin creates event with metadata
2. Scoring criteria and phases are configured
3. Contestants register and upload profiles
4. Competition progresses through phases
5. Scores can be reset between phases
6. Final results are calculated and displayed

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm and drizzle-kit for database operations
- **Auth**: openid-client and passport for authentication
- **UI**: @radix-ui/* components for accessible UI primitives
- **Styling**: tailwindcss for utility-first CSS
- **State**: @tanstack/react-query for server state management

### Development Dependencies
- **Build**: vite for development and production builds
- **TypeScript**: Full TypeScript support across frontend and backend
- **ESLint/Prettier**: Code quality and formatting tools

### Replit-specific Dependencies
- **Auth Integration**: Replit Auth is mandatory and pre-configured
- **Development**: @replit/vite-plugin-cartographer for development tools
- **Runtime**: @replit/vite-plugin-runtime-error-modal for error handling

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with automatic restart
- **Database**: Neon PostgreSQL with development database
- **Environment**: Environment variables managed through Replit Secrets

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: esbuild for Node.js bundle creation
- **Assets**: Static file serving through Express
- **Database**: Production PostgreSQL instance via DATABASE_URL

### Environment Configuration
- **Secrets Management**: All credentials stored in Replit Secrets
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Session**: SESSION_SECRET for secure session management
- **Auth**: REPLIT_DOMAINS and ISSUER_URL for authentication

### Security Considerations
- **HTTPS**: Enforced in production environment
- **Sessions**: Secure session cookies with appropriate flags
- **CORS**: Configured for appropriate cross-origin access
- **Input Validation**: Zod schemas for runtime type validation
- **SQL Injection**: Prevented through Drizzle ORM parameterized queries

The system is designed to be scalable, secure, and maintainable with clear separation of concerns between frontend, backend, and database layers. The modular architecture allows for easy extension and customization of scoring criteria and competition formats.