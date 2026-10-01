import cron from 'node-cron';
import { config, validateConfig } from './config.js';
import { fetchDailyTrendingAITopic } from './services/scavengerService.js';
import { generateTieredPost, WEEKLY_SCHEDULE } from './services/geminiService.js';
import { generateImageUrl } from './services/imageService.js';
import { sendDraftPreview, startApprovalListener, sendTelegramMessage } from './services/telegramService.js';
import { pollingService } from './services/pollingService.js';
import { startWebhookServer } from './services/webhookServer.js';
import { sendDailyExecutiveReport } from './services/reportService.js';
import { startWhatsAppClient } from './services/whatsappService.js';
import { keepAliveService } from './services/keepAliveService.js';

console.log('🚀 Ai Revolution - ৪-স্তরের লাইভ এআই অটোমেশন ও অ্যাসিস্ট্যান্ট বট চালু হচ্ছে...');
validateConfig();

export async function runScavengedCycle(tierLevel = 1, targetChatId = config.telegramChatId, forceRotate = false) {
  try {
    const todayIndex = new Date().getDay();
    const dayPlan = WEEKLY_SCHEDULE[todayIndex] || WEEKLY_SCHEDULE[3];

    console.log(`🔍 [${dayPlan.dayName} - ${dayPlan.pillar}] তাজা টপিক কুড়ানো হচ্ছে (স্তর ${tierLevel}, রোটেট: ${forceRotate})...`);
    const liveTopic = await fetchDailyTrendingAITopic(dayPlan.pillar, todayIndex, tierLevel, forceRotate);

    console.log(`✍️ এআই দিয়ে পোস্ট ড্রাফট তৈরি হচ্ছে: ${liveTopic.title}`);
    const postData = await generateTieredPost(tierLevel, liveTopic, todayIndex);

    console.log(`🎨 ছবির কনসেপ্ট তৈরি হচ্ছে...`);
    const imageUrl = await generateImageUrl(postData.image_prompt);

    const completeDraft = {
      ...postData,
      imageUrl,
      pillarName: `${dayPlan.pillar}: ${liveTopic.title} [${postData.tierName}]`
    };

    console.log(`📲 টেলিগ্রামে প্রিভিউ পাঠানো হচ্ছে...`);
    await sendDraftPreview(completeDraft, targetChatId);
    console.log(`✅ সফলভাবে ড্রাফট পাঠানো হয়েছে!`);
    return completeDraft;
  } catch (err) {
    console.error('❌ সাইকেলে সমস্যা:', err);
    await sendTelegramMessage(`⚠️ এরর রিপোর্ট: ড্রাফট তৈরিতে সমস্যা - ${err.message}`, targetChatId);
  }
}

export async function runCustomCraftCycle(topic, tierLevel = 4, targetChatId = config.telegramChatId) {
  try {
    const todayIndex = new Date().getDay();
    const dayPlan = WEEKLY_SCHEDULE[todayIndex] || WEEKLY_SCHEDULE[3];

    console.log(`🎯 [কাস্টম এজেন্ট ক্রাফট] টপিক: ${topic} (স্তর ${tierLevel})...`);
    const customTopic = {
      title: topic,
      description: `Comprehensive in-depth guide and actionable prompt recipe on ${topic}`
    };

    console.log(`✍️ এআই দিয়ে পোস্ট ড্রাফট তৈরি হচ্ছে: ${topic}`);
    const postData = await generateTieredPost(tierLevel, customTopic, todayIndex);

    console.log(`🎨 সিনেমাটিক ছবির কনসেপ্ট তৈরি হচ্ছে...`);
    const imageUrl = await generateImageUrl(postData.image_prompt);

    const completeDraft = {
      ...postData,
      imageUrl,
      pillarName: `🎯 স্পেশাল পোস্ট: ${topic} [${postData.tierName}]`
    };

    console.log(`📲 টেলিগ্রামে প্রিভিউ পাঠানো হচ্ছে...`);
    await sendDraftPreview(completeDraft, targetChatId);
    console.log(`✅ সফলভাবে কাস্টম ড্রাফট পাঠানো হয়েছে!`);
    return completeDraft;
  } catch (err) {
    console.error('❌ কাস্টম সাইকেলে সমস্যা:', err);
    await sendTelegramMessage(`⚠️ এরর রিপোর্ট: কাস্টম ড্রাফট তৈরিতে সমস্যা - ${err.message}`, targetChatId);
  }
}

export async function runModifyDraftCycle(draft, instruction, targetChatId = config.telegramChatId) {
  try {
    const { modifyDraftContent } = await import('./services/geminiService.js');
    console.log(`🎯 [মডিফাই ড্রাফট] ইনস্ট্রাকশন: ${instruction}...`);
    const modifiedPost = await modifyDraftContent(draft, instruction);
    
    console.log(`🎨 পরিবর্তিত ছবির কনসেপ্ট তৈরি হচ্ছে...`);
    const imageUrl = await generateImageUrl(modifiedPost.image_prompt);
    
    const completeDraft = {
      ...modifiedPost,
      imageUrl,
      pillarName: draft.pillarName,
      tierName: draft.tierName,
      topicName: draft.topicName
    };
    
    console.log(`📲 টেলিগ্রামে সংশোধিত প্রিভিউ পাঠানো হচ্ছে...`);
    await sendDraftPreview(completeDraft, targetChatId);
    console.log(`✅ সফলভাবে সংশোধিত ড্রাফট পাঠানো হয়েছে!`);
    return completeDraft;
  } catch (err) {
    console.error('❌ মডিফাই সাইকেলে সমস্যা:', err);
    await sendTelegramMessage(`⚠️ এরর রিপোর্ট: ড্রাফট মডিফাই করতে সমস্যা - ${err.message}`, targetChatId);
  }
}

export async function runViralWorkflowCycle(niche = 'restaurant', targetChatId = config.telegramChatId) {
  try {
    const { generateViralWorkflowPost } = await import('./services/geminiService.js');
    console.log(`🔥 [ভাইরাল ওয়ার্কফ্লো সাইকেল] নিশ: ${niche}...`);
    const postData = await generateViralWorkflowPost(niche);

    console.log(`🎨 সিনেমাটিক ছবির কনসেপ্ট তৈরি হচ্ছে...`);
    const imageUrl = await generateImageUrl(postData.image_prompt);

    const completeDraft = {
      ...postData,
      imageUrl,
      pillarName: `🔥 ভাইরাল এআই ওয়ার্কফ্লো: ${postData.title}`
    };

    console.log(`📲 টেলিগ্রামে প্রিভিউ পাঠানো হচ্ছে...`);
    await sendDraftPreview(completeDraft, targetChatId);
    console.log(`✅ সফলভাবে ভাইরাল ওয়ার্কফ্লো ড্রাফট পাঠানো হয়েছে!`);
    return completeDraft;
  } catch (err) {
    console.error('❌ ভাইরাল ওয়ার্কফ্লো সাইকেলে সমস্যা:', err);
    await sendTelegramMessage(`⚠️ এরর রিপোর্ট: ভাইরাল ওয়ার্কফ্লো ড্রাফট তৈরিতে সমস্যা - ${err.message}`, targetChatId);
  }
}

// টেলিগ্রাম ইন্টারঅ্যাক্টিভ লিসেনার চালু করা
startApprovalListener(async (action, payload, chatId) => {
  if (action === 'generate_tier') {
    const tier = typeof payload === 'object' ? payload.tier : payload;
    const forceRotate = typeof payload === 'object' ? !!payload.forceRotate : false;
    await runScavengedCycle(tier || 2, chatId, forceRotate);
  } else if (action === 'rotate_topic') {
    const tier = typeof payload === 'object' ? payload.tier : payload;
    await runScavengedCycle(tier || 2, chatId, true);
  } else if (action === 'craft_custom_post') {
    await runCustomCraftCycle(payload.topic, payload.tier || 4, chatId);
  } else if (action === 'craft_viral_post') {
    await runViralWorkflowCycle(payload.niche || 'restaurant', chatId);
  } else if (action === 'modify_draft') {
    await runModifyDraftCycle(payload.draft, payload.instruction, chatId);
  }
});

// ৪-স্তরের ৪টি নির্দিষ্ট শিডিউল (বাংলাদেশ সময়)
// ১. সকাল ১০:০০ টা (বিগিনার - রেগুলার পোস্ট)
cron.schedule('0 10 * * *', async () => {
  console.log('🌅 সকাল ১০:০০ - বিগিনার পোস্ট রান হচ্ছে...');
  await runScavengedCycle(1);
}, { timezone: 'Asia/Dhaka' });

// ২. দুপুর ০২:০০ টা (ইন্টারমিডিয়েট - দিনের একমাত্র পোস্ট কার্ড!)
cron.schedule('0 14 * * *', async () => {
  console.log('☀️ দুপুর ০২:০০ - পোস্ট কার্ড রান হচ্ছে...');
  await runScavengedCycle(2);
}, { timezone: 'Asia/Dhaka' });

// ৩. বিকাল ০৫:১৫ টা (আসরের পর - ডেইলি প্রম্পট রেসিপি / Altiam Kabir স্টাইল)
cron.schedule('15 17 * * *', async () => {
  console.log('🌇 বিকাল ০৫:১৫ (আসরের পর) - ডেইলি প্রম্পট রেসিপি রান হচ্ছে...');
  await runScavengedCycle(4);
}, { timezone: 'Asia/Dhaka' });

// ৪. রাত ০৮:৩০ টা (অ্যাডভান্সড - Free vs Pro রেগুলার পোস্ট)
cron.schedule('30 20 * * *', async () => {
  console.log('🌙 রাত ০৮:৩০ - অ্যাডভান্সড (Free vs Pro) পোস্ট রান হচ্ছে...');
  await runScavengedCycle(3);
}, { timezone: 'Asia/Dhaka' });

// ৫. রাত ১০:৩০ টা (ডেইলি এক্সিকিউটিভ রিপোর্ট ও স্বয়ংক্রিয় ব্যাকআপ)
cron.schedule('30 22 * * *', async () => {
  console.log('📊 রাত ১০:৩০ - ডেইলি এক্সিকিউটিভ রিপোর্ট তৈরি ও স্বয়ংক্রিয় ব্যাকআপ রান হচ্ছে...');
  await sendDailyExecutiveReport();
}, { timezone: 'Asia/Dhaka' });

// 🤖 বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট সার্ভিসেস চালু করা
// ১. ফেসবুক পেজ কমেন্ট ও ইনবক্স মেসেজ স্মার্ট পোলিং
pollingService.start();

// ২. রিয়েল-টাইম ওয়েবহুক রিসিভার (লোকালে ৩০০১, রেন্ডারে process.env.PORT)
const serverPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
startWebhookServer(serverPort);

// ৩. ২৪/৭ ক্লাউড কিপ-অ্যালাইভ সেলফ-পিং সার্ভিস চালু করা (রেন্ডার স্লিপ প্রতিরোধ)
keepAliveService.start();

// ৩. 📱 WhatsApp পার্সোনাল অ্যাসিস্ট্যান্ট চালু করা (লোকাল মেশিনের জন্য)
// 🔴 কঠোর নিয়ম: গ্রুপে কোনো রিপ্লাই দেবে না — কোডে লক করা
if (!process.env.RENDER && process.env.ENABLE_LOCAL_WHATSAPP === 'true') {
  startWhatsAppClient().then((client) => {
    if (client) {
      console.log('📱 WhatsApp অ্যাসিস্ট্যান্ট চালু হয়েছে (গ্রুপে রিপ্লাই নিষিদ্ধ)।');
    } else {
      console.warn('⚠️ WhatsApp অ্যাসিস্ট্যান্ট চালু হয়নি — QR কোড স্ক্যান করুন।');
    }
  }).catch((err) => {
    console.warn('⚠️ WhatsApp start warning:', err.message);
  });
} else {
  console.log('☁️ রেন্ডার ক্লাউডে ফেসবুক, মেসেঞ্জার ও টেলিগ্রাম পূর্ণ গতিতে সক্রিয় (হোয়াটসঅ্যাপ লোকাল মোডে সংরক্ষিত)।');
}

// ক্র্যাশ প্রতিরোধ ও অটো-রিকভারি
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception হ্যান্ডেল করা হয়েছে:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('🚨 Unhandled Rejection হ্যান্ডেল করা হয়েছে:', reason);
});

process.on('exit', (code) => {
  console.error('🛑 প্রসেস এক্সিট হচ্ছে, কোড:', code);
});

// প্রতি ৩০ মিনিটে হার্টবিট মনিটর
setInterval(() => {
  const nowStr = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' });
  console.log(`💓 [Heartbeat ${nowStr}] Ai Revolution বট ও অ্যাসিস্ট্যান্ট সার্বক্ষণিক সক্রিয় আছে...`);
}, 30 * 60 * 1000);

console.log('⏰ ৫টি দৈনিক শিডিউলার সক্রিয়: সকাল ১০:০০, দুপুর ২:০০, বিকাল ৫:১৫, রাত ৮:৩০ ও রাত ১০:৩০ (ডেইলি রিপোর্ট)');
console.log('🌟 বট ও বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট সম্পূর্ণ প্রস্তুত ও সার্বক্ষণিক সক্রিয়!');
