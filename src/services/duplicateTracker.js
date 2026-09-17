/**
 * Duplicate & Processed Event Tracker
 * Prevents answering the same comment ID or message ID more than once.
 * Persists to JSON file on disk.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = fs.existsSync('D:/ai-insight-bot/data')
  ? path.resolve('D:/ai-insight-bot/data')
  : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'processed_events.json');

export class DuplicateTracker {
  constructor() {
    this.processedIds = new Set();
    this.greetedUsers = new Map(); // psid -> timestamp
    this.maxEntries = 3000;
    this._initStore();
  }

  _initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          // Legacy array format
          this.processedIds = new Set(parsed);
        } else if (parsed && typeof parsed === 'object') {
          // New format with greetedUsers
          if (Array.isArray(parsed.processedIds)) {
            this.processedIds = new Set(parsed.processedIds);
          }
          if (parsed.greetedUsers && typeof parsed.greetedUsers === 'object') {
            this.greetedUsers = new Map(Object.entries(parsed.greetedUsers));
          }
        }
      } else {
        this._saveToDisk();
      }
    } catch (err) {
      console.error('[DuplicateTracker] Error initializing store:', err.message);
      this.processedIds = new Set();
      this.greetedUsers = new Map();
    }
  }

  _saveToDisk() {
    try {
      const arr = Array.from(this.processedIds);
      if (arr.length > this.maxEntries) {
        arr.splice(0, arr.length - this.maxEntries);
        this.processedIds = new Set(arr);
      }

      // Cleanup old greeted users older than 48 hours
      const cutoff = Date.now() - (48 * 3600 * 1000);
      for (const [psid, time] of this.greetedUsers.entries()) {
        if (time < cutoff) {
          this.greetedUsers.delete(psid);
        }
      }

      const payload = {
        processedIds: arr,
        greetedUsers: Object.fromEntries(this.greetedUsers)
      };

      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DuplicateTracker] Error saving to disk:', err.message);
    }
  }

  has(id) {
    if (!id) return false;
    return this.processedIds.has(String(id));
  }

  add(id) {
    if (!id) return;
    this.processedIds.add(String(id));
    this._saveToDisk();
  }

  /**
   * Check if a user has already received the formal intro greeting within the last 24 hours.
   */
  isUserGreeted(psid, windowMs = 24 * 3600 * 1000) {
    if (!psid) return false;
    const lastTime = this.greetedUsers.get(String(psid));
    if (!lastTime) return false;
    return (Date.now() - lastTime) < windowMs;
  }

  /**
   * Mark a user as having received the formal greeting.
   */
  markUserGreeted(psid) {
    if (!psid) return;
    this.greetedUsers.set(String(psid), Date.now());
    this._saveToDisk();
  }
}

export const duplicateTracker = new DuplicateTracker();
