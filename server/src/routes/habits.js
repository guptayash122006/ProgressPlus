/**
 * src/routes/habits.js — Habit Routes
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  getHabitLogs,
} from '../controllers/habitController.js';

const router = Router();

// GET /api/habits — list active habits with today's completion status
router.get('/', verifyToken, getHabits);

// POST /api/habits — create a new habit
router.post('/', verifyToken, createHabit);

// PUT /api/habits/:id — update habit metadata
router.put('/:id', verifyToken, updateHabit);

// DELETE /api/habits/:id — soft delete (isActive = false)
router.delete('/:id', verifyToken, deleteHabit);

// POST /api/habits/:id/log — mark habit complete/incomplete for today
router.post('/:id/log', verifyToken, logHabit);

// GET /api/habits/:id/logs?days=30 — historical completion log
router.get('/:id/logs', verifyToken, getHabitLogs);

export default router;
