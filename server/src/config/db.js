/**
 * src/config/db.js — MongoDB Connection
 * Establishes a Mongoose connection with retry logic and structured logging.
 * If the initial connection fails the server still starts, but a background
 * reconnect loop retries every RECONNECT_INTERVAL_MS until it succeeds.
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MAX_RETRIES       = 3;              // attempts at startup (reduced to avoid long boot delay)
const RETRY_DELAY_MS    = 2000;          // delay between startup retries
const RECONNECT_INTERVAL_MS = 10_000;   // background retry interval after startup failure

/**
 * Global flag to track if MongoDB is connected.
 * Controllers check this before performing database operations.
 */
export let mongoConnected = false;

// Store the background retry timer so we can cancel it on reconnect
let _reconnectTimer = null;

/**
 * Register Mongoose lifecycle listeners exactly once.
 */
function _registerMongooseEvents() {
  mongoose.connection.off('disconnected', _onDisconnect);
  mongoose.connection.off('reconnected',  _onReconnect);
  mongoose.connection.on('disconnected',  _onDisconnect);
  mongoose.connection.on('reconnected',   _onReconnect);
}

function _onDisconnect() {
  mongoConnected = false;
  logger.warn('MongoDB disconnected — background reconnect loop will retry…');
  _scheduleReconnect();
}

function _onReconnect() {
  mongoConnected = true;
  logger.info('MongoDB reconnected ✅');
  _cancelReconnect();
}

/**
 * Start a background loop that keeps trying to connect until it succeeds.
 */
function _scheduleReconnect() {
  if (_reconnectTimer) return; // already scheduled
  _reconnectTimer = setInterval(async () => {
    if (mongoConnected) {
      _cancelReconnect();
      return;
    }
    logger.info('Background reconnect: attempting MongoDB connection…');
    try {
      const uri = process.env.MONGO_URI;
      if (!uri) return;
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      mongoConnected = true;
      logger.info('✅ MongoDB reconnected via background loop');
      _cancelReconnect();
      _registerMongooseEvents();
    } catch (err) {
      logger.warn(`Background reconnect failed: ${err.message} — will retry in ${RECONNECT_INTERVAL_MS / 1000}s`);
    }
  }, RECONNECT_INTERVAL_MS);
}

function _cancelReconnect() {
  if (_reconnectTimer) {
    clearInterval(_reconnectTimer);
    _reconnectTimer = null;
  }
}

/**
 * Attempt to connect to MongoDB at server startup.
 * Retries up to MAX_RETRIES times with linear back-off.
 * If all retries fail, starts the background reconnect loop and returns false.
 */
const connectDB = async (attempt = 1) => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoConnected = true;
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    _registerMongooseEvents();
    return true;
  } catch (err) {
    logger.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);

    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt;
      logger.info(`Retrying in ${delay / 1000}s… (${attempt}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(attempt + 1);
    }

    logger.warn(
      'MongoDB could not connect at startup. ' +
      `Server will start without database — background reconnect loop will retry every ${RECONNECT_INTERVAL_MS / 1000}s. ` +
      'Data operations will use in-memory fallback until the database is available.'
    );
    _scheduleReconnect(); // start background retry
    return false;
  }
};

export default connectDB;
