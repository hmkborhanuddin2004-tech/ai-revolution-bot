/**
 * Assistant Intelligence & Orchestration Service
 * Handles intent detection, escalation checks, and two-reply generation.
 */

import { config } from '../config.js';
import { generatePublicAssistantReply } from './geminiService.js';
import { telegramAlertService } from './telegramAlertService.js';
import { agentEngine } from './agentEngine.js';

import { BORHAN_FB_PROFILE } from '../config.js';
export { BORHAN_FB_PROFILE };

export function cleanVisitorName(userName) {
  if (!userName || typeof userName !== 'string') return '';
  let name = userName.trim();

  // Filter out placeholders
  const lower = name.toLowerCase();
  const placeholders = [
    'বন্ধু', 'ইউজার', 'ভিজিটর', 'সম্মানিত ভিজিটর', 'গ্রাহক', 'সম্মানিত গ্রাহক',
    'facebook user', 'facebook visitor', 'user', 'visitor', 'guest', 'unknown',
    'admin', 'null', 'undefined'
  ];
  if (placeholders.includes(lower) || lower.includes('facebook')) {
    return '';
  }

  // Strip leading honorifics like জনাব, মুহতারাম, সম্মানিত
  name = name.replace(/^(?:সম্মানিত\s+)?(?:জনাব(?:\/জনাবা)?|জনাবা|মুহতারাম|মুহতারামা)\s+/iu, '');
  // Strip trailing titles like সাহেব, ভাই, আপু
  name = name.replace(/\s+(?:সাহেব|ভাই|আপু)$/iu, '');

  return name.trim();
}

export class AssistantService {
  constructor() {
    this.telegramAlert = telegramAlertService;

    // Escalation regex patterns for high-priority leads, projects, hiring, deals, calls
    this.escalationPatterns = [
      /hire|hiring|job|recruit|freelance|contract/i,
      /project|deal|client|order|order\s+korte/i,
      /website|web\s*development|software|app\s*development|bot\s*development|automation/i,
      /budget|cost|price|quotation|payment|khoroch|taka|rate|দাম|খরচ|বাজেট|টাকা/i,
      /urgent|emergency|call\s*me|phone|contact\s*number|জরুরি|ফোন|যোগাযোগ|নাম্বার|কল\s*করুন/i,
      /কাজ\s*দিতে\s*চাই|কাজ\s*করাতে\s*চাই|ডেভেলপার\s*লাগবে|ওয়েবসাইট\s*বানাতে\s*চাই|সফটওয়্যার\s*বানাতে\s*চাই/i,
      /অর্ডার\s*করতে\s*চাই|মিটিং|পার্টনারশিপ|চুক্তি|কথা\s*বলতে\s*চাই|পার্সোনালি\s*কথা|ইনবক্স\s*করব/i
    ];

    // Inquiry patterns (questions, pricing, how-to, service details)
    // Uses Unicode boundary patterns (?:^|[^\p{L}\p{M}\p{N}]) because \b does not match Bengali characters in JS RegExp
    this.inquiryPatterns = [
      /(?:^|[^\p{L}\p{M}\p{N}])(?:কী|কি|কেমন|কবে|কোথায়|কোথায়|কেন|কিভাবে|কীভাবে|কত|কোন|কোনটি|কার|কাকে)(?=[^\p{L}\p{M}\p{N}]|$)/u,
      /(?:^|[^\p{L}\p{M}\p{N}])(?:জানতে\s*চাই|বলবেন\s*কি|বলা\s*যাবে|পারি\s*কি|হবে\s*কি|করা\s*যাবে|শিখব|শিখতে\s*চাই|সাহায্য\s*লাগবে|হেল্প)(?=[^\p{L}\p{M}\p{N}]|$)/u,
      /\b(?:how|what|why|when|where|who|which|whose|whom|can\s+i|can\s+you|could\s+you|is\s+there|help|price|cost)\b/i
    ];
  }

  isAbusive(text) {
    if (!text || typeof text !== 'string') return false;
    const abusivePatterns = /কুত্তা|কুকুর|শুয়োর|শুয়ার|শালা|হারামি|হারামজাদা|খানকি|মাগি|মাগী|বেশ্যা|লেওড়া|লেওড়া|চোদা|চোদ|বাল|মাদারচোদ|ভোদ|খানকির|চুদা|গালি/i;
    return abusivePatterns.test(text.trim());
  }

  isEscalationNeeded(text) {
    if (!text || typeof text !== 'string') return false;
    const cleanText = text.trim();
    for (const pattern of this.escalationPatterns) {
      if (pattern.test(cleanText)) {
        return true;
      }
    }
    return false;
  }

  isSpecificInquiry(text) {
    if (!text || typeof text !== 'string') return false;
    const cleanText = text.trim();

    if (this.isEscalationNeeded(cleanText)) return true;
    if (/[?？]/.test(cleanText)) return true;

    for (const pattern of this.inquiryPatterns) {
      if (pattern.test(cleanText)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Process an incoming Facebook Post Comment.
   * - Abusive: Dignified warning (single reply)
   * - General Opinion / Feedback: Elegant single polite response with Borhan Sir's profile link
   * - Specific Inquiry / Escalation: Single comprehensive reply (Polite greeting + AI answer + profile link + escalation note if applicable)
   * Never posts a second comment (reply2 is always null for post comments).
   */
  async processComment({ userName, commentText, commentId, postId }) {
    // If abusive language, do NOT send welcome/gratitude reply; send polite dignity warning only
    if (this.isAbusive(commentText)) {
      return {
        reply1: 'আমাদের পেজে মার্জিত ও শালীন ভাষা বজায় রাখার জন্য বিনীত অনুরোধ জানাচ্ছি। ধন্যবাদ।',
        reply2: null,
        escalated: false
      };
    }

    const isEscalated = this.isEscalationNeeded(commentText);
    const hasSpecificInquiry = this.isSpecificInquiry(commentText);
    const cleanName = cleanVisitorName(userName);

    // If specific question or project inquiry / escalation:
    // Generate a single clean, dignified response containing greeting, contextual AI answer, profile link, and Telegram note
    if (hasSpecificInquiry || isEscalated) {
      const agentRes = await agentEngine.runAgent({
        userName: cleanName,
        userText: commentText,
        contextType: 'comment',
        userId: commentId,
        telegramAlert: this.telegramAlert
      });

      const aiAnswer = agentRes.reply;
      const finalEscalated = isEscalated || agentRes.escalated;

      let singleComment = `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। আমি বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট। আপনাকে কমেন্ট করার জন্য ধন্যবাদ।\n\n${aiAnswer}\n\nউনার সাথে পার্সোনালি কথা বলতে চাইলে উনার ফেসবুক লিঙ্কে যোগাযোগ করুন: ${BORHAN_FB_PROFILE}`;

      if (finalEscalated) {
        singleComment += '\n\n📌 (বোরহান স্যারকে আপনার এই গুরুত্বপূর্ণ বিষয়টি আমি সরাসরি টেলিগ্রামে জানিয়ে দিয়েছি, উনি ফ্রি হয়ে আপনার সাথে দ্রুত যোগাযোগ করবেন।)';

        // Trigger Telegram alert to Borhan Sir if not already triggered by agent tool
        if (!agentRes.toolsUsed.includes('escalate_to_telegram')) {
          await this.telegramAlert.sendEscalationAlert({
            senderName: userName || 'ভিজিটর',
            platform: 'Facebook Post Comment',
            text: commentText,
            referenceId: `Comment: ${commentId}`,
            link: postId ? `https://facebook.com/${postId}` : undefined
          });
        }
      }

      return { reply1: singleComment, reply2: null, escalated: finalEscalated, toolsUsed: agentRes.toolsUsed };
    }

    // For general opinions / reactions, single dignified greeting with Borhan Sir's profile link
    const generalReply = `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। আমি বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট। আপনাকে কমেন্ট করার জন্য অসংখ্য ধন্যবাদ।\n\nউনার সাথে পার্সোনালি কথা বলতে চাইলে উনার ফেসবুক লিঙ্কে যোগাযোগ করুন: ${BORHAN_FB_PROFILE}`;

    return { reply1: generalReply, reply2: null, escalated: false, toolsUsed: [] };
  }

  /**
   * Process an incoming Facebook Messenger direct message.
   * Generates dignified polite response:
   * Reply 1: Polite Introduction, Busy status & Borhan Sir's personal link
   * Reply 2: Contextual AI answer to their question (for inquiries/escalations)
   */
  async processMessengerMessage({ userName, messageText, senderPsid }) {
    if (this.isAbusive(messageText)) {
      return {
        reply1: 'আমাদের ইনবক্সে মার্জিত ও শালীন ভাষা বজায় রাখার জন্য বিনীত অনুরোধ জানাচ্ছি। ধন্যবাদ।',
        reply2: null,
        escalated: false,
        toolsUsed: []
      };
    }

    const isEscalated = this.isEscalationNeeded(messageText);
    const hasSpecificInquiry = this.isSpecificInquiry(messageText);

    // Reply 1: Dignified greeting, busy status & Borhan Sir's personal link
    const reply1 = `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। আমি বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট। আপনাকে মেসেজ করার জন্য অসংখ্য ধন্যবাদ।\n\nবোরহান স্যার সফটওয়্যার ডেভেলপমেন্ট, ওয়েবসাইট ও অটোমেশনের প্রজেক্ট কাজে ব্যস্ত থাকায় তাৎক্ষণিক উত্তর দিতে পারছেন না। উনার সাথে পার্সোনালি কথা বলতে চাইলে উনার ফেসবুক লিঙ্কে যোগাযোগ করুন: ${BORHAN_FB_PROFILE}\n\nআপনি কী বিষয়ে সহযোগিতা চান তা এখানে জানাতে পারেন, আমি আপনাকে আন্তরিকভাবে সহযোগিতা করার চেষ্টা করছি।`;

    let reply2 = null;
    let toolsUsed = [];

    if (hasSpecificInquiry || isEscalated) {
      const cleanName = cleanVisitorName(userName);
      const agentRes = await agentEngine.runAgent({
        userName: cleanName,
        userText: messageText,
        contextType: 'messenger',
        userId: senderPsid,
        telegramAlert: this.telegramAlert
      });

      reply2 = agentRes.reply;
      toolsUsed = agentRes.toolsUsed;
      const finalEscalated = isEscalated || agentRes.escalated;

      if (finalEscalated) {
        reply2 += '\n\n📌 (আপনার এই গুরুত্বপূর্ণ প্রজেক্ট/ইনকোয়ারিটি আমি বোরহান স্যারের সরাসরি টেলিগ্রামে অ্যালার্ট পাঠিয়ে দিয়েছি। উনি ব্যস্ততা শেষ করেই আপনার সাথে যোগাযোগ করবেন।)';

        // Trigger Telegram alert to Borhan Sir if not already dispatched by agent tool
        if (!agentRes.toolsUsed.includes('escalate_to_telegram')) {
          await this.telegramAlert.sendEscalationAlert({
            senderName: userName || 'মেসেঞ্জার গ্রাহক',
            platform: 'Facebook Messenger',
            text: messageText,
            referenceId: `PSID: ${senderPsid}`
          });
        }
      }

      return { reply1, reply2, escalated: finalEscalated, toolsUsed };
    }

    return { reply1, reply2, escalated: isEscalated, toolsUsed };
  }
}

export const assistantService = new AssistantService();
