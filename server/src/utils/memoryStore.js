/**
 * src/utils/memoryStore.js — In-Process Memory Store
 *
 * Used as a fallback when MongoDB is unavailable.
 * Data is keyed by userId (Firebase UID) and lives for the lifetime of the
 * server process.  When MongoDB comes back online the controllers switch to
 * real DB operations automatically — this store is never consulted again.
 *
 * Structure:
 *   tasks     : Map<userId, Task[]>
 *   habits    : Map<userId, Habit[]>
 *   habitLogs : Map<habitId, HabitLog[]>
 *   users     : Map<userId, UserDoc>
 */

import { todayString } from './xp.js';

// ─── Storage maps ─────────────────────────────────────────────────────────────
const _tasks     = new Map(); // userId → Task[]
const _habits    = new Map(); // userId → Habit[]
const _habitLogs = new Map(); // habitId → HabitLog[]
const _users     = new Map(); // userId → UserDoc
const _dailyLogs = new Map(); // userId → DailyLog[]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function _list(map, key) {
  if (!map.has(key)) map.set(key, []);
  return map.get(key);
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasks = {
  getAll(userId, query = {}) {
    let items = [..._list(_tasks, userId)];
    const { filter, category, priority, search } = query;

    const now       = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 86_400_000);

    if (filter === 'today') {
      items = items.filter(t => t.dueDate && t.dueDate >= todayStart && t.dueDate < todayEnd && !t.completed);
    } else if (filter === 'upcoming') {
      items = items.filter(t => t.dueDate && t.dueDate >= todayEnd && !t.completed);
    } else if (filter === 'completed') {
      items = items.filter(t => t.completed);
    } else if (filter === 'overdue') {
      items = items.filter(t => t.dueDate && t.dueDate < todayStart && !t.completed);
    }

    if (category) items = items.filter(t => t.category === category);
    if (priority)  items = items.filter(t => t.priority === priority);
    if (search)    items = items.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

    return items.sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt - a.createdAt;
    });
  },

  create(userId, data) {
    const task = {
      _id: uid(),
      userId,
      title: (data.title || '').trim(),
      description: (data.description || '').trim(),
      priority: data.priority || 'medium',
      category: data.category || 'personal',
      customCategory: data.customCategory || '',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      completed: false,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    _list(_tasks, userId).push(task);
    return task;
  },

  findById(userId, id) {
    return _list(_tasks, userId).find(t => t._id === id) || null;
  },

  update(userId, id, updates) {
    const list = _list(_tasks, userId);
    const idx  = list.findIndex(t => t._id === id);
    if (idx === -1) return null;
    const allowed = ['title', 'description', 'priority', 'category', 'customCategory', 'dueDate', 'tags'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        list[idx][key] = key === 'dueDate' && updates[key] ? new Date(updates[key]) : updates[key];
      }
    }
    list[idx].updatedAt = new Date();
    return list[idx];
  },

  toggle(userId, id) {
    const task = this.findById(userId, id);
    if (!task) return null;
    task.completed   = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    task.updatedAt   = new Date();
    return task;
  },

  delete(userId, id) {
    const list = _list(_tasks, userId);
    const idx  = list.findIndex(t => t._id === id);
    if (idx === -1) return null;
    return list.splice(idx, 1)[0];
  },

  countAll(userId)       { return _list(_tasks, userId).length; },
  countCompleted(userId) { return _list(_tasks, userId).filter(t => t.completed).length; },
};

// ─── Habits ───────────────────────────────────────────────────────────────────
export const habits = {
  getAll(userId) {
    const today  = todayString();
    const items  = [..._list(_habits, userId)].filter(h => h.isActive);
    return items.map(habit => {
      const logs       = _list(_habitLogs, habit._id);
      const todayLog   = logs.find(l => l.date === today) || null;
      return {
        ...habit,
        todayLog,
        completedToday: todayLog?.completed ?? false,
      };
    });
  },

  create(userId, data) {
    const habit = {
      _id: uid(),
      userId,
      name: (data.name || '').trim(),
      icon: data.icon || '⭐',
      color: data.color || '#7c5cfc',
      frequency: data.frequency || 'daily',
      targetDays: Array.isArray(data.targetDays) ? data.targetDays : [],
      isActive: true,
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    _list(_habits, userId).push(habit);

    // Pre-create today's log entry (mirrors real DB behaviour)
    _list(_habitLogs, habit._id).push({
      _id: uid(),
      habitId: habit._id,
      userId,
      date: todayString(),
      completed: false,
      note: '',
      loggedAt: new Date(),
    });

    return habit;
  },

  findById(userId, id) {
    return _list(_habits, userId).find(h => h._id === id) || null;
  },

  update(userId, id, updates) {
    const list = _list(_habits, userId);
    const idx  = list.findIndex(h => h._id === id);
    if (idx === -1) return null;
    const allowed = ['name', 'icon', 'color', 'frequency', 'targetDays', 'isActive'];
    for (const key of allowed) {
      if (updates[key] !== undefined) list[idx][key] = updates[key];
    }
    list[idx].updatedAt = new Date();
    return list[idx];
  },

  softDelete(userId, id) {
    const habit = this.findById(userId, id);
    if (!habit) return null;
    habit.isActive  = false;
    habit.updatedAt = new Date();
    return habit;
  },

  countAll(userId) { return _list(_habits, userId).filter(h => h.isActive).length; },
};

// ─── Habit Logs ───────────────────────────────────────────────────────────────
export const habitLogs = {
  log(userId, habitId, { completed, note } = {}) {
    const habit    = _list(_habits, userId).find(h => h._id === habitId);
    if (!habit) return null;

    const today    = todayString();
    const logs     = _list(_habitLogs, habitId);
    let   existing = logs.find(l => l.date === today);

    const newCompleted = completed !== undefined ? Boolean(completed) : !(existing?.completed ?? false);

    if (existing) {
      existing.completed = newCompleted;
      existing.note      = note?.toString().trim() || existing.note;
      existing.loggedAt  = new Date();
    } else {
      existing = { _id: uid(), habitId, userId, date: today, completed: newCompleted, note: note || '', loggedAt: new Date() };
      logs.push(existing);
    }

    // Update streak
    if (newCompleted) {
      habit.streak = (habit.streak || 0) + 1;
      if (habit.streak > (habit.longestStreak || 0)) habit.longestStreak = habit.streak;
      habit.totalCompletions = (habit.totalCompletions || 0) + 1;
    } else {
      habit.streak = Math.max(0, (habit.streak || 1) - 1);
    }
    habit.updatedAt = new Date();

    return { log: existing, habit: { _id: habit._id, streak: habit.streak, longestStreak: habit.longestStreak, totalCompletions: habit.totalCompletions } };
  },

  getLogs(habitId, days = 30) {
    const logs    = _list(_habitLogs, habitId);
    const result  = [];
    for (let i = days - 1; i >= 0; i--) {
      const d     = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const date  = d.toISOString().slice(0, 10);
      const found = logs.find(l => l.date === date);
      result.push(found || { habitId, date, completed: false });
    }
    return result;
  },

  countDoneToday(userId) {
    const today  = todayString();
    let   count  = 0;
    for (const habit of _list(_habits, userId)) {
      const logs = _list(_habitLogs, habit._id);
      if (logs.some(l => l.date === today && l.completed)) count++;
    }
    return count;
  },
};

// ─── Daily Logs ───────────────────────────────────────────────────────────────
export const dailyLogs = {
  /**
   * Upsert a daily log entry. Fields are merged so callers can pass partials.
   */
  upsert(userId, date, fields) {
    const list    = _list(_dailyLogs, userId);
    const existing = list.find(l => l.date === date);
    if (existing) {
      Object.assign(existing, fields, { date });
      return existing;
    }
    const entry = { userId, date, tasksTotal: 0, tasksDone: 0, habitsTotal: 0, habitsDone: 0, productivityScore: 0, ...fields };
    list.push(entry);
    return entry;
  },

  /**
   * Return all daily logs for userId within the last `days` calendar days,
   * ordered oldest → newest, with gaps filled with zero entries.
   */
  getRange(userId, days) {
    const list   = _list(_dailyLogs, userId);
    const logMap = new Map(list.map(l => [l.date, l]));
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d    = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const date = d.toISOString().slice(0, 10);
      result.push(logMap.get(date) || {
        userId, date,
        tasksTotal: 0, tasksDone: 0,
        habitsTotal: 0, habitsDone: 0,
        productivityScore: 0,
      });
    }
    return result;
  },

  /** Yesterday's log for streak calculation. */
  yesterday(userId) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const date = d.toISOString().slice(0, 10);
    return _list(_dailyLogs, userId).find(l => l.date === date) || null;
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = {
  findOrCreate(uid_, email, displayName = '', photoURL = '') {
    if (_users.has(uid_)) return _users.get(uid_);
    const user = {
      _id: `mem-user-${uid_}`,
      firebaseUid: uid_,
      email: email || '',
      displayName: displayName || '',
      photoURL: photoURL || '',
      onboardingCompleted: false,
      preferences: { theme: 'dark', notifications: true, reminderTime: '20:00' },
      gamification: { xp: 0, level: 1, badges: [], currentStreak: 0, longestStreak: 0, lastActiveDate: new Date() },
      createdAt: new Date(),
    };
    _users.set(uid_, user);
    return user;
  },

  find(uid_) { return _users.get(uid_) || null; },

  addXP(uid_, amount) {
    const user = this.find(uid_);
    if (!user) return;
    user.gamification.xp    = (user.gamification.xp || 0) + amount;
    user.gamification.level = Math.floor(user.gamification.xp / 100) + 1;
  },

  updateStreak(uid_, productivityScore, yesterdayLog) {
    const user = this.find(uid_);
    if (!user) return;
    if (productivityScore > 0) {
      const g = user.gamification;
      if (yesterdayLog && yesterdayLog.productivityScore > 0) {
        g.currentStreak = (g.currentStreak || 0) + 1;
      } else {
        g.currentStreak = 1;
      }
      if (g.currentStreak > (g.longestStreak || 0)) {
        g.longestStreak = g.currentStreak;
      }
      g.lastActiveDate = new Date();
    }
  },
};
