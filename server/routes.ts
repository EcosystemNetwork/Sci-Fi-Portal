import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { alienRaceSeedData } from "./seed-aliens";
import { generateAlienEncounter } from "./encounter-generator";
import { generatePortalVideo, isVideoGenerationEnabled } from "./video-generator";
import { ENCOUNTER_TEMPLATES, ALIEN_ID_TO_NAME, BIOME_DESCRIPTIONS } from "./encounter-data";
import type { EncounterChoice, EncounterOutcome } from "@shared/schema";

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

  // Generate a portal video using Veo 3
  app.post("/api/video/generate", async (req, res) => {
    try {
      const { prompt, alienName } = req.body;
      
      if (!prompt || !alienName) {
        return res.status(400).json({ error: "Prompt and alienName are required" });
      }

      if (!isVideoGenerationEnabled()) {
        return res.status(503).json({ 
          error: "Video generation not configured",
          fallback: true 
        });
      }

      const result = await generatePortalVideo(prompt, alienName);
      
      if (result.error) {
        return res.status(500).json({ error: result.error, fallback: true });
      }

      res.json({ videoUrl: result.videoUrl, localPath: result.localPath });
    } catch (error) {
      console.error("Video generation error:", error);
      res.status(500).json({ error: "Failed to generate video", fallback: true });
    }
  });

  // Check if video generation is available
  app.get("/api/video/status", (req, res) => {
    res.json({ enabled: isVideoGenerationEnabled() });
  });

  // Apply encounter result to game session
  const encounterResultSchema = z.object({
    type: z.enum(["credits", "health", "energy", "damage", "nothing"]),
    amount: z.number(),
    message: z.string(),
  });

  app.post("/api/game/:gameId/portal-result", async (req, res) => {
    try {
      const { gameId } = req.params;
      const parseResult = encounterResultSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid result data" });
      }
      
      const { type, amount, message } = parseResult.data;
      const session = await storage.getGameSession(gameId);
      
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }

      const timestamp = getTimestamp();
      let updates: any = {};

      switch (type) {
        case "credits":
          updates.credits = Math.min(99999, session.credits + amount);
          break;
        case "health":
          updates.health = Math.min(session.maxHealth, session.health + amount);
          break;
        case "energy":
          updates.energy = Math.min(session.maxEnergy, session.energy + amount);
          break;
        case "damage":
          updates.health = Math.max(0, session.health - amount);
          break;
      }

      const updatedSession = await storage.updateGameSession(gameId, updates);
      
      await storage.createEventLog({
        gameId,
        text: message,
        type: type === "damage" ? "alert" : type === "nothing" ? "info" : "loot",
        timestamp,
      });

      const logs = await storage.getEventLogs(gameId);
      const encounter = await storage.getActiveEncounter(gameId);

      res.json({ session: updatedSession, logs, encounter });
    } catch (error) {
      console.error("Portal result error:", error);
      res.status(500).json({ error: "Failed to apply portal result" });
    }
  });

  // ========== NEW ENCOUNTER SYSTEM ==========

  // Seed encounter templates
  app.post("/api/encounters/seed", async (req, res) => {
    try {
      const existingCount = await storage.getEncounterTemplateCount();
      if (existingCount > 0) {
        return res.json({ message: "Encounters already seeded", count: existingCount });
      }

      for (const template of ENCOUNTER_TEMPLATES) {
        await storage.createEncounterTemplate({
          id: template.id,
          alienId: template.alienId,
          biome: template.biome,
          tier: template.tier,
          attackVector: template.attackVector,
          setupText: template.setupText,
          playerObjective: template.playerObjective,
          choices: template.choices as any,
        });
      }

      res.json({ message: "Encounters seeded", count: ENCOUNTER_TEMPLATES.length });
    } catch (error) {
      console.error("Seed encounters error:", error);
      res.status(500).json({ error: "Failed to seed encounters" });
    }
  });

  // Get all encounter templates
  app.get("/api/encounters", async (req, res) => {
    try {
      const templates = await storage.getAllEncounterTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Get encounters error:", error);
      res.status(500).json({ error: "Failed to get encounters" });
    }
  });

  // Get random encounter for portal
  app.get("/api/encounters/random", async (req, res) => {
    try {
      const tier = req.query.tier ? parseInt(req.query.tier as string) : undefined;
      const template = await storage.getRandomEncounterTemplate(tier);
      
      if (!template) {
        return res.status(404).json({ error: "No encounters available" });
      }

      const alienName = ALIEN_ID_TO_NAME[template.alienId] || template.alienId;
      const biomeDescription = BIOME_DESCRIPTIONS[template.biome] || template.biome;

      res.json({
        ...template,
        alienName,
        biomeDescription,
        choices: template.choices as EncounterChoice[],
      });
    } catch (error) {
      console.error("Get random encounter error:", error);
      res.status(500).json({ error: "Failed to get random encounter" });
    }
  });

  // Resolve encounter choice with weighted outcome
  const resolveChoiceSchema = z.object({
    encounterId: z.string(),
    choiceId: z.string(),
  });

  function selectWeightedOutcome(outcomes: EncounterOutcome[]): EncounterOutcome {
    const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const outcome of outcomes) {
      random -= outcome.weight;
      if (random <= 0) return outcome;
    }
    return outcomes[outcomes.length - 1];
  }

  app.post("/api/game/:gameId/resolve-choice", async (req, res) => {
    try {
      const { gameId } = req.params;
      const parseResult = resolveChoiceSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid choice data" });
      }

      const { encounterId, choiceId } = parseResult.data;
      const session = await storage.getGameSession(gameId);
      
      if (!session) {
        return res.status(404).json({ error: "Game session not found" });
      }

      const template = await storage.getEncounterTemplateById(encounterId);
      if (!template) {
        return res.status(404).json({ error: "Encounter not found" });
      }

      const choices = template.choices as EncounterChoice[];
      const choice = choices.find(c => c.id === choiceId);
      if (!choice) {
        return res.status(404).json({ error: "Choice not found" });
      }

      const outcome = selectWeightedOutcome(choice.outcomes);
      const effects = outcome.effects;
      const timestamp = getTimestamp();

      // Apply effects to session
      const updates: any = {};
      const currentInventory = (session.inventory as string[]) || [];
      const currentFlags = (session.flags as string[]) || [];
      const currentReputation = (session.reputation as Record<string, number>) || {};

      if (effects.integrity !== undefined) {
        updates.integrity = Math.max(0, Math.min(100, (session.integrity || 100) + effects.integrity));
      }
      if (effects.clarity !== undefined) {
        updates.clarity = Math.max(0, Math.min(100, (session.clarity || 50) + effects.clarity));
      }
      if (effects.cacheCorruption !== undefined) {
        updates.cacheCorruption = Math.max(0, Math.min(100, (session.cacheCorruption || 0) + effects.cacheCorruption));
      }
      if (effects.health !== undefined) {
        updates.health = Math.max(0, Math.min(session.maxHealth, session.health + effects.health));
      }
      if (effects.energy !== undefined) {
        updates.energy = Math.max(0, Math.min(session.maxEnergy, session.energy + effects.energy));
      }
      if (effects.credits !== undefined) {
        updates.credits = Math.max(0, session.credits + effects.credits);
      }

      // Handle inventory changes
      let newInventory = [...currentInventory];
      if (effects.itemsAdd) {
        newInventory = Array.from(new Set([...newInventory, ...effects.itemsAdd]));
      }
      if (effects.itemsRemove) {
        newInventory = newInventory.filter(i => !effects.itemsRemove!.includes(i));
      }
      if (effects.itemsAdd || effects.itemsRemove) {
        updates.inventory = newInventory;
      }

      // Handle flags
      let newFlags = [...currentFlags];
      if (effects.flagAdd) {
        newFlags = Array.from(new Set([...newFlags, ...effects.flagAdd]));
      }
      if (effects.flagRemove) {
        newFlags = newFlags.filter(f => !effects.flagRemove!.includes(f));
      }
      if (effects.flagAdd || effects.flagRemove) {
        updates.flags = newFlags;
      }

      // Handle reputation
      if (effects.reputation) {
        const newReputation = { ...currentReputation };
        for (const [faction, change] of Object.entries(effects.reputation)) {
          newReputation[faction] = (newReputation[faction] || 0) + change;
        }
        updates.reputation = newReputation;
      }

      const updatedSession = await storage.updateGameStats(gameId, updates);

      // Create event log
      await storage.createEventLog({
        gameId,
        text: outcome.resultText,
        type: effects.integrity && effects.integrity < 0 ? "alert" : 
              effects.itemsAdd ? "loot" : "info",
        timestamp,
      });

      const logs = await storage.getEventLogs(gameId);

      res.json({
        session: updatedSession,
        logs,
        outcome: {
          resultText: outcome.resultText,
          effects,
          choiceIntent: choice.intent,
        },
      });
    } catch (error) {
      console.error("Resolve choice error:", error);
      res.status(500).json({ error: "Failed to resolve choice" });
    }
  });

  return httpServer;
}
