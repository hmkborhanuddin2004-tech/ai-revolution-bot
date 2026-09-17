import { assistantService, BORHAN_FB_PROFILE, cleanVisitorName } from '../services/assistantService.js';
import { generatePublicAssistantReply, sanitizeAssistantReply } from '../services/geminiService.js';

async function runTests() {
  console.log('=== 🧪 Testing Assistant Service & Reply Templates ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Check constants
  assert(BORHAN_FB_PROFILE === 'https://www.facebook.com/share/19f1qHdhKW/', 'BORHAN_FB_PROFILE matches required URL');

  // Mock Telegram escalation alert during test to avoid sending fake notifications to Borhan Sir
  let lastEscalationPayload = null;
  assistantService.telegramAlert = {
    sendEscalationAlert: async (payload) => {
      lastEscalationPayload = payload;
      return true;
    }
  };

  // 2. Test Inquiry vs General Opinion Classification
  const generalOpinions = [
    'মানুষের সহজাত সৃজনশীলতা ও আবেগ এআই-এর পক্ষে অর্জন করা অসম্ভব',
    'এআই মানুষের চাকরি খেয়ে ফেলবে',
    'চমৎকার তথ্যবহুল পোস্ট',
    'Nice post brother',
    'অনেক সুন্দর পোস্ট',
    'মাশাআল্লাহ',
    'ধন্যবাদ',
    'দারুণ লিখেছেন',
    'একমত কিন্তু কথা আছে',
    'খুব সুন্দর হয়েছে'
  ];

  for (const text of generalOpinions) {
    const isQuestion = assistantService.isSpecificInquiry(text);
    assert(!isQuestion, `General opinion should NOT be specific inquiry: "${text}"`);
  }

  // Test Bengali inquiries WITHOUT question marks (verifies Unicode boundary fix)
  const inquiriesWithoutQuestionMark = [
    'এআই শিখতে কি কোর্স লাগবে',
    'এটা কিভাবে করব',
    'কোর্স ফি কত',
    'আমি ওয়েব ডেভেলপমেন্ট শিখতে চাই',
    'কোথায় যোগাযোগ করতে হবে'
  ];

  for (const text of inquiriesWithoutQuestionMark) {
    const isQuestion = assistantService.isSpecificInquiry(text);
    assert(isQuestion, `Inquiry without question mark MUST be recognized: "${text}"`);
  }

  // Test inquiries with question marks and escalations
  const inquiriesWithQuestionMark = [
    'কীভাবে এআই প্রম্পট লিখব?',
    'ওয়েবসাইট বানাতে কত টাকা লাগবে?',
    'আপনারা কি চ্যাটবট বানান?',
    'How can I learn AI automation?',
    'বোরহান স্যারের সাথে পার্সোনালি কথা বলতে চাই',
    'কাজ দিতে চাই, বাজেট ৫০ হাজার'
  ];

  for (const text of inquiriesWithQuestionMark) {
    const isQuestion = assistantService.isSpecificInquiry(text);
    assert(isQuestion, `Standard inquiry should be recognized: "${text}"`);
  }

  // 3. Test cleanVisitorName
  console.log('\n--- Testing Visitor Name Cleaner ---');
  assert(cleanVisitorName('তানভীর') === 'তানভীর', 'cleanVisitorName retains valid name');
  assert(cleanVisitorName('জনাব তানভীর') === 'তানভীর', 'cleanVisitorName strips "জনাব" from name');
  assert(cleanVisitorName('তানভীর ভাই') === 'তানভীর', 'cleanVisitorName strips "ভাই" from name');
  assert(cleanVisitorName('রফিক সাহেব') === 'রফিক', 'cleanVisitorName strips "সাহেব" from name');
  assert(cleanVisitorName('মুহতারাম রফিক') === 'রফিক', 'cleanVisitorName strips "মুহতারাম" from name');
  assert(cleanVisitorName('Facebook User') === '', 'cleanVisitorName filters Facebook User');
  assert(cleanVisitorName('গ্রাহক') === '', 'cleanVisitorName filters generic গ্রাহক');
  assert(cleanVisitorName('ইউজার') === '', 'cleanVisitorName filters generic ইউজার');
  assert(cleanVisitorName('ভিজিটর') === '', 'cleanVisitorName filters generic ভিজিটর');
  assert(cleanVisitorName('') === '', 'cleanVisitorName handles empty name');

  // 4. Test sanitizeAssistantReply Unit Logic
  console.log('\n--- Testing Reply Sanitization Unit Logic ---');
  const sample1 = 'ওয়ালাইকুম আসসালাম ওয়া রাহমাতুল্লাহ, তানভীর ভাই। আপনার ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট প্রজেক্টের বিষয়ে বোরহান স্যারের টিম আপনাকে সর্বাত্মক সহযোগিতা করতে প্রস্তুত। বিস্তারিত তথ্যের জন্য বোরহান স্যারের প্রোফাইলে যোগাযোগ করতে পারেন: https://www.facebook.com/share/19f1qHdhKW/';
  const cleaned1 = sanitizeAssistantReply(sample1);
  assert(!cleaned1.includes('ওয়ালাইকুম আসসালাম'), 'Sanitizer strips leading salam');
  assert(!cleaned1.includes('তানভীর ভাই'), 'Sanitizer strips informal brother suffix');
  assert(cleaned1.includes('তানভীর'), 'Sanitizer preserves visitor name');
  assert(!cleaned1.includes(BORHAN_FB_PROFILE), 'Sanitizer strips redundant profile link');
  assert(cleaned1.endsWith('।'), 'Sanitizer preserves sentence-ending Dari (।)');

  const sample2 = 'আমাদের প্ল্যাটফর্মের প্রতিষ্ঠাতা ও প্রধান প্রকৌশলী বোরহান স্যারের দর্শন অনুযায়ী, এআই মানুষের কাজের গতি বহুগুণ বাড়ায়।';
  const cleaned2 = sanitizeAssistantReply(sample2);
  assert(!cleaned2.includes('দর্শন অনুযায়ী'), 'Sanitizer strips "দর্শন অনুযায়ী"');
  assert(!cleaned2.includes('প্রধান প্রকৌশলী'), 'Sanitizer strips "প্রধান প্রকৌশলী"');
  assert(cleaned2.endsWith('।'), 'Sanitizer preserves Dari in philosophical filter');

  // Verify that "জনাব" is properly removed without corrupting visitor names into "জতানভীর"
  const sampleJanab = 'জনাব তানভীর, আপনার প্রজেক্টের বিষয়ে আমাদের টিম প্রস্তুত।';
  const cleanedJanab = sanitizeAssistantReply(sampleJanab);
  assert(!cleanedJanab.includes('জনাব'), 'Sanitizer strips stiff/robotic "জনাব" addressing');
  assert(!cleanedJanab.startsWith('জতানভীর'), 'Sanitizer does NOT mangle name into "জতানভীর"');
  assert(cleanedJanab.startsWith('তানভীর'), 'Sanitizer cleanly preserves visitor name at start');
  assert(cleanedJanab.endsWith('।'), 'Sanitizer preserves sentence-ending Dari (।)');

  // Standalone "জনাব," addressing
  const sampleStandaloneJanab = 'জনাব, আপনার প্রশ্নের উত্তর দিচ্ছি।';
  const cleanedStandaloneJanab = sanitizeAssistantReply(sampleStandaloneJanab);
  assert(!cleanedStandaloneJanab.includes('জনাব'), 'Sanitizer strips standalone "জনাব"');
  assert(!cleanedStandaloneJanab.startsWith('জ'), 'Sanitizer leaves no partial "জ" letter');
  assert(cleanedStandaloneJanab.startsWith('আপনার'), 'Sanitizer starts directly with natural text');

  // Female honorific "জনাবা"
  const sampleJanaba = 'জনাবা ফাতেমা, বিস্তারিত আলোচনা করতে ইনবক্স করুন।';
  const cleanedJanaba = sanitizeAssistantReply(sampleJanaba);
  assert(!cleanedJanaba.includes('জনাবা'), 'Sanitizer strips "জনাবা"');
  assert(cleanedJanaba.startsWith('ফাতেমা'), 'Sanitizer preserves female visitor name');

  // Muhtaram addressing
  const sampleMuhtaram = 'মুহতারাম রফিক, বিস্তারিত জানতে ইনবক্স করুন।';
  const cleanedMuhtaram = sanitizeAssistantReply(sampleMuhtaram);
  assert(!cleanedMuhtaram.includes('মুহতারাম'), 'Sanitizer strips stiff "মুহতারাম" addressing');
  assert(cleanedMuhtaram.startsWith('রফিক'), 'Sanitizer preserves name after stripping "মুহতারাম"');

  // Saheb addressing
  const sampleSaheb = 'অবশ্যই, রফিক সাহেব। এআই আপনার কাজে সাহায্য করবে।';
  const cleanedSaheb = sanitizeAssistantReply(sampleSaheb);
  assert(!cleanedSaheb.includes('সাহেব'), 'Sanitizer strips artificial "সাহেব" addressing');
  assert(cleanedSaheb.includes('রফিক'), 'Sanitizer preserves name after stripping "সাহেব"');

  // Generic honorifics
  const sampleGeneric = 'সম্মানিত গ্রাহক, আপনার বিষয়টি দেখছি।';
  const cleanedGeneric = sanitizeAssistantReply(sampleGeneric);
  assert(!cleanedGeneric.includes('সম্মানিত গ্রাহক'), 'Sanitizer strips "সম্মানিত গ্রাহক"');
  assert(cleanedGeneric.startsWith('আপনার'), 'Sanitizer starts directly after generic honorific');

  // Comprehensive Salam and Greeting stripping variations
  const greetingVariations = [
    { input: 'আস-সালামু আলাইকুম, কেমন আছেন?', expectedStart: 'কেমন আছেন?' },
    { input: 'ওয়ালাইকুমুস সালাম, ধন্যবাদ আপনাকে।', expectedStart: 'ধন্যবাদ আপনাকে।' },
    { input: 'সালামু আলাইকুম, কাজটা কি হবে?', expectedStart: 'কাজটা কি হবে?' },
    { input: 'ওয়া আলাইকুমুস সালাম, অবশ্যই আমরা আছি।', expectedStart: 'অবশ্যই আমরা আছি।' },
    { input: 'ওয়ালাইকুম আস-সালাম, স্বাগতম।', expectedStart: 'স্বাগতম।' },
    { input: 'সালাম ও শুভেচ্ছা, আমাদের টিম প্রস্তুত।', expectedStart: 'আমাদের টিম প্রস্তুত।' },
    { input: 'হ্যালো, সাহায্য দরকার।', expectedStart: 'সাহায্য দরকার।' },
    { input: 'Hi, I need assistance.', expectedStart: 'I need assistance.' }
  ];

  for (const g of greetingVariations) {
    const cleanedG = sanitizeAssistantReply(g.input);
    assert(cleanedG.startsWith(g.expectedStart), `Greeting variation stripped correctly: "${g.input}" -> "${cleanedG}"`);
  }

  // 4. Test Facebook Comment with General Opinion
  console.log('\n--- Testing General Opinion Comment ---');
  const commentTest1 = await assistantService.processComment({
    userName: 'আব্দুর রহমান',
    commentText: 'মানুষের সহজাত সৃজনশীলতা ও আবেগ এআই-এর পক্ষে অর্জন করা অসম্ভব',
    commentId: 'c_test_01',
    postId: 'p_test_01'
  });

  console.log('Reply 1:', commentTest1.reply1);
  console.log('Reply 2:', commentTest1.reply2);

  assert(commentTest1.reply1.includes('আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।'), 'Comment reply1 includes dignified Islamic greeting');
  assert(commentTest1.reply1.includes('আমি বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট।'), 'Comment reply1 identifies as Borhan Sir AI assistant');
  assert(commentTest1.reply1.includes('আপনাকে কমেন্ট করার জন্য অসংখ্য ধন্যবাদ।'), 'Comment reply1 expresses refined gratitude for comment');
  assert(commentTest1.reply1.includes(BORHAN_FB_PROFILE), 'Comment reply1 includes Borhan Sir profile link');
  assert(!commentTest1.reply1.startsWith('@'), 'Comment reply1 does NOT start with robotic @ prefix');
  assert(commentTest1.reply1.startsWith('আসসালামু আলাইকুম'), 'Comment reply1 starts directly with natural greeting');
  assert(commentTest1.reply2 === null, 'Comment reply2 is strictly null (no split second comment)');

  // 5. Test Facebook Messenger Message with General Greeting
  console.log('\n--- Testing Messenger General Message ---');
  const messengerTest1 = await assistantService.processMessengerMessage({
    userName: 'শাকিল আহমেদ',
    messageText: 'হ্যালো',
    senderPsid: 'psid_test_01'
  });

  console.log('Messenger Reply 1:', messengerTest1.reply1);
  console.log('Messenger Reply 2:', messengerTest1.reply2);

  assert(messengerTest1.reply1.includes('আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।'), 'Messenger reply1 includes dignified Islamic greeting');
  assert(messengerTest1.reply1.includes('আমি বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট।'), 'Messenger reply1 identifies as Borhan Sir AI assistant');
  assert(messengerTest1.reply1.includes('আপনাকে মেসেজ করার জন্য অসংখ্য ধন্যবাদ।'), 'Messenger reply1 expresses refined gratitude for message');
  assert(messengerTest1.reply1.includes(BORHAN_FB_PROFILE), 'Messenger reply1 includes Borhan Sir personal Facebook link');
  assert(messengerTest1.reply2 === null, 'Messenger reply2 is null for simple greeting');

  // 6. Test Facebook Comment with Project / Specific Inquiry (Single Clean Comment on Posts)
  console.log('\n--- Testing Project Inquiry Comment (Single Comment Flow) ---');
  const commentTest2 = await assistantService.processComment({
    userName: 'তানভীর',
    commentText: 'আমাদের একটি ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট প্রজেক্ট আছে, বাজেট ৫০ হাজার। কাজ করতে আগ্রহী?',
    commentId: 'c_test_02',
    postId: 'p_test_02'
  });

  console.log('Inquiry Single Reply 1:', commentTest2.reply1);
  console.log('Inquiry Reply 2 (must be null):', commentTest2.reply2);
  console.log('Escalated:', commentTest2.escalated);

  assert(commentTest2.reply1.includes(BORHAN_FB_PROFILE), 'Single inquiry comment includes Borhan Sir link');
  assert(commentTest2.reply1.includes('আসসালামু আলাইকুম'), 'Single inquiry comment includes greeting');
  assert(!commentTest2.reply1.includes('জনাব'), 'Single inquiry comment does NOT contain stiff "জনাব"');
  assert(!commentTest2.reply1.includes('জতানভীর'), 'Single inquiry comment does NOT contain mangled "জতানভীর"');
  assert(!commentTest2.reply1.includes('তানভীর ভাই'), 'Single inquiry comment does NOT address visitor with informal "ভাই"');
  assert(!commentTest2.reply1.includes('দর্শন অনুযায়ী'), 'Single inquiry comment does NOT contain "দর্শন অনুযায়ী"');
  assert(!commentTest2.reply1.includes('ওয়ালাইকুম আসসালাম'), 'Single inquiry comment does NOT contain duplicate salam');
  assert(commentTest2.reply2 === null, 'Comment reply2 is strictly null - always single comment on Facebook posts');
  assert(commentTest2.escalated === true, 'Project inquiry is escalated');
  assert(commentTest2.reply1.includes('বোরহান স্যারকে আপনার এই গুরুত্বপূর্ণ বিষয়টি আমি সরাসরি টেলিগ্রামে জানিয়ে দিয়েছি'), 'Escalation note attached to single comment');
  assert(lastEscalationPayload !== null && lastEscalationPayload.senderName === 'তানভীর', 'Telegram escalation payload correctly created without sending live spam');

  // 7. Test Facebook Messenger Message with Specific Inquiry
  console.log('\n--- Testing Messenger Specific Inquiry ---');
  const messengerTest2 = await assistantService.processMessengerMessage({
    userName: 'তানভীর',
    messageText: 'আমাদের একটি ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট প্রজেক্ট আছে, বাজেট ৫০ হাজার। কাজ করতে আগ্রহী?',
    senderPsid: 'psid_test_02'
  });

  console.log('Messenger Inquiry Reply 1:', messengerTest2.reply1);
  console.log('Messenger Inquiry Reply 2:', messengerTest2.reply2);
  assert(messengerTest2.reply1 !== null, 'Messenger reply1 is sent for inquiry');
  assert(messengerTest2.reply2 !== null, 'Messenger reply2 is sent for inquiry');
  assert(!messengerTest2.reply2.includes('জনাব'), 'Messenger reply2 does NOT contain stiff "জনাব"');
  assert(!messengerTest2.reply2.includes('জতানভীর'), 'Messenger reply2 does NOT contain mangled "জতানভীর"');
  assert(!messengerTest2.reply2.includes('তানভীর ভাই'), 'Messenger reply2 does NOT contain informal "ভাই"');
  assert(!messengerTest2.reply2.includes('ওয়ালাইকুম আসসালাম'), 'Messenger reply2 does NOT contain duplicate salam');
  assert(messengerTest2.escalated === true, 'Messenger inquiry is escalated');

  // 8. Test Gemini Public Assistant Reply directly for refined dignified tone
  console.log('\n--- Testing Gemini Public Assistant Reply ---');
  const geminiReply = await generatePublicAssistantReply({
    userName: 'রফিক',
    userText: 'এআই কি মানুষের কাজের গতি বাড়াতে সাহায্য করে?',
    contextType: 'comment'
  });
  console.log('Gemini Generated Reply:', geminiReply);

  assert(!geminiReply.includes('জনাব'), 'Gemini reply does NOT contain stiff "জনাব"');
  assert(!geminiReply.includes('মুহতারাম'), 'Gemini reply does NOT contain stiff "মুহতারাম"');
  assert(!geminiReply.includes('সাহেব'), 'Gemini reply does NOT contain artificial "সাহেব"');
  assert(!geminiReply.includes('ভাই'), 'Gemini reply does NOT contain informal "ভাই"');
  assert(!geminiReply.includes('দর্শন অনুযায়ী'), 'Gemini reply does NOT contain unnatural "দর্শন অনুযায়ী"');
  assert(!geminiReply.includes('প্রধান প্রকৌশলী'), 'Gemini reply does NOT contain pompous phrase "প্রধান প্রকৌশলী"');
  assert(!geminiReply.includes('ওয়ালাইকুম আসসালাম'), 'Gemini reply does NOT contain duplicate salam');
  assert(geminiReply.length > 5, 'Gemini reply generated meaningful content');

  // 9. Test Abusive Filter
  console.log('\n--- Testing Abusive Language Handling ---');
  const abusiveComment = await assistantService.processComment({
    userName: 'খারাপ লোক',
    commentText: 'তুই একটা শুয়োর',
    commentId: 'c_bad_01',
    postId: 'p_bad_01'
  });
  assert(abusiveComment.reply1.includes('মার্জিত ও শালীন ভাষা'), 'Abusive comment returns polite dignity warning in reply1');
  assert(abusiveComment.reply2 === null, 'Abusive comment reply2 is null');

  const abusiveMessenger = await assistantService.processMessengerMessage({
    userName: 'খারাপ লোক',
    messageText: 'তুই একটা শুয়োর',
    senderPsid: 'bad_psid_01'
  });
  assert(abusiveMessenger.reply1.includes('মার্জিত ও শালীন ভাষা'), 'Abusive messenger returns polite dignity warning in reply1');
  assert(abusiveMessenger.reply2 === null, 'Abusive messenger reply2 is null');

  console.log(`\n================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
