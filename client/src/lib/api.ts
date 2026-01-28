import type { GameSession, Encounter, EventLog, AlienRace } from "@shared/schema";
export type { GameSession, EventLog };

export interface GameState {
  session: GameSession;
  logs: EventLog[];
  encounter: Encounter | null;
}

export async function startGame(): Promise<GameSession> {
  const response = await fetch("/api/game/start", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to start game");
  }
  return response.json();
}

export async function getActiveGame(): Promise<GameState> {
  const response = await fetch("/api/game/active");
  if (!response.ok) {
    throw new Error("Failed to get active game");
  }
  return response.json();
}

export async function performAction(gameId: string, action: string): Promise<GameState> {
  const response = await fetch(`/api/game/${gameId}/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });
  if (!response.ok) {
    throw new Error("Failed to perform action");
  }
  return response.json();
}

export async function endGame(gameId: string): Promise<void> {
  const response = await fetch(`/api/game/${gameId}/end`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to end game");
  }
}

// Wiki API
export interface WikiStats {
  totalRaces: number;
  categories: number;
  categoryList: string[];
}

export async function getAllAlienRaces(): Promise<AlienRace[]> {
  const response = await fetch("/api/wiki/aliens");
  if (!response.ok) {
    throw new Error("Failed to get alien races");
  }
  return response.json();
}

export async function getAlienRacesByCategory(category: string): Promise<AlienRace[]> {
  const response = await fetch(`/api/wiki/aliens/category/${encodeURIComponent(category)}`);
  if (!response.ok) {
    throw new Error("Failed to get alien races by category");
  }
  return response.json();
}

export async function getRandomAlienRace(): Promise<AlienRace> {
  const response = await fetch("/api/wiki/aliens/random");
  if (!response.ok) {
    throw new Error("Failed to get random alien race");
  }
  return response.json();
}

export async function getWikiStats(): Promise<WikiStats> {
  const response = await fetch("/api/wiki/stats");
  if (!response.ok) {
    throw new Error("Failed to get wiki stats");
  }
  return response.json();
}

// AI Encounter Generation
export interface GeneratedEncounter {
  alienName: string;
  alienCategory: string;
  encounterType: "friendly" | "hostile" | "mysterious";
  title: string;
  description: string;
  dialogue: string;
  giftName?: string;
  giftDescription?: string;
  videoPrompt: string;
}

export async function generateEncounter(): Promise<GeneratedEncounter> {
  const response = await fetch("/api/encounter/generate");
  if (!response.ok) {
    throw new Error("Failed to generate encounter");
  }
  return response.json();
}

export interface PortalResult {
  type: "credits" | "health" | "energy" | "damage" | "nothing";
  amount: number;
  message: string;
}

export async function applyPortalResult(gameId: string, result: PortalResult): Promise<GameState> {
  const response = await fetch(`/api/game/${gameId}/portal-result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });
  if (!response.ok) {
    throw new Error("Failed to apply portal result");
  }
  return response.json();
}

// Video Generation
export interface VideoGenerationResult {
  videoUrl?: string;
  localPath?: string;
  error?: string;
  fallback?: boolean;
}

export async function generateVideo(prompt: string, alienName: string): Promise<VideoGenerationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);
  
  try {
    const response = await fetch("/api/video/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, alienName }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    return { fallback: true, error: "Video generation timed out" };
  }
}

export async function checkVideoStatus(): Promise<{ enabled: boolean }> {
  const response = await fetch("/api/video/status");
  return response.json();
}

// New Encounter System
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

export interface EncounterTemplateResponse {
  id: string;
  alienId: string;
  alienName: string;
  biome: string;
  biomeDescription: string;
  tier: number;
  attackVector: string;
  setupText: string;
  playerObjective: string;
  choices: EncounterChoice[];
}

export async function seedEncounters(): Promise<{ message: string; count: number }> {
  const response = await fetch("/api/encounters/seed", { method: "POST" });
  return response.json();
}

export async function getRandomEncounter(tier?: number): Promise<EncounterTemplateResponse> {
  const url = tier ? `/api/encounters/random?tier=${tier}` : "/api/encounters/random";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to get random encounter");
  }
  return response.json();
}

export interface ResolveChoiceResponse {
  session: GameSession;
  logs: EventLog[];
  outcome: {
    resultText: string;
    effects: EncounterOutcome["effects"];
    choiceIntent: string;
  };
}

export async function resolveChoice(
  gameId: string,
  encounterId: string,
  choiceId: string
): Promise<ResolveChoiceResponse> {
  const response = await fetch(`/api/game/${gameId}/resolve-choice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encounterId, choiceId }),
  });
  if (!response.ok) {
    throw new Error("Failed to resolve choice");
  }
  return response.json();
}

// Procedural Encounter Generator API
export interface ProceduralEncounter {
  id: string;
  alienId: string;
  alienName: string;
  speciesType: string;
  tier: number;
  biome: string;
  attackVector: string;
  tags: string[];
  setupText: string;
  choices: {
    id: string;
    label: string;
    intent: string;
    policy: "safe" | "mixed" | "unsafe";
    outcomes: {
      id: string;
      weight: number;
      resultText: string;
      effects: EncounterOutcome["effects"];
    }[];
  }[];
  randomEvents: string[];
  balance: {
    evIntegrityReasonable: number;
    evIntegrityGreedy: number;
    evRewardReasonable: number;
    riskReasonable: number;
  };
}

export async function getProceduralEncounter(tier?: number): Promise<ProceduralEncounter> {
  const url = tier ? `/api/procedural/encounter?tier=${tier}` : "/api/procedural/encounter";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to get procedural encounter");
  }
  return response.json();
}

export async function getProceduralStats(): Promise<{
  totalAliens: number;
  speciesTypes: string[];
  temperaments: string[];
  attackVectors: string[];
  biomes: string[];
  tiers: { min: number; max: number };
  version: string;
}> {
  const response = await fetch("/api/procedural/stats");
  if (!response.ok) {
    throw new Error("Failed to get procedural stats");
  }
  return response.json();
}

export async function resolveProceduralChoice(
  gameId: string,
  encounter: ProceduralEncounter,
  choiceId: string
): Promise<ResolveChoiceResponse> {
  const response = await fetch(`/api/game/${gameId}/resolve-procedural`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encounter, choiceId }),
  });
  if (!response.ok) {
    throw new Error("Failed to resolve procedural choice");
  }
  return response.json();
}

// ===== RPG SYSTEM API =====

export interface Item {
  id: string;
  name: string;
  description: string;
  slot: string;
  rarity: string;
  icon: string;
  statModifiers: Record<string, number>;
  specialEffects: string[];
  requiredLevel: number;
  value: number;
}

export interface InventoryItem {
  id: string;
  gameId: string;
  itemId: string;
  quantity: number;
  equipped: boolean;
  item: Item;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  icon: string;
  statModifiers: Record<string, number>;
  prerequisites: string[];
  cost: number;
  maxRank: number;
}

export interface PlayerSkill {
  id: string;
  gameId: string;
  skillId: string;
  rank: number;
  skill: Skill;
}

export interface AlienRelationship {
  id: string;
  gameId: string;
  faction: string;
  standing: number;
  title: string;
  encounterCount: number;
  lastEncounter: string | null;
}

export interface EffectiveStats {
  baseStats: GameSession;
  bonuses: Record<string, number>;
  effectiveStats: Record<string, number>;
  equippedCount: number;
  unlockedSkillsCount: number;
}

export async function seedRpgData(): Promise<{ items: number; skills: number }> {
  const response = await fetch("/api/rpg/seed", { method: "POST" });
  if (!response.ok) throw new Error("Failed to seed RPG data");
  return response.json();
}

export async function getAllItems(): Promise<Item[]> {
  const response = await fetch("/api/rpg/items");
  if (!response.ok) throw new Error("Failed to get items");
  return response.json();
}

export async function getAllSkills(): Promise<Skill[]> {
  const response = await fetch("/api/rpg/skills");
  if (!response.ok) throw new Error("Failed to get skills");
  return response.json();
}

export async function getInventory(gameId: string): Promise<InventoryItem[]> {
  const response = await fetch(`/api/rpg/inventory/${gameId}`);
  if (!response.ok) throw new Error("Failed to get inventory");
  return response.json();
}

export async function equipItem(gameId: string, itemId: string): Promise<InventoryItem[]> {
  const response = await fetch(`/api/rpg/inventory/${gameId}/equip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  if (!response.ok) throw new Error("Failed to equip item");
  return response.json();
}

export async function unequipItem(gameId: string, itemId: string): Promise<InventoryItem[]> {
  const response = await fetch(`/api/rpg/inventory/${gameId}/unequip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  if (!response.ok) throw new Error("Failed to unequip item");
  return response.json();
}

export async function getPlayerSkills(gameId: string): Promise<PlayerSkill[]> {
  const response = await fetch(`/api/rpg/skills/${gameId}`);
  if (!response.ok) throw new Error("Failed to get player skills");
  return response.json();
}

export async function unlockSkill(gameId: string, skillId: string): Promise<{ skills: PlayerSkill[]; session: GameSession }> {
  const response = await fetch(`/api/rpg/skills/${gameId}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skillId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to unlock skill");
  }
  return response.json();
}

export async function getRelationships(gameId: string): Promise<AlienRelationship[]> {
  const response = await fetch(`/api/rpg/relationships/${gameId}`);
  if (!response.ok) throw new Error("Failed to get relationships");
  return response.json();
}

export async function getEffectiveStats(gameId: string): Promise<EffectiveStats> {
  const response = await fetch(`/api/rpg/stats/${gameId}`);
  if (!response.ok) throw new Error("Failed to get effective stats");
  return response.json();
}

export async function applyStarterKit(gameId: string): Promise<{ inventory: InventoryItem[] }> {
  const response = await fetch(`/api/rpg/starter-kit/${gameId}`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to apply starter kit");
  return response.json();
}
