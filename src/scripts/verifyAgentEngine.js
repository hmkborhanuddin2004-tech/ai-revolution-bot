import { AGENT_TOOL_DECLARATIONS, executeAgentTool } from '../services/agentTools.js';
import { agentMemory } from '../services/agentMemory.js';
import { agentEngine } from '../services/agentEngine.js';
import { assistantService, BORHAN_FB_PROFILE } from '../services/assistantService.js';

async function runAgentTests() {
  console.log('=== 🧠 Testing Autonomous Agent Engine & Tools ===\n');

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

  // 1. Tool Declarations Check
  console.log('--- 1. Testing Agent Tool Declarations ---');
  assert(AGENT_TOOL_DECLARATIONS.length >= 7, 'Tool declarations has at least 7 tools');
  const toolNames = AGENT_TOOL_DECLARATIONS.map(t => t.name);
  assert(toolNames.includes('get_borhan_profile_services'), 'Has get_borhan_profile_services tool');
  assert(toolNames.includes('search_ai_knowledge'), 'Has search_ai_knowledge tool');
  assert(toolNames.includes('escalate_to_telegram'), 'Has escalate_to_telegram tool');
  assert(toolNames.includes('get_faq_answer'), 'Has get_faq_answer tool');
  assert(toolNames.includes('craft_high_standard_post'), 'Has craft_high_standard_post tool');
  assert(toolNames.includes('create_cinematic_image'), 'Has create_cinematic_image tool');
  assert(toolNames.includes('evaluate_post_quality'), 'Has evaluate_post_quality tool');

  // 2. Direct Tool Execution Check
  console.log('\n--- 2. Testing Direct Tool Execution ---');
  const profileRes = await executeAgentTool('get_borhan_profile_services', {});
  assert(profileRes.developerName.includes('Borhan'), 'Profile tool returns Borhan Sir name');
  assert(profileRes.portfolioLink === BORHAN_FB_PROFILE, 'Profile tool returns correct portfolio link');
  assert(Array.isArray(profileRes.servicesOffered) && profileRes.servicesOffered.length > 0, 'Profile tool returns services array');

  const knowledgeRes = await executeAgentTool('search_ai_knowledge', { query: 'deepseek' });
  assert(knowledgeRes.insight.includes('DeepSeek'), 'Knowledge tool returns deepseek info');

  const faqRes = await executeAgentTool('get_faq_answer', { topic: 'schedule' });
  assert(faqRes.schedule.includes('১০:০০'), 'FAQ tool returns schedule');

  // 3. New Advanced Agent Tools Check
  console.log('\n--- 3. Testing High-Standard Post, Cinematic Image & Quality Audit ---');
  const imageRes = await executeAgentTool('create_cinematic_image', { visualConcept: 'Futuristic AI neural network hologram' });
  assert(imageRes.imageUrl.includes('pollinations.ai') || imageRes.imageUrl.includes('http'), 'Image tool generates valid URL');
  assert(imageRes.resolution.includes('1080x1080'), 'Image tool targets 1080x1080 resolution');

  const auditRes = await executeAgentTool('evaluate_post_quality', {
    draftContent: 'প্রম্পট ইঞ্জিনিয়ারিংয়ের ৩টি গোপন নিয়ম জেনে নিন! 🎯 কপি-পেস্ট এআই প্রম্পট ব্লুপ্রিন্ট: তুমি একজন ডাটা এনালিস্ট... আজই সেভ করে রাখুন। #AiRevolution #PromptEngineering #SmartWork'
  });
  assert(auditRes.qualityScore.includes('/10'), 'Evaluation tool returns score');
  assert(auditRes.analysis.hookCheck.includes('হুক'), 'Evaluation tool analyzes hook');

  // 4. Agent Persistent Memory Check
  console.log('\n--- 4. Testing Agent Memory ---');
  const testUserId = 'test_user_789';
  agentMemory.recordInteraction(testUserId, {
    userText: 'আপনারা কি ই-কমার্স সাইট তৈরি করেন?',
    agentReply: 'হ্যাঁ, আমরা আধুনিক ই-কমার্স সাইট ডেভেলপ করে থাকি।',
    toolsUsed: ['get_borhan_profile_services']
  });

  const history = agentMemory.getHistory(testUserId);
  assert(history.length >= 1, 'Memory successfully stored interaction');
  assert(history[history.length - 1].userText === 'আপনারা কি ই-কমার্স সাইট তৈরি করেন?', 'Memory text verified');
  const snippet = agentMemory.getContextSnippet(testUserId);
  assert(snippet.includes('ই-কমার্স'), 'Memory context snippet generated properly');

  // 5. Autonomous Agent Engine Live Run
  console.log('\n--- 5. Testing Autonomous Agent ReAct Loop ---');
  const agentOutput = await agentEngine.runAgent({
    userName: 'নাফিস আহমেদ',
    userText: 'বোরহান স্যারের সাথে একটা ওয়েবসাইট নিয়ে কথা বলতে চাই, খরচ কেমন পড়বে?',
    contextType: 'messenger',
    userId: testUserId
  });

  console.log('Agent Response:', agentOutput.reply);
  console.log('Tools Executed:', agentOutput.toolsUsed);

  assert(agentOutput.reply && agentOutput.reply.length > 10, 'Agent generated substantive response');
  assert(!agentOutput.reply.includes('জনাব'), 'Agent reply does not contain stiff "জনাব"');
  assert(!agentOutput.reply.includes('ভাই'), 'Agent reply does not contain informal "ভাই"');
  assert(!agentOutput.reply.includes('দর্শন অনুযায়ী'), 'Agent reply does not contain "দর্শন অনুযায়ী"');
  assert(/[।?!.]$/u.test(agentOutput.reply), 'Agent reply ends with proper punctuation');

  // 6. Assistant Service Single Comment Flow with Agent Engine
  console.log('\n--- 6. Testing Assistant Service Integration with Agent Engine ---');
  const commentTest = await assistantService.processComment({
    userName: 'তানভীর আহমেদ',
    commentText: 'আমি একটা কাস্টম অটোমーション সফটওয়্যার বানাতে চাই, আপনাদের টিম কি সাহায্য করবে?',
    commentId: 'c_agent_test_01',
    postId: 'p_agent_test_01'
  });

  console.log('Comment Reply1:', commentTest.reply1);
  assert(commentTest.reply2 === null, 'Post comment strictly maintains single comment (reply2 is null)');
  assert(commentTest.reply1.includes('আসসালামু আলাইকুম'), 'Single comment includes greeting');
  assert(commentTest.reply1.includes(BORHAN_FB_PROFILE), 'Single comment includes Borhan Sir profile link');
  assert(!commentTest.reply1.includes('জনাব'), 'Single comment does not contain "জনাব"');
  assert(commentTest.escalated === true, 'Inquiry correctly identified as escalated');

  console.log(`\n================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAgentTests().catch(err => {
  console.error('Agent test error:', err);
  process.exit(1);
});
