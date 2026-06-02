/**
 * server.js — ProgressPlus API Entry Point
 * Loads environment variables, connects to MongoDB, then starts Express.
 */

import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the HTTP server
connectDB().then((connected) => {
  if (!connected) {
    logger.warn('Starting ProgressPlus API without MongoDB connectivity. Some routes may fail until the database is available.');
  }

  app.listen(PORT, () => {
    logger.info(`🚀 ProgressPlus API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch((err) => {
  logger.error('Unexpected error during startup — server not started', { error: err.message });
  process.exit(1);
});

// Graceful shutdown on SIGTERM (e.g., from Render/Railway)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully…');
  process.exit(0);
});
