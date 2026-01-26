import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, and } from "drizzle-orm";
import {
  type GameSession,
  type InsertGameSession,
  type Encounter,
  type InsertEncounter,
  type EventLog,
  type InsertEventLog,
  type AlienRace,
  type InsertAlienRace,
  gameSessions,
  encounters,
  eventLogs,
  alienRaces,
} from "@shared/schema";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();
export const db = drizzle(client);

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
}

export const storage = new DbStorage();
