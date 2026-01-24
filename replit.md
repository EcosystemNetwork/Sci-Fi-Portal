# Void Walker: Protocol

## Overview

Void Walker: Protocol is a sci-fi portal adventure game built as a full-stack web application. Players survive quantum jumps through a procedural encounter system, managing health, energy, and credits while exploring sectors and engaging with various encounters (combat, loot, exploration).

The application follows a client-server architecture with a React frontend and Express backend, using PostgreSQL for persistent game state storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom sci-fi theme (Orbitron, Rajdhani, Share Tech Mono fonts)
- **Animations**: Framer Motion for encounter transitions, custom CSS animations (scanlines, flicker, glitch effects)
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: RESTful endpoints under `/api/game/*`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Tables**:
  - `game_sessions`: Tracks player stats (health, energy, credits, level, game state)
  - `encounters`: Stores active encounters per game session
  - `event_logs`: Mission log entries with timestamps and event types

### Key Design Patterns
- **Shared Schema**: Database schema defined in `shared/schema.ts`, accessible to both client and server
- **Type Safety**: Full TypeScript coverage with inferred types from Drizzle schema
- **API Layer**: Centralized API functions in `client/src/lib/api.ts`
- **Component Structure**: Separation between game components (`components/game/`) and layout components (`components/layout/`)

### Build Process
- Development: Vite dev server with HMR, proxied through Express
- Production: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema migrations and database pushing

### UI Framework
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component library using Radix + Tailwind

### Development Tools
- **Vite**: Frontend build and development server
- **esbuild**: Server bundling for production
- **TypeScript**: Type checking across the entire codebase

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator