import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { generalLimiter } from './middleware/rateLimit';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Import routes
import analyzeRouter from './routes/analyze';
import reportsRouter from './routes/reports';
import evidenceRouter from './routes/evidence';
import subscriptionsRouter from './routes/subscriptions';
import communityRouter from './routes/community';
import cookieTruthRouter from './routes/cookieTruth';
import checkoutDiffRouter from './routes/checkoutDiff';
import cookiesAiRouter from './routes/cookiesAi';
import adminRouter from './routes/admin';

// Bypass local self-signed corporate / proxy certificates for Google APIs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS setup — allow all origins in development; lock to known domains in production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://frontend-phi-three-4q9jpgst6a.vercel.app',
  'https://frontend-1rbvi29qx-jayanti29s-projects.vercel.app',
  // Accept any *.vercel.app subdomain for preview deployments
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // allow all for now — tighten in production if needed
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-role'],
}));

// Request body parsers (supports base64 images and large text)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply general rate limiting
app.use(generalLimiter);

// Request tracking & logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
    }, 'Incoming Request');
  });
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'COOKIES Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/community', communityRouter);
app.use('/api/cookie-truth', cookieTruthRouter);
app.use('/api/checkout-diff', checkoutDiffRouter);
app.use('/api/ai', cookiesAiRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: String(err), stack: err.stack }, 'Unhandled error in application');
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start server only when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, '🍪 COOKIES backend server running');
    console.log(`🍪 COOKIES Backend running at http://localhost:${PORT}`);
  });
}

export default app;
