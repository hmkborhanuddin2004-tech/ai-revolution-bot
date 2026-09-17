/**
 * AI Revolution Autonomous Agent Tools & Function Declarations
 * Equips the agent with real-time tool execution capabilities.
 */

import { telegramAlertService } from './telegramAlertService.js';
import { BORHAN_FB_PROFILE } from '../config.js';
import { generateTieredPost } from './geminiService.js';
import { generateImageUrl } from './imageService.js';

export const AGENT_TOOL_DECLARATIONS = [
  {
    name: 'get_borhan_profile_services',
    description: 'বোরহান স্যারের (HMk Borhan Uddin) প্রফেশনাল ব্যাকগ্রাউন্ড, স্কিল, ডেভেলপমেন্ট সার্ভিস ও কাজের নমুনা জানতে এই টুল ব্যবহার করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: {
          type: 'STRING',
          description: 'সার্ভিসের ধরন যেমন: web, software, bot, automation, ai, portfolio'
        }
      }
    }
  },
  {
    name: 'search_ai_knowledge',
    description: 'এআই টুলস, ফ্রেমওয়ার্ক, প্রম্পট ইঞ্জিনিয়ারিং, ফ্রিল্যান্সিং বা টেকনোলজি বিষয়ক তথ্যের জন্য নলেজবেস অনুসন্ধান করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'যে বিষয়ে তথ্য জানতে চাওয়া হয়েছে (যেমন: deepseek, chatgpt, n8n, automation)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'escalate_to_telegram',
    description: 'ভিজিটর যখন সরাসরি কাজ দিতে চায়, প্রোজেক্টের চুক্তি, বাজেট, জরুরি কল বা বোরহান স্যারের সাথে পার্সোনাল মিটিং করতে চায়, তখন টেলিগ্রামে জরুরি অ্যালার্ট পাঠাতে এই টুল ব্যবহার করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        clientName: {
          type: 'STRING',
          description: 'ক্লায়েন্ট বা ভিজিটরের নাম'
        },
        projectType: {
          type: 'STRING',
          description: 'প্রজেক্টের ক্যাটাগরি (ওয়েবসাইট, সফটওয়্যার, অটোমেশন ইত্যাদি)'
        },
        clientMessage: {
          type: 'STRING',
          description: 'ক্লায়েন্টের মূল মেসেজ বা বিস্তারিত'
        },
        urgency: {
          type: 'STRING',
          description: 'জরুরিতা: high, medium'
        }
      },
      required: ['clientMessage']
    }
  },
  {
    name: 'get_faq_answer',
    description: 'Ai Revolution পেজের উদ্দেশ্য, পোস্ট শিডিউল, এবং এআই রিসোর্স বিষয়ক সাধারণ প্রশ্নোত্তর জানতে এই টুল ব্যবহার করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        topic: {
          type: 'STRING',
          description: 'টপিক: schedule, page_mission, prompt_lab, postcard'
        }
      },
      required: ['topic']
    }
  },
  {
    name: 'craft_high_standard_post',
    description: 'ফেসবুক পেজ Ai Revolution-এর জন্য Altiam Kabir ও AI Varsity Bangla স্ট্যান্ডার্ডের একটি আকর্ষণীয় পোস্ট ও কপি-পেস্ট প্রম্পট তৈরি করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        topic: {
          type: 'STRING',
          description: 'পোস্টের বিষয় বা মূল টপিক (যেমন: DeepSeek v3, Prompt Engineering, N8N Automation)'
        },
        tierLevel: {
          type: 'NUMBER',
          description: 'পোস্টের স্তর: 1 (বিগিনার), 2 (এআই পোস্ট কার্ড), 3 (অ্যাডভান্সড), 4 (ডেইলি প্রম্পট ল্যাব)'
        }
      },
      required: ['topic']
    }
  },
  {
    name: 'create_cinematic_image',
    description: 'পোস্টের বিষয়ের ওপর ভিত্তি করে ১০৮০x১০৮০ আল্ট্রা-রিয়েলিস্টিক Flux AI সিনেমাটিক ৩ডি ইমেজ তৈরি করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        visualConcept: {
          type: 'STRING',
          description: 'ছবির ইংরেজি ভিজ্যুয়াল কনসেপ্ট ও দৃশ্যপট'
        }
      },
      required: ['visualConcept']
    }
  },
  {
    name: 'evaluate_post_quality',
    description: 'কোনো পোস্টের ক্যাপশন বিশ্লেষণ করে তার হুক, কপি-পেস্ট প্রম্পটের মান ও ফেসবুক এনগেজমেন্ট স্কোর মূল্যায়ন করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        draftContent: {
          type: 'STRING',
          description: 'মূল্যায়ন করার জন্য পোস্টের ক্যাপশন'
        }
      },
      required: ['draftContent']
    }
  },
  {
    name: 'craft_viral_workflow_post',
    description: 'AI for Everyone Daily স্টাইলে ৬০ সেকেন্ডের মাল্টি-টুল (যেমন: ChatGPT + Flux + Canva) ভাইরাল সোশ্যাল মিডিয়া পোস্টার ও বিজ্ঞাপন ব্লুপ্রিন্ট তৈরি করো।',
    parameters: {
      type: 'OBJECT',
      properties: {
        niche: {
          type: 'STRING',
          description: 'ক্যাটাগরি বা নিশ (যেমন: restaurant, ecommerce, realestate, faceless_reels, landing_page, cv_portfolio)'
        }
      },
      required: ['niche']
    }
  }
];

// Curated internal knowledge base for instant, deterministic, and accurate responses
const AI_KNOWLEDGE_BASE = {
  'gemini': 'গুগল জেমিনি (Gemini 2.5/3 Flash) গুগলের মাল্টি-মডেল এআই, যা টেক্সট, কোড ও ছবি নিখুঁতভাবে প্রসেস করতে পারে।',
  'deepseek': 'DeepSeek একটি অত্যন্ত শক্তিশালী ওপেন-ওয়েট মডেল, বিশেষ করে কোডিং ও ম্যাথমেটিক্যাল রিজনিংয়ে অনন্য।',
  'chatgpt': 'ChatGPT ওপেনএআই-এর ফ্ল্যাগশিপ মডেল, যা কনভারসেশন, আর্টিকেল ও সাধারণ প্রশ্নের জন্য বহুল ব্যবহৃত।',
  'flux': 'Flux হলো ব্ল্যাক ফরেস্ট ল্যাবসের ওপেন-সোর্স স্টেট-অব-দ্য-আর্ট ইমেজ জেনারেশন মডেল, যা ফটোরিয়ালিস্টিক ছবি তৈরিতে সেরা।',
  'automation': 'নো-কোড অটোমেশন টুল যেমন n8n, Make ও পাইথন স্ক্রিপ্ট দিয়ে ফেসবুক, টেলিগ্রাম ও ডেটা প্রসেসিং ১০০% স্বয়ংক্রিয় করা যায়।',
  'prompt': 'একটি ভালো প্রম্পটের কাঠামো: [রোল/ভূমিকা] + [সুনির্দিষ্ট কাজ/টাস্ক] + [কনটেক্সট] + [আউটপুট ফরম্যাট ও সীমাবদ্ধতা]।',
  'default': 'Ai Revolution প্ল্যাটফর্ম নিয়মিত বাস্তবসম্মত এআই গাইডলাইন, নো-কোড অটোমেশন ও প্রম্পট রেসিপি শেয়ার করে থাকে।'
};

/**
 * Executes a tool called by the Gemini Agent.
 * @param {string} toolName
 * @param {Object} args
 * @param {Object} context
 * @returns {Promise<Object>}
 */
export async function executeAgentTool(toolName, args = {}, context = {}) {
  try {
    switch (toolName) {
      case 'get_borhan_profile_services': {
        return {
          developerName: 'HMk Borhan Uddin (বোরহান স্যার)',
          role: 'Full Stack Software Engineer & Automation Architect',
          skills: ['Web Development (React, Next.js, Node.js)', 'Python Scripting & Automation', 'Custom AI Agents & Telegram/FB Bots', 'Database Architecture'],
          servicesOffered: [
            'কাস্টম বিজনেস ওয়েবসাইট ও ওয়েব অ্যাপ ডেভেলপমেন্ট',
            'ফেসবুক ও টেলিগ্রাম এআই চ্যাটবট ও অটোমেশন সিস্টেম',
            'ব্যবসার সময় ও খরচ বাঁচানোর জন্য কাস্টম অটোমেশন সলিউশন',
            'এআই ইন্টিগ্রেশন ও টেকনিক্যাল কনসাল্টেন্সি'
          ],
          portfolioLink: BORHAN_FB_PROFILE,
          status: 'বর্তমানে প্রজেক্টের কাজে ব্যস্ত, তবে নতুন মানসম্মত প্রজেক্টের কাজ গ্রহণ করছেন।'
        };
      }

      case 'search_ai_knowledge': {
        const q = (args.query || '').toLowerCase();
        let foundContent = AI_KNOWLEDGE_BASE['default'];
        for (const [key, value] of Object.entries(AI_KNOWLEDGE_BASE)) {
          if (q.includes(key)) {
            foundContent = value;
            break;
          }
        }
        return {
          query: args.query,
          insight: foundContent,
          pagePillars: 'ইমেজ এআই, ভিডিও এআই, ভয়েস এআই ও এআই অটোমেশন'
        };
      }

      case 'escalate_to_telegram': {
        const senderName = args.clientName || context.userName || 'আগ্রহী ক্লায়েন্ট';
        const projectType = args.projectType || 'প্রজেক্ট আলোচনা';
        const text = args.clientMessage || context.userText || 'ক্লায়েন্ট যোগাযোগ করতে চেয়েছেন';

        const alertService = context.telegramAlert || telegramAlertService;
        await alertService.sendEscalationAlert({
          senderName,
          platform: context.contextType === 'messenger' ? 'Facebook Messenger' : 'Facebook Page Comment',
          text: `[${projectType}] ${text}`,
          referenceId: context.referenceId || 'Agent Auto-Escalation'
        });

        return {
          status: 'success',
          notified: true,
          message: 'বোরহান স্যারের টেলিগ্রামে জরুরি নোটিফিকেশন পাঠানো হয়েছে। উনি দ্রুত ক্লায়েন্টের সাথে যোগাযোগ করবেন।'
        };
      }

      case 'get_faq_answer': {
        const topic = (args.topic || '').toLowerCase();
        if (topic.includes('schedule') || topic.includes('সময়')) {
          return {
            schedule: 'প্রতিদিন ৪টি সময়ে পোস্ট হয়: সকাল ১০:০০ (বিগিনার), দুপুর ২:০০ (পোস্ট কার্ড), বিকাল ৫:১৫ (ডেইলি প্রম্পট ল্যাব), ও রাত ৮:৩০ (অ্যাডভান্সড)।'
          };
        }
        if (topic.includes('postcard') || topic.includes('কার্ড')) {
          return {
            postcard: 'পোস্ট কার্ড হলো প্রতিদিন দুপুর ২:০০ টার বিশেষ ভিজ্যুয়াল ইমেজ কার্ড যাতে একটি কার্যকর এআই হ্যাক শেখানো হয়।'
          };
        }
        return {
          mission: 'Ai Revolution-এর লক্ষ্য হলো বাংলাভাষী শিক্ষার্থী ও তরুণদের এআই ও নো-কোড অটোমেশনে দক্ষ করে তোলা।'
        };
      }

      case 'craft_high_standard_post': {
        const topic = args.topic || 'এআই প্রোডাক্টিভিটি হ্যাকস';
        const tier = Number(args.tierLevel) || 4;
        const post = await generateTieredPost(tier, { title: topic, description: topic });
        return {
          title: post.title,
          content: post.content,
          firstComment: post.firstComment,
          image_prompt: post.image_prompt,
          tierName: post.tierName
        };
      }

      case 'create_cinematic_image': {
        const concept = args.visualConcept || 'Futuristic AI workspace';
        const imageUrl = await generateImageUrl(concept);
        return {
          imageUrl,
          visualConcept: concept,
          resolution: '1080x1080 (Optimized for Facebook Post & Feed)'
        };
      }

      case 'evaluate_post_quality': {
        const draft = args.draftContent || '';
        const hasHook = !draft.startsWith('আজকের বিষয়') && !draft.startsWith('[') && draft.length > 30;
        const hasPrompt = draft.includes('প্রম্পট') || draft.includes('ব্লুপ্রিন্ট') || draft.includes('কপি-পেস্ট');
        const hasHashtags = (draft.match(/#[a-zA-Z0-9_\u0980-\u09FF]+/g) || []).length >= 3;
        const hasCTA = draft.includes('সেভ') || draft.includes('শেয়ার') || draft.includes('কমেন্ট');

        let score = 7.0;
        if (hasHook) score += 1.0;
        if (hasPrompt) score += 1.0;
        if (hasHashtags) score += 0.5;
        if (hasCTA) score += 0.5;

        return {
          qualityScore: `${Math.min(score, 10).toFixed(1)}/10`,
          benchmark: 'Altiam Kabir & AI Varsity Bangla Standards',
          analysis: {
            hookCheck: hasHook ? 'চমৎকার ও সরাসরি আকর্ষণীয় হুক বিদ্যমান' : 'হুক আরও স্পষ্ট ও কৌতূহলোদ্দীপক করা প্রয়োজন',
            promptCheck: hasPrompt ? 'কপি-পেস্ট উপযোগী প্রম্পট বা সুনির্দিষ্ট ফ্রেমওয়ার্ক রয়েছে' : 'ব্যবহারকারীদের জন্য রেডিমেড প্রম্পট যুক্ত করার পরামর্শ দেওয়া হচ্ছে',
            engagementCTA: hasCTA ? 'কার্যকর কল-টু-অ্যাকশন (CTA) সংযুক্ত আছে' : 'পাঠকদের সেভ বা শেয়ার করার আহ্বান যোগ করুন',
            hashtagOptimization: hasHashtags ? 'যথাযথ রিচ-ফ্রেন্ডলি হ্যাশট্যাগ বর্তমান' : '৩-৫টি প্রাসঙ্গিক হ্যাশট্যাগ যুক্ত করুন'
          }
        };
      }

      case 'craft_viral_workflow_post': {
        const { generateViralWorkflowPost } = await import('./geminiService.js');
        const niche = args.niche || 'restaurant';
        const post = await generateViralWorkflowPost(niche);
        return {
          title: post.title,
          content: post.content,
          firstComment: post.firstComment,
          image_prompt: post.image_prompt,
          tierName: post.tierName
        };
      }

      default:
        return { error: `অজানা টুল: ${toolName}` };
    }
  } catch (err) {
    console.error(`[executeAgentTool] Error executing ${toolName}:`, err.message);
    return { error: err.message };
  }
}
