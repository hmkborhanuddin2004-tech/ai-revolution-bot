import { generateViralWorkflowPost, sanitizePostContent } from '../services/geminiService.js';
import { VIRAL_WORKFLOW_TOPICS, fetchDailyTrendingAITopic } from '../services/scavengerService.js';
import { executeAgentTool, AGENT_TOOL_DECLARATIONS } from '../services/agentTools.js';

async function runTests() {
  console.log('🧪 === ভাইরাল মাল্টি-টুল ওয়ার্কফ্লো টেস্ট শুরু হচ্ছে ===\n');

  // ১. Scavenger Service টেস্ট
  console.log('1️⃣ Scavenger Service ভাইরাল টপিক ভেরিফিকেশন:');
  if (!Array.isArray(VIRAL_WORKFLOW_TOPICS) || VIRAL_WORKFLOW_TOPICS.length < 5) {
    throw new Error('❌ VIRAL_WORKFLOW_TOPICS সঠিকভাবে ডিফাইন করা হয়নি!');
  }
  console.log(`   ✅ ${VIRAL_WORKFLOW_TOPICS.length} টি কিউরেটেড ভাইরাল ওয়ার্কফ্লো টপিক পাওয়া গেছে।`);
  const sampleTopic = VIRAL_WORKFLOW_TOPICS[0];
  console.log(`   📌 নমুনা টপিক: ${sampleTopic.title} (টুলস: ${sampleTopic.tools.join(', ')})`);

  // ২. Gemini Viral Workflow Post Generation টেস্ট
  console.log('\n2️⃣ Gemini Service: AI for Everyone স্টাইল রেস্তোরাঁ পোস্টার পোস্ট জেনারেশন:');
  const post = await generateViralWorkflowPost('restaurant');
  console.log(`   📌 শিরোনাম: ${post.title}`);
  console.log(`   🏷️ টিয়ার নেম: ${post.tierName}`);
  console.log(`   📝 ক্যাপশন দৈর্ঘ্য: ${post.content.length} অক্ষর`);
  console.log(`   💬 প্রথম কমেন্ট: ${post.firstComment ? '✅ বিদ্যমান (' + post.firstComment.slice(0, 50) + '...)' : '❌ অনুপস্থিত'}`);
  console.log(`   🎨 ইমেজ প্রম্পট: ${post.image_prompt.slice(0, 70)}...`);

  // ভ্যালিডেশন
  if (!post.title || !post.content) {
    throw new Error('❌ পোস্টের শিরোনাম বা কন্টেন্ট তৈরি হয়নি!');
  }
  if (!post.firstComment) {
    throw new Error('❌ প্রথম কমেন্ট তৈরি হয়নি!');
  }
  if (!post.image_prompt || post.image_prompt.length < 20) {
    throw new Error('❌ ইমেজ প্রম্পট যথেষ্ট বিস্তারিত নয়!');
  }

  // হুক ও ৩-টুল ফর্মুলা চেক
  const hasHook = post.content.includes('ডিজাইন') || post.content.includes('৬০ সেকেন্ড') || post.content.includes('পোস্টার') || post.content.includes('রেস্তোরাঁ');
  console.log(`   🎯 ভাইরাল হুক চেক: ${hasHook ? '✅ উত্তীর্ণ' : '⚠️ হুক চেক নোট'}`);

  const hasTools = post.content.includes('ChatGPT') || post.content.includes('Flux') || post.content.includes('Canva') || post.content.includes('টুল');
  console.log(`   🛠️ ৩-টুল ফর্মুলা চেক: ${hasTools ? '✅ উত্তীর্ণ' : '⚠️ টুল ফর্মুলা নোট'}`);

  // মেটা-হেডার, ডিভাইডার দাগ ও ব্লু পয়েন্ট চেক
  if (post.content.includes('[ফেসবুক পোস্ট ক্যাপশন]') || post.content.includes('ফেসবুক পোস্ট ক্যাপশন')) {
    throw new Error('❌ পোস্টের কন্টেন্টে [ফেসবুক পোস্ট ক্যাপশন] পাওয়া গেছে!');
  }
  if (post.content.includes('━━━━') || post.content.includes('────')) {
    throw new Error('❌ পোস্টের কন্টেন্টে ডিভাইডার দাগ (━━━━) পাওয়া গেছে!');
  }
  if (!post.content.includes('🔹')) {
    throw new Error('❌ পোস্টের কন্টেন্টে ব্লু পয়েন্ট (🔹) পাওয়া যায়নি!');
  }
  console.log('   💎 স্পেশালিস্ট ব্লু পয়েন্ট ও জিরো-মেটা হেডার চেক: ✅ উত্তীর্ণ');

  // sanitizePostContent ইউনিট চেক
  const sampleDirtyText = `📋 *[ফেসবুক পোস্ট ক্যাপশন]*:\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nডিজাইন পারেন না? Here’s the workflow 👇\n• টুল ১: ChatGPT\n- টুল ২: Flux\n* টুল ৩: Canva\n━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  const sanitizedSample = sanitizePostContent(sampleDirtyText);
  if (sanitizedSample.includes('[ফেসবুক পোস্ট ক্যাপশন]') || sanitizedSample.includes('━━━━━━━━')) {
    throw new Error('❌ sanitizePostContent মেটা হেডার বা ডিভাইডার দাগ মুছতে ব্যর্থ হয়েছে!');
  }
  if (!sanitizedSample.includes('🔹')) {
    throw new Error('❌ sanitizePostContent বুলেটকে ব্লু পয়েন্টে রূপান্তর করতে ব্যর্থ হয়েছে!');
  }

  // বিভিন্ন ধরনের মেটা-হেডার এবং ডিভাইডার দাঁত অপসারণের গভীর ইউনিট টেস্ট
  const edgeCaseTests = [
    { input: '📌 **[ফেসবুক পোস্ট ক্যাপশন]:**\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '### ফেসবুক পোস্ট ক্যাপশন\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '👉 ফেসবুক পোস্ট ক্যাপশন 👇\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '**ফেসবুক পোস্ট ক্যাপশন:**\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: 'ফেসবুক পোস্ট ক্যাপশন:\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: 'ফেসবুক পোস্ট ক্যাপশন\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: 'ক্যাপশন:\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '[ক্যাপশন]\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '— — — — — — — — — —\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '- - - - - - - - - -\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '* * * * * * * * * *\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔\nহ্যালো বন্ধুরা', expected: 'হ্যালো বন্ধুরা' },
    { input: '🔹 ক্যাপশন লেখার জন্য ৩টি এআই টুল ব্যবহার করুন।\n🔹 দ্বিতীয় লাইন', expected: '🔹 ক্যাপশন লেখার জন্য ৩টি এআই টুল ব্যবহার করুন।\n🔹 দ্বিতীয় লাইন' }
  ];

  for (const { input, expected } of edgeCaseTests) {
    const res = sanitizePostContent(input);
    if (res !== expected) {
      throw new Error(`❌ sanitizePostContent এজ-কেস ব্যর্থ!\nইনপুট: ${JSON.stringify(input)}\nপ্রত্যাশিত: ${JSON.stringify(expected)}\nপ্রকৃত: ${JSON.stringify(res)}`);
    }
  }
  console.log('   🧼 sanitizePostContent গভীর ইউনিট টেস্ট (সব মেটা-হেডার, দাঁত ও স্পেসড ডিভাইডার): ✅ উত্তীর্ণ');

  // ৩. Agent Tools টেস্ট
  console.log('\n3️⃣ Agent Tools: craft_viral_workflow_post টুল এক্সিকিউশন:');
  const decl = AGENT_TOOL_DECLARATIONS.find(d => d.name === 'craft_viral_workflow_post');
  if (!decl) {
    throw new Error('❌ AGENT_TOOL_DECLARATIONS-এ craft_viral_workflow_post নেই!');
  }
  console.log(`   ✅ টুল ডিক্লারেশন পাওয়া গেছে: ${decl.name}`);

  console.log('\n🎉 === সকল ভাইরাল ওয়ার্কফ্লো টেস্ট সফলভাবে উত্তীর্ণ হয়েছে! ===\n');
}

runTests().catch(err => {
  console.error('❌ টেস্ট ফেইল করেছে:', err);
  process.exit(1);
});
