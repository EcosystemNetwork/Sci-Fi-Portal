# Sci-Fi Portal (Space Bases)

A sci-fi portal adventure game built as a full-stack web application. Players build their space empire through a procedural encounter system, managing combat stats, credits, and resources while exploring sectors and engaging with various alien encounters.

## Features

- **Procedural Encounters**: AI-generated alien encounters with dynamic storytelling
- **RPG System**: Items, skills, and faction relationships
- **Combat Stats**: Manage health, energy, ammunition, and more
- **Alien Wiki**: Database of 80+ alien races across multiple categories
- **Video Generation**: AI-powered portal videos (optional)

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Express 5, Node.js
- **Database**: PostgreSQL (production) or SQLite (local development)
- **AI**: Google Gemini API for encounter generation

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm

### Local Development (SQLite)

1. Clone the repository:
   ```bash
   git clone https://github.com/EcosystemNetwork/Sci-Fi-Portal.git
   cd Sci-Fi-Portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up AI features by creating a `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5000 in your browser.

The app will automatically create a SQLite database at `./data/game.db`.

### Production (PostgreSQL)

1. Set the `DATABASE_URL` environment variable to your PostgreSQL connection string:
   ```bash
   export DATABASE_URL=postgresql://user:password@host:5432/database
   ```

2. Push the database schema:
   ```bash
   npm run db:push
   ```

3. Build and start:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string. If not set or doesn't start with "postgres", SQLite is used. | No |
| `DATABASE_PATH` | Path to SQLite database file (default: `./data/game.db`) | No |
| `GEMINI_API_KEY` | Google Gemini API key for encounter generation | No |
| `GEMINI_VIDEO_API_KEY` | Google Gemini API key for video generation | No |
| `PORT` | Server port (default: 5000) | No |

## Database Schema

The game uses the following tables:

- `game_sessions` - Player stats and progress
- `encounters` - Active encounters per game session
- `event_logs` - Mission log entries
- `alien_races` - Wiki database of alien races
- `items` - Equippable items with stat modifiers
- `player_inventory` - Player's items
- `skills` - Skill tree definitions
- `player_skills` - Unlocked skills
- `alien_relationships` - Faction standings

## API Endpoints

### Game
- `POST /api/game/start` - Start a new game session
- `GET /api/game/active` - Get active game session
- `POST /api/game/:gameId/action` - Perform an action

### RPG System
- `POST /api/rpg/seed` - Seed items and skills
- `GET /api/rpg/items` - Get all items
- `GET /api/rpg/skills` - Get all skills
- `GET /api/rpg/inventory/:gameId` - Get player inventory
- `POST /api/rpg/inventory/:gameId/equip` - Equip an item

### Wiki
- `GET /api/wiki/aliens` - Get all alien races
- `POST /api/wiki/aliens/seed` - Seed alien database

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push schema to database

## License

MIT
