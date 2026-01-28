/**
 * Database Storage Module
 * 
 * Supports both PostgreSQL (production) and SQLite (local development).
 * - If DATABASE_URL starts with "postgres", uses PostgreSQL
 * - Otherwise, uses SQLite with a local file (./data/game.db)
 */
import { eq, desc, and } from "drizzle-orm";

// Import types from the PostgreSQL schema (types are compatible between both)
import type {
  GameSession,
  InsertGameSession,
  Encounter,
  InsertEncounter,
  EventLog,
  InsertEventLog,
  AlienRace,
  InsertAlienRace,
  GeneratedVideo,
  InsertGeneratedVideo,
  EncounterTemplate,
  InsertEncounterTemplate,
  Item,
  InsertItem,
  PlayerInventory,
  InsertPlayerInventory,
  Skill,
  InsertSkill,
  PlayerSkill,
  InsertPlayerSkill,
  AlienRelationship,
  InsertAlienRelationship,
} from "@shared/schema";

// Determine database type
const usePostgres = process.env.DATABASE_URL?.startsWith("postgres");

// Database instance and schema tables - will be initialized based on environment
let db: any;
let gameSessions: any;
let encounters: any;
let eventLogs: any;
let alienRaces: any;
let generatedVideos: any;
let encounterTemplates: any;
let items: any;
let playerInventory: any;
let skills: any;
let playerSkills: any;
let alienRelationships: any;

if (usePostgres) {
  // PostgreSQL mode
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const pg = await import("pg");
  const schema = await import("@shared/schema");
  
  const client = new pg.default.Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  db = drizzle(client);
  
  // Use PostgreSQL schema tables
  gameSessions = schema.gameSessions;
  encounters = schema.encounters;
  eventLogs = schema.eventLogs;
  alienRaces = schema.alienRaces;
  generatedVideos = schema.generatedVideos;
  encounterTemplates = schema.encounterTemplates;
  items = schema.items;
  playerInventory = schema.playerInventory;
  skills = schema.skills;
  playerSkills = schema.playerSkills;
  alienRelationships = schema.alienRelationships;
  
  console.log("📊 Connected to PostgreSQL database");
} else {
  // SQLite mode for local development
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const Database = (await import("better-sqlite3")).default;
  const fs = await import("fs");
  const path = await import("path");
  const schema = await import("@shared/schema-sqlite");
  
  const dbPath = process.env.DATABASE_PATH || "./data/game.db";
  
  // Ensure directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  
  // Initialize SQLite tables
  initializeSQLiteTables(sqlite);
  
  db = drizzle(sqlite);
  
  // Use SQLite schema tables
  gameSessions = schema.gameSessions;
  encounters = schema.encounters;
  eventLogs = schema.eventLogs;
  alienRaces = schema.alienRaces;
  generatedVideos = schema.generatedVideos;
  encounterTemplates = schema.encounterTemplates;
  items = schema.items;
  playerInventory = schema.playerInventory;
  skills = schema.skills;
  playerSkills = schema.playerSkills;
  alienRelationships = schema.alienRelationships;
  
  console.log(`📊 Connected to SQLite database at ${dbPath}`);
}

function initializeSQLiteTables(sqlite: any) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      health INTEGER NOT NULL DEFAULT 100,
      max_health INTEGER NOT NULL DEFAULT 100,
      energy INTEGER NOT NULL DEFAULT 100,
      max_energy INTEGER NOT NULL DEFAULT 100,
      credits INTEGER NOT NULL DEFAULT 250,
      level INTEGER NOT NULL DEFAULT 1,
      integrity INTEGER NOT NULL DEFAULT 100,
      clarity INTEGER NOT NULL DEFAULT 50,
      cache_corruption INTEGER NOT NULL DEFAULT 0,
      ammunition INTEGER NOT NULL DEFAULT 100,
      max_ammunition INTEGER NOT NULL DEFAULT 100,
      armour INTEGER NOT NULL DEFAULT 50,
      charge_bonus INTEGER NOT NULL DEFAULT 10,
      leadership INTEGER NOT NULL DEFAULT 75,
      melee_attack INTEGER NOT NULL DEFAULT 30,
      melee_defence INTEGER NOT NULL DEFAULT 25,
      missile_strength INTEGER NOT NULL DEFAULT 20,
      range INTEGER NOT NULL DEFAULT 150,
      speed INTEGER NOT NULL DEFAULT 40,
      weapon_strength INTEGER NOT NULL DEFAULT 35,
      accuracy INTEGER NOT NULL DEFAULT 70,
      replenishment_rate INTEGER NOT NULL DEFAULT 5,
      reload_time INTEGER NOT NULL DEFAULT 8,
      experience INTEGER NOT NULL DEFAULT 0,
      experience_to_level INTEGER NOT NULL DEFAULT 100,
      skill_points INTEGER NOT NULL DEFAULT 3,
      inventory TEXT NOT NULL DEFAULT '[]',
      flags TEXT NOT NULL DEFAULT '[]',
      reputation TEXT NOT NULL DEFAULT '{}',
      game_state TEXT NOT NULL DEFAULT 'idle',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS encounters (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      game_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_logs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      game_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alien_races (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      traits TEXT,
      video_prompt TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS generated_videos (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      alien_name TEXT NOT NULL,
      prompt TEXT NOT NULL,
      local_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS encounter_templates (
      id TEXT PRIMARY KEY,
      alien_id TEXT NOT NULL,
      biome TEXT NOT NULL,
      tier INTEGER NOT NULL DEFAULT 1,
      attack_vector TEXT NOT NULL,
      setup_text TEXT NOT NULL,
      player_objective TEXT NOT NULL,
      choices TEXT NOT NULL DEFAULT '[]',
      rewards TEXT,
      penalties TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      slot TEXT NOT NULL,
      rarity TEXT NOT NULL DEFAULT 'common',
      icon TEXT NOT NULL DEFAULT 'package',
      stat_modifiers TEXT NOT NULL DEFAULT '{}',
      special_effects TEXT NOT NULL DEFAULT '[]',
      required_level INTEGER NOT NULL DEFAULT 1,
      value INTEGER NOT NULL DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS player_inventory (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      game_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES items(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      equipped INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      tier INTEGER NOT NULL DEFAULT 1,
      icon TEXT NOT NULL DEFAULT 'star',
      stat_modifiers TEXT NOT NULL DEFAULT '{}',
      prerequisites TEXT NOT NULL DEFAULT '[]',
      cost INTEGER NOT NULL DEFAULT 1,
      max_rank INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS player_skills (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      game_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL REFERENCES skills(id),
      rank INTEGER NOT NULL DEFAULT 1,
      unlocked_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alien_relationships (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
      game_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      faction TEXT NOT NULL,
      standing INTEGER NOT NULL DEFAULT 0,
      title TEXT NOT NULL DEFAULT 'Unknown',
      encounter_count INTEGER NOT NULL DEFAULT 0,
      last_encounter TEXT
    );
  `);
}

export { db };

export interface IStorage {
  // Game Sessions
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(id: string): Promise<GameSession | undefined>;
  updateGameSession(id: string, updates: Partial<InsertGameSession>): Promise<GameSession | undefined>;
  getActiveGameSession(): Promise<GameSession | undefined>;
  endGameSession(id: string): Promise<void>;

  // Encounters
  createEncounter(encounter: InsertEncounter): Promise<Encounter>;
  getActiveEncounter(gameId: string): Promise<Encounter | undefined>;
  resolveEncounter(id: string): Promise<void>;

  // Event Logs
  createEventLog(log: InsertEventLog): Promise<EventLog>;
  getEventLogs(gameId: string): Promise<EventLog[]>;

  // Alien Races Wiki
  createAlienRace(race: InsertAlienRace): Promise<AlienRace>;
  getAllAlienRaces(): Promise<AlienRace[]>;
  getAlienRacesByCategory(category: string): Promise<AlienRace[]>;
  getRandomAlienRace(): Promise<AlienRace | undefined>;
  getAlienRaceCount(): Promise<number>;

  // Generated Videos
  createGeneratedVideo(video: InsertGeneratedVideo): Promise<GeneratedVideo>;
  getAllGeneratedVideos(): Promise<GeneratedVideo[]>;
  getVideoByAlienName(alienName: string): Promise<GeneratedVideo | undefined>;

  // Encounter Templates
  createEncounterTemplate(template: InsertEncounterTemplate): Promise<EncounterTemplate>;
  getAllEncounterTemplates(): Promise<EncounterTemplate[]>;
  getEncounterTemplateById(id: string): Promise<EncounterTemplate | undefined>;
  getRandomEncounterTemplate(tier?: number): Promise<EncounterTemplate | undefined>;
  getEncounterTemplateCount(): Promise<number>;

  // Update game session stats
  updateGameStats(gameId: string, updates: Partial<GameSession>): Promise<GameSession>;

  // Items
  createItem(item: InsertItem): Promise<Item>;
  getAllItems(): Promise<Item[]>;
  getItemById(id: string): Promise<Item | undefined>;
  getItemsBySlot(slot: string): Promise<Item[]>;
  seedItems(items: InsertItem[]): Promise<void>;

  // Player Inventory
  addToInventory(gameId: string, itemId: string, quantity?: number): Promise<PlayerInventory>;
  removeFromInventory(gameId: string, itemId: string, quantity?: number): Promise<void>;
  getInventory(gameId: string): Promise<(PlayerInventory & { item: Item })[]>;
  equipItem(gameId: string, itemId: string): Promise<void>;
  unequipItem(gameId: string, itemId: string): Promise<void>;
  getEquippedItems(gameId: string): Promise<(PlayerInventory & { item: Item })[]>;

  // Skills
  createSkill(skill: InsertSkill): Promise<Skill>;
  getAllSkills(): Promise<Skill[]>;
  getSkillById(id: string): Promise<Skill | undefined>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  seedSkills(skills: InsertSkill[]): Promise<void>;

  // Player Skills
  unlockSkill(gameId: string, skillId: string): Promise<PlayerSkill>;
  upgradeSkill(gameId: string, skillId: string): Promise<PlayerSkill | undefined>;
  getPlayerSkills(gameId: string): Promise<(PlayerSkill & { skill: Skill })[]>;
  hasSkill(gameId: string, skillId: string): Promise<boolean>;

  // Alien Relationships
  getRelationship(gameId: string, faction: string): Promise<AlienRelationship | undefined>;
  getAllRelationships(gameId: string): Promise<AlienRelationship[]>;
  updateRelationship(gameId: string, faction: string, standingChange: number): Promise<AlienRelationship>;
  initializeRelationships(gameId: string): Promise<void>;
}

export class DbStorage implements IStorage {
  // Game Sessions
  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [newSession] = await db.insert(gameSessions).values(session).returning();
    return newSession;
  }

  async getGameSession(id: string): Promise<GameSession | undefined> {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
    return session;
  }

  async updateGameSession(id: string, updates: Partial<InsertGameSession>): Promise<GameSession | undefined> {
    const [updated] = await db
      .update(gameSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gameSessions.id, id))
      .returning();
    return updated;
  }

  async getActiveGameSession(): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.isActive, true))
      .orderBy(desc(gameSessions.createdAt))
      .limit(1);
    return session;
  }

  async endGameSession(id: string): Promise<void> {
    await db.update(gameSessions).set({ isActive: false }).where(eq(gameSessions.id, id));
  }

  // Encounters
  async createEncounter(encounter: InsertEncounter): Promise<Encounter> {
    const [newEncounter] = await db.insert(encounters).values(encounter).returning();
    return newEncounter;
  }

  async getActiveEncounter(gameId: string): Promise<Encounter | undefined> {
    const [encounter] = await db
      .select()
      .from(encounters)
      .where(and(eq(encounters.gameId, gameId), eq(encounters.resolved, false)))
      .orderBy(desc(encounters.createdAt))
      .limit(1);
    return encounter;
  }

  async resolveEncounter(id: string): Promise<void> {
    await db.update(encounters).set({ resolved: true }).where(eq(encounters.id, id));
  }

  // Event Logs
  async createEventLog(log: InsertEventLog): Promise<EventLog> {
    const [newLog] = await db.insert(eventLogs).values(log).returning();
    return newLog;
  }

  async getEventLogs(gameId: string): Promise<EventLog[]> {
    return await db.select().from(eventLogs).where(eq(eventLogs.gameId, gameId)).orderBy(eventLogs.createdAt);
  }

  // Alien Races Wiki
  async createAlienRace(race: InsertAlienRace): Promise<AlienRace> {
    const [newRace] = await db.insert(alienRaces).values(race).returning();
    return newRace;
  }

  async getAllAlienRaces(): Promise<AlienRace[]> {
    return await db.select().from(alienRaces).orderBy(alienRaces.category, alienRaces.name);
  }

  async getAlienRacesByCategory(category: string): Promise<AlienRace[]> {
    return await db.select().from(alienRaces).where(eq(alienRaces.category, category)).orderBy(alienRaces.name);
  }

  async getRandomAlienRace(): Promise<AlienRace | undefined> {
    const allRaces = await db.select().from(alienRaces);
    if (allRaces.length === 0) return undefined;
    return allRaces[Math.floor(Math.random() * allRaces.length)];
  }

  async getAlienRaceCount(): Promise<number> {
    const allRaces = await db.select().from(alienRaces);
    return allRaces.length;
  }

  // Generated Videos
  async createGeneratedVideo(video: InsertGeneratedVideo): Promise<GeneratedVideo> {
    const [newVideo] = await db.insert(generatedVideos).values(video).returning();
    return newVideo;
  }

  async getAllGeneratedVideos(): Promise<GeneratedVideo[]> {
    return await db.select().from(generatedVideos).orderBy(desc(generatedVideos.createdAt));
  }

  async getVideoByAlienName(alienName: string): Promise<GeneratedVideo | undefined> {
    const [video] = await db.select().from(generatedVideos).where(eq(generatedVideos.alienName, alienName));
    return video;
  }

  // Encounter Templates
  async createEncounterTemplate(template: InsertEncounterTemplate): Promise<EncounterTemplate> {
    const [newTemplate] = await db.insert(encounterTemplates).values(template).returning();
    return newTemplate;
  }

  async getAllEncounterTemplates(): Promise<EncounterTemplate[]> {
    return await db.select().from(encounterTemplates).orderBy(encounterTemplates.tier);
  }

  async getEncounterTemplateById(id: string): Promise<EncounterTemplate | undefined> {
    const [template] = await db.select().from(encounterTemplates).where(eq(encounterTemplates.id, id));
    return template;
  }

  async getRandomEncounterTemplate(tier?: number): Promise<EncounterTemplate | undefined> {
    let templates: EncounterTemplate[];
    if (tier) {
      templates = await db.select().from(encounterTemplates).where(eq(encounterTemplates.tier, tier));
    } else {
      templates = await db.select().from(encounterTemplates);
    }
    if (templates.length === 0) return undefined;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async getEncounterTemplateCount(): Promise<number> {
    const allTemplates = await db.select().from(encounterTemplates);
    return allTemplates.length;
  }

  // Update game session stats
  async updateGameStats(gameId: string, updates: Partial<GameSession>): Promise<GameSession> {
    const [updated] = await db.update(gameSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gameSessions.id, gameId))
      .returning();
    return updated;
  }

  // Items
  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async getItemById(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async getItemsBySlot(slot: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.slot, slot));
  }

  async seedItems(itemsData: InsertItem[]): Promise<void> {
    for (const item of itemsData) {
      const existing = await this.getItemById(item.id);
      if (!existing) {
        await this.createItem(item);
      }
    }
  }

  // Player Inventory
  async addToInventory(gameId: string, itemId: string, quantity: number = 1): Promise<PlayerInventory> {
    const existing = await db.select().from(playerInventory)
      .where(and(eq(playerInventory.gameId, gameId), eq(playerInventory.itemId, itemId)));
    
    if (existing.length > 0) {
      const [updated] = await db.update(playerInventory)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(playerInventory.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newEntry] = await db.insert(playerInventory)
      .values({ gameId, itemId, quantity, equipped: false })
      .returning();
    return newEntry;
  }

  async removeFromInventory(gameId: string, itemId: string, quantity: number = 1): Promise<void> {
    const existing = await db.select().from(playerInventory)
      .where(and(eq(playerInventory.gameId, gameId), eq(playerInventory.itemId, itemId)));
    
    if (existing.length > 0) {
      if (existing[0].quantity <= quantity) {
        await db.delete(playerInventory).where(eq(playerInventory.id, existing[0].id));
      } else {
        await db.update(playerInventory)
          .set({ quantity: existing[0].quantity - quantity })
          .where(eq(playerInventory.id, existing[0].id));
      }
    }
  }

  async getInventory(gameId: string): Promise<(PlayerInventory & { item: Item })[]> {
    const inventory = await db.select().from(playerInventory)
      .where(eq(playerInventory.gameId, gameId));
    
    const result: (PlayerInventory & { item: Item })[] = [];
    for (const inv of inventory) {
      const item = await this.getItemById(inv.itemId);
      if (item) {
        result.push({ ...inv, item });
      }
    }
    return result;
  }

  async equipItem(gameId: string, itemId: string): Promise<void> {
    const inventory = await db.select().from(playerInventory)
      .where(and(eq(playerInventory.gameId, gameId), eq(playerInventory.itemId, itemId)));
    
    if (inventory.length > 0) {
      const item = await this.getItemById(itemId);
      if (item && item.slot !== 'consumable' && item.slot !== 'module') {
        await db.update(playerInventory)
          .set({ equipped: false })
          .where(and(
            eq(playerInventory.gameId, gameId),
            eq(playerInventory.equipped, true)
          ));
        
        const equippedOfSlot = await this.getEquippedItems(gameId);
        for (const equipped of equippedOfSlot) {
          if (equipped.item.slot === item.slot) {
            await db.update(playerInventory)
              .set({ equipped: false })
              .where(eq(playerInventory.id, equipped.id));
          }
        }
      }
      
      await db.update(playerInventory)
        .set({ equipped: true })
        .where(eq(playerInventory.id, inventory[0].id));
    }
  }

  async unequipItem(gameId: string, itemId: string): Promise<void> {
    await db.update(playerInventory)
      .set({ equipped: false })
      .where(and(eq(playerInventory.gameId, gameId), eq(playerInventory.itemId, itemId)));
  }

  async getEquippedItems(gameId: string): Promise<(PlayerInventory & { item: Item })[]> {
    const equipped = await db.select().from(playerInventory)
      .where(and(eq(playerInventory.gameId, gameId), eq(playerInventory.equipped, true)));
    
    const result: (PlayerInventory & { item: Item })[] = [];
    for (const inv of equipped) {
      const item = await this.getItemById(inv.itemId);
      if (item) {
        result.push({ ...inv, item });
      }
    }
    return result;
  }

  // Skills
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getSkillById(id: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.category, category));
  }

  async seedSkills(skillsData: InsertSkill[]): Promise<void> {
    for (const skill of skillsData) {
      const existing = await this.getSkillById(skill.id);
      if (!existing) {
        await this.createSkill(skill);
      }
    }
  }

  // Player Skills
  async unlockSkill(gameId: string, skillId: string): Promise<PlayerSkill> {
    const [newSkill] = await db.insert(playerSkills)
      .values({ gameId, skillId, rank: 1 })
      .returning();
    return newSkill;
  }

  async upgradeSkill(gameId: string, skillId: string): Promise<PlayerSkill | undefined> {
    const existing = await db.select().from(playerSkills)
      .where(and(eq(playerSkills.gameId, gameId), eq(playerSkills.skillId, skillId)));
    
    if (existing.length > 0) {
      const skill = await this.getSkillById(skillId);
      if (skill && existing[0].rank < skill.maxRank) {
        const [updated] = await db.update(playerSkills)
          .set({ rank: existing[0].rank + 1 })
          .where(eq(playerSkills.id, existing[0].id))
          .returning();
        return updated;
      }
    }
    return undefined;
  }

  async getPlayerSkills(gameId: string): Promise<(PlayerSkill & { skill: Skill })[]> {
    const playerSkillsList = await db.select().from(playerSkills)
      .where(eq(playerSkills.gameId, gameId));
    
    const result: (PlayerSkill & { skill: Skill })[] = [];
    for (const ps of playerSkillsList) {
      const skill = await this.getSkillById(ps.skillId);
      if (skill) {
        result.push({ ...ps, skill });
      }
    }
    return result;
  }

  async hasSkill(gameId: string, skillId: string): Promise<boolean> {
    const existing = await db.select().from(playerSkills)
      .where(and(eq(playerSkills.gameId, gameId), eq(playerSkills.skillId, skillId)));
    return existing.length > 0;
  }

  // Alien Relationships
  async getRelationship(gameId: string, faction: string): Promise<AlienRelationship | undefined> {
    const [relationship] = await db.select().from(alienRelationships)
      .where(and(eq(alienRelationships.gameId, gameId), eq(alienRelationships.faction, faction)));
    return relationship;
  }

  async getAllRelationships(gameId: string): Promise<AlienRelationship[]> {
    return await db.select().from(alienRelationships)
      .where(eq(alienRelationships.gameId, gameId));
  }

  async updateRelationship(gameId: string, faction: string, standingChange: number): Promise<AlienRelationship> {
    let relationship = await this.getRelationship(gameId, faction);
    
    if (!relationship) {
      const [newRel] = await db.insert(alienRelationships)
        .values({ gameId, faction, standing: 0, title: "Unknown", encounterCount: 0 })
        .returning();
      relationship = newRel;
    }

    const newStanding = Math.max(-100, Math.min(100, relationship!.standing + standingChange));
    const title = this.getRelationshipTitle(newStanding);
    
    const [updated] = await db.update(alienRelationships)
      .set({ 
        standing: newStanding, 
        title,
        encounterCount: relationship!.encounterCount + 1,
        lastEncounter: new Date()
      })
      .where(eq(alienRelationships.id, relationship!.id))
      .returning();
    
    return updated;
  }

  private getRelationshipTitle(standing: number): string {
    if (standing <= -75) return "Hostile";
    if (standing <= -50) return "Unfriendly";
    if (standing <= -25) return "Suspicious";
    if (standing < 25) return "Neutral";
    if (standing < 50) return "Friendly";
    if (standing < 75) return "Allied";
    return "Exalted";
  }

  async initializeRelationships(gameId: string): Promise<void> {
    const factions = ["council", "hive", "syndicate", "collective", "empire", 
                      "federation", "alliance", "nomads", "ancients", "void"];
    
    for (const faction of factions) {
      const existing = await this.getRelationship(gameId, faction);
      if (!existing) {
        await db.insert(alienRelationships)
          .values({ gameId, faction, standing: 0, title: "Neutral", encounterCount: 0 })
          .returning();
      }
    }
  }
}

export const storage = new DbStorage();
