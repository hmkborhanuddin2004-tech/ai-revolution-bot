const fs = require('fs');
let content = fs.readFileSync('D:/ai-insight-bot/src/services/telegramService.js', 'utf8');

const importStmt = "import { processAssistantMessage, processFile } from './personalAssistantService.js';\n";
if (!content.includes(importStmt)) {
    content = content.replace("import { chatWithGemini } from './geminiService.js';", "import { chatWithGemini } from './geminiService.js';\n" + importStmt);
}

const docHandler =             if (msg.document) {
              console.log(\📎 ডকুমেন্ট রিসিভ হয়েছে [\]: \\);
              await sendTelegramMessage('📎 ফাইলটি পেয়েছি! একটু সময় দিন, আমি পড়ছি...', fromId);
              const reply = await processFile(msg.document, msg.caption);
              await sendTelegramMessage(reply, fromId);
              continue;
            };

if (!content.includes("if (msg.document)")) {
    content = content.replace("if (!msg.text) {", docHandler + "\n\n            if (!msg.text) {");
}

const newStart =                 \🎮 *কমান্ড শর্টকাট (পেজ ম্যানেজমেন্ট):*\\n\ +
                \• /card - এখনই দুপুরের পোস্ট কার্ড বানাও\\n\ +
                \• /prompt - এখনই আসরের প্রম্পট রেসিপি পোস্ট বানাও\\n\ +
                \• /morning - সকালের বিগিনার পোস্ট বানাও\\n\ +
                \• /night - রাতের Free vs Pro পোস্ট বানাও\\n\ +
                \• /craft <টপিক> - যেকোনো পছন্দের বিষয়ে পোস্ট ও সিনেমাটিক ছবি তৈরি\\n\ +
                \• /agent - স্বায়ত্তশাসিত এআই এজেন্ট স্ট্যাটাস ও পাওয়ারফুল টুলস\\n\ +
                \• /status - বট স্ট্যাটাস ও ফেসবুক কানেকশন চেক\\n\\n\ +
                \🤖 *পার্সোনাল অ্যাসিস্ট্যান্ট মোড:*\\n\ +
                \• /help - অ্যাসিস্ট্যান্টের সব ফিচার দেখতে\\n\ +
                \• যেকোনো ফাইল (PDF/TXT) সেন্ড করলে আমি পড়ে বিশ্লেষণ করব!\\n\\n\ +;

if (!content.includes("পার্সোনাল অ্যাসিস্ট্যান্ট মোড")) {
    content = content.replace(/🎮 \*কমান্ড শর্টকাট:\*\\n \+[\s\S]*?• \/status - বট স্ট্যাটাস ও ফেসবুক কানেকশন চেক\\n\\n \+/, newStart);
}

const routingLogic =             // পার্সোনাল অ্যাসিস্ট্যান্ট মোডে রাউটিং
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
            };

if (content.includes("// কোনো নির্দিষ্ট কমান্ড না হলে Gemini দিয়ে ফ্রেন্ডলি চ্যাট করা")) {
    content = content.replace(/\/\/ কোনো নির্দিষ্ট কমান্ড না হলে Gemini দিয়ে ফ্রেন্ডলি চ্যাট করা[\s\S]*?(?=continue;)/, routingLogic + "\n            ");
}

fs.writeFileSync('D:/ai-insight-bot/src/services/telegramService.js', content, 'utf8');
console.log('patched');
