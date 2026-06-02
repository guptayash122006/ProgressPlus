/**
 * src/middleware/rateLimiter.js — Express Rate Limiter
 *
 * Limits each IP to 100 requests per 15-minute window on all /api routes.
 * Returns a JSON error instead of the default HTML response.
 */

import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max requests per window per IP
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,      // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  // Use a custom key generator if you want per-user limits in the future
  keyGenerator: (req) => req.ip,
});
