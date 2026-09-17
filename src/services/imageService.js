/**
 * Ultra-High Quality AI Image Generation Service for Facebook Posts
 * Multi-Engine Architecture:
 * 1. Primary: Pollinations Flux Multi-Model ('flux', 'flux-realism', 'sana') - 100% FREE & Ultra-Fast
 * 2. Secondary: Google Gemini Imagen 3 ('gemini-2.5-flash-image', 'gemini-3.1-flash-image') (if quota available)
 * 3. Fallback: High-Tech Curated Photography
 */

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const HIGH_TECH_FALLBACKS = [
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1080&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1080&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1080&auto=format&fit=crop'
];

/**
 * Word-bounded portrait detection so technical terms like "interface", "command", "manager", "management"
 * never trigger portrait tokens.
 * @param {string} prompt
 * @returns {boolean}
 */
export function detectPortraitPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;

  // Bengali human portrait triggers
  const bengaliPortraitRegex = /(ছেলে|মেয়ে|মানুষ|চেহারা|পোর্ট্রেট|অবতার|পুরুষ|মহিলা|ব্যক্তি|তরুণ|তরুণী|যুবক|যুবতী|মুখ|হাসিমুখ)/;
  if (bengaliPortraitRegex.test(prompt)) return true;

  // Strip known technical words that contain substrings like 'man' or 'face' to eliminate false positives
  const techFalsePositives = /\b(manager|management|command|interface|manipulation|performance|manifest|permanent|interfacial|manual|manufacturing|manufacture)\b/gi;
  const sanitizedPrompt = prompt.replace(techFalsePositives, ' ');

  // Strict word-bounded English portrait detection
  const portraitRegex = /\b(portrait|studio portrait|photo of a (man|woman|person|girl|boy)|photograph of (a|an)|human face|real human|model|gentleman|lady|person|people)\b|(?<![a-zA-Z0-9_])(man|men|woman|women|guy)(?![a-zA-Z0-9_])/i;

  return portraitRegex.test(sanitizedPrompt);
}

/**
 * Enriches visual prompts with clean, viral photography or 3D digital art.
 * - Humans: realistic studio portrait photography
 * - Tech/office/AI: breathtaking 3D Octane Render 8K
 * @param {string} basePrompt
 * @param {boolean} isPortrait
 * @returns {string}
 */
export function enhanceVisualPrompt(basePrompt, isPortrait = false) {
  if (!basePrompt || typeof basePrompt !== 'string') {
    return 'Breathtaking 3D Octane Render 8K, futuristic AI neural network technology, glowing neon cyan and amber, cinematic lighting, photorealistic, viral visual hook';
  }

  let prompt = basePrompt.trim().replace(/^["']|["']$/g, '');

  if (isPortrait) {
    const portraitTokens = [
      'authentic studio portrait photography',
      'Shot on Sony A7 IV 85mm f1.4 lens',
      'natural human skin pores and authentic texture',
      'sharp highly detailed realistic eyes',
      'professional studio soft warm rim light',
      '8k raw photo',
      'photorealistic',
      'cinematic depth of field',
      'masterpiece',
      'no cartoon',
      'no CGI',
      'no 3d render',
      'no plastic skin',
      'no airbrushed look'
    ];
    return `${prompt}, ${portraitTokens.join(', ')}`;
  }

  const techTokens = [
    'breathtaking 3D Octane Render 8K',
    'cinematic 3D render for tech and futuristic office',
    'volumetric ray-traced lighting',
    'glowing cyan and amber illumination',
    'photorealistic glass and metallic textures',
    'clean elegant high-tech workspace aesthetics',
    'viral Facebook visual hook',
    'hyper-sharp focus',
    'Unreal Engine 5 render',
    'masterpiece',
    'no text',
    'no watermark',
    'no distorted elements'
  ];

  return `${prompt}, ${techTokens.join(', ')}`;
}

/**
 * Secondary Engine: Attempts image generation using Google Gemini native image models (Imagen 3).
 * Requires an account with image generation access (Subscription / Billing enabled).
 */
export async function tryGeminiImage(imagePrompt, apiKey = config.geminiApiKey) {
  if (!apiKey) return null;

  const models = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image'
  ];

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate a photorealistic 8k Facebook post image: ${imagePrompt}. High aesthetic quality, sharp focus, no text, no watermark.` }]
          }]
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json();
      const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

      if (part?.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        const ext = part.inlineData.mimeType?.includes('png') ? 'png' : 'jpg';
        const imgDir = path.resolve('D:/ai-insight-bot/data/generated_images');
        if (!fs.existsSync(imgDir)) {
          fs.mkdirSync(imgDir, { recursive: true });
        }
        const filePath = path.join(imgDir, `gemini_image_${Date.now()}.${ext}`);
        fs.writeFileSync(filePath, buffer);
        console.log(`💎 [imageService] Google Gemini (${modelName}) দিয়ে আল্ট্রা-এইচডি ছবি প্রস্তুত: ${filePath}`);
        return filePath;
      }

      if (data.error) {
        console.log(`[imageService] Gemini ${modelName} note: ${data.error.message?.substring(0, 80)}`);
      }
    } catch (e) {
      console.warn(`[imageService] Gemini ${modelName} fetch exception:`, e.message);
    }
  }
  return null;
}

// Local URL-to-file cache mapping so Telegram and Facebook delivery can reuse
// the pre-warmed image buffer instantly without re-fetching from Pollinations across the network.
const urlToLocalPathCache = new Map();

/**
 * Returns the local file path if an image URL was pre-warmed and cached locally,
 * or if the input is already a valid local file path.
 * @param {string} imageUrl
 * @returns {string|null}
 */
export function getLocalCachedImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  if (fs.existsSync(imageUrl)) return imageUrl;
  if (urlToLocalPathCache.has(imageUrl)) {
    const cachedPath = urlToLocalPathCache.get(imageUrl);
    if (fs.existsSync(cachedPath)) return cachedPath;
  }
  return null;
}

/**
 * Helper to download an image from a remote URL to a local buffer.
 * Reuses local cached buffer if available.
 */
export async function downloadImageBuffer(url, timeoutMs = 45000) {
  const cachedPath = getLocalCachedImagePath(url);
  if (cachedPath) {
    return fs.readFileSync(cachedPath);
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`Image download failed with status ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

/**
 * Main Image Generation Function
 * 100% FREE, Ultra-High Quality, Multi-Model Fallback:
 * 1. Primary: Pollinations Flux Multi-Model ('flux', 'turbo', 'flux-realism', 'sana') with dynamic seed & local caching
 * 2. Secondary: Google Gemini Imagen 3 (if explicit or Pollinations fails)
 * 3. Fallback: Curated high-tech images
 */
export async function generateImageUrl(imagePrompt, customOptions = {}) {
  try {
    // If explicitly configured to try Gemini Imagen first
    if (customOptions.forceGemini) {
      const geminiImagePath = await tryGeminiImage(imagePrompt);
      if (geminiImagePath) {
        urlToLocalPathCache.set(geminiImagePath, geminiImagePath);
        return geminiImagePath;
      }
    }

    const isPortrait = customOptions.isPortrait !== undefined 
      ? customOptions.isPortrait 
      : detectPortraitPrompt(imagePrompt);

    const enhanced = enhanceVisualPrompt(imagePrompt, isPortrait);
    const encoded = encodeURIComponent(enhanced);

    const width = customOptions.width || 1080;
    const height = customOptions.height || 1080;
    const seed = customOptions.seed || Math.floor(Math.random() * 10000000);

    // ১. Primary Free Engine: Pollinations Flux Multi-Model ('flux', 'turbo', 'flux-realism', 'sana')
    // 'flux' is highest quality; 'turbo' is fast & resilient; 'flux-realism' for portraits; 'sana' as upstream fallback
    const candidateModels = customOptions.model 
      ? [customOptions.model]
      : (isPortrait ? ['flux-realism', 'flux', 'turbo'] : ['flux', 'turbo', 'flux-realism']);

    for (const model of candidateModels) {
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${seed}&enhance=false`;

      try {
        console.log(`🎨 [imageService] Pollinations (${model}) দিয়ে ছবি প্রি-ওয়ার্ম ও বাফার প্রস্তুত করা হচ্ছে...`);
        // 30s timeout ensures Pollinations GPU inference finishes without keeping connections open indefinitely
        const res = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(30000) });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('image') || contentType.includes('octet-stream')) {
            const arrayBuf = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuf);

            // Save local buffer copy in data/generated_images
            const imgDir = path.resolve('D:/ai-insight-bot/data/generated_images');
            if (!fs.existsSync(imgDir)) {
              fs.mkdirSync(imgDir, { recursive: true });
            }
            const localFilePath = path.join(imgDir, `pollinations_${model}_${Date.now()}_${seed}.jpg`);
            fs.writeFileSync(localFilePath, buffer);
            console.log(`✅ [imageService] Pollinations (${model}) ছবি প্রস্তুত ও ক্যাশ সেভ হয়েছে: ${localFilePath}`);

            // Register in URL-to-local-cache so Facebook & Telegram upload the pre-warmed file instantly
            urlToLocalPathCache.set(pollinationsUrl, localFilePath);

            if (customOptions.returnLocalPath) {
              return localFilePath;
            }
            return pollinationsUrl;
          }
        } else {
          const errText = await res.text().catch(() => '');
          console.warn(`[imageService] Pollinations (${model}) HTTP ${res.status}: ${errText.substring(0, 100)}`);
          if (res.status === 429 || errText.includes('429')) {
            // Queue full for IP: wait 3s for backend job to clear before next attempt
            console.log(`⏳ [imageService] IP কিউ খালি হতে ৩ সেকেন্ড অপেক্ষা করা হচ্ছে...`);
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      } catch (err) {
        console.warn(`[imageService] Pollinations model ${model} timeout/error:`, err.message);
      }
    }

    // ২. Secondary Engine: Google Gemini Imagen 3 (যদি Pollinations সংযোগে সমস্যা হয়)
    console.log(`⚡ [imageService] Pollinations মডেল ব্যর্থ, Secondary Engine (Google Gemini Imagen 3) চেষ্টা করা হচ্ছে...`);
    const geminiImagePath = await tryGeminiImage(imagePrompt);
    if (geminiImagePath) {
      urlToLocalPathCache.set(geminiImagePath, geminiImagePath);
      return geminiImagePath;
    }

    // ৩. ৩য় ফলব্যাক: কিউরেটেড হাই-টেক ইমেজ
    console.warn('[imageService] সকল ইঞ্জিন ব্যর্থ, হাই-টেক ফলব্যাক ছবি ব্যবহার করা হচ্ছে');
    const randomIndex = Math.floor(Math.random() * HIGH_TECH_FALLBACKS.length);
    return HIGH_TECH_FALLBACKS[randomIndex];
  } catch (error) {
    console.error('Image Generation Error, using fallback:', error);
    const randomIndex = Math.floor(Math.random() * HIGH_TECH_FALLBACKS.length);
    return HIGH_TECH_FALLBACKS[randomIndex];
  }
}
