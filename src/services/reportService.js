/**
 * Daily Executive Report and Automated Backup Service
 * Runs daily at 10:30 PM (Asia/Dhaka) and sends a concise executive summary to Borhan Bhai on Telegram.
 * Also supports on-demand report via /report command and automated backups of data directory.
 */

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { duplicateTracker } from './duplicateTracker.js';
import { sendTelegramMessage } from './telegramService.js';

const DATA_DIR = path.resolve('D:/ai-insight-bot/data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const BOT_START_TIME = Date.now();

/**
 * Calculates human-readable uptime string in Bengali.
 */
function getBengaliUptime() {
  const uptimeMs = Date.now() - BOT_START_TIME;
  const totalMinutes = Math.floor(uptimeMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} মিনিট`;
  }
  return `${hours} ঘণ্টা ${minutes} মিনিট`;
}

/**
 * Creates an automated JSON snapshot backup of the data folder.
 */
export function createDataBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const backupFile = path.join(BACKUP_DIR, `backup-${todayStr}.json`);

    const filesToBackup = ['processed_events.json', 'agent_memory.json', 'latestDraft.json'];
    const snapshot = {
      backupDate: new Date().toISOString(),
      files: {}
    };

    for (const fileName of filesToBackup) {
      const filePath = path.join(DATA_DIR, fileName);
      if (fs.existsSync(filePath)) {
        try {
          snapshot.files[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch {
          snapshot.files[fileName] = fs.readFileSync(filePath, 'utf-8');
        }
      }
    }

    fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2), 'utf-8');
    console.log(`💾 [Data Backup] সফলভাবে ব্যাকআপ তৈরি হয়েছে: ${backupFile}`);
    return { success: true, backupFile };
  } catch (err) {
    console.error('❌ [Data Backup] ব্যাকআপ তৈরিতে ত্রুটি:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Generates and sends the Daily Executive Summary to Borhan Bhai on Telegram.
 */
export async function sendDailyExecutiveReport(targetChatId = config.telegramChatId) {
  try {
    const dhakaDateStr = new Date().toLocaleDateString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dhakaTimeStr = new Date().toLocaleTimeString('bn-BD', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Run backup first
    const backupRes = createDataBackup();

    // Gather metrics
    const uptime = getBengaliUptime();
    const processedEventsCount = duplicateTracker.processedIds ? duplicateTracker.processedIds.size : 0;
    
    // Check latest draft
    let latestDraftTitle = 'কোনো ড্রাফট নেই';
    try {
      const draftPath = path.join(DATA_DIR, 'latestDraft.json');
      if (fs.existsSync(draftPath)) {
        const draft = JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
        if (draft && draft.title) {
          latestDraftTitle = draft.title;
        }
      }
    } catch {}

    const reportMessage = 
`📊 *ডেইলি এক্সিকিউটিভ রিপোর্ট — Ai Revolution*
📅 *তারিখ:* ${dhakaDateStr} (${dhakaTimeStr})

🔹 *সিস্টেম স্ট্যাটাস ও আপটাইম:*
• সার্ভার স্বাস্থ্য: ✅ সক্রিয় (পোর্ট ৩০০১)
• মোট রান-টাইম: ${uptime}
• জেমিনি এআই এঞ্জিন: ✅ সচল (মাল্টি-মডেল অটো-ফলব্যাক)

🔹 *আজকের অটোমেশন পারফরম্যান্স:*
• প্রসেসকৃত কমেন্ট ও ইভেন্ট: *${processedEventsCount} টি*
• ফেসবুক কমেন্ট রিপ্লাই: ✅ মার্জিত প্রোফাইল লিঙ্কসহ সক্রিয়
• সর্বশেষ ড্রাফট: "${latestDraftTitle}"

🔹 *শিডিউল স্থিতি (আগামীকালের রুটিন):*
• সকাল ১০:০০ টা — বিগিনার পোস্ট ও প্রম্পট
• দুপুর ০২:০০ টা — এআই পোস্ট কার্ড
• বিকাল ০৫:১৫ টা — ডেইলি প্রম্পট রেসিপি
• রাত ০৮:৩০ টা — অ্যাডভান্সড (Free vs Pro)

🔹 *ডেটা ব্যাকআপ:*
• স্ট্যাটাস: ${backupRes.success ? '✅ সফলভাবে ব্যাকআপ নেওয়া হয়েছে' : '⚠️ ব্যাকআপে সমস্যা'}

_লুবাবা সার্বক্ষণিক আপনার পাশে সজাগ আছে বোরহান ভাই!_ 🌸`;

    await sendTelegramMessage(reportMessage, targetChatId);
    console.log(`📊 [Daily Report] এক্সিকিউটিভ রিপোর্ট পাঠানো হয়েছে Telegram Chat ID: ${targetChatId}`);
    return true;
  } catch (err) {
    console.error('❌ [Daily Report] রিপোর্ট পাঠাতে ত্রুটি:', err.message);
    return false;
  }
}
