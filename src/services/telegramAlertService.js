/**
 * Telegram Escalation Alert Service
 * Sends instant notifications to Borhan Sir when high-value leads or inquiries occur.
 */

import { config } from '../config.js';

export class TelegramAlertService {
  constructor() {
    this.botToken = config.telegramBotToken;
    this.chatId = config.telegramChatId;
  }

  /**
   * Sends a structured high-priority escalation alert to Borhan Sir on Telegram.
   * @param {Object} details
   * @param {string} details.senderName - Name of the user
   * @param {string} details.platform - 'Facebook Messenger' or 'Facebook Post Comment'
   * @param {string} details.text - Message or comment content
   * @param {string} [details.referenceId] - Post ID, Comment ID, or User PSID
   * @param {string} [details.link] - Direct URL if available
   */
  async sendEscalationAlert({ senderName, platform, text, referenceId, link }) {
    if (!this.botToken || !this.chatId) {
      console.warn('[TelegramAlertService] Telegram token or chatId not configured. Skipping alert.');
      return false;
    }

    const timestamp = new Date().toLocaleString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const messageLines = [
      '🚨 <b>[জরুরি ক্লায়েন্ট নোটিফিকেশন - এআই অ্যাসিস্ট্যান্ট]</b> 🌸',
      '',
      `👤 <b>ক্লায়েন্টের নাম:</b> ${this._escapeHtml(senderName || 'অপরিচিত')}`,
      `📱 <b>মাধ্যম:</b> ${platform}`,
      `💬 <b>বার্তা:</b> "<i>${this._escapeHtml(text || '')}</i>"`,
      referenceId ? `🆔 <b>আইডি / রেফারেন্স:</b> <code>${referenceId}</code>` : '',
      link ? `🔗 <b>সরাসরি লিঙ্ক:</b> <a href="${link}">${link}</a>` : '',
      `⏰ <b>সময়:</b> ${timestamp}`,
      '',
      '📌 <b>অ্যাসিস্ট্যান্ট প্রতিক্রিয়া:</b> ব্যবহারকারীকে জানানো হয়েছে যে আপনি ব্যস্ত আছেন এবং এই জরুরি বার্তাটি আপনার কাছে সরাসরি পৌঁছে দেওয়া হয়েছে। ফ্রি হয়ে যোগাযোগ করুন।'
    ].filter(Boolean).join('\n');

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: messageLines,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      const data = await res.json();
      return data.ok;
    } catch (err) {
      console.error('[TelegramAlertService] Failed to send Telegram alert:', err.message);
      return false;
    }
  }

  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

export const telegramAlertService = new TelegramAlertService();
