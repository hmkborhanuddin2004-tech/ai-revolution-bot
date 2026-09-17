/**
 * WhatsApp QR Code Authenticator
 * একবার চালালেই QR কোড দেখাবে — স্ক্যান করলেই শেষ!
 * পরে আর চালাতে হবে না, session স্বয়ংক্রিয় সেভ থাকে।
 */

import pkg from 'whatsapp-web.js';
const actual = pkg.default || pkg;
const { Client, LocalAuth } = actual;
import qrcode from 'qrcode-terminal';

console.log('==============================================');
console.log('  📱 WhatsApp QR Authentication Tool');
console.log('  বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট সেটআপ');
console.log('==============================================');
console.log('');
console.log('⏳ WhatsApp সংযোগ প্রস্তুত হচ্ছে, একটু অপেক্ষা করুন...');
console.log('');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: 'D:/ai-insight-bot/data/whatsapp-session'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

client.on('qr', async (qr) => {
  console.log('');
  console.log('✅ QR কোড প্রস্তুত! এখন স্ক্যান করুন:');
  console.log('');
  console.log('আপনার ফোনে: WhatsApp → ⋮ (তিনটি ডট) → Linked Devices → Link a Device');
  console.log('');
  qrcode.generate(qr, { small: true });
  console.log('');

  try {
    const QRCodeImg = await import('qrcode');
    const qrSaver = QRCodeImg.default || QRCodeImg;
    const brainQrPath = 'C:/Users/assdi/.gemini/antigravity/brain/b42529dc-7d3f-4527-9fb7-7db67a924824/whatsapp_qr.png';
    await qrSaver.toFile(brainQrPath, qr, { width: 450, margin: 2 });
    await qrSaver.toFile('D:/ai-insight-bot/whatsapp_qr.png', qr, { width: 450, margin: 2 });
    console.log('📸 QR কোডের ছবি সেভ হয়েছে: whatsapp_qr.png');
  } catch (imgErr) {
    // Ignore image save error
  }

  console.log('⏳ স্ক্যানের জন্য অপেক্ষা করছি...');
});

client.on('authenticated', () => {
  console.log('');
  console.log('✅ সফলভাবে অথেন্টিকেট হয়েছে! Session সেভ হচ্ছে...');
});

client.on('ready', () => {
  console.log('');
  console.log('🎉 WhatsApp সম্পূর্ণ প্রস্তুত!');
  console.log('✅ এখন এই উইন্ডো বন্ধ করতে পারেন।');
  console.log('✅ বট পরের বার চালালে WhatsApp স্বয়ংক্রিয়ভাবে কানেক্ট হবে।');
  console.log('');
  setTimeout(() => process.exit(0), 3000);
});

client.on('auth_failure', (msg) => {
  console.error('❌ অথেন্টিকেশন ব্যর্থ হয়েছে:', msg);
  process.exit(1);
});

client.initialize().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
