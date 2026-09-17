/**
 * Smart Polling Service
 * Allows Facebook AI Assistant to function autonomously without requiring a public Webhook tunnel.
 * Polls recent post comments and inbox messages periodically.
 */

import { config } from '../config.js';
import { getRecentPostsWithComments, getRecentConversations } from './facebookService.js';
import { commentHandler } from './commentHandler.js';
import { messengerHandler } from './messengerHandler.js';

export class PollingService {
  constructor() {
    this.interval = 40000; // 40 seconds
    this.timer = null;
    this.isPolling = false;
  }

  /**
   * Start polling loop.
   */
  start() {
    if (this.timer) return;
    console.log(`👂 স্মার্ট কমেন্ট ও মেসেঞ্জার পোলিং সক্রিয় (প্রতি ৪০ সেকেন্ডে চেক করবে)...`);

    // Run first iteration after 5 seconds
    setTimeout(() => this._pollCycle(), 5000);

    this.timer = setInterval(() => {
      this._pollCycle();
    }, this.interval);
  }

  /**
   * Stop polling loop.
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[PollingService] Polling service stopped.');
    }
  }

  async _pollCycle() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      await Promise.allSettled([
        this._pollComments(),
        this._pollMessages()
      ]);
    } catch (err) {
      // Ignored silently or logged if critical
    } finally {
      this.isPolling = false;
    }
  }

  /**
   * Poll comments from recent page posts.
   */
  async _pollComments() {
    const posts = await getRecentPostsWithComments(5);
    if (!posts || posts.length === 0) return;

    for (const post of posts) {
      const comments = post.comments?.data || [];
      for (const comment of comments) {
        comment.postId = post.id;
        await commentHandler.handleComment(comment);
      }
    }
  }

  /**
   * Poll inbox messages from recent conversations.
   */
  async _pollMessages() {
    const conversations = await getRecentConversations(5);
    if (!conversations || conversations.length === 0) return;

    for (const convo of conversations) {
      const messages = [...(convo.messages?.data || [])].reverse();
      for (const msg of messages) {
        const event = {
          sender: { id: msg.from?.id },
          recipient: { id: config.fbPageId },
          senderName: msg.from?.name,
          message: {
            mid: msg.id,
            text: msg.message,
            is_echo: msg.from?.id === String(config.fbPageId)
          }
        };
        await messengerHandler.handleMessage(event);
      }
    }
  }
}

export const pollingService = new PollingService();
