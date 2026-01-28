import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const GEMINI_API_KEY = process.env.GEMINI_VIDEO_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_VIDEO_API_KEY not set - video generation will be disabled");
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const VIDEO_DIR = path.join(process.cwd(), "public", "videos");

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

const generationInProgress = new Map<string, Promise<VideoGenerationResult>>();

export interface VideoGenerationResult {
  videoUrl: string | null;
  localPath: string | null;
  error?: string;
}

async function downloadVideo(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith("https") ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadVideo(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }
      
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

export async function generatePortalVideo(prompt: string, alienName: string, forceNew: boolean = true): Promise<VideoGenerationResult> {
  if (!ai) {
    return { videoUrl: null, localPath: null, error: "Video generation not configured" };
  }

  // Generate unique key for this specific encounter to allow parallel generation
  const encounterKey = `${alienName}-${Date.now()}`;
  
  if (!forceNew) {
    const existingVideo = await storage.getVideoByAlienName(alienName);
    if (existingVideo) {
      console.log("Using cached video for:", alienName);
      return { 
        videoUrl: `/videos/${existingVideo.localPath}`, 
        localPath: existingVideo.localPath 
      };
    }
  }

  if (generationInProgress.has(encounterKey)) {
    console.log("Video generation already in progress for:", encounterKey);
    return generationInProgress.get(encounterKey)!;
  }

  const generationPromise = generateVideoInternal(prompt, alienName);
  generationInProgress.set(encounterKey, generationPromise);
  
  try {
    return await generationPromise;
  } finally {
    generationInProgress.delete(encounterKey);
  }
}

const VISUAL_STYLES = [
  "neon-lit cyberpunk atmosphere with rain reflections",
  "ancient temple ruins with bioluminescent alien flora",
  "crystalline void with fractal energy patterns",
  "industrial spaceship corridor with steam and sparks",
  "frozen wasteland with aurora borealis overhead",
  "volcanic moon surface with lava rivers",
  "underwater bioluminescent cavern with floating debris",
  "cosmic nebula background with star clusters",
  "overgrown bio-mechanical structure with pulsing veins",
  "holographic grid space with data streams"
];

const CAMERA_MOVEMENTS = [
  "slow dramatic zoom revealing the alien",
  "smooth orbital camera circling the portal",
  "push-in through portal energy to alien reveal",
  "low angle shot rising to eye level",
  "tracking shot following energy tendrils",
  "crane shot descending from above"
];

const PORTAL_EFFECTS = [
  "swirling vortex of cyan and purple quantum energy",
  "crackling electrical discharge with plasma arcs",
  "rippling dimensional tear with reality fragments",
  "spiraling void with gravitational distortion",
  "pulsating gateway with chromatic aberration",
  "unstable rift with flickering between dimensions"
];

function generateDynamicPrompt(basePrompt: string, alienName: string): string {
  const style = VISUAL_STYLES[Math.floor(Math.random() * VISUAL_STYLES.length)];
  const camera = CAMERA_MOVEMENTS[Math.floor(Math.random() * CAMERA_MOVEMENTS.length)];
  const portal = PORTAL_EFFECTS[Math.floor(Math.random() * PORTAL_EFFECTS.length)];
  
  return `Cinematic sci-fi 4K video: ${basePrompt}. ${alienName} materializes through a ${portal}. Environment: ${style}. Camera: ${camera}. Dramatic lighting with volumetric fog, particle effects, lens flares. Highly detailed alien creature design, menacing yet mysterious presence. Professional cinematography quality.`;
}

async function generateVideoInternal(prompt: string, alienName: string): Promise<VideoGenerationResult> {
  if (!ai) {
    return { videoUrl: null, localPath: null, error: "Video generation not configured" };
  }
  
  const enhancedPrompt = generateDynamicPrompt(prompt, alienName);

  try {
    console.log("Starting Veo 3 video generation for:", alienName);
    console.log("Prompt:", enhancedPrompt);

    const operation = await ai!.models.generateVideos({
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
      result = await ai!.operations.get({ operation: result });
      attempts++;
      console.log(`Video generation polling attempt ${attempts}...`);
    }

    if (!result.done) {
      return { videoUrl: null, localPath: null, error: "Video generation timed out" };
    }

    const videos = (result as any).response?.generatedVideos;
    if (videos && videos.length > 0) {
      const videoUri = videos[0]?.video?.uri;
      if (videoUri) {
        console.log("Video generated, downloading from:", videoUri);
        
        const sanitizedName = alienName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const timestamp = Date.now();
        const fileName = `${sanitizedName}-${timestamp}.mp4`;
        const localPath = path.join(VIDEO_DIR, fileName);
        
        const authUrl = `${videoUri}&key=${GEMINI_API_KEY}`;
        await downloadVideo(authUrl, localPath);
        
        console.log("Video saved to:", localPath);
        
        await storage.createGeneratedVideo({
          alienName,
          prompt: enhancedPrompt,
          localPath: fileName,
        });
        
        return { 
          videoUrl: `/videos/${fileName}`, 
          localPath: fileName 
        };
      }
    }

    return { videoUrl: null, localPath: null, error: "No video in response" };
  } catch (error) {
    console.error("Video generation error:", error);
    return { 
      videoUrl: null, 
      localPath: null,
      error: error instanceof Error ? error.message : "Video generation failed" 
    };
  }
}

export function isVideoGenerationEnabled(): boolean {
  return !!ai;
}

export async function getAllCachedVideos() {
  return await storage.getAllGeneratedVideos();
}
