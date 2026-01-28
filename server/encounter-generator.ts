import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

// Support both Replit AI Integrations and standard Gemini API
const isReplit = process.env.AI_INTEGRATIONS_GEMINI_API_KEY !== undefined;
const apiKey = isReplit 
  ? process.env.AI_INTEGRATIONS_GEMINI_API_KEY! 
  : process.env.GEMINI_API_KEY;

// Only create AI client if we have an API key
const ai = apiKey 
  ? new GoogleGenAI({
      apiKey,
      httpOptions: isReplit 
        ? {
            apiVersion: "",
            baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
          }
        : undefined,
    })
  : null;

// Check if AI generation is available
export function isAIEncounterGenerationEnabled(): boolean {
  return ai !== null;
}

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

export async function generateAlienEncounter(): Promise<GeneratedEncounter> {
  const alien = await storage.getRandomAlienRace();
  
  if (!alien) {
    throw new Error("No alien races in database. Please seed the wiki first.");
  }

  // If AI is not available, return a fallback encounter
  if (!ai) {
    console.log("AI not available, using fallback encounter");
    return {
      alienName: alien.name,
      alienCategory: alien.category,
      encounterType: "mysterious",
      title: `${alien.name} Emerges`,
      description: alien.description || `A ${alien.name} steps through the quantum portal.`,
      dialogue: "The being regards you with ancient wisdom...",
      giftName: "Mysterious Artifact",
      giftDescription: "An object of unknown origin pulses with energy.",
      videoPrompt: alien.videoPrompt || `${alien.name} alien emerging from portal with a gift`,
    };
  }

  const prompt = `You are a creative sci-fi storyteller for a game called "Void Walker: Protocol". 
Generate a unique encounter scenario for the following alien race:

Alien: ${alien.name}
Category: ${alien.category}
Description: ${alien.description || "Unknown"}
Traits: ${alien.traits || "Unknown"}

Create an encounter where this alien emerges from a quantum portal bearing a gift for the player. 
Respond in JSON format only (no markdown, no code blocks):
{
  "encounterType": "friendly" or "hostile" or "mysterious",
  "title": "short dramatic title for the encounter",
  "description": "2-3 sentences describing the alien emerging from the portal",
  "dialogue": "what the alien says or communicates to the player (can be cryptic, telepathic, or verbal)",
  "giftName": "name of the gift they bring",
  "giftDescription": "brief description of the gift and its potential use"
}`;

  try {
    const response = await ai!.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const generated = JSON.parse(jsonMatch[0]);

    return {
      alienName: alien.name,
      alienCategory: alien.category,
      encounterType: generated.encounterType || "mysterious",
      title: generated.title || `Encounter with ${alien.name}`,
      description: generated.description || alien.description || "",
      dialogue: generated.dialogue || "...",
      giftName: generated.giftName,
      giftDescription: generated.giftDescription,
      videoPrompt: alien.videoPrompt || `${alien.name} alien emerging from portal with a gift`,
    };
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
    return {
      alienName: alien.name,
      alienCategory: alien.category,
      encounterType: "mysterious",
      title: `${alien.name} Emerges`,
      description: alien.description || `A ${alien.name} steps through the quantum portal.`,
      dialogue: "The being regards you with ancient wisdom...",
      giftName: "Mysterious Artifact",
      giftDescription: "An object of unknown origin pulses with energy.",
      videoPrompt: alien.videoPrompt || `${alien.name} alien emerging from portal with a gift`,
    };
  }
}
