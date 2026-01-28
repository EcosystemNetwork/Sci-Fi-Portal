import { appPromise } from '../server/index';
import type { Request, Response } from 'express';

// Wait for app initialization before handling requests
let initializedApp: Awaited<typeof appPromise> | null = null;

export default async function handler(req: Request, res: Response) {
  if (!initializedApp) {
    initializedApp = await appPromise;
  }
  return initializedApp(req, res);
}
