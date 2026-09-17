const fs = require('fs');
const content = \import { config } from '../config.js';
import { chatWithGemini } from './geminiService.js';
import { generateImageUrl } from './imageService.js';
import { searchWeb } from './webSearchService.js';
import { agentMemory } from './agentMemory.js';

async function downloadTelegramFile(fileId) {
  const url = \\\https://api.telegram.org/bot\/getFile?file_id=\\\\;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error('File not found');
  const fileUrl = \\\https://api.telegram.org/file/bot\/\\\\;
  const fileRes = await fetch(fileUrl);
  return await fileRes.arrayBuffer();
}

async function geminiMultiModelFallback(prompt) {
  const modelsToTry = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
  for (const modelName of modelsToTry) {
    const url = \\\https://generativelanguage.googleapis.com/v1beta/models/\:generateContent?key=\\\\;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.error(\\\[\] chat error:\\\, err.message);
    }
  }
  return "দুঃখিত বোরহান ভাই, আমি এখন উত্তর দিতে পারছি না।";
}

async function geminiVisionFallback(prompt, base64Data, mimeType) {
  const modelsToTry = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
  for (const modelName of modelsToTry) {
    const url = \\\https://generativelanguage.googleapis.com/v1beta/models/\:generateContent?key=\\\\;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.error(\\\[\] vision error:\\\, err.message);
    }
  }
  return "দুঃখিত বোরহান ভাই, ছবিটি বিশ্লেষণ করতে সমস্যা হচ্ছে।";
}

export async function processFile(document, caption) {
  try {
    const buffer = await downloadTelegramFile(document.file_id);
    let prompt = caption || "ফাইলটিতে কী আছে আমাকে বলুন";
    let systemInstruction = "আপনি বোরহান ভাইয়ের পার্সোনাল এআই। ফাইল পড়ে সহজ বাংলায় উত্তর দিন।\\n\\n";
    if (document.mime_type === 'application/pdf' || (document.file_name && document.file_name.endsWith('.pdf'))) {
      const base64Data = Buffer.from(buffer).toString('base64');
      return await geminiVisionFallback(systemInstruction + prompt, base64Data, 'application/pdf');
    } else {
      const text = Buffer.from(buffer).toString('utf-8');
      return await geminiMultiModelFallback(systemInstruction + \\\ফাইল টেক্সট:\\n\\\n\\nপ্রশ্ন: \\\\);
    }
  } catch (err) {
    return "দুঃখিত বোরহান ভাই, এই ফাইলটি প্রসেস করতে গিয়ে সমস্যা হয়েছে।";
  }
}

export async function processAssistantMessage(userId, text) {
  const lowerText = text.trim().toLowerCase();
  
  if (lowerText === '/help') {
    return \\\🌸 *পার্সোনাল এআই পাওয়ারহাউস শর্টকাট:* 🌸\\n\\n\\\ +
\\\• /search <যেকোনো কিছু> - রিয়েল-টাইম ওয়েব সার্চ\\n\\\ +
\\\• /image বা /ছবি <বর্ণনা> - এআই ছবি তৈরি\\n\\\ +
\\\• /task <প্ল্যান> - স্টেপ-বাই-স্টেপ টাস্ক প্ল্যানিং\\n\\\ +
\\\• /code <সমস্যা> - কোডিং সলিউশন বা এরর ফিক্স\\n\\\ +
\\\• /translate <টেক্সট> - দ্রুত বাংলা অনুবাদ\\n\\\ +
\\\• /summary <টেক্সট> - বড় লেখার সারাংশ\\n\\\ +
\\\• /remember <তথ্য> - মেমোরিতে সেভ রাখা\\n\\\ +
\\\• /forget - মেমোরি ক্লিয়ার করা\\n\\\ +
\\\• /memory - সেভ করা মেমোরি দেখা\\n\\\ +
\\\• যেকোনো ফাইল (PDF/TXT) সেন্ড করলে আমি পড়ে বিশ্লেষণ করব!\\n\\n\\\ +
\\\_এছাড়া সাধারণ চ্যাট করলে আমি একজন স্মার্ট পার্সোনাল অ্যাসিস্ট্যান্ট হিসেবে বাংলায় উত্তর দেব!_\\\;
  }
  
  if (lowerText.startsWith('/search ')) {
    const q = text.substring(8).trim();
    return await searchWeb(q);
  }

  if (lowerText.startsWith('/image ') || lowerText.startsWith('/ছবি ')) {
    const q = text.replace(/^\\/(image|ছবি)\\s+/i, '').trim();
    const url = await generateImageUrl(q);
    return { type: 'photo', url, caption: \\\🎨 আপনার তৈরি ছবি:\\\ };
  }

  if (lowerText.startsWith('/task ')) {
    const q = text.substring(6).trim();
    const prompt = \\\তুমি একজন এক্সপার্ট টাস্ক প্ল্যানার। আমাকে ধাপে ধাপে এই কাজটি প্ল্যান করে দাও: \\nTask: \\\\;
    return await geminiMultiModelFallback(prompt);
  }

  if (lowerText.startsWith('/code ')) {
    const q = text.substring(6).trim();
    const prompt = \\\তুমি একজন এক্সপার্ট প্রোগ্রামার। এই কোড বা সমস্যাটির সমাধান দাও: \\n\\\\;
    return await geminiMultiModelFallback(prompt);
  }

  if (lowerText.startsWith('/translate ')) {
    const q = text.substring(11).trim();
    const prompt = \\\Translate this text to Bengali (if it is already in Bengali, translate to English):\\n\\\\;
    return await geminiMultiModelFallback(prompt);
  }

  if (lowerText.startsWith('/summary ')) {
    const q = text.substring(9).trim();
    const prompt = \\\Summarize this text briefly in Bengali:\\n\\\\;
    return await geminiMultiModelFallback(prompt);
  }

  if (lowerText.startsWith('/remember ')) {
    const q = text.substring(10).trim();
    if (!agentMemory.memory[userId]) agentMemory.recordInteraction(userId, { userText: 'init', agentReply: 'init' });
    if (!agentMemory.memory[userId].facts) agentMemory.memory[userId].facts = [];
    agentMemory.memory[userId].facts.push(q);
    agentMemory.save();
    return \\\✅ মেমোরিতে সেভ করেছি: "\"\\\;
  }

  if (lowerText === '/forget') {
    if (agentMemory.memory[userId]) {
      agentMemory.memory[userId].facts = [];
      agentMemory.save();
    }
    return \\\✅ সব মেমোরি ক্লিয়ার করা হয়েছে!\\\;
  }

  if (lowerText === '/memory') {
    const facts = agentMemory.memory[userId]?.facts || [];
    if (facts.length === 0) return \\\আপনার কোনো মেমোরি সেভ করা নেই!\\\;
    return \\\📌 *সেভ করা মেমোরি:*\\n\\n\\\ + facts.map((f, i) => \\\\. \\\\).join('\\n');
  }

  if (text.includes("'''")) {
    const prompt = \\\তুমি একজন স্মার্ট অ্যাসিস্ট্যান্ট...: \\n\\\\;
    return await geminiMultiModelFallback(prompt);
  }
  
  if (lowerText.match(/(আজকের|খবর|current|latest|নিউজ)/)) {
    return await searchWeb(text);
  }
  
  if (lowerText.match(/(?:calculate|অংক|হিসাব|\\+|-|\\*|\\/)/)) {
    const prompt = \\\Calculate and explain step by step: \\n\\\\;
    return await geminiMultiModelFallback(prompt);
  }
  
  if (text.match(/https?:\\/\\/[^\\s]+/)) {
    const prompt = \\\Please summarize or answer based on the link text: \\n\\\\;
    return await geminiMultiModelFallback(prompt);
  }

  const historySnippet = agentMemory.getContextSnippet(userId);
  const facts = agentMemory.memory[userId]?.facts || [];
  const factSnippet = facts.length > 0 ? \\\\\n[সেভ করা মেমোরি:\\n\]\\n\\\ : '';
  
  const systemPrompt = \\\তুমি বোরহান ভাইয়ের একজন স্মার্ট পার্সোনাল অ্যাসিস্ট্যান্ট...: \\n\\\n\\\nCurrent: \\\\;
  const reply = await geminiMultiModelFallback(systemPrompt);
  agentMemory.recordInteraction(userId, { userText: text, agentReply: reply });
  return reply;
}
\;

fs.writeFileSync('D:/ai-insight-bot/src/services/personalAssistantService.js', content, 'utf8');
console.log('clean rewrite done');
