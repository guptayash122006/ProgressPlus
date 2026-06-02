/**
 * src/models/Task.js — Task Mongoose Model
 *
 * Represents a to-do / task item owned by a user.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    priority: {
      type: String,
      enum: {
        values: ['high', 'medium', 'low'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },

    category: {
      type: String,
      enum: {
        values: ['study', 'work', 'fitness', 'personal', 'health', 'custom'],
        message: '{VALUE} is not a valid category',
      },
      default: 'personal',
    },

    // Used when category === 'custom'
    customCategory: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    dueDate: {
      type: Date,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },

    tags: {
      type: [String],
      default: [],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Compound index for efficient user-scoped task queries sorted by due date
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, completed: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
