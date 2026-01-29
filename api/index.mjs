// Vercel Serverless Function - API catch-all
// This imports the pre-built Express app bundle

// The dist/index.mjs is built during the build step
// We use dynamic import to load the async initialization
const initApp = async () => {
    const module = await import('../dist/index.mjs');
    // The module exports both `default` (the app) and `appPromise`
    if (module.appPromise) {
        return await module.appPromise;
    }
    return module.default;
};

let appInstance = null;
let initError = null;

export default async function handler(req, res) {
    if (initError) {
        return res.status(500).json({
            error: 'Server initialization failed',
            message: initError.message
        });
    }

    try {
        if (!appInstance) {
            appInstance = await initApp();
        }
        return appInstance(req, res);
    } catch (error) {
        initError = error;
        console.error('Server initialization error:', error);
        return res.status(500).json({
            error: 'Server initialization failed',
            message: error.message
        });
    }
}
