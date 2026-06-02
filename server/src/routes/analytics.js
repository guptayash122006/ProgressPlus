/**
 * src/routes/analytics.js — Analytics Routes
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getSummary,
  saveDailyLog,
} from '../controllers/analyticsController.js';

const router = Router();

// GET /api/analytics/weekly — last 7 days of DailyLog data
router.get('/weekly', verifyToken, getWeeklyAnalytics);

// GET /api/analytics/monthly — last 30 days of DailyLog data
router.get('/monthly', verifyToken, getMonthlyAnalytics);

// GET /api/analytics/summary — high-level user stats (tasks, habits, XP, badges)
router.get('/summary', verifyToken, getSummary);

// POST /api/analytics/daily-log — upsert today's DailyLog, calculate score
router.post('/daily-log', verifyToken, saveDailyLog);

export default router;
