import { generateViralWorkflowPost } from '../services/geminiService.js';
import { generateImageUrl } from '../services/imageService.js';
import { sendDraftPreview, saveLatestDraft } from '../services/telegramService.js';
import { config } from '../config.js';

async function main() {
  console.log('🚀 বোরহান ভাইয়ের জন্য রেস্তোরাঁ পোস্টার ভাইরাল ওয়ার্কফ্লো পোস্ট তৈরি হচ্ছে...');
  const postData = await generateViralWorkflowPost('restaurant');
  console.log('📝 শিরোনাম:', postData.title);

  console.log('🎨 ১০৮০x১০৮০ সিনেমাটিক ছবি প্রস্তুত করা হচ্ছে...');
  const imageUrl = await generateImageUrl(postData.image_prompt);
  console.log('🖼️ ইমেজ লিংক তৈরি সম্পন্ন!');

  const completeDraft = {
    title: postData.title,
    content: postData.content,
    firstComment: postData.firstComment || '',
    image_prompt: postData.image_prompt,
    imageUrl: imageUrl,
    pillarName: `🔥 ভাইরাল এআই ওয়ার্কফ্লো: ${postData.title}`,
    tierName: 'ভাইরাল ওয়ার্কফ্লো ল্যাব',
    topicName: postData.title
  };

  saveLatestDraft(completeDraft);

  console.log('📤 বোরহান ভাইয়ের টেলিগ্রামে সিইও ড্রাফট প্রিভিউ পাঠানো হচ্ছে...');
  await sendDraftPreview(completeDraft, config.telegramChatId);
  console.log('✅ বোরহান ভাইয়ের কাছে নতুন ব্লু পয়েন্ট ও জিরো-মেটা হেডার ফরম্যাটে প্রিভিউ সফলভাবে পাঠানো হয়েছে!');
}

main().catch(err => {
  console.error('Error sending preview:', err);
  process.exit(1);
});
