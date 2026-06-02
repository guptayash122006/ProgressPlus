/**
 * src/config/firebase-admin.js — Firebase Admin SDK Initializer
 * Reads credentials from environment variables and initializes the app once.
 * Exports `admin` (full SDK) and `auth` (shorthand for admin.auth()).
 */

import admin from 'firebase-admin';
import logger from '../utils/logger.js';

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const firebaseConfigAvailable =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  privateKey;

let auth;

if (firebaseConfigAvailable) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          clientId: process.env.FIREBASE_CLIENT_ID,
        }),
      });
    }

    logger.info(`🔥 Firebase Admin initialized for project: ${process.env.FIREBASE_PROJECT_ID}`);
    auth = admin.auth();
  } catch (error) {
    logger.warn(
      'Firebase Admin credentials are invalid or incomplete. Falling back to safe auth stub.',
      { message: error.message }
    );
    auth = {
      verifyIdToken: async () => {
        const err = new Error('Firebase Admin is not configured');
        err.code = 'auth/not-configured';
        throw err;
      },
    };
  }
} else {
  logger.warn(
    'Firebase Admin is not configured. Protected routes will continue to work, but token verification will reject requests until credentials are added.'
  );

  auth = {
    verifyIdToken: async () => {
      const error = new Error('Firebase Admin is not configured');
      error.code = 'auth/not-configured';
      throw error;
    },
  };
}

export { auth };
export default admin;
