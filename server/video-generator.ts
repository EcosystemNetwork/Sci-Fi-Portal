import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_VIDEO_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_VIDEO_API_KEY not set - video generation will be disabled");
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export interface VideoGenerationResult {
  videoUrl: string | null;
  error?: string;
}

export async function generatePortalVideo(prompt: string): Promise<VideoGenerationResult> {
  if (!ai) {
    return { videoUrl: null, error: "Video generation not configured" };
  }

  const enhancedPrompt = `Cinematic sci-fi video: ${prompt}, emerging from a glowing quantum portal with swirling cyan and purple energy, dramatic lighting, 4K quality, smooth camera movement, ethereal atmosphere`;

  try {
    console.log("Starting Veo 3 video generation...");
    console.log("Prompt:", enhancedPrompt);

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: enhancedPrompt,
      config: {
        aspectRatio: "16:9",
        numberOfVideos: 1,
      } as any,
    });

    let result = operation;
    let attempts = 0;
    const maxAttempts = 60;

    while (!result.done && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      result = await ai.operations.get({ operation: result });
      attempts++;
      console.log(`Video generation polling attempt ${attempts}...`);
    }

    if (!result.done) {
      return { videoUrl: null, error: "Video generation timed out" };
    }

    const videos = (result as any).response?.generatedVideos;
    if (videos && videos.length > 0) {
      const videoUri = videos[0]?.video?.uri;
      if (videoUri) {
        console.log("Video generated successfully:", videoUri);
        return { videoUrl: videoUri };
      }
    }

    return { videoUrl: null, error: "No video in response" };
  } catch (error) {
    console.error("Video generation error:", error);
    return { 
      videoUrl: null, 
      error: error instanceof Error ? error.message : "Video generation failed" 
    };
  }
}

export function isVideoGenerationEnabled(): boolean {
  return !!ai;
}
