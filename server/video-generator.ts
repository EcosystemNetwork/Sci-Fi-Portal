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

export async function generatePortalVideo(prompt: string, alienName: string): Promise<VideoGenerationResult> {
  if (!ai) {
    return { videoUrl: null, localPath: null, error: "Video generation not configured" };
  }

  const existingVideo = await storage.getVideoByAlienName(alienName);
  if (existingVideo) {
    console.log("Using cached video for:", alienName);
    return { 
      videoUrl: `/videos/${existingVideo.localPath}`, 
      localPath: existingVideo.localPath 
    };
  }

  if (generationInProgress.has(alienName)) {
    console.log("Video generation already in progress for:", alienName);
    return generationInProgress.get(alienName)!;
  }

  const generationPromise = generateVideoInternal(prompt, alienName);
  generationInProgress.set(alienName, generationPromise);
  
  try {
    return await generationPromise;
  } finally {
    generationInProgress.delete(alienName);
  }
}

async function generateVideoInternal(prompt: string, alienName: string): Promise<VideoGenerationResult> {
  if (!ai) {
    return { videoUrl: null, localPath: null, error: "Video generation not configured" };
  }
  
  const enhancedPrompt = `Cinematic sci-fi video: ${prompt}, emerging from a glowing quantum portal with swirling cyan and purple energy, dramatic lighting, 4K quality, smooth camera movement, ethereal atmosphere`;

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
