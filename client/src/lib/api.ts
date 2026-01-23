import type { GameSession, Encounter, EventLog } from "@shared/schema";

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
