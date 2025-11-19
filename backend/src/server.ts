import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import contractRoutes from './routes/contract.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import adminRoutes from './routes/admin.routes.js';
import shareRoutes from './routes/share.routes.js';
import contactRoutes from './routes/contact.routes.js';
import { requestLogger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';

// Resolve paths - try multiple approaches for compatibility
// When running with tsx, __dirname is src/, when compiled it's dist/
// process.cwd() gives us the backend root when running from backend/
let backendRoot: string;
if (__dirname.includes('dist')) {
  // Compiled code
  backendRoot = path.resolve(__dirname, '../..');
} else {
  // Development with tsx
  backendRoot = path.resolve(__dirname, '..');
}

const envFilePath = path.resolve(backendRoot, envFile);
const fallbackEnvPath = path.resolve(backendRoot, '.env');

// Load environment-specific file first, then fallback to .env
// Use override: true to ensure env vars from files override any existing ones
const envResult = dotenv.config({ path: envFilePath, override: false });
const fallbackResult = dotenv.config({ path: fallbackEnvPath, override: false }); // Fallback

// Log environment info
console.log(`🔧 Environment: ${nodeEnv}`);
console.log(`🔧 Loading env file: ${envFile}`);
console.log(`🔧 Backend root: ${backendRoot}`);
console.log(`🔧 Env file path: ${envFilePath}`);
if (envResult.error) {
  console.warn(`⚠️  Warning: Could not load ${envFile}:`, envResult.error.message);
} else {
  console.log(`✅ Loaded ${envFile} successfully`);
}
if (fallbackResult.error && !envResult.error) {
  console.warn(`⚠️  Warning: Could not load .env fallback:`, fallbackResult.error.message);
}

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName]?.trim() === '');
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error(`   Please set these in ${envFile} or .env file`);
  if (nodeEnv === 'production') {
    process.exit(1);
  } else {
    console.warn(`⚠️  Continuing in development mode, but some features may not work`);
  }
} else {
  // Debug: Show that JWT_SECRET is loaded (first 10 chars only for security)
  const jwtSecretPreview = process.env.JWT_SECRET ? 
    `${process.env.JWT_SECRET.substring(0, 10)}...` : 'NOT SET';
  console.log(`✅ JWT_SECRET loaded: ${jwtSecretPreview}`);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://contractiq-ivory.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (!isProduction) {
      // Allow all origins in development
      callback(null, true);
    } else {
      // In production, only allow specified origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
// Exclude webhook route from JSON parsing (needs raw body for signature verification)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/api/subscription/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (for development - local storage)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware (after static files, before routes)
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
