/**
 * Facebook Messenger Event Handler
 * Delivers dual-reply experience for page inbox direct messages.
 */

import { config } from '../config.js';
import { duplicateTracker } from './duplicateTracker.js';
import { assistantService } from './assistantService.js';
import { sendMessengerMessage } from './facebookService.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class MessengerHandler {
  constructor() {
    this.tracker = duplicateTracker;
    this.assistant = assistantService;
  }

  /**
   * Handles a Facebook Messenger messaging event.
   * @param {Object} event
   * @param {Object} event.sender - { id: string }
   * @param {Object} event.recipient - { id: string }
   * @param {Object} event.message - { mid: string, text: string, is_echo: boolean }
   * @param {string} [event.senderName] - Optional sender name
   */
  async handleMessage(event) {
    if (!event || !event.message) return;

    const senderPsid = event.sender?.id ? String(event.sender.id) : null;
    const messageId = event.message.mid ? String(event.message.mid) : null;
    const messageText = event.message.text || '';
    const isEcho = Boolean(event.message.is_echo);

    // Skip echo messages or messages from the page itself
    if (isEcho || !senderPsid || senderPsid === String(config.fbPageId)) {
      return;
    }

    // Skip already processed messages
    if (messageId && this.tracker.has(messageId)) {
      return;
    }
    if (messageId) {
      this.tracker.add(messageId);
    }

    // Handle text or attachments (stickers, thumbs-up, photos)
    const hasAttachments = Boolean(event.message.attachments && event.message.attachments.length > 0);
    let effectiveText = messageText.trim();

    if (!effectiveText) {
      if (hasAttachments) {
        effectiveText = '[ব্যবহারকারী মেসেঞ্জারে একটি স্টিকার বা ফাইল পাঠিয়েছেন]';
      } else {
        if (messageId) this.tracker.add(messageId);
        return;
      }
    }

    const userName = event.senderName || 'গ্রাহক';
    console.log(`[MessengerHandler] 📩 নতুন ইনবক্স মেসেজ [${senderPsid}]: "${effectiveText}"`);

    try {
      // Generate two replies
      const { reply1, reply2, escalated } = await this.assistant.processMessengerMessage({
        userName,
        messageText: effectiveText,
        senderPsid
      });

      // 1. Send Reply 1 (Polite Introduction & Busy status) if present
      if (reply1) {
        console.log(`[MessengerHandler] Reply 1 পাঠানো হচ্ছে...`);
        const res1 = await sendMessengerMessage(senderPsid, reply1);
        if (res1?.messageId) this.tracker.add(res1.messageId);

        // Pacing delay (1.5 seconds) if reply2 follows
        if (reply2) {
          await sleep(1500);
        }
      }

      // 2. Send Reply 2 (Contextual AI answer or warning)
      if (reply2) {
        console.log(`[MessengerHandler] Reply 2 পাঠানো হচ্ছে...`);
        const res2 = await sendMessengerMessage(senderPsid, reply2);
        if (res2?.messageId) this.tracker.add(res2.messageId);
      }

      // Mark processed on success
      if (messageId) this.tracker.add(messageId);
      console.log(`✅ মেসেঞ্জারে সফলভাবে উত্তর দেওয়া হয়েছে! (Reply2: ${Boolean(reply2)}, Escalated: ${escalated})`);
    } catch (err) {
      console.error(`[MessengerHandler] Failed handling message ${messageId || senderPsid}:`, err.message);
    }
  }
}

export const messengerHandler = new MessengerHandler();
