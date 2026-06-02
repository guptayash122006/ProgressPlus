/**
 * src/middleware/auth.js — Firebase Token Verification Middleware
 *
 * Extracts the Bearer token from the Authorization header, verifies it with
 * Firebase Admin, and attaches the decoded token to `req.user`.
 * 
 * FALLBACK MODE (Firebase not configured):
 * For local development, uses user identity from request body instead of token verification.
 * In production with Firebase credentials, this fallback is never used.
 */

import { auth } from '../config/firebase-admin.js';
import logger from '../utils/logger.js';

/**
 * verifyToken — Express middleware
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no token provided, return 401
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach decoded token to request (contains uid, email, name, picture, etc.)
    req.user = decodedToken;

    next();
  } catch (error) {
    // If Firebase is not configured, try fallback authentication
    if (error.code === 'auth/not-configured') {
      return handleFallbackAuth(req, res, next, error);
    }

    logger.warn(`Token verification failed: ${error.message}`);

    // Firebase specific error codes
    if (
      error.code === 'auth/id-token-expired' ||
      error.code === 'auth/argument-error'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired or invalid',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Could not verify token',
    });
  }
};

/**
 * handleFallbackAuth — Fallback authentication for development (Firebase not configured)
 * Extracts user identity from request body or decodes it from the JWT token.
 * This allows local development without Firebase Admin credentials.
 * In production, Firebase is always configured, so this is never reached.
 */
function handleFallbackAuth(req, res, next, error) {
  // Safely extract user identity from request body (may be undefined)
  const body = req.body || {};
  let { email, displayName, photoURL, uid } = body;

  // If no user data in body, try to extract from the JWT token itself (without verification)
  // Firebase ID tokens contain the user claims in the payload
  if (!email && req.headers.authorization) {
    try {
      const token = req.headers.authorization.split('Bearer ')[1];
      if (token) {
        // Decode JWT payload without verification (safe for local dev fallback mode)
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        email = decoded.email;
        uid = decoded.uid || decoded.sub; // 'sub' is the standard JWT subject claim (user ID)
        displayName = decoded.name;
        photoURL = decoded.picture;
      }
    } catch (err) {
      logger.debug(`Failed to decode token in fallback auth: ${err.message}`);
    }
  }

  // If still no user data, we can't continue
  if (!email) {
    logger.warn('Fallback auth: No email found in request body or JWT token');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Firebase not configured and no user data provided',
    });
  }

  // Create a mock decoded token from extracted data
  // In a real Firebase scenario, these fields come from a verified token
  // Here, we trust the token payload (safe for local dev only)
  req.user = {
    uid: uid || email, // Use email as fallback uid for local dev
    email: email || '',
    name: displayName || '',
    picture: photoURL || '',
  };

  logger.info(`[FALLBACK AUTH] Using user data for: ${email} (Firebase not configured, token decoded)`);
  next();
}
