/**
 * WhatsApp Personal Assistant Service
 * =====================================
 * বোরহান স্যারের ব্যক্তিগত WhatsApp অ্যাসিস্ট্যান্ট।
 *
 * কঠোর নিয়ম (কখনো ভঙ্গ করা যাবে না):
 * ১. শুধুমাত্র 1-on-1 মেসেজে — প্রথমবার একটাই অটো-রিপ্লাই, তারপর আর কোনোদিন না।
 * ২. গ্রুপে (isGroup === true) একদম চুপ — কোনো রিপ্লাই নেই।
 * ৩. মিসড কল হলে কলারকে একটি মেসেজ পাঠাবে + বোরহান ভাইকে Telegram-এ জানাবে।
 */

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

// --- স্থায়ী "replied once" ট্র্যাকার (disk-এ সেভ) ---
const REPLIED_FILE = path.resolve('D:/ai-insight-bot/data/whatsapp_replied.json');

function loadRepliedSet() {
  try {
    if (fs.existsSync(REPLIED_FILE)) {
      const arr = JSON.parse(fs.readFileSync(REPLIED_FILE, 'utf-8'));
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch {}
  return new Set();
}

function saveRepliedSet(set) {
  try {
    fs.mkdirSync(path.dirname(REPLIED_FILE), { recursive: true });
    fs.writeFileSync(REPLIED_FILE, JSON.stringify([...set], null, 2), 'utf-8');
  } catch (err) {
    console.error('[WhatsApp] repliedSet save error:', err.message);
  }
}

// প্রোগ্রাম শুরুতে লোড করা
const repliedContacts = loadRepliedSet();

// --- অটো-রিপ্লাই টেক্সট (1-on-1 মেসেজের জন্য) ---
const PERSONAL_AUTO_REPLY =
  `আস-সালামু আলাইকুম! 🌸\n\n` +
  `আমি বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট বলছি।\n\n` +
  `বোরহান স্যার এখন সফটওয়্যার ডেভেলপমেন্ট ও অটোমেশনের কাজে ব্যস্ত আছেন। তিনি একটু পরেই আপনার মেসেজটি দেখবেন।\n\n` +
  `📌 জরুরি কিছু থাকলে সরাসরি তাঁর ফেসবুকে যোগাযোগ করুন:\n` +
  `👉 https://www.facebook.com/share/19f1qHdhKW/\n\n` +
  `ধন্যবাদ মেসেজ করার জন্য। 🙏`;

// --- মিসড কল মেসেজ (কলার পাবেন) ---
const MISSED_CALL_REPLY =
  `আস-সালামু আলাইকুম! 🌸\n\n` +
  `আমি বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট বলছি।\n\n` +
  `বোরহান স্যার এই মুহূর্তে একটু ব্যস্ত ছিলেন, তাই কলটি ধরতে পারেননি। তিনি অবশ্যই একটু পরে আপনাকে কলব্যাক করবেন।\n\n` +
  `📌 জরুরি কিছু থাকলে এখানে মেসেজ করুন বা তাঁর ফেসবুকে যোগাযোগ করুন:\n` +
  `👉 https://www.facebook.com/share/19f1qHdhKW/\n\n` +
  `ধন্যবাদ। 🙏`;

/**
 * 1-on-1 WhatsApp মেসেজ হ্যান্ডলার
 */
export async function handleWhatsAppMessage(client, msg) {
  try {
    const chat = await msg.getChat();

    // কঠোর নিয়ম: গ্রুপে কোনো রিপ্লাই নেই — কখনোই না
    if (chat.isGroup) {
      console.log(`[WhatsApp] গ্রুপ "${chat.name}" — সম্পূর্ণ উপেক্ষা করা হয়েছে।`);
      return;
    }

    // নিজের মেসেজ উপেক্ষা
    if (msg.fromMe) return;

    const contactId = msg.from; // e.g. "8801XXXXXXXXX@c.us"
    const contact = await msg.getContact();
    const senderName = contact.pushname || contact.name || 'অজ্ঞাত';
    const messageBody = msg.body || '[মিডিয়া]';

    console.log(`[WhatsApp] 1-on-1 মেসেজ "${senderName}" (${contactId}): "${messageBody.substring(0, 60)}"`);

    // ইতিমধ্যে এই ব্যক্তিকে কোনোদিন রিপ্লাই দেওয়া হয়েছে কিনা চেক
    if (repliedContacts.has(contactId)) {
      console.log(`[WhatsApp] "${senderName}"-কে আগেই একবার রিপ্লাই দেওয়া হয়েছে — আর দেওয়া হবে না।`);
      return;
    }

    // প্রথমবার — অটো-রিপ্লাই পাঠানো
    await msg.reply(PERSONAL_AUTO_REPLY);

    // স্থায়ীভাবে মনে রাখা (disk-এ সেভ)
    repliedContacts.add(contactId);
    saveRepliedSet(repliedContacts);
    console.log(`[WhatsApp] ✅ "${senderName}"-কে প্রথম ও শেষবারের মতো অটো-রিপ্লাই পাঠানো হয়েছে।`);

    // জরুরি হলে লোকাল কনসোলে লগ রাখা
    const isUrgent = /(জরুরি|urgent|emergency|দরকার|কল করুন|আজকেই|দ্রুত|project|প্রজেক্ট|ব্যবসা|business|deal)/i.test(messageBody);
    if (isUrgent) {
      console.log(`[WhatsApp] 🚨 জরুরি মেসেজ এসেছে ${senderName} (${contactId}) থেকে: "${messageBody}"`);
    }
  } catch (err) {
    console.error('[WhatsApp] handleWhatsAppMessage error:', err.message);
  }
}

/**
 * WhatsApp ক্লায়েন্ট তৈরি ও চালু করা
 */
export async function startWhatsAppClient() {
  let Client, LocalAuth, qrcode;

  try {
    const wwjs = await import('whatsapp-web.js');
    const pkg = wwjs.default || wwjs;
    Client = pkg.Client;
    LocalAuth = pkg.LocalAuth;
    const qt = await import('qrcode-terminal');
    qrcode = qt.default || qt;
  } catch (err) {
    console.error('[WhatsApp] whatsapp-web.js লোড হয়নি:', err.message);
    return null;
  }

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: 'D:/ai-insight-bot/data/whatsapp-session' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    }
  });

  client.on('qr', (qr) => {
    console.log('\n📱 [WhatsApp] QR কোড স্ক্যান করুন:');
    qrcode.generate(qr, { small: true });
    console.log('WhatsApp > Linked Devices > Link a Device\n');
  });

  client.on('authenticated', () => {
    console.log('[WhatsApp] ✅ অথেন্টিকেট হয়েছে।');
  });

  client.on('ready', async () => {
    console.log('[WhatsApp] ✅ সক্রিয়! গ্রুপে রিপ্লাই নিষিদ্ধ। 1-on-1: প্রথমবার একবারই রিপ্লাই।');
  });

  // 1-on-1 মেসেজ
  client.on('message', (msg) => handleWhatsAppMessage(client, msg));

  // মিসড কল ডিটেকশন
  client.on('call', async (call) => {
    try {
      await call.reject();

      const callerId = call.from || '';
      const callerNumber = callerId.replace('@c.us', '');
      const callType = call.isVideo ? 'ভিডিও কল' : 'ভয়েস কল';

      console.log(`[WhatsApp] 📞 মিসড ${callType} — +${callerNumber}`);

      // কলারকে মেসেজ পাঠানো
      if (callerId) {
        await client.sendMessage(callerId, MISSED_CALL_REPLY);
        console.log(`[WhatsApp] ✅ মিসড কলের মেসেজ পাঠানো হয়েছে +${callerNumber}-কে।`);
      }
    } catch (err) {
      console.error('[WhatsApp] call handler error:', err.message);
    }
  });

  client.on('auth_failure', (msg) => console.error('[WhatsApp] ❌ Auth failure:', msg));
  client.on('disconnected', (reason) => console.warn('[WhatsApp] সংযোগ বিচ্ছিন্ন:', reason));

  try {
    await client.initialize();
  } catch (err) {
    console.error('[WhatsApp] initialize error:', err.message);
  }

  return client;
}
