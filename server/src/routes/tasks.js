/**
 * src/routes/tasks.js — Task Routes
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from '../controllers/taskController.js';

const router = Router();

// GET /api/tasks?filter=today|upcoming|completed|overdue|all&category=&priority=&search=
router.get('/', verifyToken, getTasks);

// POST /api/tasks
router.post('/', verifyToken, createTask);

// PUT /api/tasks/:id
router.put('/:id', verifyToken, updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', verifyToken, deleteTask);

// PATCH /api/tasks/:id/toggle — flip completed state
router.patch('/:id/toggle', verifyToken, toggleTask);

export default router;
