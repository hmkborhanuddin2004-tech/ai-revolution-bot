import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  fbPageId: process.env.FB_PAGE_ID || '1332501043279682',
  fbPageAccessToken: process.env.FB_PAGE_ACCESS_TOKEN || '',
  postingHour: parseInt(process.env.POSTING_HOUR || '19', 10),
  postingMinute: parseInt(process.env.POSTING_MINUTE || '30', 10),
  port: process.env.PORT || 3001
};

export const BORHAN_FB_PROFILE = 'https://www.facebook.com/share/19f1qHdhKW/';

export function validateConfig() {
  const missing = [];
  if (!config.geminiApiKey) missing.push('GEMINI_API_KEY');
  if (!config.telegramBotToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!config.telegramChatId) missing.push('TELEGRAM_CHAT_ID');
  
  if (missing.length > 0) {
    console.warn('⚠️ সতর্কতা: নিচের কনফিগারেশনগুলো অনুপস্থিত:', missing.join(', '));
  } else {
    console.log('✅ সমস্ত সিক্রেট কী ও কনফিগারেশন সফলভাবে লোড হয়েছে!');
  }
  return missing.length === 0;
}
