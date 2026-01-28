import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { alienRaceSeedData } from "./seed-aliens";
import { generateAlienEncounter } from "./encounter-generator";

const actionSchema = z.object({
  action: z.enum(["explore", "move", "attack", "flee", "loot", "ignore"]),
});

function getTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

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

      const timestamp = getTimestamp();
      
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
      console.error("Start game error:", error);
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
      console.error("Get active game error:", error);
      res.status(500).json({ error: "Failed to get game session" });
    }
  });

  // Perform an action
  app.post("/api/game/:gameId/action", async (req, res) => {
    try {
      const { gameId } = req.params;
      
      // Validate action payload
      const parseResult = actionSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid action", details: parseResult.error.errors });
      }
      const { action } = parseResult.data;

      const session = await storage.getGameSession(gameId);
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }

      // Check if game is still active
      if (!session.isActive) {
        return res.status(400).json({ error: "Game session has ended" });
      }

      // Check if player is dead
      if (session.health <= 0) {
        await storage.endGameSession(gameId);
        return res.status(400).json({ error: "Operator terminated. Game over." });
      }

      const timestamp = getTimestamp();
      const currentEncounter = await storage.getActiveEncounter(gameId);

      let updates: any = {};
      let newEncounter = null;
      let logText = "";
      let logType: "info" | "combat" | "loot" | "alert" = "info";

      switch (action) {
        case "explore": {
          // Prevent exploring during active encounter
          if (currentEncounter) {
            return res.status(400).json({ error: "Cannot explore while encounter is active. Resolve current encounter first." });
          }

          // Check energy
          if (session.energy < 5) {
            return res.status(400).json({ error: "Not enough energy to explore." });
          }

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
          // Resolve any active encounter when moving
          if (currentEncounter) {
            await storage.resolveEncounter(currentEncounter.id);
          }
          
          const newEnergy = Math.max(0, session.energy - 5);
          updates.gameState = "idle";
          updates.energy = newEnergy;
          logText = "Moving to next sector. Energy consumed: 5";
          logType = "info";
          break;
        }

        case "attack": {
          if (!currentEncounter || currentEncounter.type !== "enemy") {
            return res.status(400).json({ error: "No hostile to engage" });
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

          const newHealth = Math.max(0, session.health - enemyDmg);
          updates.health = newHealth;

          // Check for death
          if (newHealth <= 0) {
            await storage.resolveEncounter(currentEncounter.id);
            updates.gameState = "idle";
            updates.isActive = false;
            logText = "CRITICAL FAILURE. Hull integrity compromised. Operator terminated.";
            logType = "alert";
          } else if (Math.random() > 0.5) {
            await storage.resolveEncounter(currentEncounter.id);
            updates.gameState = "idle";
            updates.credits = Math.min(99999, session.credits + 50);
            logText = "Target eliminated. +50 Credits harvested.";
            logType = "loot";
          } else {
            logText = "Combat continues...";
            logType = "combat";
          }
          break;
        }

        case "flee": {
          if (!currentEncounter) {
            return res.status(400).json({ error: "Nothing to flee from" });
          }
          
          const fleeEnergyCost = 20;
          if (session.energy < fleeEnergyCost) {
            return res.status(400).json({ error: "Not enough energy to emergency warp" });
          }

          await storage.resolveEncounter(currentEncounter.id);
          updates.gameState = "idle";
          updates.energy = Math.max(0, session.energy - fleeEnergyCost);
          logText = "Emergency warp initiated. Escaped successfully.";
          logType = "info";
          break;
        }

        case "loot": {
          if (!currentEncounter || currentEncounter.type !== "loot") {
            return res.status(400).json({ error: "No data cache to harvest" });
          }

          await storage.resolveEncounter(currentEncounter.id);
          updates.gameState = "idle";
          updates.credits = Math.min(99999, session.credits + 100);
          logText = "Decryption successful. +100 Credits added to account.";
          logType = "loot";
          break;
        }

        case "ignore": {
          if (!currentEncounter) {
            return res.status(400).json({ error: "Nothing to ignore" });
          }

          await storage.resolveEncounter(currentEncounter.id);
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
      console.error("End game error:", error);
      res.status(500).json({ error: "Failed to end game" });
    }
  });

  // ===== ALIEN RACES WIKI API =====

  // Get all alien races
  app.get("/api/wiki/aliens", async (req, res) => {
    try {
      const races = await storage.getAllAlienRaces();
      res.json(races);
    } catch (error) {
      console.error("Get aliens error:", error);
      res.status(500).json({ error: "Failed to get alien races" });
    }
  });

  // Get alien races by category
  app.get("/api/wiki/aliens/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const races = await storage.getAlienRacesByCategory(category);
      res.json(races);
    } catch (error) {
      console.error("Get aliens by category error:", error);
      res.status(500).json({ error: "Failed to get alien races by category" });
    }
  });

  // Get a random alien race (for video generation)
  app.get("/api/wiki/aliens/random", async (req, res) => {
    try {
      const race = await storage.getRandomAlienRace();
      if (!race) {
        return res.status(404).json({ error: "No alien races found. Please seed the database." });
      }
      res.json(race);
    } catch (error) {
      console.error("Get random alien error:", error);
      res.status(500).json({ error: "Failed to get random alien race" });
    }
  });

  // Seed alien races database
  app.post("/api/wiki/aliens/seed", async (req, res) => {
    try {
      const count = await storage.getAlienRaceCount();
      if (count > 0) {
        return res.json({ message: "Database already seeded", count });
      }

      let seeded = 0;
      for (const race of alienRaceSeedData) {
        await storage.createAlienRace(race);
        seeded++;
      }

      res.json({ message: "Database seeded successfully", count: seeded });
    } catch (error) {
      console.error("Seed aliens error:", error);
      res.status(500).json({ error: "Failed to seed alien races" });
    }
  });

  // Get wiki stats
  app.get("/api/wiki/stats", async (req, res) => {
    try {
      const count = await storage.getAlienRaceCount();
      const races = await storage.getAllAlienRaces();
      const categories = Array.from(new Set(races.map(r => r.category)));
      res.json({ 
        totalRaces: count, 
        categories: categories.length,
        categoryList: categories 
      });
    } catch (error) {
      console.error("Get wiki stats error:", error);
      res.status(500).json({ error: "Failed to get wiki stats" });
    }
  });

  // ===== AI ENCOUNTER GENERATION =====

  // Generate a random alien encounter using AI
  app.get("/api/encounter/generate", async (req, res) => {
    try {
      const encounter = await generateAlienEncounter();
      res.json(encounter);
    } catch (error) {
      console.error("Generate encounter error:", error);
      res.status(500).json({ error: "Failed to generate encounter" });
    }
  });

  return httpServer;
}
