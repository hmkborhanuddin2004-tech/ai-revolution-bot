import { sendDraftPreview } from '../services/telegramService.js';
import { generateImageUrl } from '../services/imageService.js';

async function sendTestPostCard() {
  console.log('🎨 পোস্ট কার্ড তৈরি হচ্ছে...');

  const imagePrompt = "A futuristic glowing holographic microphone and open digital book with floating cyan sound waves and audio waveforms, dark navy blue aesthetic, studio lighting, photorealistic 8k, elegant tech background";
  const imageUrl = await generateImageUrl(imagePrompt);

  const post1 = {
    title: "গুগলের অবিশ্বাস্য ফ্রি এআই জাদু! ৫০ পৃষ্ঠার পিডিএফ রূপ নেবে রেডিও পডকাস্টে",
    pillarName: "সকাল ১০:০০ টা • লেভেল ১: বিগিনার স্তর (পোস্ট কার্ড ১)",
    content: `╔══════════════════════════╗\n🎙️ গুগলের অবিশ্বাস্য ফ্রি এআই জাদু!\n৫০ পৃষ্ঠার বোরিং পিডিএফ বা বই আপলোড করলেই\nতা রূপ নেবে দুজন মানুষের রেডিও পডকাস্ট আড্ডায়!\n🔹 কোনো টাকা লাগবে না • মোবাইল দিয়েই চালানো যায়\n╚══════════════════════════╝\n\nকঠিন ইংরেজি বই বা অফিসের লম্বা রিপোর্ট পড়তে পড়তে কি আপনার মাথা ব্যথা ধরে যায়? 🥱\n\nগুগলের সম্পূর্ণ ফ্রি একটি এআই টুল এসেছে—যার নাম Google NotebookLM। এটি আপনার পড়ার পদ্ধতিকে আজীবনের জন্য বদলে দেবে!\n\nকীভাবে এটি আপনার কাজ সহজ করবে?\n১. পিডিএফ রূপ নেবে রেডিও পডকাস্টে: আপনার পড়ার যেকোনো পিডিএফ, বই বা ক্লাসের নোট আপলোড করে শুধু "Generate Audio" বাটনে চাপ দিন। এআই দুজন রেডিও জকির মতো নিজেদের মধ্যে আলোচনা করে পুরো বিষয়টি গল্পচ্ছলে আপনাকে শুনিয়ে দেবে!\n২. মিথ্যা বা ভুল তথ্য দেবে না: সাধারণ চ্যাটজিপিটি অনেক সময় ভুল উত্তর বানিয়ে বলে। কিন্তু NotebookLM শুধুমাত্র আপনার দেওয়া ফাইলের ওপর ভিত্তি করেই উত্তর দেয়।\n৩. সম্পূর্ণ ফ্রি: কোনো সাবস্ক্রিপশন ফি নেই, জিমেইল আইডি থাকলেই মোবাইলে ব্রাউজার দিয়ে ফ্রিতে ব্যবহার করা যায়।\n\n👉 কীভাবে শুরু করবেন: গুগল ব্রাউজারে গিয়ে সার্চ করুন notebooklm.google.com এবং আপনার জিমেইল দিয়ে লগইন করে যেকোনো ফাইল আপলোড করুন।\n\nআপনার পড়াশোনা বা কাজের সময় বাঁচাতে আজই একবার ট্রাই করে দেখুন! আপনি কি এমন টুল খুঁজছিলেন? কমেন্টে জানান! 👇\n\n#AiRevolution #GoogleNotebookLM #AIToolsBangla #SmartStudy #BanglaTech`,
    imageUrl
  };

  console.log('📲 টেলিগ্রামে পোস্ট কার্ড ড্রাফট পাঠানো হচ্ছে...');
  await sendDraftPreview(post1);
  console.log('✅ সফলভাবে টেলিগ্রামে পোস্ট কার্ড ১ পাঠানো হয়েছে!');
}

sendTestPostCard().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
