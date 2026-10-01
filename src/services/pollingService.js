/**
 * Smart Polling Service
 * Allows Facebook AI Assistant to function autonomously without requiring a public Webhook tunnel.
 * Polls recent post comments and inbox messages periodically.
 */

import { config } from '../config.js';
import { getRecentPostsWithComments, getRecentConversations } from './facebookService.js';
import { commentHandler } from './commentHandler.js';
import { messengerHandler } from './messengerHandler.js';
import { duplicateTracker } from './duplicateTracker.js';

export class PollingService {
  constructor() {
    this.interval = 30000; // 30 seconds
    this.timer = null;
    this.isPolling = false;
  }

  /**
   * Start polling loop.
   */
  start() {
    if (this.timer) return;
    console.log(`👂 স্মার্ট কমেন্ট ও মেসেঞ্জার পোলিং সক্রিয় (প্রতি ৩০ সেকেন্ডে চেক করবে)...`);

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
    const posts = await getRecentPostsWithComments(10);
    if (!posts || posts.length === 0) return;

    for (const post of posts) {
      const comments = post.comments?.data || [];
      for (const comment of comments) {
        comment.postId = post.id;

        // ১. লোকাল মেমোরি ট্র্যাকার চেক: এই সেশনে অলরেডি উত্তর দেওয়া হয়ে থাকলে স্কিপ
        if (duplicateTracker.has(comment.id)) {
          continue;
        }

        // ২. ফেসবুক ক্লাউড স্টেট লক: কমেন্টটির নিচে কি পেজ অলরেডি উত্তর দিয়ে রেখেছে?
        const nestedReplies = comment.comments?.data || [];
        const alreadyAnsweredByPage = nestedReplies.some(
          r => r.from?.id === String(config.fbPageId)
        );

        if (alreadyAnsweredByPage) {
          duplicateTracker.add(comment.id);
          continue;
        }

        // ৩. ২৪ ঘণ্টার বেশি পুরনো কমেন্ট হলে সিন মার্ক করে স্কিপ
        const commentTime = comment.created_time ? new Date(comment.created_time).getTime() : 0;
        if (commentTime && (Date.now() - commentTime) > 24 * 3600 * 1000) {
          duplicateTracker.add(comment.id);
          continue;
        }

        // ৪. রেস-কন্ডিশন ঠেকাতে সাথে সাথে ট্র্যাকার যোগ করা
        duplicateTracker.add(comment.id);

        await commentHandler.handleComment(comment);
      }
    }
  }

  /**
   * Poll inbox messages from recent conversations.
   * মেটার অফিশিয়াল ২৪ ঘণ্টার মেসেজিং উইন্ডো পলিসি:
   * ১. প্রতিটি কনভার্সেশনের সর্বশেষ মেসেজটি (messages[0]) বিবেচনা করা হবে।
   * ২. সর্বশেষ মেসেজ যদি পেজের নিজের হয়, তার মানে অলরেডি রিপ্লাই দেওয়া শেষ — কোনো রিপ্লাই দেবে না।
   * ৩. মেসেজটিতে যদি ইতোমধ্যেই উত্তর দেওয়া হয়ে থাকে, কোনো রিপ্লাই দেবে না।
   * ৪. মেসেজ যদি ২৪ ঘণ্টার বেশি পুরনো হয়, তবে স্কিপ করবে। কিন্তু ২৪ ঘণ্টার মধ্যকার যেকোনো নতুন মেসেজে তাৎক্ষণিক রেসপন্স করবে।
   */
  async _pollMessages() {
    const conversations = await getRecentConversations(10);
    if (!conversations || conversations.length === 0) return;

    for (const convo of conversations) {
      const messages = convo.messages?.data || [];
      if (messages.length === 0) continue;

      // Facebook Graph API returns messages ordered newest first (messages[0] is latest)
      const latestMsg = messages[0];
      if (!latestMsg || !latestMsg.id) continue;

      // ১. যদি কনভার্সেশনের সর্বশেষ মেসেজটি পেজের নিজের পাঠানো হয়, তার মানে অলরেডি রিপ্লাই দেওয়া শেষ
      if (latestMsg.from?.id === String(config.fbPageId)) {
        duplicateTracker.add(latestMsg.id);
        continue;
      }

      // ২. যদি এই সর্বশেষ মেসেজটিতে ইতোমধ্যে উত্তর দেওয়া হয়ে থাকে, তবে স্কিপ
      if (duplicateTracker.has(latestMsg.id)) {
        continue;
      }

      // ৩. মেসেজের বয়স চেক করা: ২৪ ঘণ্টার বেশি পুরনো হলে স্কিপ (মেটার স্ট্যান্ডার্ড উইন্ডো)
      const msgTime = latestMsg.created_time ? new Date(latestMsg.created_time).getTime() : 0;
      if (msgTime && (Date.now() - msgTime) > 24 * 3600 * 1000) {
        duplicateTracker.add(latestMsg.id);
        continue;
      }

      // ৪. ইউজারের পাঠানো আনকোরা নতুন মেসেজে রেসপন্স
      const event = {
        sender: { id: latestMsg.from?.id },
        recipient: { id: config.fbPageId },
        senderName: latestMsg.from?.name,
        message: {
          mid: latestMsg.id,
          text: latestMsg.message,
          is_echo: false
        }
      };

      // রেস কন্ডিশন ঠেকাতে ট্র্যাকার যোগ করা
      duplicateTracker.add(latestMsg.id);

      await messengerHandler.handleMessage(event);
    }
  }
}

export const pollingService = new PollingService();
