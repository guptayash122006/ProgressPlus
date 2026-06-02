/**
 * src/middleware/errorHandler.js — Global Express Error Handler
 *
 * Catches errors passed via next(err) from any route or middleware.
 * Returns a consistent { success, message, stack? } JSON response.
 * Stack trace is only included in development mode.
 */

import logger from '../utils/logger.js';

/**
 * globalErrorHandler — must be registered LAST in app.js
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next - kept to satisfy Express 4-arg signature
 */
// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, _next) => {
  // Default status code
  const statusCode = err.statusCode || err.status || 500;

  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, {
    status: statusCode,
    stack: err.stack,
  });

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Expose stack trace only during development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
  }

  res.status(statusCode).json(response);
};
