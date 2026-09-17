import fs from 'fs';
import path from 'path';
import { config } from './src/config.js';

const APP_ID = '1056245927231570';
const PAGE_ID = config.fbPageId;
const ENV_FILE = path.resolve('.env');

export async function exchangeToPermanentToken(appSecret, currentToken = config.fbPageAccessToken) {
  if (!appSecret) {
    throw new Error('App Secret প্রদান করতে হবে!');
  }

  console.log('🔄 স্টেপ ১: লং-লাইভড টোকেনে রূপান্তর করা হচ্ছে...');
  const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`;
  
  const res1 = await fetch(exchangeUrl);
  const data1 = await res1.json();

  if (data1.error) {
    throw new Error(`এক্সচেঞ্জ ব্যর্থ: ${data1.error.message}`);
  }

  const longLivedUserToken = data1.access_token;
  console.log('✅ লং-লাইভড টোকেন প্রাপ্ত হয়েছে!');

  console.log('🔄 স্টেপ ২: পার্মানেন্ট (Never-Expiring) পেজ টোকেন সংগ্রহ করা হচ্ছে...');
  const pageUrl = `https://graph.facebook.com/v21.0/${PAGE_ID}?fields=access_token&access_token=${longLivedUserToken}`;
  const res2 = await fetch(pageUrl);
  const data2 = await res2.json();

  if (data2.error) {
    // me/accounts দিয়ে অলটারনেটিভ ট্রাই
    const accountsUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedUserToken}`;
    const resAccounts = await fetch(accountsUrl);
    const dataAccounts = await resAccounts.json();
    const foundPage = dataAccounts.data?.find(p => p.id === PAGE_ID);
    if (foundPage?.access_token) {
      data2.access_token = foundPage.access_token;
    } else {
      throw new Error(`পেজ টোকেন উদ্ধার করা যায়নি: ${data2.error?.message || 'Page not found'}`);
    }
  }

  const permanentPageToken = data2.access_token;
  console.log('🎉 পার্মানেন্ট পেজ এক্সেস টোকেন সফলভাবে তৈরি হয়েছে!');

  // .env ফাইল আপডেট করা
  let envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  if (envContent.includes('FB_PAGE_ACCESS_TOKEN=')) {
    envContent = envContent.replace(/FB_PAGE_ACCESS_TOKEN=.*/, `FB_PAGE_ACCESS_TOKEN=${permanentPageToken}`);
  } else {
    envContent += `\nFB_PAGE_ACCESS_TOKEN=${permanentPageToken}\n`;
  }

  if (!envContent.includes('FB_APP_SECRET=')) {
    envContent += `FB_APP_SECRET=${appSecret}\n`;
  } else {
    envContent = envContent.replace(/FB_APP_SECRET=.*/, `FB_APP_SECRET=${appSecret}`);
  }

  fs.writeFileSync(ENV_FILE, envContent, 'utf-8');
  console.log('💾 .env ফাইলে পার্মানেন্ট টোকেন ও অ্যাপ সিক্রেট সংরক্ষণ করা হয়েছে!');

  return permanentPageToken;
}

// যদি সরাসরি রান করা হয়: node exchange_token.js <app_secret>
if (process.argv[2]) {
  exchangeToPermanentToken(process.argv[2])
    .then(() => {
      console.log('✅ কাজ ১০০% সম্পন্ন!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ এরর:', err.message);
      process.exit(1);
    });
}
