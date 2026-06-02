/**
 * src/routes/auth.js — Authentication Routes
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  syncUser,
  getProfile,
  updateProfile,
  completeOnboarding,
} from '../controllers/authController.js';

const router = Router();

// POST /api/auth/sync — upsert user in MongoDB on login
router.post('/sync', verifyToken, syncUser);

// GET /api/auth/profile — fetch current user profile
router.get('/profile', verifyToken, getProfile);

// PUT /api/auth/profile — update display name, photo, preferences
router.put('/profile', verifyToken, updateProfile);

// PUT /api/auth/onboarding — mark onboarding complete + award badge/XP
router.put('/onboarding', verifyToken, completeOnboarding);

export default router;
