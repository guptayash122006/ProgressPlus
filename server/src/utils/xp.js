/**
 * src/utils/xp.js — Gamification Helpers
 *
 * Centralised functions for awarding XP and badges to users.
 * All badge keys are lower-snake-case strings.
 */

import User from '../models/User.js';
import logger from './logger.js';

/**
 * Award XP to a user and recalculate their level.
 * @param {mongoose.Types.ObjectId} userId  MongoDB User _id
 * @param {number} amount                   XP to award (positive integer)
 * @returns {Promise<User>}                 Updated user document
 */
export const awardXP = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.gamification.xp += amount;
  user.recalculateLevel();
  await user.save();

  logger.debug(`Awarded ${amount} XP to user ${userId} (total: ${user.gamification.xp}, level: ${user.gamification.level})`);
  return user;
};

/**
 * Award a badge to a user (idempotent — will not duplicate).
 * @param {mongoose.Types.ObjectId} userId  MongoDB User _id
 * @param {string} badge                    Badge key string
 * @returns {Promise<boolean>}              true if newly awarded, false if already had it
 */
export const awardBadge = async (userId, badge) => {
  const user = await User.findById(userId);
  if (!user) return false;

  if (user.gamification.badges.includes(badge)) return false;

  user.gamification.badges.push(badge);
  await user.save();

  logger.info(`Badge '${badge}' awarded to user ${userId}`);
  return true;
};

/**
 * Check task-completion milestones and award badges accordingly.
 * @param {User} user            Hydrated User document
 * @param {number} totalDone     Total completed tasks for this user
 */
export const checkTaskBadges = async (user, totalDone) => {
  const milestones = [
    { count: 1, badge: 'first_task' },
    { count: 10, badge: 'task_10' },
    { count: 50, badge: 'task_50' },
    { count: 100, badge: 'task_100' },
  ];

  for (const { count, badge } of milestones) {
    if (totalDone >= count) {
      await awardBadge(user._id, badge);
    }
  }
};

/**
 * Return today's date as a 'YYYY-MM-DD' string in local time (server-side UTC).
 */
export const todayString = () => new Date().toISOString().slice(0, 10);
