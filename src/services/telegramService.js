import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { publishToFacebook, replyToComment, uploadReelToFacebook } from './facebookService.js';
import { chatWithGemini, WEEKLY_SCHEDULE, sanitizePostContent, formatWeeklyScheduleMessage } from './geminiService.js';
import { processAssistantMessage, processFile, processPhoto } from './personalAssistantService.js';
import { getLocalCachedImagePath, generateImageUrl } from './imageService.js';
import { createAiReel } from './reelsService.js';

const DRAFT_FILE = path.resolve('D:/ai-insight-bot/data/latestDraft.json');

export function saveLatestDraft(draft) {
  try {
    fs.writeFileSync(DRAFT_FILE, JSON.stringify(draft, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save draft:', err);
  }
}

export function getLatestDraft() {
  try {
    if (fs.existsSync(DRAFT_FILE)) {
      return JSON.parse(fs.readFileSync(DRAFT_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read draft:', err);
  }
  return null;
}

export async function sendTelegramMessage(text, targetChatId = config.telegramChatId, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
  const payload = {
    chat_id: targetChatId,
    text: text,
    parse_mode: 'Markdown'
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.ok && data.description?.includes('can\'t parse entities')) {
      // Fallback without Markdown
      delete payload.parse_mode;
      const retryRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await retryRes.json();
    }
    return data;
  } catch (err) {
    console.error('Telegram sendMessage error:', err);
  }
}

export async function sendTelegramPhoto(targetChatId, imageUrl, caption = '') {
  try {
    const photoApiUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendPhoto`;

    // Telegram caption limit is 1024 characters
    let safeCaption = caption || '';
    let overflowMessage = null;
    if (safeCaption.length > 1024) {
      overflowMessage = safeCaption;
      safeCaption = safeCaption.substring(0, 1000) + '...';
    }

    // ০. সরাসরি Buffer অথবা ArrayBuffer পাঠানো হলে
    if (Buffer.isBuffer(imageUrl) || (imageUrl && imageUrl.constructor && imageUrl.constructor.name === 'ArrayBuffer')) {
      try {
        const buffer = Buffer.isBuffer(imageUrl) ? imageUrl : Buffer.from(imageUrl);
        const formData = new FormData();
        formData.append('chat_id', targetChatId);
        formData.append('photo', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
        if (safeCaption) {
          formData.append('caption', safeCaption);
          formData.append('parse_mode', 'Markdown');
        }
        const res = await fetch(photoApiUrl, { method: 'POST', body: formData, signal: AbortSignal.timeout(25000) });
        const data = await res.json();
        if (data.ok) {
          if (overflowMessage) {
            await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
          }
          return { ok: true, data };
        }

        if (safeCaption && data.description?.includes('can\'t parse entities')) {
          const retryFormData = new FormData();
          retryFormData.append('chat_id', targetChatId);
          retryFormData.append('photo', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
          retryFormData.append('caption', safeCaption);
          const retryRes = await fetch(photoApiUrl, { method: 'POST', body: retryFormData, signal: AbortSignal.timeout(25000) });
          const retryData = await retryRes.json();
          if (retryData.ok) {
            if (overflowMessage) {
              await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
            }
            return { ok: true, data: retryData };
          }
        }
      } catch (bErr) {
        console.warn('sendPhoto direct buffer upload warning:', bErr.message);
      }
    }

    // ১. যদি লোকাল ফাইল বা প্রি-ওয়ার্মড ক্যাশ ফাইল হয় (মোবাইল আপলোড বা লোকাল ক্যাশ করা ছবি)
    const localTarget = getLocalCachedImagePath(imageUrl) || (imageUrl && typeof imageUrl === 'string' && fs.existsSync(imageUrl) ? imageUrl : null);
    if (localTarget) {
      try {
        const fileBuffer = fs.readFileSync(localTarget);
        const ext = path.extname(localTarget).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const fileName = path.basename(localTarget) || 'image.jpg';

        const formData = new FormData();
        formData.append('chat_id', targetChatId);
        formData.append('photo', new Blob([fileBuffer], { type: mimeType }), fileName);
        if (safeCaption) {
          formData.append('caption', safeCaption);
          formData.append('parse_mode', 'Markdown');
        }

        const res = await fetch(photoApiUrl, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(25000)
        });
        const data = await res.json();
        if (data.ok) {
          if (overflowMessage) {
            await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
          }
          return { ok: true, data };
        }

        // Markdown পার্সিং এররে প্লেইন টেক্সট হিসেবে রিট্রাই
        if (safeCaption && data.description?.includes('can\'t parse entities')) {
          const retryFormData = new FormData();
          retryFormData.append('chat_id', targetChatId);
          retryFormData.append('photo', new Blob([fileBuffer], { type: mimeType }), fileName);
          retryFormData.append('caption', safeCaption);
          const retryRes = await fetch(photoApiUrl, { method: 'POST', body: retryFormData, signal: AbortSignal.timeout(25000) });
          const retryData = await retryRes.json();
          if (retryData.ok) {
            if (overflowMessage) {
              await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
            }
            return { ok: true, data: retryData };
          }
        }
      } catch (fsErr) {
        console.warn('sendPhoto local file upload warning:', fsErr.message);
      }
    }

    // ২. সরাসরি বাফার ডাউনলোড করে আপলোড করার চেষ্টা (টেলিগ্রাম সার্ভারের ৫-সেকেন্ড টাইমআউট এড়াতে)
    try {
      if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(25000) });
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const formData = new FormData();
          formData.append('chat_id', targetChatId);
          formData.append('photo', new Blob([arrayBuffer], { type: contentType }), 'image.jpg');
          if (safeCaption) {
            formData.append('caption', safeCaption);
            formData.append('parse_mode', 'Markdown');
          }

          const res = await fetch(photoApiUrl, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(25000)
          });
          const data = await res.json();
          if (data.ok) {
            if (overflowMessage) {
              await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
            }
            return { ok: true, data };
          }

          // Markdown পার্সিং এররে রিট্রাই
          if (safeCaption && data.description?.includes('can\'t parse entities')) {
            const retryFormData = new FormData();
            retryFormData.append('chat_id', targetChatId);
            retryFormData.append('photo', new Blob([arrayBuffer], { type: contentType }), 'image.jpg');
            retryFormData.append('caption', safeCaption);
            const retryRes = await fetch(photoApiUrl, { method: 'POST', body: retryFormData, signal: AbortSignal.timeout(25000) });
            const retryData = await retryRes.json();
            if (retryData.ok) {
              if (overflowMessage) {
                await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
              }
              return { ok: true, data: retryData };
            }
          }
          console.warn('sendPhoto via buffer upload Telegram rejected:', data);
        }
      }
    } catch (bufferErr) {
      console.warn('sendPhoto buffer upload attempt warning:', bufferErr.message);
    }

    // ৩. ফলব্যাক: সরাসরি URL দিয়ে পাঠানো
    try {
      const res = await fetch(photoApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          photo: imageUrl,
          caption: safeCaption,
          parse_mode: 'Markdown'
        }),
        signal: AbortSignal.timeout(25000)
      });
      const data = await res.json();
      if (data.ok) {
        if (overflowMessage) {
          await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
        }
        return { ok: true, data };
      }

      if (safeCaption && data.description?.includes('can\'t parse entities')) {
        const retryRes = await fetch(photoApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            photo: imageUrl,
            caption: safeCaption
          }),
          signal: AbortSignal.timeout(25000)
        });
        const retryData = await retryRes.json();
        if (retryData.ok) {
          if (overflowMessage) {
            await sendTelegramMessage(overflowMessage, targetChatId).catch(() => {});
          }
          return { ok: true, data: retryData };
        }
      }
      console.warn('sendPhoto via URL failed:', data);
    } catch (urlErr) {
      console.error('sendPhoto URL attempt error:', urlErr.message);
    }

    return { ok: false };
  } catch (topErr) {
    console.error('Top-level sendTelegramPhoto error:', topErr.message);
    return { ok: false, error: topErr.message };
  }
}

export async function sendDraftPreview(draft, targetChatId = config.telegramChatId) {
  draft.content = sanitizePostContent(draft.content);
  if (draft.firstComment) {
    draft.firstComment = sanitizePostContent(draft.firstComment);
  }
  saveLatestDraft(draft);

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🚀 হ্যাঁ, পেজে পোস্ট করুন', callback_data: 'publish_post' }
      ],
      [
        { text: '🔄 না, অন্য আইডিয়ায় নতুন পোস্ট লিখুন', callback_data: 'regen_draft' }
      ]
    ]
  };

  const headerCaption = `👑 *আসসালামু আলাইকুম বোরহান ভাই! (CEO Approval)* 🌸\n\n` +
    `আমাদের ফেসবুক পেজ *Ai Revolution*-এর জন্য একটি চমৎকার পোস্ট প্রস্তুত!\n\n` +
    `📂 *রোডম্যাপ বিষয়:* ${draft.pillarName || draft.topicName}\n` +
    `🏷️ *শিরোনাম:* ${draft.title}\n\n` +
    `_পেজে ঠিক যা পোস্ট হবে তা নিচে দেওয়া হলো 👇_`;

  let fullContentMessage = `${draft.content}\n\n`;

  if (draft.firstComment && draft.firstComment.trim()) {
    fullContentMessage += `💬 *প্রথম কমেন্ট (অতিরিক্ত প্রম্পট):*\n${draft.firstComment}\n\n`;
  }

  fullContentMessage += `👑 *বোরহান ভাই, এই পোস্টটি কি পেজে ছাড়ার অনুমতি দিচ্ছেন?* 👇`;

  const photoResult = await sendTelegramPhoto(targetChatId, draft.imageUrl, headerCaption);

  // যদি ছবি সেন্ড হয়, তবে তার পরপরই সম্পূর্ণ পোস্ট ও বাটন পাঠানো হবে
  if (photoResult.ok) {
    await sendTelegramMessage(fullContentMessage, targetChatId, inlineKeyboard);
  } else {
    // ছবি ব্যর্থ হলে সরাসরি টেক্সট এবং ইমেজ লিংকসহ পোস্ট পাঠানো হবে
    const fallbackText = `🖼️ *পোস্টের ইমেজ লিঙ্ক:* ${draft.imageUrl}\n\n` + fullContentMessage;
    await sendTelegramMessage(fallbackText, targetChatId, inlineKeyboard);
  }
}

function safeParseJson(text) {
  if (!text || typeof text !== 'string') return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.content) return parsed;
  } catch (_) {}
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && parsed.content) return parsed;
  } catch (_) {}
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed && parsed.content) return parsed;
    }
  } catch (_) {}
  return null;
}

/**
 * Generates an AI-crafted post caption matching user's photo and today's roadmap pillar.
 * Multi-layer fallback: Gemini Vision -> Gemini Text -> Structured high-standard template.
 */
export async function generatePostFromUserPhoto(photoBuffer, userCaption, dayPlan) {
  const base64Data = photoBuffer.toString('base64');
  const userInstruction = userCaption || 'এই ছবিটি দিয়ে একটি আকর্ষণীয় ফেসবুক পোস্ট তৈরি করো।';

  const prompt = `
তুমি "বোরহান উদ্দিন (HMk Borhan Uddin)" হিসেবে ফেসবুক পেজ "Ai Revolution"-এর জন্য সরাসরি একটি আকর্ষণীয় পোস্টের ক্যাপশন লিখছ। তোমার লেখার মান হতে হবে Altiam Kabir এবং AI Varsity Bangla-এর মতো সর্বোচ্চ স্ট্যান্ডার্ডের।

আজকের নির্দিষ্ট রোডম্যাপ বিষয়: ${dayPlan.pillar} (${dayPlan.dayName})
বিষয়ের মূল ফোকাস: ${dayPlan.focus}
বোরহান ভাই নিজে মোবাইল থেকে এই ছবিটি দিয়েছেন এবং সাথে নির্দেশনা লিখেছেন: "${userInstruction}"

🚨 পোস্ট তৈরির কঠোর নিয়মাবলী:
১. ছবিটি মনোযোগ দিয়ে দেখে ছবিটির বিষয়ের সাথে আজকের রোডম্যাপ বিষয়ের (${dayPlan.pillar}) একটি চমৎকার ও আকর্ষণীয় সংযোগ তৈরি করবে।
২. পোস্টটি সরাসরি একটি স্ক্রোল-স্টপিং শক্তিশালী বাংলা ১-লাইনের হুক দিয়ে শুরু হবে।
৩. কোনো বক্স বা ফ্রেম (╭──╮), কোনো ডিভাইডার দাগ (━━━━ বা ────) বা [ফেসবুক পোস্ট ক্যাপশন] জাতীয় হেডার ভুলেও লিখবে না।
৪. বাস্তবসম্মত টিপস, রেডিমেড এআই প্রম্পট বা কার্যকর গাইড পয়েন্ট এক্সক্লুসিভলি ব্লু পয়েন্টে (🔹) দেবে। কোনো সাধারণ বুলেট (•) বা হাইফেন (-) দেবে না। পুরো কনসেপ্ট ক্লিয়ার না হওয়া পর্যন্ত যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলো দেবে (ব্লু পয়েন্টের সংখ্যার কোনো সীমা নেই)।
৫. মূল কপি-পেস্ট এআই প্রম্পট সরাসরি পোস্টের ভেতর ব্লু পয়েন্টেই দেবে ("ja thakbe upore dibe")।
৬. অতিরিক্ত প্রম্পট থাকলে (১টির বেশি হলে) তবেই firstComment ফিল্ডে দেবে।
৭. শেষে স্পষ্ট কল-টু-অ্যাকশন (CTA) এবং ৩-৪টি প্রাসঙ্গিক হ্যাশট্যাগ (যেমন: #AiRevolution #${(dayPlan.pillar || 'AI').replace(/[\s&(),/]/g, '')}) দেবে।

JSON ফরম্যাটে আউটপুট দাও:
{
  "title": "পোস্টের মূল বাংলা শিরোনাম",
  "content": "সম্পূর্ণ ফেসবুক ক্যাপশন টেক্সট (১-লাইন হুক, ব্লু পয়েন্ট 🔹 দিয়ে সম্পূর্ণ গাইড ও হ্যাশট্যাগ সহ - কোনো [ফেসবুক পোস্ট ক্যাপশন] বা ডিভাইডার দাগ ছাড়া)",
  "firstComment": "📌 অতিরিক্ত প্রম্পট বা বোনাস টিপস (যদি ১টির বেশি প্রম্পট থাকে)..."
}
`;

  // ১. Gemini Vision দিয়ে ইমেজ বিশ্লেষণ
  if (config.geminiApiKey) {
    const visionModels = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    for (const modelName of visionModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 3000,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(15000)
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = safeParseJson(text);
        if (parsed) {
          parsed.content = sanitizePostContent(parsed.content);
          if (parsed.firstComment) {
            parsed.firstComment = sanitizePostContent(parsed.firstComment);
          }
          return parsed;
        }
      } catch (vErr) {
        console.warn(`[generatePostFromUserPhoto] Vision ${modelName} note:`, vErr.message);
      }
    }

    // ২. ফলব্যাক: Gemini Text-Only
    const textModels = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    for (const modelName of textModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 3000,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(15000)
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = safeParseJson(text);
        if (parsed) {
          parsed.content = sanitizePostContent(parsed.content);
          if (parsed.firstComment) {
            parsed.firstComment = sanitizePostContent(parsed.firstComment);
          }
          return parsed;
        }
      } catch (tErr) {}
    }
  }

  // ৩. স্ট্রাকচার্ড টেমপ্লেট ফলব্যাক
  const safePillarTag = (dayPlan.pillar || 'AiRevolution').replace(/[\s&(),/]/g, '');
  return {
    title: `${dayPlan.pillar} — প্র্যাকটিক্যাল গাইড ও প্রয়োজনীয় টিপস`,
    content: `💥 ${dayPlan.pillar} নিয়ে বিশেষ কিছু জেনে রাখা অত্যন্ত জরুরি!\n\n${userCaption ? `📌 মূল ভাবনা: ${userCaption}\n\n` : ''}আজকের ডিজিটাল ও প্রযুক্তির যুগে সঠিক টুল এবং কৌশল জানা থাকলে কাজের গতি বহুগুণ বাড়িয়ে নেওয়া যায়।\n\n🔹 প্রতিদিন অন্তত ২০ মিনিট নতুন এআই টুল এক্সপ্লোর করার অভ্যাস তৈরি করুন।\n🔹 পুনরাবৃত্তিমূলক ও জটিল কাজগুলো অটোমেশন পাইপলাইনে নিয়ে আসুন।\n🔹 নিজের কাজের ক্ষেত্র অনুযায়ী প্রয়োজনীয় ফ্রেমওয়ার্ক তৈরি করে রাখুন।\n\nপোস্টটি আপনার প্রয়োজনীয় মনে হলে বন্ধুদের সাথে শেয়ার করতে পারেন এবং ভবিষ্যতের জন্য সেভ করে রাখুন! 🚀\n\n#AiRevolution #SmartTech #Innovation #Workflow #${safePillarTag}`,
    firstComment: `📌 বিস্তারিত তথ্যের জন্য আমাদের পেজে লাইক দিয়ে যুক্ত থাকুন। আপনার কোনো মতামত বা প্রশ্ন থাকলে নিচে কমেন্ট করতে পারেন!`
  };
}

/**
 * Handles mobile photo upload from Telegram to Facebook draft with CEO approval workflow.
 */
export async function handleUserPhotoPostUpload(msg, fromId) {
  try {
    await sendTelegramMessage('📸 *বোরহান ভাই, আপনার চমৎকার ছবিটি পেয়েছি!* 🌸\n\nআজকের পেজ রোডম্যাপের সাথে মিলিয়ে আপনার ছবির জন্য একটি আকর্ষণীয় ফেসবুক পোস্ট তৈরি করছি... ⏳', fromId);

    const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : msg.document?.file_id;
    if (!fileId) throw new Error('ছবির ফাইল আইডি পাওয়া যায়নি।');

    // ১. টেলিগ্রাম থেকে ফাইলের তথ্য পাওয়া
    const getFileUrl = `https://api.telegram.org/bot${config.telegramBotToken}/getFile?file_id=${fileId}`;
    const getFileRes = await fetch(getFileUrl);
    const getFileData = await getFileRes.json();
    if (!getFileData.ok || !getFileData.result?.file_path) {
      throw new Error('টেলিগ্রাম থেকে ছবির ফাইল পাথ উদ্ধার করা যায়নি।');
    }

    // ২. ফাইল ডাউনলোড করা
    const downloadUrl = `https://api.telegram.org/file/bot${config.telegramBotToken}/${getFileData.result.file_path}`;
    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) {
      throw new Error('টেলিগ্রাম থেকে ফাইল ডাউনলোড ব্যর্থ হয়েছে।');
    }
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ৩. data/user_uploads/ ফোল্ডারে সেভ করা
    const uploadsDir = path.resolve('D:/ai-insight-bot/data/user_uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(getFileData.result.file_path) || '.jpg';
    const savedFileName = `user_photo_${Date.now()}${ext}`;
    const localFilePath = path.join(uploadsDir, savedFileName);
    fs.writeFileSync(localFilePath, buffer);
    console.log(`📸 [telegramService] বোরহান ভাইয়ের ছবি সেভ হয়েছে: ${localFilePath}`);

    // ৪. আজকের রোডম্যাপ তথ্য সংগ্রহ
    const todayIndex = new Date().getDay();
    const dayPlan = WEEKLY_SCHEDULE[todayIndex] || WEEKLY_SCHEDULE[3];
    const userCaption = (msg.caption || '').trim();

    // ৫. এআই দিয়ে পোস্টের কন্টেন্ট জেনারেট করা
    const postData = await generatePostFromUserPhoto(buffer, userCaption, dayPlan);

    // ৬. ড্রাফট অবজেক্ট তৈরি
    const completeDraft = {
      title: postData.title,
      content: postData.content,
      firstComment: postData.firstComment,
      imageUrl: localFilePath,
      image_prompt: 'Custom photo uploaded from mobile by HMk Borhan Uddin',
      pillarName: `📸 আপনার আপলোড করা ছবি [${dayPlan.pillar}]`,
      tierName: 'মোবাইল ফটো পোস্ট'
    };

    // ৭. সিইও অ্যাপ্রুভাল কার্ড পাঠানো (প্রিভিউ + "হ্যাঁ, পেজে পোস্ট করুন" বাটন)
    await sendDraftPreview(completeDraft, fromId);
    console.log(`✅ [telegramService] ব্যবহারকারীর ছবির ড্রাফট সফলভাবে প্রস্তুত ও পাঠানো হয়েছে!`);
  } catch (err) {
    console.error('❌ [handleUserPhotoPostUpload] ত্রুটি:', err);
    await sendTelegramMessage(`⚠️ দুঃখিত বোরহান ভাই, ছবিটি দিয়ে পোস্ট তৈরিতে একটি সমস্যা হয়েছে: ${err.message}`, fromId);
  }
}

/**
 * Handles when Borhan Bhai pastes an explicit post draft or gives custom post text
 * e.g., "📋 [ফেসবুক পোস্ট ক্যাপশন]: ... ei topic er mil kore chobi banao ei lekha di;ye ekta post koro .r eta amake dekhao"
 */
export async function handleDirectUserPostRequest(rawText, fromId) {
  try {
    await sendTelegramMessage('🌸 *বোরহান ভাই, আপনার চমৎকার পোস্টটি পেয়েছি!* ✍️\n\nএই বিষয়ের সাথে মিলিয়ে সুন্দর একটি ৩ডি সিনেমাটিক ছবি তৈরি করছি এবং ড্রাফট কার্ড পাঠাচ্ছি... ⏳', fromId);

    // ১. Gemini দিয়ে পোস্ট কন্টেন্ট, প্রথম কমেন্ট ও ইমেজ প্রম্পট রিফাইন করা
    let title = 'গুগল ওয়ার্কস্পেস এখন ফুল-টাইম এআই অফিস অ্যাসিস্ট্যান্ট!';
    let content = rawText;
    let firstComment = '';
    let imagePrompt = 'Cinematic 8k 3D Octane render of a modern office desk with glowing holographic Google Workspace AI assistant, friendly cute futuristic robot helper organizing glowing emails and documents, neon cyan and warm gold lighting, photorealistic textures, masterpiece, no watermark, no text';

    const prompt = `তুমি লুবাবা — বোরহান উদ্দিন (HMk Borhan Uddin) ভাইয়ের প্রিয় এআই অ্যাসিস্ট্যান্ট।
বোরহান ভাই ফেসবুকে পোস্ট করার জন্য নিচের টেক্সট ও নির্দেশনা পাঠিয়েছেন:
"""
${rawText}
"""

তোমার কাজ:
১. বোরহান ভাইয়ের ব্যক্তিগত মেসেজ/নির্দেশনা (যেমন: "ei topic er mil kore chobi banao", "ei lekha diye ekta post koro", "eta amake dekhao" ইত্যাদি) সম্পূর্ণ ছেঁটে বাদ দাও।
২. ফেসবুক পোস্টের মূল আকর্ষণীয় বাংলা ক্যাপশনটি "content" ফিল্ডে দাও (কোনো [ফেসবুক পোস্ট ক্যাপশন] হেডার বা দাগ ━━━━ বাদ দিয়ে খাঁটি ফেসবুক পোস্ট টেক্সট, বডিতে এক্সক্লুসিভলি ব্লু পয়েন্ট 🔹 ব্যবহার করে)।
৩. প্রথম কমেন্টটি "firstComment" ফিল্ডে দাও (যদি ১টির বেশি অতিরিক্ত প্রম্পট থাকে)।
৪. পোস্টের মূল বিষয়বস্তুর সাথে মিলিয়ে একটি আকর্ষণীয় বাংলা শিরোনাম "title" ফিল্ডে দাও।
৫. পোস্টের বিষয়ের সাথে হুবহু মিল রেখে একটি আকর্ষণীয় ৩ডি সিনেমাটিক ইমেজ প্রম্পট (Cinematic 8k 3D Octane render, futuristic, glowing lighting, photorealistic textures, masterpiece, no text, no watermark) ইংরেজিতে "image_prompt" ফিল্ডে দাও।

JSON ফরম্যাটে উত্তর দাও:
{
  "title": "পোস্টের বাংলা শিরোনাম",
  "content": "ফেসবুক পোস্টের মূল ক্যাপশন (ব্লু পয়েন্ট 🔹 সহ - কোনো [ফেসবুক পোস্ট ক্যাপশন] বা দাগ ছাড়া)",
  "firstComment": "প্রথম কমেন্ট (যদি অতিরিক্ত প্রম্পট থাকে)",
  "image_prompt": "Cinematic 8k 3D Octane render..."
}`;

    let parsedSuccessfully = false;
    if (config.geminiApiKey) {
      const models = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];
      for (const model of models) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2500,
                responseMimeType: 'application/json'
              }
            }),
            signal: AbortSignal.timeout(15000)
          });
          const data = await res.json();
          const parsed = safeParseJson(data.candidates?.[0]?.content?.parts?.[0]?.text);
          if (parsed && parsed.content) {
            title = parsed.title || title;
            content = sanitizePostContent(parsed.content);
            firstComment = parsed.firstComment ? sanitizePostContent(parsed.firstComment) : '';
            imagePrompt = parsed.image_prompt || imagePrompt;
            parsedSuccessfully = true;
            break;
          }
        } catch (mErr) {
          console.warn(`[handleDirectUserPostRequest] ${model} note:`, mErr.message);
        }
      }
    }

    // ফলব্যাক পার্সিং (যদি কোনো কারণে Gemini API সাড়া না দেয়)
    if (!parsedSuccessfully) {
      let cleaned = sanitizePostContent(rawText);

      const commentSplit = cleaned.split(/💬\s*\[প্রথম কমেন্ট হিসেবে যা যাবে\]:?/i);
      if (commentSplit.length > 1) {
        content = sanitizePostContent(commentSplit[0]);
        let commentPart = commentSplit[1].trim();
        commentPart = commentPart.replace(/(ei topic.*|ei lekha.*|ekta post koro.*|eta amake dekhao.*|chobi banao.*)/gis, '').trim();
        firstComment = sanitizePostContent(commentPart);
      } else {
        content = sanitizePostContent(cleaned.replace(/(ei topic.*|ei lekha.*|ekta post koro.*|eta amake dekhao.*|chobi banao.*)/gis, ''));
      }
    }

    // ২. ছবি জেনারেট করা
    const imageUrl = await generateImageUrl(imagePrompt);

    // ৩. ড্রাফট অবজেক্ট তৈরি
    const completeDraft = {
      title,
      content,
      firstComment,
      image_prompt: imagePrompt,
      imageUrl,
      pillarName: `📌 বোরহান ভাইয়ের পোস্ট: ${title}`,
      tierName: 'কাস্টম পোস্ট'
    };

    saveLatestDraft(completeDraft);
    lastDirectPostTimestamp = Date.now();

    // ৪. সিইও অ্যাপ্রুভাল কার্ড পাঠানো
    await sendDraftPreview(completeDraft, fromId);
    console.log(`✅ [handleDirectUserPostRequest] বোরহান ভাইয়ের পোস্ট ড্রাফট ও ছবি পাঠানো হয়েছে!`);
    return completeDraft;
  } catch (err) {
    console.error('❌ [handleDirectUserPostRequest] ত্রুটি:', err);
    await sendTelegramMessage(`⚠️ দুঃখিত বোরহান ভাই, পোস্ট ড্রাফট তৈরিতে সমস্যা হয়েছে: ${err.message}`, fromId);
  }
}

let lastDirectPostTimestamp = 0;
let lastUpdateId = 0;
let isPolling = false;

export function startApprovalListener(onAction) {
  if (isPolling) return;
  isPolling = true;
  console.log('👂 টেলিগ্রাম লাইভ লিসেনার সক্রিয় আছে...');

  async function pollUpdates() {
    try {
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`;
      const res = await fetch(url, { signal: AbortSignal.timeout(35000) });
      const data = await res.json();

      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        console.log(`📩 নতুন আপডেট পাওয়া গেছে: ${data.result.length} টি`);
        for (const update of data.result) {
          lastUpdateId = update.update_id;

          try {
            // ১. টেক্সট কমান্ড হ্যান্ডেল করা
            if (update.message) {
            const msg = update.message;
            const fromId = String(msg.chat.id);

            // ক. ডকুমেন্ট ফাইল (PDF, TXT, PNG, JPG ইত্যাদি)
            if (msg.document) {
              console.log(`📎 ডকুমেন্ট রিসিভ হয়েছে [${fromId}]: ${msg.document.file_name || 'unknown'}`);
              const rawCaption = (msg.caption || '').trim();
              const fileName = (msg.document.file_name || '').toLowerCase();
              const mimeType = (msg.document.mime_type || '').toLowerCase();
              const isImageDoc = mimeType.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fileName);
              const isPostTrigger = /(পোস্ট|post|ফেসবুকে\s*দাও|পেজে\s*দাও|ফেসবুকে|পেজে\s*পোস্ট|ফেসবুক|\bfb\b|facebook)/i.test(rawCaption);

              if (isImageDoc && isPostTrigger) {
                console.log(`📸 ডকুমেন্টে ছবি দিয়ে পোস্ট রিকোয়েস্ট পাওয়া গেছে [${fromId}]`);
                await handleUserPhotoPostUpload(msg, fromId);
                continue;
              }

              await sendTelegramMessage('📎 ফাইলটি পেয়েছি! একটু সময় দিন, লুবাবা বিশ্লেষণ করছে... ⏳', fromId);
              const reply = await processFile(msg.document, msg.caption);
              await sendTelegramMessage(reply, fromId);
              continue;
            }

            // খ. ছবি আপলোড (Telegram Photo)
            if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
              const rawCaption = (msg.caption || '').trim();
              console.log(`🖼️ ছবি রিসিভ হয়েছে [${fromId}], ক্যাপশন: "${rawCaption || 'নেই'}"`);

              // চেক করা: ক্যাপশনে কি পোস্ট করার অনুরোধ আছে? (e.g. "পোস্ট করো", "পোস্টে এই ছবি দাও", "পোস্ট বানাও", "ফেসবুকে দাও")
              const isPostTrigger = /(পোস্ট|post|ফেসবুকে\s*দাও|পেজে\s*দাও|ফেসবুকে|পেজে\s*পোস্ট|ফেসবুক|\bfb\b|facebook)/i.test(rawCaption);

              if (isPostTrigger) {
                console.log(`📸 ব্যবহারকারীর ছবি দিয়ে ফেসবুক পোস্ট ড্রাফট তৈরি হচ্ছে [${fromId}]`);
                await handleUserPhotoPostUpload(msg, fromId);
                continue;
              }

              // কোনো পোস্ট কিওয়ার্ড না থাকলে পার্সোনাল অ্যাসিস্ট্যান্ট হিসেবে ছবি বিশ্লেষণ করা
              await sendTelegramMessage('🖼️ ছবিটি পেয়েছি! একটু অপেক্ষা করুন, লুবাবা বিশ্লেষণ করছে... ⏳', fromId);
              const largestPhoto = msg.photo[msg.photo.length - 1];
              const reply = await processPhoto(largestPhoto, msg.caption);
              await sendTelegramMessage(reply, fromId);
              continue;
            }

            // গ. স্টিকার
            if (msg.sticker) {
              console.log(`💬 স্টিকার রিসিভ হয়েছে [${fromId}]`);
              await sendTelegramMessage('বোরহান ভাই, সুন্দর রেসপন্সের জন্য অনেক ধন্যবাদ! ❤️', fromId);
              continue;
            }

            if (!msg.text) {
              continue;
            }

            const text = msg.text.trim().toLowerCase();
            console.log(`💬 টেক্সট মেসেজ [${fromId}]: ${text}`);

            // ১. ব্যবহারকারী নিজে সরাসরি পোস্টের ড্রাফট পাঠালে বা এই ক্যাপশন দিয়ে পোস্ট করতে বললে (সবার আগে চেক করা হবে)
            const isNegativeComplaint = /(লিখবে\s*না|লিখবা\s*না|লিখছ\s*কেন|লিখলে\s*কেন|মানা\s*করছি|বাদ\s*দাও|মুছে\s*ফেল|এগুলা\s*কেন|মাথা\s*গরম|কুত্তা|কুকুর|শালা|হারামি|কেন\s*লিখছ|কেন\s*লিখছো|লিখতে\s*মানা)/i.test(msg.text);

            const isDirectPost = !isNegativeComplaint && (
              (msg.text.includes('[ফেসবুক পোস্ট ক্যাপশন]') && msg.text.length > 100) ||
              ((text.includes('ei topic') || text.includes('ei lekha') || text.includes('পোস্টে এই লেখা') || text.includes('ফেসবুকে এই লেখা')) && (msg.text.length > 80 || msg.text.includes('\n')))
            );

            if (isDirectPost) {
              console.log(`📝 সরাসরি ফেসবুক পোস্ট ইনপুট পাওয়া গেছে [${fromId}]`);
              await handleDirectUserPostRequest(msg.text, fromId);
              continue;
            }

            // ২. Natural Language FB Posting Approval / Rejection Loop (সংক্ষিপ্ত মেসেজের জন্য)
            const approvalKeywords = [
              'পোস্ট করে দাও', 'অনুমতি দিলাম', 'ফেসবুকে পোস্ট করো', 'পোস্ট কর', 'post it',
              'post koro', 'post kore dao', 'post kore dew', 'post kore daw',
              'fb te post koro', 'page e post koro', 'publish koro', 'chere dao',
              'deya dao', 'yes post it', 'ha post koro', 'হাঁ পোস্ট করো', 'হ্যাঁ পোস্ট করো',
              'post kore felo', 'charo', 'chhere dao'
            ];
            const isShortApproval = text.length < 60 && !text.includes('ekta post') && !text.includes('ei lekha') && !text.includes('chobi banao');
            if (isShortApproval && approvalKeywords.some(k => text === k || text.includes(k))) {
              const latest = getLatestDraft();
              if (latest) {
                await sendTelegramMessage('⏳ *আপনার নির্দেশ পেয়েছি বোরহান ভাই!* ফেসবুকে পোস্টটি আপলোড করা হচ্ছে...', fromId);
                const publishContent = sanitizePostContent(latest.content);
                const fbResult = await publishToFacebook(publishContent, latest.imageUrl);

                if (fbResult.success) {
                  if (latest.firstComment) {
                    try {
                      await replyToComment(fbResult.postId, sanitizePostContent(latest.firstComment));
                    } catch (cErr) {}
                  }
                  await sendTelegramMessage(`✅ *আলহামদুলিল্লাহ বোরহান ভাই! আপনার অনুমোদনে পোস্টটি পেজে সফলভাবে পাবলিশ হয়েছে!* 🥳🎉\n🔗 *ফেসবুক পোস্টের লিঙ্ক:* ${fbResult.postUrl}`, fromId);
                } else if (fbResult.reason === 'TOKEN_NOT_CONFIGURED') {
                  await sendTelegramMessage(`⚠️ *ফেসবুক এক্সেস টোকেন বাকি আছে*`, fromId);
                } else {
                  await sendTelegramMessage(`❌ ফেসবুক এরর: ${fbResult.error}`, fromId);
                }
              } else {
                await sendTelegramMessage('⚠️ কোনো ড্রাফট পাওয়া যায়নি!', fromId);
              }
              continue;
            }

            // Liveness / Check-in হ্যান্ডলিং (বট সজাগ আছে কি না জানতে চাইলে)
            const checkAliveKeywords = [
              'koi', 'kothay', 'koy', 'কই', 'কোথায়', 'acho', 'আছো', 'আছো কি',
              'bot to kichui bolchena', 'kichui bolchena', 'kisu bolchena', 'kisu bolona',
              'কিছু বলছ না', 'কিছু বলছো না', 'কিছু বলছেনা', 'বট কিছু বলছে না'
            ];
            if (checkAliveKeywords.some(k => text === k || text.startsWith(k + ' ') || text.endsWith(' ' + k))) {
              const latest = getLatestDraft();
              let aliveMsg = `🌸 *আসসালামু আলাইকুম বোরহান ভাই! আমি লুবাবা, আপনার পাশেই আছি এবং পুরোপুরি সজাগ আছি!* ❤️\n\n`;
              if (latest) {
                aliveMsg += `📌 *সর্বশেষ ড্রাফট পোস্ট:* "${latest.title}"\n\nআপনি কি এই পোস্টটি পেজে পাবলিশ করতে চান? শুধু লিখুন *'পোস্ট করে দাও'* অথবা *'নতুন পোস্ট বানাও'*।`;
              } else {
                aliveMsg += `আমি একদম প্রস্তুত। আপনি চাইলে এখনই একটি নতুন পোস্ট তৈরি করতে বলতে পারেন (যেমন: *'পোস্ট বানাও'* বা */card*) অথবা যেকোনো বিষয়ে জানতে চাইতে পারেন! 😊`;
              }
              await sendTelegramMessage(aliveMsg, fromId);
              continue;
            }

            // /reel command handling for automated video generation
            if (text.startsWith('/reel')) {
              const topic = msg.text.replace('/reel', '').trim() || 'AI Tools and Productivity';
              await sendTelegramMessage(`🎬 *আপনার নির্দেশ অনুযায়ী Reel তৈরি করা হচ্ছে বোরহান ভাই!* ⏳\n\nবিষয়: ${topic}\n\n_AI স্ক্রিপ্ট, Edge-TTS ভয়েসওভার এবং ৩ডি ভিজ্যুয়াল তৈরি হচ্ছে। সময় লাগতে পারে ৩০-৬০ সেকেন্ড।_`, fromId);
              
              try {
                const { videoPath, script } = await createAiReel(topic);
                
                const completeDraft = {
                  isReel: true,
                  videoPath: videoPath,
                  content: script,
                  title: topic,
                  tierName: 'Reel AI Automation'
                };
                saveLatestDraft(completeDraft);
                
                const formData = new FormData();
                formData.append('chat_id', fromId);
                const fileBuffer = fs.readFileSync(videoPath);
                formData.append('video', new Blob([fileBuffer], { type: 'video/mp4' }), 'reel.mp4');
                formData.append('caption', `🎬 *আপনার ভিডিও প্রস্তুত!* 🥳\n\n📜 *স্ক্রিপ্ট:*\n${script}\n\n_আপনি কি এটি পেজে প্রকাশ করতে চান?_`);
                formData.append('parse_mode', 'Markdown');
                formData.append('reply_markup', JSON.stringify({
                  inline_keyboard: [
                    [
                      { text: '🚀 Approve & Post to FB', callback_data: 'publish_reel' }
                    ],
                    [
                      { text: '❌ Reject', callback_data: 'reject_reel' }
                    ]
                  ]
                }));
                
                await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendVideo`, {
                  method: 'POST',
                  body: formData
                });
              } catch (reelErr) {
                console.error('Reel generation error in telegram:', reelErr);
                await sendTelegramMessage(`⚠️ দুঃখিত বোরহান ভাই, রিলসটি তৈরি করতে সমস্যা হয়েছে: ${reelErr.message}`, fromId);
              }
              continue;
            }

            // সরাসরি ছবি বানানোর নির্দেশ
            if ((text.includes('chobi banao') || text.includes('ছবি বানাও') || text.includes('chobi dao') || text.includes('chobi banaw')) && !text.includes('/image') && !text.includes('/ছবি')) {
              const latest = getLatestDraft();
              const topic = latest ? latest.title : 'Futuristic AI and Smart Office Automation';
              await sendTelegramMessage(`🎨 *আপনার নির্দেশ অনুযায়ী ছবি তৈরি করা হচ্ছে বোরহান ভাই!* ⏳\nবিষয়: ${topic}`, fromId);
              const imgUrl = await generateImageUrl(`Cinematic 8k 3D Octane render of ${topic}, vibrant volumetric lighting, photorealistic, masterpiece, no text, no watermark`);
              await sendTelegramPhoto(fromId, imgUrl, `🎨 বোরহান ভাই, আপনার জন্য ৩ডি সিনেমাটিক ছবিটি প্রস্তুত!`);
              continue;
            }

            // ভাইরাল ওয়ার্কফ্লো পোস্ট তৈরির নির্দেশ (AI for Everyone স্টাইল)
            const viralKeywords = [
              'viral post banao', 'viral post', 'workflow post banao', 'workflow post',
              'পোস্টার বানাও', 'পোস্টার বানানোর পোস্ট', '৬০ সেকেন্ডে পোস্ট', 'মাল্টি টুল পোস্ট'
            ];
            if (viralKeywords.some(k => text.includes(k))) {
              await sendTelegramMessage('🔥 *আপনার নির্দেশ পেয়েছি বোরহান ভাই!* AI for Everyone স্টাইলে ৬০ সেকেন্ডের মাল্টি-টুল ভাইরাল ওয়ার্কফ্লো পোস্ট ও সিনেমাটিক ইমেজ তৈরি করছি... ⏳', fromId);
              if (typeof onAction === 'function') {
                await onAction('craft_viral_post', { niche: 'restaurant' }, fromId);
              }
              continue;
            }

            const createPostKeywords = [
              'পোস্ট বানাও', 'post banao', 'পোস্ট তৈরি করো', 'পোস্ট তৈরি কর',
              'একটি পোস্ট বানাও', 'একটি পোস্ট তৈরি করো', 'নতুন পোস্ট বানাও',
              'পোস্ট দাও', 'post dao', 'create post', 'make post',
              'ekta post banao', 'ekta post koro', 'notun post banao'
            ];
            if (createPostKeywords.some(k => text.toLowerCase().includes(k))) {
              const isRecentDirectDraft = (Date.now() - lastDirectPostTimestamp) < 180000;
              if (isRecentDirectDraft) {
                const latest = getLatestDraft();
                await sendTelegramMessage(`📌 *বোরহান ভাই, আপনার নির্দেশিত পোস্টটি উপরে প্রস্তুত করে পাঠিয়েছি!* ("${latest?.title}")\n\nআপনি কি এই পোস্টটি ফেসবুকে ছাড়তে চান? তাহলে লিখুন *'পোস্ট করে দাও'*।\nআর একদম নতুন কোনো পোস্ট চাইলে লিখুন */card* বা */prompt*। 😊`, fromId);
                continue;
              }

              await sendTelegramMessage('✍️ *আপনার নির্দেশ পেয়েছি বোরহান ভাই!* চমৎকার বিষয় নিয়ে একটি পোস্ট ও সিনেমাটিক ইমেজ ড্রাফট করছি... ⏳', fromId);
              if (typeof onAction === 'function') {
                const hour = new Date().getHours();
                let tier = 1;
                if (hour >= 10 && hour < 14) tier = 1; // Morning
                else if (hour >= 14 && hour < 17) tier = 2; // Card
                else if (hour >= 17 && hour < 20) tier = 4; // Asr Prompt lab
                else tier = 3; // Night Free vs Pro
                const isExplicitlyNew = text.includes('নতুন') || text.includes('notun') || text.includes('arekta') || text.includes('আরেকটা');
                await onAction('generate_tier', { tier, forceRotate: isExplicitlyNew }, fromId);
              }
              continue;
            }

            const rejectKeywords = ['পছন্দ হয়নি', 'নতুনভাবে বানাও', 'আরেকটা দাও', 'পছন্দ হয় নাই', 'arekta dao', 'pochondo hoyni'];
            if (rejectKeywords.some(k => text.includes(k)) && !text.includes('এই পরিবর্তন করো')) {
              await sendTelegramMessage('🔄 ঠিক আছে বোরহান ভাই, পূর্ববর্তী টপিক বাদ দিয়ে একদম ভিন্ন ও আনকোরা আইডিয়া নিয়ে ফ্রেশ পোস্ট ড্রাফট করছি... ⏳', fromId);
              if (typeof onAction === 'function') {
                const latest = getLatestDraft();
                await onAction('rotate_topic', { tier: latest?.tierLevel || 2 }, fromId);
              }
              continue;
            }

            // একই বিষয়ের পুনরাবৃত্তি নিয়ে বোরহান ভাইয়ের অভিযোগ হ্যান্ডেল করা
            const repetitionComplaintKeywords = [
              'একই ধরনের পোস্ট', 'একই পোস্ট', 'একই বিষয়', 'একই টপিক', 'বারবার একই',
              'বক্কর চক্কর', 'সবসময় একই', 'ঘুরে ফিরে একই', 'একই জিনিস'
            ];
            if (repetitionComplaintKeywords.some(k => text.includes(k))) {
              await sendTelegramMessage(
                `🌸 *বোরহান ভাই, আপনার কথা একদম ঠিক!* ❤️\n\n` +
                `আগে পুরো দিন জুড়ে একক বিষয়ের কারণে বারবার একই নো-কোড ওয়েবসাইট নিয়ে পোস্ট তৈরি হচ্ছিল।\n` +
                `এখন আমি অ্যান্টি-রিপিটিশন ফিল্টার ও প্রতিটি দিনের জন্য ৪টি স্বতন্ত্র সাব-থিম যুক্ত করেছি!\n\n` +
                `🔄 আমি এখনই আপনার জন্য সম্পূর্ণ ভিন্ন একটি আকর্ষণীয় বিষয়ের ফ্রেশ ড্রাফট নিয়ে আসছি... ⏳`,
                fromId
              );
              if (typeof onAction === 'function') {
                await onAction('rotate_topic', { tier: 2 }, fromId);
              }
              continue;
            }

            // শিডিউল বা রুটিন দেখার কমান্ড
            if (text === '/schedule' || text === '/শিডিউল' || text.includes('শিডিউল কি') || text.includes('সাপ্তাহিক শিডিউল') || text.includes('রুটিন কি') || text === 'schedule' || text === 'শিডিউল') {
              const scheduleMsg = formatWeeklyScheduleMessage();
              await sendTelegramMessage(scheduleMsg, fromId);
              continue;
            }

            if (text.includes('এই পরিবর্তন করো')) {
               const latest = getLatestDraft();
               if(latest) {
                  await sendTelegramMessage('✍️ ঠিক আছে বোরহান ভাই, আমি পোস্টটি আপনার নির্দেশনা অনুযায়ী পরিবর্তন করছি... ⏳', fromId);
                  if (typeof onAction === 'function') {
                     await onAction('modify_draft', { draft: latest, instruction: text }, fromId);
                  }
               } else {
                  await sendTelegramMessage('⚠️ কোনো পূর্ববর্তী ড্রাফট পাওয়া যায়নি!', fromId);
               }
               continue;
            }

            if (text.includes('মেসেঞ্জারটা চেক করো') || text.includes('কি সমস্যা হয়েছে')) {
                await sendTelegramMessage('🔍 বোরহান ভাই, মেসেঞ্জার API কনফিগারেশন চেক করছি...', fromId);
                // diagnostic
                const convos = await import('./facebookService.js').then(m => m.getRecentConversations(2));
                if (convos && convos.length > 0) {
                    await sendTelegramMessage(`✅ মেসেঞ্জার ঠিকঠাক কাজ করছে! সর্বশেষ ${convos.length} টি কনভার্সেশন পাওয়া গেছে।`, fromId);
                } else {
                    await sendTelegramMessage(`⚠️ মেসেঞ্জারে কোনো নতুন মেসেজ নেই বা pages_messaging পারমিশন টোকেনে নেই।`, fromId);
                }
                continue;
            }
            
            if (text.includes('পেজের রিচ বাড়ানোর আইডিয়া দাও')) {
                await sendTelegramMessage('💡 *পেজের রিচ বাড়ানোর ৫টি কার্যকরী হ্যাকস:*\n\n১. প্রতিদিন নির্দিষ্ট সময়ে পোস্ট করুন (আমাদের ৪-স্তরের শিডিউল অনুযায়ী)।\n২. রিলেভেন্ট ও ট্রেন্ডিং হ্যাশট্যাগ ব্যবহার করুন।\n৩. পোস্টে হুক এবং কল-টু-অ্যাকশন (CTA) যোগ করুন।\n৪. কমেন্টের দ্রুত রিপ্লাই দিন।\n৫. মাঝে মাঝে লাইভ ভিডিও বা স্টোরি শেয়ার করুন।', fromId);
                continue;
            }

            if (text === '/report' || text === 'রিপোর্ট' || text === 'ডেইলি রিপোর্ট') {
              await sendTelegramMessage('📊 বোরহান ভাই, ডেইলি এক্সিকিউটিভ রিপোর্ট তৈরি করা হচ্ছে... ⏳', fromId);
              const { sendDailyExecutiveReport } = await import('./reportService.js');
              await sendDailyExecutiveReport(fromId);
              continue;
            }

            if (text === '/start') {
              console.log(`🎉 /start রিসিভ হয়েছে ইউজার [${fromId}] থেকে`);
              await sendTelegramMessage(
                `🌸 *আসসালামু আলাইকুম বোরহান ভাই!* ❤️\n\n` +
                `আমি আপনার ফেসবুক পেজ *Ai Revolution*-এর অফিসিয়াল এআই কন্টেন্ট ও অটোমেশন ম্যানেজার বট! 🚀\n\n` +
                `📌 *আমাদের ৪-স্তরের দৈনিক কন্টেন্ট শিডিউল:*\n` +
                `• 🌅 *সকাল ১০:০০ টা:* বিগিনার পোস্ট (সহজ গাইড ও টুল পরিচিতি)\n` +
                `• ☀️ *দুপুর ০২:০০ টা:* দিনের একমাত্র *এআই পোস্ট কার্ড* (৩টি হ্যাকস ও শর্টকাট)\n` +
                `• 🌇 *বিকাল ০৫:১৫ টা (আসরের পর):* *ডেইলি প্রম্পট ল্যাব* (Altiam Kabir স্টাইল কপি-পেস্ট প্রম্পট রেসিপি)\n` +
                `• 🌙 *রাত ০৮:৩০ টা:* অ্যাডভান্সড পোস্ট (*Free vs Paid/Pro* বিস্তারিত বিশ্লেষণ)\n\n` +
                `🎮 *কমান্ড শর্টকাট (পেজ ম্যানেজমেন্ট):*\n` +
                `• /schedule - সাপ্তাহিক ৭ দিনের রুটিন ও আজকের উপ-বিষয় দেখতে\n` +
                `• /card - এখনই দুপুরের পোস্ট কার্ড বানাও\n` +
                `• /prompt - এখনই আসরের প্রম্পট রেসিপি পোস্ট বানাও\n` +
                `• /morning - সকালের বিগিনার পোস্ট বানাও\n` +
                `• /night - রাতের Free vs Pro পোস্ট বানাও\n` +
                `• /viral <নিশ> - AI for Everyone স্টাইলে ৬০ সেকেন্ডের ভাইরাল পোস্টার/মাল্টি-টুল ওয়ার্কফ্লো পোস্ট\n` +
                `• /craft <টপিক> - যেকোনো পছন্দের বিষয়ে পোস্ট ও সিনেমাটিক ছবি তৈরি\n` +
                `• /agent - স্বায়ত্তশাসিত এআই এজেন্ট স্ট্যাটাস ও পাওয়ারফুল টুলস\n` +
                `• /status - বট স্ট্যাটাস ও ফেসবুক কানেকশন চেক\n` +
                `• /report - আজকের ডেইলি এক্সিকিউটিভ রিপোর্ট ও অটো-ব্যাকআপ\n\n` +
                `🤖 *পার্সোনাল অ্যাসিস্ট্যান্ট মোড:*\n` +
                `• /help - অ্যাসিস্ট্যান্টের সব ফিচার দেখতে\n` +
                `• যেকোনো ফাইল (PDF/TXT) সেন্ড করলে আমি পড়ে বিশ্লেষণ করব!\n\n` +
                `_আমি সবসময় ব্যাকগ্রাউন্ডে সক্রিয় আছি। আপনি যেকোনো প্রশ্ন করলে আমি স্মার্ট চ্যাট মোডে বাংলায় উত্তর দেব!_`,
                fromId
              );
              continue;
            }

            if (text === '/card') {
              await sendTelegramMessage('☀️ দুপুরের *এআই পোস্ট কার্ড* তৈরি করা হচ্ছে...', fromId);
              if (typeof onAction === 'function') {
                await onAction('generate_tier', 2, fromId);
              }
              continue;
            }

            if (text === '/prompt' || text === '/asr') {
              await sendTelegramMessage('🌇 আসরের পরের *ডেইলি প্রম্পট রেসিপি* তৈরি করা হচ্ছে...', fromId);
              if (typeof onAction === 'function') {
                await onAction('generate_tier', 4, fromId);
              }
              continue;
            }

            if (text === '/morning') {
              await sendTelegramMessage('🌅 সকালের *বিগিনার পোস্ট* তৈরি করা হচ্ছে...', fromId);
              if (typeof onAction === 'function') {
                await onAction('generate_tier', 1, fromId);
              }
              continue;
            }

            if (text === '/night') {
              await sendTelegramMessage('🌙 রাতের *অ্যাডভান্সড (Free vs Pro) পোস্ট* তৈরি করা হচ্ছে...', fromId);
              if (typeof onAction === 'function') {
                await onAction('generate_tier', 3, fromId);
              }
              continue;
            }

            if (text.startsWith('/viral') || text.startsWith('/workflow')) {
              const customNiche = msg.text.replace(/^\/(viral|workflow)\s*/i, '').trim();
              const niche = customNiche || 'restaurant';
              await sendTelegramMessage(
                `🔥 বোরহান ভাই, আপনার নির্দেশে *${niche}*-এর ওপর AI for Everyone Daily স্টাইলে ৬০ সেকেন্ডের ভাইরাল ওয়ার্কফ্লো পোস্ট ও সিনেমাটিক Flux ইমেজ তৈরি করা হচ্ছে... ⏳`,
                fromId
              );
              if (typeof onAction === 'function') {
                await onAction('craft_viral_post', { niche }, fromId);
              }
              continue;
            }

            if (text.startsWith('/craft') || text.startsWith('/post')) {
              const customTopic = msg.text.replace(/^\/(craft|post)\s*/i, '').trim();
              const topicTitle = customTopic || 'আজকের ট্রেন্ডিং এআই টপিক';
              await sendTelegramMessage(
                `🎨 বোরহান ভাই, আপনার নির্দেশে *${topicTitle}*-এর ওপর Altiam Kabir & AI Varsity Bangla স্ট্যান্ডার্ডে স্পেশাল পোস্ট ও সিনেমাটিক Flux ইমেজ তৈরি করা হচ্ছে... ⏳`,
                fromId
              );
              if (typeof onAction === 'function') {
                await onAction('craft_custom_post', { topic: topicTitle, tier: 4 }, fromId);
              }
              continue;
            }

            if (text === '/status') {
              const fbStatus = config.fbPageAccessToken && config.fbPageAccessToken !== 'YOUR_PAGE_ACCESS_TOKEN_HERE'
                ? '✅ সফলভাবে সংযুক্ত আছে'
                : '⚠️ পেজ টোকেন বাকি আছে (.env)';
              await sendTelegramMessage(
                `📊 *Ai Revolution বট স্ট্যাটাস:*\n\n` +
                `• বট ইঞ্জিন: Gemini & Flux AI\n` +
                `• ফেসবুক পেজ আইডি: \`${config.fbPageId}\`\n` +
                `• ফেসবুক টোকেন: ${fbStatus}\n` +
                `• ৪টি দৈনিক শিডিউলার: সকাল ১০:০০, দুপুর ২:০০, বিকাল ৫:১৫ (আসরের পর) ও রাত ৮:৩০\n` +
                `• লাইভ লিসেনার: ২৪/৭ সার্বক্ষণিক সক্রিয় 🚀`,
                fromId
              );
              continue;
            }

            if (text === '/agent') {
              await sendTelegramMessage(
                `🧠 *Ai Revolution Autonomous AI Agent Active!* 🚀\n\n` +
                `• *এজেন্ট আর্কিটেকচার:* Multi-Model ReAct Engine (Gemini Function Calling)\n` +
                `• *টুলবক্স:* \n` +
                `   1. 🔍 \`search_ai_knowledge\` (লাইভ এআই নলেজ সার্চ)\n` +
                `   2. 📁 \`get_borhan_profile_services\` (বোরহান স্যারের পোর্টফোলিও ও সার্ভিসেস)\n` +
                `   3. 📲 \`escalate_to_telegram\` (প্রায়োরিটি লিড সরাসরি টেলিগ্রামে পাঠানো)\n` +
                `   4. 💡 \`get_faq_answer\` (পেজের শিডিউল ও এফএকিউ)\n` +
                `   5. ✍️ \`craft_high_standard_post\` (Altiam Kabir & AI Varsity Bangla পোস্ট)\n` +
                `   6. 🎨 \`create_cinematic_image\` (১০৮০×১০৮০ সিনেমাটিক Flux AI ইমেজ)\n` +
                `   7. ⚖️ \`evaluate_post_quality\` (হুক, প্রম্পট ও এনগেজমেন্ট কোয়ালিটি অডিট)\n` +
                `• *অন-ডিমান্ড কমান্ড:* \`/craft <টপিক>\` বা \`/post <টপিক>\` লিখলেই তাৎক্ষণিক পোস্ট তৈরি হবে\n` +
                `• *মেমোরি:* পার্সিস্টেন্ট সেশন মেমোরি সক্রিয় আছে\n` +
                `• *পলিসি:* একক মার্জিত কমেন্ট ও প্রমিত বাংলা রেসপন্স\n\n` +
                `_বোরহান ভাই, আপনি সরাসরি যেকোনো প্রশ্ন পাঠালেই এজেন্ট নিজে টুলস ব্যবহার করে সঠিক তথ্য নিয়ে উত্তর দেবে!_`,
                fromId
              );
              continue;
            }

            // পার্সোনাল অ্যাসিস্ট্যান্ট মোডে রাউটিং
            try {
              console.log(`🤖 পার্সোনাল অ্যাসিস্ট্যান্ট রাউটিং: "${msg.text}"`);
              const chatReply = await processAssistantMessage(fromId, msg.text);
              if (typeof chatReply === 'object' && chatReply?.type === 'photo') {
                const photoResult = await sendTelegramPhoto(fromId, chatReply.url, chatReply.caption);
                if (!photoResult || !photoResult.ok) {
                  await sendTelegramMessage(`🖼️ *ছবির লিঙ্ক:* ${chatReply.url}\n\n${chatReply.caption || ''}`, fromId);
                }
              } else {
                await sendTelegramMessage(chatReply, fromId);
              }
            } catch (asstErr) {
              console.error('Telegram assistant routing error:', asstErr.message);
              await sendTelegramMessage('বোরহান ভাই, উত্তর প্রস্তুত করতে সাময়িক একটু সমস্যা হয়েছিল। আমি সক্রিয় আছি, আবার বলুন! 😊', fromId);
            }
            continue;
          }

          // ২. বাটন ক্লিক (Callback Query) হ্যান্ডেল করা
          if (update.callback_query) {
            const query = update.callback_query;
            const action = query.data;
            const fromId = String(query.from.id);
            console.log(`🔘 বাটন ক্লিক রিসিভ হয়েছে [${fromId}]: ${action}`);

            // তৎক্ষণাৎ টেলিগ্রাম বাটনে রেসপন্স ফিডব্যাক পাঠানো
            await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: query.id,
                text: action === 'publish_post' ? '⏳ ফেসবুকে যাচাই করা হচ্ছে...' : '🔄 নতুন আইডিয়া তৈরি করা হচ্ছে...',
                show_alert: false
              })
            }).catch(() => {});

            if (action === 'publish_post') {
              const latest = getLatestDraft();
              if (latest) {
                await sendTelegramMessage('⏳ *আপনার অনুমতি গ্রহণ করা হয়েছে বোরহান ভাই!* ফেসবুকে পোস্টটি আপলোড করা হচ্ছে...', fromId);
                const publishContent = sanitizePostContent(latest.content);
                const fbResult = await publishToFacebook(publishContent, latest.imageUrl);

                if (fbResult.success) {
                  // যদি কোনো রেডিমেড প্রম্পট বা সোর্স লিংক থাকে, তবে প্রথম কমেন্ট হিসেবে পোস্ট করা
                  if (latest.firstComment) {
                    try {
                      await replyToComment(fbResult.postId, sanitizePostContent(latest.firstComment));
                      console.log('✅ ফেসবুক পোস্টে প্রথম কমেন্ট স্বয়ংক্রিয়ভাবে যোগ করা হয়েছে!');
                    } catch (cErr) {
                      console.warn('First comment warning:', cErr.message);
                    }
                  }

                  await sendTelegramMessage(
                    `✅ *আলহামদুলিল্লাহ বোরহান ভাই! আপনার অনুমোদনে পোস্টটি পেজে সফলভাবে পাবলিশ হয়েছে!* 🥳🎉\n\n` +
                    `🔗 *ফেসবুক পোস্টের লিঙ্ক:* ${fbResult.postUrl}\n` +
                    `📊 পেজ: *Ai Revolution*\n` +
                    (latest.firstComment ? `💬 *প্রথম কমেন্ট:* সফলভাবে যোগ করা হয়েছে!\n\n` : `\n`) +
                    `_পরবর্তী শিডিউল অনুযায়ী স্বয়ংক্রিয়ভাবে পরবর্তী পোস্টের ড্রাফট আপনার কাছে অনুমোদনের জন্য চলে আসবে!_`,
                    fromId
                  );
                } else if (fbResult.reason === 'TOKEN_NOT_CONFIGURED') {
                  await sendTelegramMessage(
                    `⚠️ *ফেসবুক এক্সেস টোকেন বাকি আছে*\n\n` +
                    `বোরহান ভাই, আপনার পোস্টের লেখা এবং ছবি ১০০% রেডি আছে! ❤️\n\n` +
                    `কিন্তু ফেসবুকে অটোমেটিক ছাড়ার জন্য আপনার পেজের **Page Access Token** প্রয়োজন, যা এখনো .env ফাইলে বসানো হয়নি।`,
                    fromId
                  );
                } else {
                  await sendTelegramMessage(`❌ ফেসবুক এরর: ${fbResult.error}`, fromId);
                }
              } else {
                await sendTelegramMessage('⚠️ কোনো ড্রাফট পাওয়া যায়নি! নতুন পোস্ট বানাতে /card বা /prompt লিখুন।', fromId);
              }
            } else if (action === 'regen_draft') {
              await sendTelegramMessage('🔄 ঠিক আছে বোরহান ভাই, আপনার নির্দেশ অনুযায়ী ভিন্ন একটি আকর্ষণীয় আইডিয়া নিয়ে নতুন পোস্ট ড্রাফট করছি... ⏳', fromId);
              if (typeof onAction === 'function') {
                const latest = getLatestDraft();
                if (latest && latest.tierName === 'ভাইরাল ওয়ার্কফ্লো ল্যাব') {
                  await onAction('craft_viral_post', { niche: 'restaurant' }, fromId);
                } else if (latest && latest.tierLevel) {
                  await onAction('rotate_topic', { tier: latest.tierLevel }, fromId);
                } else {
                  await onAction('rotate_topic', { tier: 2 }, fromId);
                }
              }
            } else if (action === 'publish_reel') {
              const latest = getLatestDraft();
              if (latest && latest.isReel) {
                await sendTelegramMessage('⏳ *আপনার অনুমতি গ্রহণ করা হয়েছে বোরহান ভাই!* ফেসবুকে Reel আপলোড করা হচ্ছে...', fromId);
                const fbResult = await uploadReelToFacebook(latest.videoPath, latest.content);
                if (fbResult.success) {
                  await sendTelegramMessage(`✅ *আলহামদুলিল্লাহ বোরহান ভাই! আপনার অনুমোদনে Reel টি পেজে সফলভাবে পাবলিশ হয়েছে!* 🥳🎉\n🔗 *Reel লিঙ্ক:* ${fbResult.postUrl}`, fromId);
                } else if (fbResult.reason === 'TOKEN_NOT_CONFIGURED') {
                  await sendTelegramMessage(`⚠️ *ফেসবুক এক্সেস টোকেন বাকি আছে*`, fromId);
                } else {
                  await sendTelegramMessage(`❌ ফেসবুক এরর: ${fbResult.error}`, fromId);
                }
              } else {
                await sendTelegramMessage('⚠️ কোনো Reel ড্রাফট পাওয়া যায়নি!', fromId);
              }
            } else if (action === 'reject_reel') {
              await sendTelegramMessage('❌ ঠিক আছে বোরহান ভাই, এই Reel টি বাতিল করা হলো। আপনি চাইলে নতুন করে /reel <টপিক> লিখে কমান্ড দিতে পারেন।', fromId);
            }
          }
        } catch (uErr) {
          console.error('Telegram update processing error:', uErr.message);
        }
        }
      }
    } catch (err) {
      // Retry safely
    }

    if (isPolling) {
      setTimeout(pollUpdates, 1500);
    }
  }

  pollUpdates();
}
