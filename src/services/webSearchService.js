import { config } from '../config.js';

/**
 * DuckDuckGo Instant Answer API (no key required) + Gemini fallback
 */
export async function searchWeb(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('json') || contentType.includes('javascript')) {
        const rawBody = await res.text();
        let data = null;
        try {
          data = JSON.parse(rawBody);
        } catch (_) {}

        if (data) {
          let info = '';
          if (data.AbstractText) {
            info = data.AbstractText;
          } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            info = data.RelatedTopics
              .filter(t => t.Text)
              .slice(0, 5)
              .map(t => t.Text)
              .join('\n');
          }

          if (info && info.trim().length > 20) {
            const prompt = `তুমি লুবাবা, একজন বাংলাদেশি এআই রিসার্চ অ্যাসিস্ট্যান্ট।
ওয়েব থেকে নিচের তথ্য পাওয়া গেছে। বোরহান ভাইকে বাংলায় সহজ ও স্পষ্ট উত্তর দাও।

প্রশ্ন: ${query}
ওয়েব তথ্য: ${info.substring(0, 2000)}

নিয়ম: সংক্ষিপ্ত, বাংলায়, মোবাইল-বান্ধব ফরম্যাটে উত্তর দাও।`;
            return await geminiChat(prompt);
          }
        }
      }
    }
  } catch (e) {
    console.error('[webSearch] DuckDuckGo note:', e.message);
  }

  // Gemini knowledge fallback
  const prompt = `তুমি লুবাবা। বোরহান ভাই জানতে চাইছেন: "${query}"
বাংলায় সংক্ষিপ্ত, তথ্যভিত্তিক উত্তর দাও। যদি রিয়েল-টাইম তথ্য দরকার হয় সেটা জানিয়ে দাও।`;
  return await geminiChat(prompt);
}

async function geminiChat(prompt) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];
  for (const modelName of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
        }),
        signal: AbortSignal.timeout(12000)
      });
      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.warn(`[webSearch/${modelName}]`, err.message);
    }
  }
  return 'দুঃখিত, এই মুহূর্তে সার্চ করা সম্ভব হচ্ছে না। একটু পরে আবার চেষ্টা করুন।';
}