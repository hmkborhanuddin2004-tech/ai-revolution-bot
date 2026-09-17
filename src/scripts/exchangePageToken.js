/**
 * Never-Expiring Permanent Facebook Page Access Token Generator
 * Usage: node src/scripts/exchangePageToken.js <SHORT_LIVED_USER_TOKEN>
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: 'D:/ai-insight-bot/.env' });

const APP_ID = '1056245927231570';
const APP_SECRET = process.env.FB_APP_SECRET || '6c317c8701230f789deda9c110ea9285';
const PAGE_ID = process.env.FB_PAGE_ID || '1332501043279682';

const inputToken = process.argv[2] || process.env.FB_PAGE_ACCESS_TOKEN;

if (!inputToken) {
  console.error('❌ টোকেন দেওয়া হয়নি! ব্যবহার: node src/scripts/exchangePageToken.js <TOKEN>');
  process.exit(1);
}

async function getPermanentPageToken(userToken) {
  console.log('🔄 ১. শর্ট-লাইভড টোকেনকে লং-লাইভড টোকেনে কনভার্ট করা হচ্ছে...');
  
  const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${encodeURIComponent(userToken)}`;
  
  const exRes = await fetch(exchangeUrl);
  const exData = await exRes.json();
  
  if (exData.error) {
    console.error('❌ এক্সচেঞ্জ এরর:', exData.error.message);
    return null;
  }
  
  const longLivedUserToken = exData.access_token;
  console.log('✅ লং-লাইভড ইউজার টোকেন পাওয়া গেছে!');
  
  console.log('🔄 ২. পেজের পার্মানেন্ট / কখনো মেয়াদ শেষ না হওয়া Page Access Token সংগ্রহ করা হচ্ছে...');
  const pageUrl = `https://graph.facebook.com/v21.0/${PAGE_ID}?fields=access_token,name&access_token=${encodeURIComponent(longLivedUserToken)}`;
  
  const pageRes = await fetch(pageUrl);
  const pageData = await pageRes.json();
  
  if (pageData.error) {
    console.error('❌ পেজ টোকেন এরর:', pageData.error.message);
    return null;
  }
  
  const permanentPageToken = pageData.access_token;
  console.log(`✅ সফল! পেজ নাম: "${pageData.name}"`);
  console.log(`🔑 স্থায়ী পেজ টোকেন:\n${permanentPageToken}\n`);
  
  // Update .env file
  const envPath = 'D:/ai-insight-bot/.env';
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf-8');
    envContent = envContent.replace(/FB_PAGE_ACCESS_TOKEN=.*/, `FB_PAGE_ACCESS_TOKEN=${permanentPageToken}`);
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('💾 .env ফাইলে FB_PAGE_ACCESS_TOKEN সফলভাবে আপডেট ও সেভ হয়েছে!');
  }
  
  return permanentPageToken;
}

getPermanentPageToken(inputToken).then(res => {
  if (res) {
    console.log('🎉 আপনার পেজ টোকেন এখন পার্মানেন্ট (কখনো মেয়াদ শেষ হবে না)!');
  }
  process.exit(res ? 0 : 1);
});
