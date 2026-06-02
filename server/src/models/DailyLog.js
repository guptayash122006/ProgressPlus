/**
 * src/models/DailyLog.js — Daily Summary Mongoose Model
 *
 * Aggregated snapshot of a user's productivity for a given calendar date.
 * Used by analytics endpoints to return historical performance without
 * re-querying tasks/habits every time.
 * Unique index prevents duplicate summaries for the same user+date pair.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const dailyLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },

    // ISO date string 'YYYY-MM-DD'
    date: {
      type: String,
      required: [true, 'date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'],
    },

    tasksTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    tasksDone: {
      type: Number,
      default: 0,
      min: 0,
    },

    habitsTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    habitsDone: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Composite score 0-100 calculated on save
    productivityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// One summary per user per day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);
export default DailyLog;
