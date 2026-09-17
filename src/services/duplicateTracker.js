/**
 * Duplicate & Processed Event Tracker
 * Prevents answering the same comment ID or message ID more than once.
 * Persists to JSON file on disk.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('D:/ai-insight-bot/data');
const DATA_FILE = path.join(DATA_DIR, 'processed_events.json');

export class DuplicateTracker {
  constructor() {
    this.processedIds = new Set();
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
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.processedIds = new Set(list);
        }
      } else {
        this._saveToDisk();
      }
    } catch (err) {
      console.error('[DuplicateTracker] Error initializing store:', err.message);
      this.processedIds = new Set();
    }
  }

  _saveToDisk() {
    try {
      const arr = Array.from(this.processedIds);
      if (arr.length > this.maxEntries) {
        arr.splice(0, arr.length - this.maxEntries);
        this.processedIds = new Set(arr);
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf-8');
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
}

export const duplicateTracker = new DuplicateTracker();
