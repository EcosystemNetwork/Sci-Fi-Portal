import type { GameSession, Encounter, EventLog, AlienRace } from "@shared/schema";

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
