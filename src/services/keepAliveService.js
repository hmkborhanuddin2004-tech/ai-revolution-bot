/**
 * 24/7 Keep-Alive Service
 * Prevents Render.com free tier from sleeping (spinning down after 15m inactivity).
 * Pings the public health endpoint every 4 minutes to reset Render's idle timer.
 */

import { config } from '../config.js';

export class KeepAliveService {
  constructor() {
    this.intervalMs = 4 * 60 * 1000; // 4 minutes (well below Render's 15m limit)
    this.timer = null;
    this.isRunning = false;
  }

  /**
   * Determine the target URL to keep awake.
   */
  getTargetUrl() {
    // 1. If Render provides RENDER_EXTERNAL_URL env var
    if (process.env.RENDER_EXTERNAL_URL) {
      return `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/health`;
    }
    // 2. Default production Render URL
    if (process.env.RENDER || process.env.NODE_ENV === 'production') {
      return 'https://ai-revolution-bot.onrender.com/health';
    }
    // 3. Local fallback
    const port = process.env.PORT || '3001';
    return `http://localhost:${port}/health`;
  }

  /**
   * Start keep-alive loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const targetUrl = this.getTargetUrl();
    console.log(`💓 [KeepAlive] ২৪/৭ সার্ভার সজাগ রাখার সিস্টেম সক্রিয় হয়েছে -> ${targetUrl}`);

    // First ping after 20 seconds of server startup
    setTimeout(() => this._ping(targetUrl), 20000);

    // Recurring ping every 4 minutes
    this.timer = setInterval(() => {
      this._ping(targetUrl);
    }, this.intervalMs);
  }

  /**
   * Stop keep-alive loop.
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[KeepAlive] Keep-alive service stopped.');
  }

  /**
   * Execute single ping.
   */
  async _ping(url) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'AiRevolution-KeepAlive/2.0' },
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        const now = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' });
        console.log(`💓 [KeepAlive ${now}] সার্ভার সজাগ ও সক্রিয় আছে (HTTP ${res.status})`);
      } else {
        console.warn(`⚠️ [KeepAlive] পিং স্ট্যাটাস: HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn(`⚠️ [KeepAlive] পিং করতে সমস্যা (স্বাভাবিক রিট্রাই হবে): ${err.message}`);
    }
  }
}

export const keepAliveService = new KeepAliveService();
