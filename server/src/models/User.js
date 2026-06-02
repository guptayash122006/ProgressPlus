/**
 * src/models/User.js — User Mongoose Model
 *
 * One document per Firebase authenticated user.
 * Stores profile info, preferences, and gamification state.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // Firebase UID — primary cross-reference key
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },

    displayName: {
      type: String,
      trim: true,
    },

    photoURL: {
      type: String,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // User-configurable app preferences
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'dark',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: '20:00',
        match: [/^\d{2}:\d{2}$/, 'reminderTime must be in HH:MM format'],
      },
    },

    // XP / level / badges / streaks
    gamification: {
      xp: { type: Number, default: 0, min: 0 },
      level: { type: Number, default: 1, min: 1 },
      badges: { type: [String], default: [] },
      currentStreak: { type: Number, default: 0, min: 0 },
      longestStreak: { type: Number, default: 0, min: 0 },
      lastActiveDate: { type: Date },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Avoid adding a second `createdAt` via timestamps: true — we define it manually
    versionKey: false,
  }
);

/**
 * Calculate user level based on XP thresholds.
 * Level 1: 0–99 XP, Level 2: 100–249 XP, Level 3: 250–499 XP, …
 */
userSchema.methods.recalculateLevel = function () {
  const thresholds = [0, 100, 250, 500, 850, 1300, 1900, 2700, 3700, 5000];
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (this.gamification.xp >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }
  this.gamification.level = level;
};

const User = mongoose.model('User', userSchema);
export default User;
