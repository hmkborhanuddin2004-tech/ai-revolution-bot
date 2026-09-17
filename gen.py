import fs
import os
import re

def write_web_search_service():
    content = \"\"\"import { chatWithGemini } from './geminiService.js';

export async function searchWeb(query) {
  try {
    const url = \https://api.duckduckgo.com/?q=\&format=json\;
    const res = await fetch(url);
    const data = await res.json();
    
    let info = '';
    if (data.AbstractText) {
      info = data.AbstractText;
    } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      info = data.RelatedTopics.filter(t => t.Text).map(t => t.Text).join(' | ');
    }
    
    if (info) {
      const prompt = \তুমি একজন ওয়েব রিসার্চার। নিচের তথ্যের ভিত্তিতে প্রশ্নটির উত্তর বাংলায় দাও।\\nপ্রশ্ন: \\\nতথ্য: \\;
      return await chatWithGemini(prompt);
    }
  } catch (e) {
    console.error('Web search error:', e);
  }
  
  // Fallback to gemini
  return await chatWithGemini(\অনুগ্রহ করে সার্চ করে বা নিজের জ্ঞান থেকে বিস্তারিত বাংলায় উত্তর দাও: \\);
}
\"\"\"
    with open('D:/ai-insight-bot/src/services/webSearchService.js', 'w', encoding='utf-8') as f:
        f.write(content)

def write_personal_assistant_service():
    content = \"\"\"import { chatWithGemini } from './geminiService.js';
import { generateImageUrl } from './imageService.js';
import { searchWeb } from './webSearchService.js';
import { agentMemory } from './agentMemory.js';
import { config } from '../config.js';

async function downloadTelegramFile(fileId) {
  const url = \https://api.telegram.org/bot\/getFile?file_id=\\;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error('File not found');
  
  const fileUrl = \https://api.telegram.org/file/bot\/\\;
  const fileRes = await fetch(fileUrl);
  return await fileRes.arrayBuffer();
}

async function geminiMultiModelFallback(prompt) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-flash-lite-latest', 'gemini-3.6-flash'];
  for (const modelName of modelsToTry) {
    const url = \https://generativelanguage.googleapis.com/v1beta/models/\:generateContent?key=\\;
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
      console.error(\[\] chat error:\, err.message);
    }
  }
  return "দুঃখিত বোরহান ভাই, এই মুহূর্তে উত্তর তৈরি করতে সমস্যা হচ্ছে।";
}

async function geminiVisionFallback(prompt, base64Data, mimeType) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-flash-lite-latest', 'gemini-3.6-flash'];
  for (const modelName of modelsToTry) {
    const url = \https://generativelanguage.googleapis.com/v1beta/models/\:generateContent?key=\\;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mimeType, data: base64Data } }
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
      console.error(\[\] vision error:\, err.message);
    }
  }
  return "দুঃখিত বোরহান ভাই, ফাইলটি পড়তে সমস্যা হচ্ছে।";
}

export async function processFile(document, caption) {
  try {
    const buffer = await downloadTelegramFile(document.file_id);
    let prompt = caption || "ফাইলটি পেয়েছি! কী জানতে চান এটা থেকে? (সারসংক্ষেপ / মূল পয়েন্ট / প্রশ্নোত্তর)";
    let systemInstruction = "তুমি বোরহান স্যারের পার্সোনাল এআই অ্যাসিস্ট্যান্ট। ফাইল থেকে তথ্য পড়ে বাংলায় উত্তর দাও।\\n\\n";
    
    if (document.mime_type === 'application/pdf' || document.file_name.endsWith('.pdf')) {
      // PDF processing: extract first 5000 chars as base64 or just send raw base64 (since gemini supports pdf)
      const base64Data = Buffer.from(buffer).toString('base64');
      return await geminiVisionFallback(systemInstruction + prompt, base64Data, 'application/pdf');
    } else {
      // TXT or other text based
      const text = Buffer.from(buffer).toString('utf-8');
      return await geminiMultiModelFallback(systemInstruction + \ফাইলের বিষয়বস্তু:\\n\\\n\\nপ্রশ্ন: \\);
    }
  } catch (err) {
    return "দুঃখিত বোরহান ভাই, ফাইলটি প্রসেস করতে সমস্যা হচ্ছে।";
  }
}

export async function processAssistantMessage(userId, text) {
  const lowerText = text.trim().toLowerCase();
  
  // 1. Commands
  if (lowerText === '/help') {
    return \🌸 *পার্সোনাল এআই পাওয়ারহাউস কমান্ডস:* 🌸\\n\\n\ +
\• /search <প্রশ্ন> - রিয়েল-টাইম ওয়েব সার্চ\\n\ +
\• /image বা /ছবি <বর্ণনা> - সিনেমাটিক ছবি তৈরি\\n\ +
\• /task <লক্ষ্য> - ধাপে ধাপে কাজের প্ল্যান\\n\ +
\• /code <কোড বা প্রশ্ন> - কোড এনালাইসিস ও ফিক্স\\n\ +
\• /translate <টেক্সট> - যেকোনো ভাষা থেকে বাংলায় অনুবাদ\\n\ +
\• /summary <টেক্সট> - বড় লেখার সারসংক্ষেপ\\n\ +
\• /remember <তথ্য> - মেমোরিতে তথ্য সেভ\\n\ +
\• /forget - মেমোরি ক্লিয়ার\\n\ +
\• /memory - সেভ করা তথ্য দেখুন\\n\ +
\• ফাইল বা PDF সেন্ড করুন - অটোমেটিক ফাইল রিডার\\n\\n\ +
\এছাড়াও যেকোনো প্রশ্ন বা কথা সরাসরি লিখলে আমি স্মার্ট চ্যাট মোডে উত্তর দেব!\;
  }
  
  if (lowerText.startsWith('/search ')) {
    const q = text.substring(8).trim();
    return await searchWeb(q);
  }
  if (lowerText.startsWith('/image ') || lowerText.startsWith('/ছবি ')) {
    const q = text.replace(/^\\/(image|ছবি)\\s+/i, '').trim();
    const url = await generateImageUrl(q);
    return { type: 'photo', url, caption: \🎨 আপনার নির্দেশ অনুযায়ী ছবি তৈরি করা হয়েছে!\ };
  }
  if (lowerText.startsWith('/task ')) {
    const q = text.substring(6).trim();
    const prompt = \তুমি বোরহান স্যারের পার্সোনাল প্রোডাক্টিভিটি এক্সপার্ট। নিচের কাজটির জন্য ধাপে ধাপে (1, 2, 3...) একটি প্র্যাকটিক্যাল অ্যাকশন প্ল্যান বাংলায় তৈরি করো:\\nকাজ: \\;
    return await geminiMultiModelFallback(prompt);
  }
  if (lowerText.startsWith('/code ')) {
    const q = text.substring(6).trim();
    const prompt = \তুমি একজন এক্সপার্ট প্রোগ্রামার। নিচের কোড বা প্রশ্নের সমাধান দাও, বাগ থাকলে ফিক্স করো, অপ্টিমাইজ করো। উত্তর বাংলায় দেবে এবং কোডগুলো \\\\\\\\\ ব্লকে রাখবে:\\n\\;
    return await geminiMultiModelFallback(prompt);
  }
  if (lowerText.startsWith('/translate ')) {
    const q = text.substring(11).trim();
    const prompt = \নিচের টেক্সটটি বাংলায় অনুবাদ করো (যদি টেক্সটটি বাংলায় হয় তবে ইংরেজিতে অনুবাদ করো):\\n\\;
    return await geminiMultiModelFallback(prompt);
  }
  if (lowerText.startsWith('/summary ')) {
    const q = text.substring(9).trim();
    const prompt = \নিচের লেখাটির একটি খুব সুন্দর, সংক্ষিপ্ত ও বুলেট-পয়েন্ট সারসংক্ষেপ বাংলায় তৈরি করো:\\n\\;
    return await geminiMultiModelFallback(prompt);
  }
  if (lowerText.startsWith('/remember ')) {
    const q = text.substring(10).trim();
    if (!agentMemory.memory[userId]) agentMemory.recordInteraction(userId, { userText: 'init', agentReply: 'init' });
    if (!agentMemory.memory[userId].facts) agentMemory.memory[userId].facts = [];
    agentMemory.memory[userId].facts.push(q);
    agentMemory.save();
    return \✅ মনে রাখলাম: "\"\;
  }
  if (lowerText === '/forget') {
    if (agentMemory.memory[userId]) {
      agentMemory.memory[userId].facts = [];
      agentMemory.save();
    }
    return \✅ আপনার সম্পর্কিত সব তথ্য ভুলে গেছি!\;
  }
  if (lowerText === '/memory') {
    const facts = agentMemory.memory[userId]?.facts || [];
    if (facts.length === 0) return \আপনার সম্পর্কে আমার কাছে এখনো কোনো বিশেষ তথ্য সেভ করা নেই। /remember দিয়ে কিছু জানাতে পারেন!\;
    return \📌 *আমি আপনার সম্পর্কে যা যা মনে রেখেছি:*\\n\\n\ + facts.map((f, i) => \\. \\).join('\\n');
  }

  // Smart Routing
  if (text.includes('\\\')) {
    const prompt = \তুমি একজন এক্সপার্ট প্রোগ্রামার। নিচের কোড বা প্রশ্নের সমাধান দাও। উত্তর বাংলায় দেবে এবং কোডগুলো \\\\\\\\\ ব্লকে রাখবে:\\n\\;
    return await geminiMultiModelFallback(prompt);
  }
  
  if (lowerText.match(/এখন|আজ|current|latest|২০২৬/)) {
    return await searchWeb(text);
  }
  
  if (lowerText.match(/(?:calculate|হিসাব|যোগ|বিয়োগ|গুণ|ভাগ|\\+|\\-|\\*|\\/)/) && lowerText.match(/\\d/)) {
    const prompt = \তুমি একজন অংক শিক্ষক। নিচের গাণিতিক সমস্যাটি ধাপে ধাপে সমাধান করে বাংলায় বুঝিয়ে দাও:\\n\\;
    return await geminiMultiModelFallback(prompt);
  }
  
  if (text.match(/https?:\\/\\/[^\\s]+/)) {
    const prompt = \নিচের লেখায় একটি লিংক আছে। লিংকটির বিষয়বস্তু বা লেখা সম্পর্কে তোমার জ্ঞান থেকে একটি সারসংক্ষেপ বা উত্তর বাংলায় দাও:\\n\\;
    return await geminiMultiModelFallback(prompt);
  }

  // Free-Style Smart Chat (Multi-turn, Context-Aware)
  const historySnippet = agentMemory.getContextSnippet(userId);
  const facts = agentMemory.memory[userId]?.facts || [];
  const factSnippet = facts.length > 0 ? \\\n[বোরহান স্যার সম্পর্কে কিছু তথ্য]:\\n\\\n\ : '';
  
  const systemPrompt = \তুমি বোরহান স্যারের পার্সোনাল এআই অ্যাসিস্ট্যান্ট (ChatGPT Plus বা Gemini Advanced এর মতো)। তুমি অত্যন্ত স্মার্ট, হেল্পফুল এবং ডিফল্টভাবে বাংলায় উত্তর দাও (ব্যবহারকারী ইংরেজিতে বললে ইংরেজিতে)। কোনো বাড়তি কথা বা ফ্ল্যাফ বলবে না। টু-দ্য-পয়েন্টে বুলেট পয়েন্ট ও ইমোজি ব্যবহার করে মোবাইল-বান্ধব উত্তর দেবে।
\
\
বর্তমান প্রশ্ন বা কথা: \\;

  const reply = await geminiMultiModelFallback(systemPrompt);
  
  agentMemory.recordInteraction(userId, { userText: text, agentReply: reply });
  
  return reply;
}
\"\"\"
    with open('D:/ai-insight-bot/src/services/personalAssistantService.js', 'w', encoding='utf-8') as f:
        f.write(content)

def update_telegram_service():
    with open('D:/ai-insight-bot/src/services/telegramService.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    import_stmt = \"import { processAssistantMessage, processFile } from './personalAssistantService.js';\\n\"
    content = content.replace(\"import { chatWithGemini } from './geminiService.js';\", 
                              \"import { chatWithGemini } from './geminiService.js';\\n\" + import_stmt)
    
    doc_handler = \"\"\"            if (msg.document) {
              console.log(\📎 ডকুমেন্ট রিসিভ হয়েছে [\]: \\);
              await sendTelegramMessage('📎 ফাইলটি পেয়েছি! একটু সময় দিন, আমি পড়ছি...', fromId);
              const reply = await processFile(msg.document, msg.caption);
              await sendTelegramMessage(reply, fromId);
              continue;
            }\"\"\"
    content = content.replace(\"if (!msg.text) {\", doc_handler + \"\\n            if (!msg.text) {\")
    
    new_start = \"\"\"                \🎮 *কমান্ড শর্টকাট (পেজ ম্যানেজমেন্ট):*\\n\ +
                \• /card - এখনই দুপুরের পোস্ট কার্ড বানাও\\n\ +
                \• /prompt - এখনই আসরের প্রম্পট রেসিপি পোস্ট বানাও\\n\ +
                \• /morning - সকালের বিগিনার পোস্ট বানাও\\n\ +
                \• /night - রাতের Free vs Pro পোস্ট বানাও\\n\ +
                \• /craft <টপিক> - যেকোনো পছন্দের বিষয়ে পোস্ট ও সিনেমাটিক ছবি তৈরি\\n\ +
                \• /agent - স্বায়ত্তশাসিত এআই এজেন্ট স্ট্যাটাস ও পাওয়ারফুল টুলস\\n\ +
                \• /status - বট স্ট্যাটাস ও ফেসবুক কানেকশন চেক\\n\\n\ +
                \🤖 *পার্সোনাল অ্যাসিস্ট্যান্ট মোড:*\\n\ +
                \• /help - অ্যাসিস্ট্যান্টের সব ফিচার দেখতে\\n\ +
                \• যেকোনো ফাইল (PDF/TXT) সেন্ড করলে আমি পড়ে বিশ্লেষণ করব!\\n\\n\ +\"\"\"
    
    content = re.sub(r\"\🎮 \\*কমান্ড শর্টকাট:\\*\\n\ \\+.*?\• /status - বট স্ট্যাটাস ও ফেসবুক কানেকশন চেক\\n\\n\ \\+\", new_start, content, flags=re.DOTALL)
    
    routing_logic = \"\"\"            // পার্সোনাল অ্যাসিস্ট্যান্ট মোডে রাউটিং
            console.log(\🤖 পার্সোনাল অ্যাসিস্ট্যান্ট রাউটিং: "\"\);
            const chatReply = await processAssistantMessage(fromId, msg.text);
            if (typeof chatReply === 'object' && chatReply.type === 'photo') {
               try {
                 const photoUrl = \https://api.telegram.org/bot\/sendPhoto\;
                 await fetch(photoUrl, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                     chat_id: fromId,
                     photo: chatReply.url,
                     caption: chatReply.caption,
                     parse_mode: 'Markdown'
                   })
                 });
               } catch(e) {
                 await sendTelegramMessage(\ছবি পাঠাতে সমস্যা হয়েছে: \\, fromId);
               }
            } else {
               await sendTelegramMessage(chatReply, fromId);
            }\"\"\"
    
    content = re.sub(r\"// কোনো নির্দিষ্ট কমান্ড না হলে Gemini দিয়ে ফ্রেন্ডলি চ্যাট করা.*?(?=continue;)\", routing_logic + \"\\n            \", content, flags=re.DOTALL)
    
    with open('D:/ai-insight-bot/src/services/telegramService.js', 'w', encoding='utf-8') as f:
        f.write(content)

def write_test_script():
    content = \"\"\"import { processAssistantMessage } from '../services/personalAssistantService.js';
import { agentMemory } from '../services/agentMemory.js';

async function runTests() {
  const userId = "TEST_USER_123";
  console.log("Testing Personal Assistant...");
  
  let res = await processAssistantMessage(userId, "/remember আমি একজন ফুলস্ট্যাক ডেভেলপার");
  console.log("Remember:", res);
  
  res = await processAssistantMessage(userId, "/memory");
  console.log("Memory:", res);
  
  res = await processAssistantMessage(userId, "/task কিভাবে একটি রেস্ট এপিআই বানাব?");
  console.log("Task:", res.substring(0, 150) + "...");
  
  res = await processAssistantMessage(userId, "বলতো আমি কে?");
  console.log("Free Chat:", res);
  
  res = await processAssistantMessage(userId, "/forget");
  console.log("Forget:", res);
  
  console.log("✅ Tests completed.");
  process.exit(0);
}

runTests();
\"\"\"
    with open('D:/ai-insight-bot/src/scripts/verifyPersonalAssistant.js', 'w', encoding='utf-8') as f:
        f.write(content)

write_web_search_service()
write_personal_assistant_service()
update_telegram_service()
write_test_script()
print('Done!')
