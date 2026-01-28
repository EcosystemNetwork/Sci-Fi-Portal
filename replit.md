# Space Bases

## Overview

Space Bases is a sci-fi portal adventure game built as a full-stack web application. Players build their space empire through a procedural encounter system, managing combat stats, credits, and resources while exploring sectors and engaging with various alien encounters.

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
  - `game_sessions`: Tracks player stats (health, energy, credits, level, experience, skill points, game state)
  - `encounters`: Stores active encounters per game session
  - `event_logs`: Mission log entries with timestamps and event types
  - `alien_races`: Wiki database of 80+ alien races with video generation prompts
  - `items`: 25+ equippable items with stat modifiers and special effects
  - `player_inventory`: Junction table for player's items with equipped status
  - `skills`: 30+ skills across 5 trees with tier progression and prerequisites
  - `player_skills`: Junction table for unlocked skills with rank tracking
  - `alien_relationships`: Faction standings (-100 to +100) with 10 alien factions

### RPG System
- **Inventory System**: 6 item slots (weapon, armor, helmet, accessory, module, consumable)
- **Item Rarities**: Common, Uncommon, Rare, Epic, Legendary with color-coded UI
- **Stat Modifiers**: Items and skills provide bonuses to combat stats
- **Skill Trees**: 5 categories (Combat, Diplomacy, Technology, Survival, Psionic)
- **Skill Tiers**: 3-tier progression with prerequisites and max ranks
- **Faction System**: 10 alien factions (Council, Hive, Syndicate, etc.) with relationship titles
- **Effective Stats**: Combat stats dynamically calculated from base + equipment + skill bonuses
- **API Endpoints**:
  - `POST /api/rpg/seed` - Seed items and skills data
  - `GET /api/rpg/items` - Get all item definitions
  - `GET /api/rpg/skills` - Get all skill definitions
  - `GET /api/rpg/inventory/:gameId` - Get player inventory
  - `POST /api/rpg/inventory/:gameId/equip` - Equip an item
  - `POST /api/rpg/inventory/:gameId/unequip` - Unequip an item
  - `GET /api/rpg/skills/:gameId` - Get player unlocked skills
  - `POST /api/rpg/skills/:gameId/unlock` - Unlock a skill
  - `GET /api/rpg/relationships/:gameId` - Get faction standings
  - `GET /api/rpg/stats/:gameId` - Get effective stats with bonuses
  - `POST /api/rpg/starter-kit/:gameId` - Apply starter equipment

### Alien Races Wiki
- **Categories**: Classic UFOlogy, Reptilian/Insectoid, Interdimensional, Humanoid/Hybrid, Ancient/Mythic, Sci-Fi Culture, Fringe Lore
- **API Endpoints**:
  - `GET /api/wiki/aliens` - Get all races
  - `GET /api/wiki/aliens/category/:category` - Get by category
  - `GET /api/wiki/aliens/random` - Get random race for video generation
  - `POST /api/wiki/aliens/seed` - Seed the database
  - `GET /api/wiki/stats` - Get wiki statistics

### AI Encounter Generation
- **Integration**: Gemini AI via Replit AI Integrations (no API key required, billed to credits)
- **API Endpoints**:
  - `GET /api/encounter/generate` - Generate a random alien encounter with AI-crafted dialogue and gifts
- **Sample Videos**: Pre-generated alien portal videos in `client/src/assets/videos/`
  - arcturian-portal.mp4, mantis-portal.mp4, grey-portal.mp4

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