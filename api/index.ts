import { appPromise } from '../server/index';
import type { Request, Response } from 'express';

// Cache the initialized app - Vercel may reuse function instances
let initializedApp: Awaited<typeof appPromise> | null = null;
let initializationError: Error | null = null;

export default async function handler(req: Request, res: Response) {
  // If initialization previously failed, return error immediately
  if (initializationError) {
    res.status(500).json({ error: 'Server initialization failed', message: initializationError.message });
    return;
  }

  try {
    if (!initializedApp) {
      initializedApp = await appPromise;
    }
    // Express app handles requests by being passed to http.createServer
    // For serverless, we invoke it directly as a request handler
    return new Promise<void>((resolve) => {
      res.on('finish', resolve);
      initializedApp!(req, res);
    });
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    res.status(500).json({ error: 'Server initialization failed', message: initializationError.message });
  }
}
