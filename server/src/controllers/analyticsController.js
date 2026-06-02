/**
 * src/controllers/analyticsController.js — Analytics Controllers
 *
 * Aggregates task/habit data into weekly/monthly summaries and overall stats.
 * Uses DailyLog as a lightweight cache layer for historical data.
 *
 * When MongoDB is available  → reads/writes Mongoose models.
 * When MongoDB is unavailable → reads/writes the in-memory store.
 */

import Task     from '../models/Task.js';
import Habit    from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import DailyLog from '../models/DailyLog.js';
import User     from '../models/User.js';
import * as mem from '../utils/memoryStore.js';
import { todayString } from '../utils/xp.js';
import logger from '../utils/logger.js';
import { mongoConnected } from '../config/db.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const getUserDoc = (firebaseUid) => User.findOne({ firebaseUid });

/**
 * Returns a 'YYYY-MM-DD' string for a date N days ago (UTC).
 */
const dateOffsetString = (daysAgo) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

/**
 * Build a date range array of 'YYYY-MM-DD' strings from oldest to newest.
 */
const buildDateRange = (days) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(dateOffsetString(i));
  }
  return dates;
};

/**
 * Merge DailyLog documents into a complete date-range array.
 * Missing days are filled with zero values.
 */
const fillDailyLogs = (dates, logs) => {
  const logMap = new Map(logs.map((l) => [l.date, l]));
  return dates.map((date) => {
    const log = logMap.get(date);
    return {
      date,
      tasksTotal:        log?.tasksTotal        ?? 0,
      tasksDone:         log?.tasksDone         ?? 0,
      habitsTotal:       log?.habitsTotal       ?? 0,
      habitsDone:        log?.habitsDone        ?? 0,
      productivityScore: log?.productivityScore ?? 0,
    };
  });
};

// ─── GET /api/analytics/weekly ────────────────────────────────────────────────

/**
 * Return the last 7 days of DailyLog data for the user.
 * Missing days are filled with zeros so charts never show gaps.
 */
export const getWeeklyAnalytics = async (req, res, next) => {
  try {
    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] getWeeklyAnalytics for ${req.user.email}`);
      const data = mem.dailyLogs.getRange(req.user.uid, 7);
      return res.status(200).json({ success: true, data });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const dates = buildDateRange(7);
    const since = dates[0];

    const logs = await DailyLog.find({
      userId: userDoc._id,
      date:   { $gte: since },
    });

    const data = fillDailyLogs(dates, logs);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/analytics/monthly ───────────────────────────────────────────────

/**
 * Return the last 30 days of DailyLog data.
 */
export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] getMonthlyAnalytics for ${req.user.email}`);
      const data = mem.dailyLogs.getRange(req.user.uid, 30);
      return res.status(200).json({ success: true, data });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const dates = buildDateRange(30);
    const since = dates[0];

    const logs = await DailyLog.find({
      userId: userDoc._id,
      date:   { $gte: since },
    });

    const data = fillDailyLogs(dates, logs);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/analytics/summary ───────────────────────────────────────────────

/**
 * Return a high-level summary of the user's progress.
 * Includes derived fields consumed by AnalyticsPage:
 *   activeDays  — days this week with productivityScore > 0
 *   accuracy    — % of tasks completed (completedTasks / totalTasks * 100)
 *   avgScore    — average productivityScore over last 7 days
 *   habitRate   — % of habits completed today
 */
export const getSummary = async (req, res, next) => {
  try {
    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] getSummary for ${req.user.email}`);
      const userId         = req.user.uid;
      const memUser        = mem.users.find(userId);
      const totalTasks     = mem.tasks.countAll(userId);
      const completedTasks = mem.tasks.countCompleted(userId);
      const totalHabits    = mem.habits.countAll(userId);
      const gamification   = memUser?.gamification || {};

      // Derived fields for AnalyticsPage
      const weekLogs  = mem.dailyLogs.getRange(userId, 7);
      const activeDays = weekLogs.filter(d => d.productivityScore > 0).length;
      const avgScore   = weekLogs.length
        ? Math.round(weekLogs.reduce((s, d) => s + d.productivityScore, 0) / weekLogs.length)
        : 0;
      const accuracy   = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const habitsDoneToday = mem.habitLogs.countDoneToday(userId);
      const habitRate  = totalHabits > 0 ? Math.round((habitsDoneToday / totalHabits) * 100) : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalTasks,
          completedTasks,
          pendingTasks:   totalTasks - completedTasks,
          totalHabits,
          currentStreak:  gamification.currentStreak  || 0,
          longestStreak:  gamification.longestStreak  || 0,
          level:          gamification.level          || 1,
          xp:             gamification.xp             || 0,
          badges:         gamification.badges         || [],
          // Derived
          activeDays,
          accuracy,
          avgScore,
          habitRate,
        },
      });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(req.user.uid);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    const [totalTasks, completedTasks, totalHabits] = await Promise.all([
      Task.countDocuments({ userId: userDoc._id }),
      Task.countDocuments({ userId: userDoc._id, completed: true }),
      Habit.countDocuments({ userId: userDoc._id, isActive: true }),
    ]);

    // Derived fields
    const weekDates  = buildDateRange(7);
    const weekLogs   = await DailyLog.find({ userId: userDoc._id, date: { $gte: weekDates[0] } });
    const weekFilled = fillDailyLogs(weekDates, weekLogs);
    const activeDays = weekFilled.filter(d => d.productivityScore > 0).length;
    const avgScore   = Math.round(weekFilled.reduce((s, d) => s + d.productivityScore, 0) / 7);
    const accuracy   = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const today      = todayString();
    const habitIds   = (await Habit.find({ userId: userDoc._id, isActive: true }).select('_id')).map(h => h._id);
    const habitsDoneToday = await HabitLog.countDocuments({ habitId: { $in: habitIds }, date: today, completed: true });
    const habitRate  = totalHabits > 0 ? Math.round((habitsDoneToday / totalHabits) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks:   totalTasks - completedTasks,
        totalHabits,
        currentStreak:  userDoc.gamification.currentStreak,
        longestStreak:  userDoc.gamification.longestStreak,
        level:          userDoc.gamification.level,
        xp:             userDoc.gamification.xp,
        badges:         userDoc.gamification.badges,
        lastActiveDate: userDoc.gamification.lastActiveDate,
        // Derived
        activeDays,
        accuracy,
        avgScore,
        habitRate,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/analytics/daily-log ────────────────────────────────────────────

/**
 * Upsert today's DailyLog with current task and habit counts.
 * Calculates productivityScore:
 *   score = (tasksDone/tasksTotal * 0.6 + habitsDone/habitsTotal * 0.4) * 100
 * Falls back to a component-only score when one side has no data.
 *
 * Callers pass { tasksTotal, tasksDone, habitsTotal, habitsDone } in the body.
 * If any are missing the controller reads live counts from the data store.
 */
export const saveDailyLog = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const today  = todayString();
    let { tasksTotal, tasksDone, habitsTotal, habitsDone } = req.body || {};

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (!mongoConnected) {
      logger.info(`[MEMORY FALLBACK] saveDailyLog for ${req.user.email}`);

      // Fill missing counts from the in-memory store
      if (tasksTotal === undefined) tasksTotal = mem.tasks.countAll(userId);
      if (tasksDone  === undefined) tasksDone  = mem.tasks.countCompleted(userId);
      if (habitsTotal === undefined) habitsTotal = mem.habits.countAll(userId);
      if (habitsDone  === undefined) habitsDone  = mem.habitLogs.countDoneToday(userId);

      tasksTotal  = Number(tasksTotal)  || 0;
      tasksDone   = Number(tasksDone)   || 0;
      habitsTotal = Number(habitsTotal) || 0;
      habitsDone  = Number(habitsDone)  || 0;

      // ── Productivity Score ────────────────────────────────────────────────
      let productivityScore;
      if (tasksTotal === 0 && habitsTotal === 0) {
        productivityScore = 0;
      } else if (tasksTotal === 0) {
        productivityScore = Math.round((habitsDone / habitsTotal) * 100);
      } else if (habitsTotal === 0) {
        productivityScore = Math.round((tasksDone / tasksTotal) * 100);
      } else {
        const taskScore  = (tasksDone  / tasksTotal)  * 0.6;
        const habitScore = (habitsDone / habitsTotal) * 0.4;
        productivityScore = Math.round((taskScore + habitScore) * 100);
      }
      productivityScore = Math.min(100, Math.max(0, productivityScore));

      // ── Persist into memory ───────────────────────────────────────────────
      const dailyLog = mem.dailyLogs.upsert(userId, today, {
        tasksTotal, tasksDone, habitsTotal, habitsDone, productivityScore,
      });

      // ── Update streak ─────────────────────────────────────────────────────
      const yesterdayLog = mem.dailyLogs.yesterday(userId);
      mem.users.updateStreak(userId, productivityScore, yesterdayLog);

      logger.debug(`[MEMORY] Daily log saved for ${userId} — score: ${productivityScore}`);
      return res.status(200).json({ success: true, data: dailyLog });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────────
    const userDoc = await getUserDoc(userId);
    if (!userDoc) return res.status(404).json({ success: false, message: 'User not found' });

    if (tasksTotal === undefined || tasksDone === undefined) {
      const todayStart = new Date(today);
      const todayEnd   = new Date(todayStart.getTime() + 86_400_000);
      [tasksTotal, tasksDone] = await Promise.all([
        Task.countDocuments({ userId: userDoc._id, dueDate: { $gte: todayStart, $lt: todayEnd } }),
        Task.countDocuments({ userId: userDoc._id, dueDate: { $gte: todayStart, $lt: todayEnd }, completed: true }),
      ]);
    }

    if (habitsTotal === undefined || habitsDone === undefined) {
      const habitIds = (await Habit.find({ userId: userDoc._id, isActive: true }).select('_id')).map(h => h._id);
      habitsTotal = habitIds.length;
      habitsDone  = await HabitLog.countDocuments({ habitId: { $in: habitIds }, date: today, completed: true });
    }

    // ── Productivity Score ────────────────────────────────────────────────────
    let productivityScore;
    if (tasksTotal === 0 && habitsTotal === 0) {
      productivityScore = 0;
    } else if (tasksTotal === 0) {
      productivityScore = Math.round((habitsDone / habitsTotal) * 100);
    } else if (habitsTotal === 0) {
      productivityScore = Math.round((tasksDone / tasksTotal) * 100);
    } else {
      const taskScore  = (tasksDone  / tasksTotal)  * 0.6;
      const habitScore = (habitsDone / habitsTotal) * 0.4;
      productivityScore = Math.round((taskScore + habitScore) * 100);
    }
    productivityScore = Math.min(100, Math.max(0, productivityScore));

    const dailyLog = await DailyLog.findOneAndUpdate(
      { userId: userDoc._id, date: today },
      { $set: { tasksTotal, tasksDone, habitsTotal, habitsDone, productivityScore, savedAt: new Date() } },
      { upsert: true, new: true }
    );

    // ── Update user-level streak ──────────────────────────────────────────────
    const yesterday    = dateOffsetString(1);
    const yesterdayLog = await DailyLog.findOne({ userId: userDoc._id, date: yesterday });

    if (productivityScore > 0) {
      if (yesterdayLog && yesterdayLog.productivityScore > 0) {
        userDoc.gamification.currentStreak += 1;
      } else {
        userDoc.gamification.currentStreak = 1;
      }
      if (userDoc.gamification.currentStreak > userDoc.gamification.longestStreak) {
        userDoc.gamification.longestStreak = userDoc.gamification.currentStreak;
      }
      userDoc.gamification.lastActiveDate = new Date();
      await userDoc.save();
    }

    logger.debug(`Daily log saved for user ${req.user.uid} — score: ${productivityScore}`);
    res.status(200).json({ success: true, data: dailyLog });
  } catch (err) {
    next(err);
  }
};
