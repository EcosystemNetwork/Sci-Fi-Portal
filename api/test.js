// Minimal test handler to verify Vercel function is working
export default function handler(req, res) {
    res.status(200).json({
        message: 'API is working',
        path: req.url,
        method: req.method,
        env: {
            hasDbUrl: !!process.env.DATABASE_URL,
            nodeEnv: process.env.NODE_ENV,
            vercel: process.env.VERCEL
        }
    });
}
