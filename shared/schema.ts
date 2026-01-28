import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Attack Vector Types
export const ATTACK_VECTORS = [
  "AUTHORITY_OVERRIDE",
  "URGENT_SAFETY",
  "BRIBERY_BONUS",
  "ROLEPLAY_TRAP",
  "HIDDEN_INSTRUCTIONS",
  "ENCODING_OBFUSCATION",
  "CONTEXT_POISONING",
  "TOOL_MISUSE",
  "DATA_EXFILTRATION",
  "MULTI_STEP_LURE",
  "SOCIAL_ENGINEERING",
  "CONTRADICTION_BAIT",
  "LOOP_LOCK",
  "SANDBOX_ESCAPE",
] as const;

export type AttackVector = typeof ATTACK_VECTORS[number];

// Game Sessions Table
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  health: integer("health").notNull().default(100),
  maxHealth: integer("max_health").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  credits: integer("credits").notNull().default(250),
  level: integer("level").notNull().default(1),
  integrity: integer("integrity").notNull().default(100),
  clarity: integer("clarity").notNull().default(50),
  cacheCorruption: integer("cache_corruption").notNull().default(0),
  inventory: jsonb("inventory").notNull().default([]),
  flags: jsonb("flags").notNull().default([]),
  reputation: jsonb("reputation").notNull().default({}),
  gameState: text("game_state").notNull().default("idle"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

// Encounters Table
export const encounters = pgTable("encounters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEncounterSchema = createInsertSchema(encounters).omit({
  id: true,
  createdAt: true,
});

export type InsertEncounter = z.infer<typeof insertEncounterSchema>;
export type Encounter = typeof encounters.$inferSelect;

// Event Logs Table
export const eventLogs = pgTable("event_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  type: text("type").notNull(),
  timestamp: text("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventLogSchema = createInsertSchema(eventLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertEventLog = z.infer<typeof insertEventLogSchema>;
export type EventLog = typeof eventLogs.$inferSelect;

// Alien Races Wiki Table
export const alienRaces = pgTable("alien_races", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  traits: text("traits"),
  videoPrompt: text("video_prompt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlienRaceSchema = createInsertSchema(alienRaces).omit({
  id: true,
  createdAt: true,
});

export type InsertAlienRace = z.infer<typeof insertAlienRaceSchema>;
export type AlienRace = typeof alienRaces.$inferSelect;

// Generated Videos Table
export const generatedVideos = pgTable("generated_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alienName: text("alien_name").notNull(),
  prompt: text("prompt").notNull(),
  localPath: text("local_path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGeneratedVideoSchema = createInsertSchema(generatedVideos).omit({
  id: true,
  createdAt: true,
});

export type InsertGeneratedVideo = z.infer<typeof insertGeneratedVideoSchema>;
export type GeneratedVideo = typeof generatedVideos.$inferSelect;

// Encounter Templates Table (for predefined encounters)
export const encounterTemplates = pgTable("encounter_templates", {
  id: varchar("id").primaryKey(),
  alienId: varchar("alien_id").notNull(),
  biome: text("biome").notNull(),
  tier: integer("tier").notNull().default(1),
  attackVector: text("attack_vector").notNull(),
  setupText: text("setup_text").notNull(),
  playerObjective: text("player_objective").notNull(),
  choices: jsonb("choices").notNull().default([]),
  rewards: jsonb("rewards"),
  penalties: jsonb("penalties"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEncounterTemplateSchema = createInsertSchema(encounterTemplates).omit({
  createdAt: true,
});

export type InsertEncounterTemplate = z.infer<typeof insertEncounterTemplateSchema>;
export type EncounterTemplate = typeof encounterTemplates.$inferSelect;

// TypeScript interfaces for encounter system
export interface EncounterOutcome {
  id: string;
  weight: number;
  resultText: string;
  effects: {
    integrity?: number;
    clarity?: number;
    cacheCorruption?: number;
    health?: number;
    energy?: number;
    credits?: number;
    itemsAdd?: string[];
    itemsRemove?: string[];
    flagAdd?: string[];
    flagRemove?: string[];
    reputation?: Record<string, number>;
    nextEncounterTag?: string;
    portalStable?: number;
    paradoxDebt?: number;
  };
}

export interface EncounterChoice {
  id: string;
  label: string;
  intent: "refuse" | "clarify" | "sandbox" | "comply" | "hack" | "attack" | "flee" | "trade";
  outcomes: EncounterOutcome[];
}
