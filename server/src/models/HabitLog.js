/**
 * src/models/HabitLog.js — Habit Daily Log Mongoose Model
 *
 * One document per (habit, date) pair.
 * Tracks whether the habit was completed on a specific calendar day.
 * Unique index prevents duplicate logs for the same habit on the same day.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const habitLogSchema = new Schema(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: [true, 'habitId is required'],
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },

    // ISO date string 'YYYY-MM-DD' — timezone-agnostic, determined by client locale
    date: {
      type: String,
      required: [true, 'date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'],
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // Optional user note for this log entry
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// One log per habit per day
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

const HabitLog = mongoose.model('HabitLog', habitLogSchema);
export default HabitLog;
