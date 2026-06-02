/**
 * src/models/Habit.js — Habit Mongoose Model
 *
 * A recurring behaviour the user wants to track.
 * Streak and completion counts are maintained here; per-day logs live in HabitLog.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const habitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name cannot exceed 100 characters'],
    },

    // Emoji icon displayed in the UI
    icon: {
      type: String,
      default: '⭐',
    },

    // Hex colour for the habit card
    color: {
      type: String,
      default: '#7c5cfc',
    },

    frequency: {
      type: String,
      enum: {
        values: ['daily', 'weekly'],
        message: '{VALUE} is not a valid frequency',
      },
      default: 'daily',
    },

    // For weekly habits — which days of the week (0 = Sunday, 6 = Saturday)
    targetDays: {
      type: [Number],
      default: [],
      validate: {
        validator: (days) => days.every((d) => d >= 0 && d <= 6),
        message: 'targetDays must contain values between 0 (Sun) and 6 (Sat)',
      },
    },

    // Current consecutive-day streak
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCompletions: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
