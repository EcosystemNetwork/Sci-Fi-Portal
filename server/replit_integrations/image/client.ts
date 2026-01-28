import { GoogleGenAI, Modality } from "@google/genai";

/**
 * AI Client for Gemini API
 * 
 * Supports both Replit's AI Integrations service and standard Gemini API:
 * - On Replit: Uses AI_INTEGRATIONS_GEMINI_* environment variables
 * - Locally: Uses GEMINI_API_KEY environment variable with standard Gemini API
 */

const isReplit = process.env.AI_INTEGRATIONS_GEMINI_API_KEY !== undefined;
const apiKey = isReplit 
  ? process.env.AI_INTEGRATIONS_GEMINI_API_KEY 
  : process.env.GEMINI_API_KEY;

// Only create AI client if we have an API key
export const ai = apiKey 
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

/**
 * Check if AI generation is available
 */
export function isAIAvailable(): boolean {
  return ai !== null;
}

/**
 * Generate an image and return as base64 data URL.
 * Uses gemini-2.5-flash-image model.
 */
export async function generateImage(prompt: string): Promise<string> {
  if (!ai) {
    throw new Error("AI generation is not available. Set GEMINI_API_KEY or use Replit AI Integrations.");
  }
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(
    (part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image data in response");
  }

  const mimeType = imagePart.inlineData.mimeType || "image/png";
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}

