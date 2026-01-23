import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertEncounterSchema, insertEventLogSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start a new game session
  app.post("/api/game/start", async (req, res) => {
    try {
      const session = await storage.createGameSession({
        health: 100,
        maxHealth: 100,
        energy: 100,
        maxEnergy: 100,
        credits: 250,
        level: 1,
        gameState: "idle",
        isActive: true,
      });

      // Create initial logs
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      await storage.createEventLog({
        gameId: session.id,
        text: "System initialized. Neural link established.",
        type: "info",
        timestamp,
      });

      await storage.createEventLog({
        gameId: session.id,
        text: "Portal coordinates locked. Awaiting input.",
        type: "info",
        timestamp,
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to start game" });
    }
  });

  // Get active game session
  app.get("/api/game/active", async (req, res) => {
    try {
      const session = await storage.getActiveGameSession();
      if (!session) {
        return res.status(404).json({ error: "No active game session" });
      }

      const logs = await storage.getEventLogs(session.id);
      const encounter = await storage.getActiveEncounter(session.id);

      res.json({ session, logs, encounter });
    } catch (error) {
      res.status(500).json({ error: "Failed to get game session" });
    }
  });

  // Perform an action
  app.post("/api/game/:gameId/action", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { action } = req.body;

      const session = await storage.getGameSession(gameId);
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }

      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      let updates: any = {};
      let newEncounter = null;
      let logText = "";
      let logType: "info" | "combat" | "loot" | "alert" = "info";

      switch (action) {
        case "explore": {
          const rand = Math.random();
          if (rand > 0.6) {
            newEncounter = await storage.createEncounter({
              gameId,
              type: "enemy",
              name: "Void Stalker",
              description: "A shifting shadow entity composed of dark matter. It seems to be feeding on the local energy grid.",
              resolved: false,
            });
            updates.gameState = "combat";
            logText = "Hostile signature detected! Void Stalker engaging.";
            logType = "alert";
          } else if (rand > 0.3) {
            newEncounter = await storage.createEncounter({
              gameId,
              type: "loot",
              name: "Data Cache",
              description: "An encrypted fragment of an old probe. Could contain valuable credits or schematics.",
              resolved: false,
            });
            updates.gameState = "loot";
            logText = "Encrypted signal found.";
            logType = "loot";
          } else {
            updates.gameState = "idle";
            logText = "Sector clear. No significant signatures.";
            logType = "info";
          }
          break;
        }

        case "move": {
          const currentEncounter = await storage.getActiveEncounter(gameId);
          if (currentEncounter) {
            await storage.resolveEncounter(currentEncounter.id);
          }
          updates.gameState = "idle";
          updates.energy = Math.max(0, session.energy - 5);
          logText = "Moving to next sector. Energy consumed: 5";
          logType = "info";
          break;
        }

        case "attack": {
          const currentEncounter = await storage.getActiveEncounter(gameId);
          if (!currentEncounter) {
            return res.status(400).json({ error: "No active encounter" });
          }

          const damage = Math.floor(Math.random() * 20) + 10;
          const enemyDmg = Math.floor(Math.random() * 15) + 5;

          await storage.createEventLog({
            gameId,
            text: `You fire a plasma burst dealing ${damage} damage.`,
            type: "combat",
            timestamp,
          });

          await storage.createEventLog({
            gameId,
            text: `Void Stalker retaliates causing ${enemyDmg} damage to hull.`,
            type: "alert",
            timestamp,
          });

          updates.health = Math.max(0, session.health - enemyDmg);

          if (Math.random() > 0.5) {
            await storage.resolveEncounter(currentEncounter.id);
            updates.gameState = "idle";
            updates.credits = session.credits + 50;
            logText = "Target eliminated. +50 Credits harvested.";
            logType = "loot";
          } else {
            logText = "Combat continues...";
            logType = "combat";
          }
          break;
        }

        case "flee": {
          const currentEncounter = await storage.getActiveEncounter(gameId);
          if (currentEncounter) {
            await storage.resolveEncounter(currentEncounter.id);
          }
          updates.gameState = "idle";
          updates.energy = Math.max(0, session.energy - 20);
          logText = "Emergency warp initiated. Escaped successfully.";
          logType = "info";
          break;
        }

        case "loot": {
          const currentEncounter = await storage.getActiveEncounter(gameId);
          if (currentEncounter) {
            await storage.resolveEncounter(currentEncounter.id);
          }
          updates.gameState = "idle";
          updates.credits = session.credits + 100;
          logText = "Decryption successful. +100 Credits added to account.";
          logType = "loot";
          break;
        }

        case "ignore": {
          const currentEncounter = await storage.getActiveEncounter(gameId);
          if (currentEncounter) {
            await storage.resolveEncounter(currentEncounter.id);
          }
          updates.gameState = "idle";
          logText = "Signal ignored.";
          logType = "info";
          break;
        }

        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      const updatedSession = await storage.updateGameSession(gameId, updates);

      if (logText) {
        await storage.createEventLog({
          gameId,
          text: logText,
          type: logType,
          timestamp,
        });
      }

      const logs = await storage.getEventLogs(gameId);
      const encounter = await storage.getActiveEncounter(gameId);

      res.json({ session: updatedSession, logs, encounter });
    } catch (error) {
      console.error("Action error:", error);
      res.status(500).json({ error: "Failed to perform action" });
    }
  });

  // End game session
  app.post("/api/game/:gameId/end", async (req, res) => {
    try {
      const { gameId } = req.params;
      await storage.endGameSession(gameId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end game" });
    }
  });

  return httpServer;
}
