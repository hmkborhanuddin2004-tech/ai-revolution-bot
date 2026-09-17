/**
 * Facebook Comment Event Handler
 * Delivers a single dignified reply for post comments.
 */

import { config } from '../config.js';
import { duplicateTracker } from './duplicateTracker.js';
import { assistantService } from './assistantService.js';
import { replyToComment } from './facebookService.js';

export class CommentHandler {
  constructor() {
    this.tracker = duplicateTracker;
    this.assistant = assistantService;
  }

  /**
   * Handles a Facebook comment event.
   * @param {Object} comment
   * @param {string} comment.id - Comment ID
   * @param {string} comment.message - Comment body
   * @param {Object} [comment.from] - Sender info
   * @param {string} [comment.postId] - Post ID
   */
  async handleComment(comment) {
    if (!comment || !comment.id) return;

    const commentId = String(comment.id);
    const senderId = comment.from?.id ? String(comment.from.id) : null;
    const senderName = comment.from?.name || null;
    const message = comment.message || '';

    // Ignore if already answered
    if (this.tracker.has(commentId)) {
      return;
    }

    // Ignore if comment is from the page itself OR from Borhan Sir (Page Owner/Creator)
    const isOwner = (
      (senderId && senderId === String(config.fbPageId)) ||
      (senderName && /borhan|বোরহান/i.test(senderName))
    );

    if (isOwner) {
      console.log(`[CommentHandler] 🛡️ পেজ ওনার/অ্যাডমিন (${senderName || senderId}) এর কমেন্ট - বট অটো-রিপ্লাই স্কিপ করছে।`);
      this.tracker.add(commentId);
      return;
    }

    // Support sticker or media comments
    const hasAttachment = Boolean(comment.attachment);
    let effectiveMessage = message.trim();

    if (!effectiveMessage) {
      if (hasAttachment) {
        effectiveMessage = '[ব্যবহারকারী একটি স্টিকার বা রিঅ্যাকশন পাঠিয়েছেন]';
      } else {
        // Truly empty comment
        this.tracker.add(commentId);
        return;
      }
    }

    console.log(`[CommentHandler] 💬 নতুন কমেন্ট পাওয়া গেছে [${senderName}]: "${effectiveMessage}"`);

    try {
      // Process comment - returns a single dignified reply (no split Reply 2 on comments)
      const { reply1, reply2, escalated } = await this.assistant.processComment({
        userName: senderName,
        commentText: effectiveMessage,
        commentId: commentId,
        postId: comment.postId
      });

      // Always send only ONE single comment on Facebook posts
      const singleReply = reply1 || reply2;
      if (singleReply) {
        console.log(`[CommentHandler] কমেন্টে উত্তর পাঠানো হচ্ছে...`);
        const res = await replyToComment(commentId, singleReply);
        if (res?.commentId) this.tracker.add(res.commentId);
      }

      // সফলভাবে উত্তর পাঠানো শেষ হলে ট্র্যাকার যোগ করা
      this.tracker.add(commentId);
      console.log(`✅ কমেন্টে সফলভাবে উত্তর দেওয়া হয়েছে! (Escalated: ${escalated})`);
    } catch (err) {
      console.error(`[CommentHandler] Failed handling comment ${commentId}:`, err.message);
    }
  }
}

export const commentHandler = new CommentHandler();
