/**
 * src/app.js — Express Application Factory
 * Sets up all middleware, mounts route groups, and registers the global error handler.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { apiRateLimiter } from './middleware/rateLimiter.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

// Route modules
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import habitRoutes from './routes/habits.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Request Logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting (all /api routes) ─────────────────────────────────────────
app.use('/api', apiRateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'ProgressPlus API is healthy 🟢', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
