import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Game Sessions Table
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  health: integer("health").notNull().default(100),
  maxHealth: integer("max_health").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  credits: integer("credits").notNull().default(250),
  level: integer("level").notNull().default(1),
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
