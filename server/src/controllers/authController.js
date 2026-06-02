/**
 * src/controllers/authController.js — Authentication Controllers
 *
 * Handles user sync (create/find), profile retrieval, profile updates,
 * and onboarding completion with XP/badge rewards.
 * 
 * Includes graceful fallback behavior when MongoDB is offline.
 */

import User from '../models/User.js';
import { awardBadge, awardXP } from '../utils/xp.js';
import * as mem from '../utils/memoryStore.js';
import logger from '../utils/logger.js';
import { mongoConnected } from '../config/db.js';

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Find a User document by Firebase UID.
 * Returns null if not found — callers handle the 404.
 */
const findUserByUid = (uid) => User.findOne({ firebaseUid: uid });

/**
 * Create a mock user object for offline mode (when MongoDB is unavailable).
 * Allows authentication flow to continue without database.
 */
const createMockUser = (uid, email, displayName = '', photoURL = '') => {
  return {
    firebaseUid: uid,
    email: email || '',
    displayName: displayName || '',
    photoURL: photoURL || '',
    onboardingCompleted: false,
    preferences: {
      theme: 'dark',
      notifications: true,
      reminderTime: '20:00',
    },
    gamification: {
      xp: 0,
      level: 1,
      badges: [],
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: new Date(),
    },
    createdAt: new Date(),
    _id: `mock-${uid}`, // Mock MongoDB ID for UI compatibility
  };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/sync
 * Called once per session to ensure the user exists in MongoDB.
 * Creates the document on first login; updates lastActiveDate on subsequent calls.
 * 
 * OFFLINE FALLBACK: If MongoDB unavailable, returns mock user object.
 */
export const syncUser = async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.user; // decoded Firebase token

    // In-memory fallback: persist user in memory so other controllers can find them
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] syncUser: using in-memory user for ${email}`);
      const user = mem.users.findOrCreate(uid, email, name, picture);
      return res.status(200).json({ success: true, data: user });
    }

    let user = await findUserByUid(uid);

    if (!user) {
      // First time we've seen this Firebase user — create the MongoDB record
      user = await User.create({
        firebaseUid: uid,
        email: email || '',
        displayName: name || '',
        photoURL: picture || '',
      });
      logger.info(`New user created: ${uid}`);
    } else {
      // Update lastActiveDate on every sync
      user.gamification.lastActiveDate = new Date();
      await user.save();
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/profile
 * Returns the authenticated user's full profile from MongoDB.
 * 
 * OFFLINE FALLBACK: If MongoDB unavailable, returns mock user based on auth token.
 */
export const getProfile = async (req, res, next) => {
  try {
    // If MongoDB is offline, return mock user object
    if (!mongoConnected) {
      const { uid, email, name, picture } = req.user;
      logger.info(`[OFFLINE FALLBACK] getProfile: returning mock user for ${email}`);
      return res.status(200).json({
        success: true,
        data: createMockUser(uid, email, name, picture),
        _meta: { offline: true, message: 'Using offline fallback (MongoDB unavailable)' },
      });
    }

    const user = await findUserByUid(req.user.uid);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please sync first.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/profile
 * Updates display name, photo URL, and preferences.
 * Only the fields provided in the body are updated.
 * 
 * OFFLINE FALLBACK: If MongoDB unavailable, returns success but doesn't persist.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, photoURL, preferences } = req.body || {};

    // If MongoDB is offline, return success message (changes won't persist but UI flow works)
    if (!mongoConnected) {
      logger.info(`[OFFLINE FALLBACK] updateProfile: skipping save for ${req.user.email}`);
      return res.status(200).json({
        success: true,
        data: createMockUser(req.user.uid, req.user.email, displayName || req.user.name, photoURL || req.user.picture),
        _meta: { offline: true, message: 'Changes not persisted (MongoDB unavailable)' },
      });
    }

    const user = await findUserByUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Apply updates only for fields that were sent
    if (displayName !== undefined) user.displayName = displayName.toString().trim();
    if (photoURL !== undefined) user.photoURL = photoURL.toString().trim();

    if (preferences && typeof preferences === 'object') {
      if (preferences.theme !== undefined) user.preferences.theme = preferences.theme;
      if (preferences.notifications !== undefined)
        user.preferences.notifications = Boolean(preferences.notifications);
      if (preferences.reminderTime !== undefined)
        user.preferences.reminderTime = preferences.reminderTime;
    }

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/onboarding
 * Marks onboarding as completed for the user.
 * Awards the 'first_login' badge and 50 XP (idempotent).
 * 
 * OFFLINE FALLBACK: If MongoDB unavailable, returns success without saving.
 * This allows the UI to proceed to dashboard in offline mode.
 */
export const completeOnboarding = async (req, res, next) => {
  try {
    // If MongoDB is offline, return success without database operations
    if (!mongoConnected) {
      logger.info(`[OFFLINE FALLBACK] completeOnboarding: skipping save for ${req.user.email}`);
      return res.status(200).json({
        success: true,
        data: {
          ...createMockUser(req.user.uid, req.user.email, req.user.name, req.user.picture),
          onboardingCompleted: true,
        },
        _meta: { offline: true, message: 'Onboarding marked complete but not persisted (MongoDB unavailable)' },
      });
    }

    const user = await findUserByUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.onboardingCompleted) {
      user.onboardingCompleted = true;
      user.gamification.xp += 50;
      user.recalculateLevel();
      await user.save();

      // Award badge (awardBadge saves separately — idempotent)
      await awardBadge(user._id, 'first_login');

      logger.info(`Onboarding completed for user ${user.firebaseUid}`);
    }

    // Re-fetch to ensure badges array is current
    const updated = await findUserByUid(req.user.uid);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
