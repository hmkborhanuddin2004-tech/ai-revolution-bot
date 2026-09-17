import assert from 'assert';
import { isDuplicateTopic, fetchDailyTrendingAITopic } from '../services/scavengerService.js';
import { formatWeeklyScheduleMessage, WEEKLY_SCHEDULE } from '../services/geminiService.js';

async function runVerification() {
  console.log('🧪 টপিক ডাইভার্সিটি ও অ্যান্টি-রিপিটিশন টেস্ট শুরু হচ্ছে...');

  // ১. ডুপ্লিকেট চেকার টেস্ট
  const seenTopics = [
    { title: 'Create a website in 60 seconds with Bolt.new and v0.dev', date: new Date().toISOString() },
    { title: 'Top 5 AI tools for making food restaurant posters', date: new Date().toISOString() }
  ];

  // টেস্ট ১.১: একই ক্লাস্টার (website) এর ডুপ্লিকেট ব্লক হওয়া উচিত
  const webDupe = isDuplicateTopic('Building a web app with cursor and v0 coding ছাড়া', seenTopics, 48);
  assert.strictEqual(webDupe, true, 'Website cluster collision should be blocked');
  console.log('✅ টেস্ট ১.১ পাস: একই ক্লাস্টারের টপিক সফলভাবে ব্লক হয়েছে।');

  // টেস্ট ১.২: সম্পূর্ণ ভিন্ন ক্লাস্টার (excel) পাস হওয়া উচিত
  const excelTopic = isDuplicateTopic('Master Excel VLOOKUP formulas in 5 seconds with ChatGPT', seenTopics, 48);
  assert.strictEqual(excelTopic, false, 'Different cluster (excel) should be allowed');
  console.log('✅ টেস্ট ১.২ পাস: সম্পূর্ণ ভিন্ন ক্লাস্টারের টপিক অনুমোদিত হয়েছে।');

  // ২. শিডিউল মেসেজ টেস্ট
  const scheduleMsg = formatWeeklyScheduleMessage();
  assert.ok(scheduleMsg.includes('Ai Revolution সাপ্তাহিক কন্টেন্ট শিডিউল'), 'Schedule message should contain header');
  assert.ok(!scheduleMsg.includes('━━━━') && !scheduleMsg.includes('────'), 'Schedule message must not contain divider lines');
  assert.ok(scheduleMsg.includes('রবিবার') && scheduleMsg.includes('বৃহস্পতিবার'), 'Schedule message must contain week days');
  console.log('✅ টেস্ট ২ পাস: সাপ্তাহিক শিডিউল কোনো ডিভাইডার লাইন ছাড়াই নিখুঁতভাবে তৈরি হয়েছে।');

  // ৩. বৃহস্পতিবারের ৪টি টিয়ারের সাব-থিম ডাইভার্সিটি টেস্ট
  const thuData = WEEKLY_SCHEDULE[4];
  assert.ok(thuData.tierThemes[1].title.includes('ফর্ম') || thuData.tierThemes[1].title.includes('Form'), 'Tier 1 subtheme check');
  assert.ok(thuData.tierThemes[2].title.includes('Make.com') || thuData.tierThemes[2].title.includes('হ্যাক'), 'Tier 2 subtheme check');
  assert.ok(thuData.tierThemes[4].title.includes('ল্যান্ডিং পেজ') || thuData.tierThemes[4].title.includes('কপিরাইটিং'), 'Tier 4 subtheme check');
  assert.ok(thuData.tierThemes[3].title.includes('Lovable') || thuData.tierThemes[3].title.includes('তুলনা'), 'Tier 3 subtheme check');
  console.log('✅ টেস্ট ৩ পাস: বৃহস্পতিবারের ৪টি স্তরের উপ-বিষয় সম্পূর্ণ আলাদা ও সমৃদ্ধ।');

  // ৪. ফোর্স রোটেশন টেস্ট
  const rotated1 = await fetchDailyTrendingAITopic(null, 4, 2, true);
  const rotated2 = await fetchDailyTrendingAITopic(null, 4, 2, true);
  assert.ok(rotated1 && rotated1.title, 'Rotated topic 1 must exist');
  assert.ok(rotated2 && rotated2.title, 'Rotated topic 2 must exist');
  assert.notStrictEqual(rotated1.title, rotated2.title, 'Two consecutive force rotates must not be identical');
  console.log(`✅ টেস্ট ৪ পাস: পরপর দুটি ফোর্স রোটেশন ফ্রেশ টপিক দিয়েছে:\n  1. "${rotated1.title}"\n  2. "${rotated2.title}"`);

  console.log('\n🎉 সমস্ত ৪টি টপিক ডাইভার্সিটি টেস্ট ১০০% সফলভাবে পাস করেছে!');
}

runVerification().catch(err => {
  console.error('❌ টেস্ট ব্যর্থ হয়েছে:', err);
  process.exit(1);
});
