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
  // Legacy stats (kept for compatibility)
  health: integer("health").notNull().default(100),
  maxHealth: integer("max_health").notNull().default(100),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  credits: integer("credits").notNull().default(250),
  level: integer("level").notNull().default(1),
  integrity: integer("integrity").notNull().default(100),
  clarity: integer("clarity").notNull().default(50),
  cacheCorruption: integer("cache_corruption").notNull().default(0),
  
  // Visible Combat Stats
  ammunition: integer("ammunition").notNull().default(100),
  maxAmmunition: integer("max_ammunition").notNull().default(100),
  armour: integer("armour").notNull().default(50),
  chargeBonus: integer("charge_bonus").notNull().default(10),
  leadership: integer("leadership").notNull().default(75),
  meleeAttack: integer("melee_attack").notNull().default(30),
  meleeDefence: integer("melee_defence").notNull().default(25),
  missileStrength: integer("missile_strength").notNull().default(20),
  range: integer("range").notNull().default(150),
  speed: integer("speed").notNull().default(40),
  weaponStrength: integer("weapon_strength").notNull().default(35),
  
  // Hidden Stats
  accuracy: integer("accuracy").notNull().default(70),
  replenishmentRate: integer("replenishment_rate").notNull().default(5),
  reloadTime: integer("reload_time").notNull().default(8),
  
  // RPG Progression
  experience: integer("experience").notNull().default(0),
  experienceToLevel: integer("experience_to_level").notNull().default(100),
  skillPoints: integer("skill_points").notNull().default(3),
  
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

// Item Rarity Types
export const ITEM_RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
export type ItemRarity = typeof ITEM_RARITIES[number];

// Item Slot Types
export const ITEM_SLOTS = ["weapon", "armor", "helmet", "accessory", "consumable", "module"] as const;
export type ItemSlot = typeof ITEM_SLOTS[number];

// Items Table - Defines all available items
export const items = pgTable("items", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  slot: text("slot").notNull(), // weapon, armor, helmet, accessory, consumable, module
  rarity: text("rarity").notNull().default("common"),
  icon: text("icon").notNull().default("package"),
  statModifiers: jsonb("stat_modifiers").notNull().default({}), // { health: 10, meleeAttack: 5, etc. }
  specialEffects: jsonb("special_effects").notNull().default([]), // ["fire_damage", "lifesteal"]
  requiredLevel: integer("required_level").notNull().default(1),
  value: integer("value").notNull().default(100), // sell price in credits
});

export const insertItemSchema = createInsertSchema(items);
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

// Player Inventory - Junction table for player items
export const playerInventory = pgTable("player_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
  equipped: boolean("equipped").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlayerInventorySchema = createInsertSchema(playerInventory).omit({
  id: true,
  createdAt: true,
});
export type InsertPlayerInventory = z.infer<typeof insertPlayerInventorySchema>;
export type PlayerInventory = typeof playerInventory.$inferSelect;

// Skill Tree Categories
export const SKILL_CATEGORIES = ["combat", "diplomacy", "technology", "survival", "psionic"] as const;
export type SkillCategory = typeof SKILL_CATEGORIES[number];

// Skills Table - Defines skill tree nodes
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // combat, diplomacy, technology, survival, psionic
  tier: integer("tier").notNull().default(1), // 1-5, determines position in tree
  icon: text("icon").notNull().default("star"),
  statModifiers: jsonb("stat_modifiers").notNull().default({}), // permanent stat bonuses
  prerequisites: jsonb("prerequisites").notNull().default([]), // list of skill IDs required
  cost: integer("cost").notNull().default(1), // skill points required
  maxRank: integer("max_rank").notNull().default(1), // how many times it can be upgraded
});

export const insertSkillSchema = createInsertSchema(skills);
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Player Skills - Junction table for unlocked skills
export const playerSkills = pgTable("player_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  skillId: varchar("skill_id").notNull().references(() => skills.id),
  rank: integer("rank").notNull().default(1),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const insertPlayerSkillSchema = createInsertSchema(playerSkills).omit({
  id: true,
  unlockedAt: true,
});
export type InsertPlayerSkill = z.infer<typeof insertPlayerSkillSchema>;
export type PlayerSkill = typeof playerSkills.$inferSelect;

// Alien Factions for relationships
export const ALIEN_FACTIONS = [
  "council", "hive", "syndicate", "collective", "empire", 
  "federation", "alliance", "nomads", "ancients", "void"
] as const;
export type AlienFaction = typeof ALIEN_FACTIONS[number];

// Alien Relationships - Tracks standing with each faction
export const alienRelationships = pgTable("alien_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => gameSessions.id, { onDelete: "cascade" }),
  faction: text("faction").notNull(),
  standing: integer("standing").notNull().default(0), // -100 to +100
  title: text("title").notNull().default("Unknown"), // Hostile, Neutral, Friendly, Allied, etc.
  encounterCount: integer("encounter_count").notNull().default(0),
  lastEncounter: timestamp("last_encounter"),
});

export const insertAlienRelationshipSchema = createInsertSchema(alienRelationships).omit({
  id: true,
});
export type InsertAlienRelationship = z.infer<typeof insertAlienRelationshipSchema>;
export type AlienRelationship = typeof alienRelationships.$inferSelect;

// Experience and Skill Points tracking in game session
export const gameSessionRpgSchema = z.object({
  experience: z.number().default(0),
  experienceToLevel: z.number().default(100),
  skillPoints: z.number().default(0),
  totalSkillPointsEarned: z.number().default(0),
});
