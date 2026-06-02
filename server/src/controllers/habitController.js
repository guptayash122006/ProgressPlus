/**
 * src/controllers/habitController.js — Habit Controllers
 *
 * Manages habits and per-day habit logs.
 * Streak calculation is done on log by checking yesterday's log.
 *
 * When MongoDB is available  → uses Mongoose models (persisted to disk).
 * When MongoDB is unavailable → uses in-memory store (persisted in-process).
 */

import Habit    from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import User     from '../models/User.js';
import { awardXP, todayString } from '../utils/xp.js';
import * as mem from '../utils/memoryStore.js';
import logger   from '../utils/logger.js';
import { mongoConnected } from '../config/db.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const getUserDoc = (firebaseUid) => User.findOne({ firebaseUid }).select('_id gamification');

const dateOffsetString = (daysAgo) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

// ─── GET /api/habits ──────────────────────────────────────────────────────────

/**
 * Return all active habits for the user, each decorated with today's log status.
 */
export const getHabits = async (req, res, next) => {
  try {
    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] getHabits for ${req.user.email}`);
      const habits = mem.habits.getAll(req.user.uid);
      return res.status(200).json({ success: true, data: habits });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const today    = todayString();
    const habits   = await Habit.find({ userId: userDoc._id, isActive: true });
    const habitIds = habits.map((h) => h._id);
    const todayLogs = await HabitLog.find({ habitId: { $in: habitIds }, date: today });
    const logMap   = new Map(todayLogs.map((l) => [l.habitId.toString(), l]));

    const decorated = habits.map((habit) => ({
      ...habit.toObject(),
      todayLog:      logMap.get(habit._id.toString()) || null,
      completedToday: logMap.get(habit._id.toString())?.completed ?? false,
    }));

    res.status(200).json({ success: true, data: decorated });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/habits ─────────────────────────────────────────────────────────

/**
 * Create a new habit and initialise today's log entry as not completed.
 */
export const createHabit = async (req, res, next) => {
  try {
    const { name, icon, color, frequency, targetDays } = req.body;

    if (!name || name.toString().trim() === '') {
      return res.status(400).json({ success: false, message: 'Habit name is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] createHabit for ${req.user.email}`);
      logger.info(`[MEMORY FALLBACK] createHabit storing habit under userId=${req.user.uid}`);
      mem.users.findOrCreate(req.user.uid, req.user.email, req.user.name, req.user.picture);
      const habit = mem.habits.create(req.user.uid, { name, icon, color, frequency, targetDays });
      logger.info(`[MEMORY FALLBACK] createHabit stored habit._id=${habit._id} under userId=${req.user.uid}`);
      return res.status(201).json({ success: true, data: habit });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const habit = await Habit.create({
      userId:     userDoc._id,
      name:       name.toString().trim(),
      icon:       icon  || '⭐',
      color:      color || '#7c5cfc',
      frequency:  frequency  || 'daily',
      targetDays: Array.isArray(targetDays) ? targetDays : [],
    });

    // Pre-create today's log so the UI can immediately show the toggle
    const today = todayString();
    await HabitLog.create({
      habitId:   habit._id,
      userId:    userDoc._id,
      date:      today,
      completed: false,
    });

    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/habits/:id ──────────────────────────────────────────────────────

/**
 * Update a habit's metadata (name, icon, color, frequency, targetDays).
 */
export const updateHabit = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Habit ID is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] updateHabit ${id} for ${req.user.email}`);
      const habit = mem.habits.update(req.user.uid, id, req.body);
      if (!habit) return res.status(404).json({ success: false, message: 'Habit not found or access denied' });
      return res.status(200).json({ success: true, data: habit });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const allowedFields = ['name', 'icon', 'color', 'frequency', 'targetDays', 'isActive'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: userDoc._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found or access denied' });

    res.status(200).json({ success: true, data: habit });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/habits/:id ───────────────────────────────────────────────────

/**
 * Soft-delete a habit (sets isActive = false) to preserve historical logs.
 */
export const deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ success: false, message: 'Habit ID is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] deleteHabit ${id} for ${req.user.email}`);
      const habit = mem.habits.softDelete(req.user.uid, id);
      if (!habit) return res.status(404).json({ success: false, message: 'Habit not found or access denied' });
      return res.status(200).json({ success: true, message: 'Habit deactivated', data: { _id: id } });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: userDoc._id },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found or access denied' });

    res.status(200).json({ success: true, message: 'Habit deactivated', data: { _id: habit._id } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/habits/:id/log ─────────────────────────────────────────────────

/**
 * Mark a habit as completed for today (or toggle it back to uncompleted).
 * Recalculates streak by checking yesterday's log.
 * Awards +15 XP on completion.
 */
export const logHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, completed: completedParam } = req.body || {};

    logger.info(`[LOG HABIT] req.params.id: ${id}`);
    logger.info(`[LOG HABIT] req.user.uid: ${req.user?.uid}`);
    logger.info(`[LOG HABIT] req.user.email: ${req.user?.email}`);
    logger.info(`[LOG HABIT] mongoConnected: ${mongoConnected}`);

    if (!id || id === 'undefined') {
      logger.warn('[LOG HABIT] id is missing or undefined — returning 400');
      return res.status(400).json({ success: false, message: 'Habit ID is required' });
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] logHabit ${id} for ${req.user.email}`);
      logger.info(`[MEMORY FALLBACK] looking up habit in mem._habits under userId=${req.user.uid}`);
      const result = mem.habitLogs.log(req.user.uid, id, { completed: completedParam, note });
      logger.info(`[MEMORY FALLBACK] mem.habitLogs.log result: ${result === null ? 'NULL (habit not found for this userId)' : 'found'}`);
      if (!result) {
        logger.warn(`[MEMORY FALLBACK] Habit ${id} not found under userId ${req.user.uid}`);
        logger.warn(`[MEMORY FALLBACK] Hint: habit may have been created under a different userId (uid mismatch between create and log requests)`);
        return res.status(404).json({ success: false, message: 'Habit not found or access denied' });
      }
      if (result.log.completed) {
        mem.users.addXP(req.user.uid, 15);
      }
      return res.status(200).json({ success: true, data: result });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const habit = await Habit.findOne({ _id: req.params.id, userId: userDoc._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found or access denied' });

    const today     = todayString();
    const yesterday = dateOffsetString(1);

    let log = await HabitLog.findOne({ habitId: habit._id, date: today });

    const newCompleted = completedParam !== undefined ? Boolean(completedParam) : !(log?.completed ?? false);

    log = await HabitLog.findOneAndUpdate(
      { habitId: habit._id, date: today },
      {
        $set: {
          userId:    userDoc._id,
          completed: newCompleted,
          note:      note?.toString().trim() || log?.note,
          loggedAt:  new Date(),
        },
      },
      { upsert: true, new: true }
    );

    if (newCompleted) {
      const yesterdayLog = await HabitLog.findOne({ habitId: habit._id, date: yesterday });
      habit.streak = yesterdayLog?.completed ? habit.streak + 1 : 1;

      if (habit.streak > habit.longestStreak) {
        habit.longestStreak = habit.streak;
      }

      habit.totalCompletions += 1;
      await habit.save();

      await awardXP(userDoc._id, 15);
      logger.debug(`Habit ${habit._id} logged — awarded 15 XP to user ${req.user.uid}`);
    } else {
      habit.streak = Math.max(0, habit.streak - 1);
      if (habit.totalCompletions > 0) habit.totalCompletions -= 1;
      await habit.save();
    }

    res.status(200).json({
      success: true,
      data: {
        log,
        habit: {
          _id:              habit._id,
          streak:           habit.streak,
          longestStreak:    habit.longestStreak,
          totalCompletions: habit.totalCompletions,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/habits/:id/logs?days=30 ────────────────────────────────────────

/**
 * Return the last N days of HabitLog entries for a specific habit.
 */
export const getHabitLogs = async (req, res, next) => {
  try {
    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] getHabitLogs for ${req.user.email}`);
      const days = Math.min(parseInt(req.query.days, 10) || 30, 365);
      const logs = mem.habitLogs.getLogs(req.params.id, days);
      return res.status(200).json({ success: true, data: logs });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const habit = await Habit.findOne({ _id: req.params.id, userId: userDoc._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found or access denied' });

    const days  = Math.min(parseInt(req.query.days, 10) || 30, 365);
    const since = dateOffsetString(days - 1);

    const logs = await HabitLog.find({
      habitId: habit._id,
      date:    { $gte: since },
    }).sort({ date: 1 });

    const logMap = new Map(logs.map((l) => [l.date, l]));
    const filled = [];
    for (let i = days - 1; i >= 0; i--) {
      const dateStr = dateOffsetString(i);
      filled.push(
        logMap.get(dateStr) || {
          habitId: habit._id,
          userId:  userDoc._id,
          date:    dateStr,
          completed: false,
        }
      );
    }

    res.status(200).json({ success: true, data: filled });
  } catch (err) {
    next(err);
  }
};
