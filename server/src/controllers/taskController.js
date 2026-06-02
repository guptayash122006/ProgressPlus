/**
 * src/controllers/taskController.js — Task CRUD Controllers
 *
 * All actions are scoped to the authenticated user via req.user.uid.
 * XP rewards and badge checks happen on task completion.
 *
 * When MongoDB is available  → uses Mongoose models (Tasks persisted to disk).
 * When MongoDB is unavailable → uses in-memory store (Tasks persisted in-process).
 */

import Task from '../models/Task.js';
import User from '../models/User.js';
import { awardXP, checkTaskBadges, todayString } from '../utils/xp.js';
import * as mem from '../utils/memoryStore.js';
import logger from '../utils/logger.js';
import { mongoConnected } from '../config/db.js';

// ─── Helper: resolve MongoDB User._id from Firebase UID ──────────────────────
const getUserDoc = (firebaseUid) => User.findOne({ firebaseUid }).select('_id gamification');

// ─── GET /api/tasks ───────────────────────────────────────────────────────────

/**
 * Retrieve tasks for the authenticated user.
 * Query params:
 *   filter   — today | upcoming | completed | overdue | all (default: all)
 *   category — study | work | fitness | personal | health | custom
 *   priority — high | medium | low
 *   search   — full-text substring match on title
 */
export const getTasks = async (req, res, next) => {
  try {
    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] getTasks for ${req.user.email}`);
      const tasks = mem.tasks.getAll(req.user.uid, req.query);
      return res.status(200).json({ success: true, data: tasks, count: tasks.length });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found. Please sync.' });

    const { filter = 'all', category, priority, search } = req.query;
    const query = { userId: userDoc._id };

    const now        = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        query.dueDate   = { $gte: todayStart, $lt: todayEnd };
        query.completed = false;
        break;
      case 'upcoming':
        query.dueDate   = { $gte: todayEnd };
        query.completed = false;
        break;
      case 'completed':
        query.completed = true;
        break;
      case 'overdue':
        query.dueDate   = { $lt: todayStart };
        query.completed = false;
        break;
      case 'all':
      default:
        break;
    }

    if (category) query.category = category;
    if (priority)  query.priority = priority;
    if (search)    query.title   = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: tasks, count: tasks.length });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/tasks ──────────────────────────────────────────────────────────

/**
 * Create a new task.
 * Awards +5 XP if this is the user's first task created today.
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, customCategory, dueDate, tags } = req.body;

    if (!title || title.toString().trim() === '') {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] createTask for ${req.user.email}`);
      // Ensure the user record exists in memory so getAll works by userId
      mem.users.findOrCreate(req.user.uid, req.user.email, req.user.name, req.user.picture);
      const task = mem.tasks.create(req.user.uid, {
        title, description, priority, category, customCategory, dueDate, tags,
      });
      return res.status(201).json({ success: true, data: task });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const task = await Task.create({
      userId:         userDoc._id,
      title:          title.toString().trim(),
      description:    description?.toString().trim(),
      priority,
      category,
      customCategory: customCategory?.toString().trim(),
      dueDate:        dueDate ? new Date(dueDate) : undefined,
      tags:           Array.isArray(tags) ? tags : [],
    });

    // Award XP if first task created today
    const today          = todayString();
    const todayTaskCount = await Task.countDocuments({
      userId:    userDoc._id,
      createdAt: { $gte: new Date(today), $lt: new Date(new Date(today).getTime() + 86400000) },
    });

    if (todayTaskCount === 1) {
      await awardXP(userDoc._id, 5);
      logger.debug(`First task of the day — awarded 5 XP to user ${req.user.uid}`);
    }

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────

/**
 * Update any fields of an existing task (scoped to user's tasks).
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] updateTask ${id} for ${req.user.email}`);
      const task = mem.tasks.update(req.user.uid, id, req.body);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found or access denied' });
      return res.status(200).json({ success: true, data: task });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const allowedFields = ['title', 'description', 'priority', 'category', 'customCategory', 'dueDate', 'tags'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: userDoc._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────

/**
 * Permanently delete a task owned by the user.
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] deleteTask ${id} for ${req.user.email}`);
      const task = mem.tasks.delete(req.user.uid, id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found or access denied' });
      return res.status(200).json({ success: true, message: 'Task deleted', data: { _id: id } });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: userDoc._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied' });
    }

    res.status(200).json({ success: true, message: 'Task deleted', data: { _id: task._id } });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/tasks/:id/toggle ─────────────────────────────────────────────

/**
 * Toggle the completed state of a task.
 * Awards +10 XP when a task is marked complete.
 * Checks and awards task milestone badges.
 */
export const toggleTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] toggleTask ${id} for ${req.user.email}`);
      const task = mem.tasks.toggle(req.user.uid, id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found or access denied' });
      if (task.completed) {
        mem.users.addXP(req.user.uid, 10);
      }
      return res.status(200).json({ success: true, data: task });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const task = await Task.findOne({ _id: req.params.id, userId: userDoc._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied' });
    }

    const wasCompleted = task.completed;
    task.completed   = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;
    await task.save();

    if (!wasCompleted && task.completed) {
      await awardXP(userDoc._id, 10);

      const totalDone = await Task.countDocuments({ userId: userDoc._id, completed: true });
      await checkTaskBadges(userDoc, totalDone);

      logger.debug(`Task ${task._id} completed — awarded 10 XP to user ${req.user.uid}`);
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};
