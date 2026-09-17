import fs from 'fs';
import path from 'path';
import { detectPortraitPrompt, enhanceVisualPrompt, generateImageUrl, getLocalCachedImagePath } from '../services/imageService.js';
import { generatePostFromUserPhoto } from '../services/telegramService.js';
import { WEEKLY_SCHEDULE } from '../services/geminiService.js';

async function runTests() {
  console.log('=== 🚀 Testing /boost Supercharged Image & Photo Post Workflow ===\n');

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

  // 1. Test Word-Bounded Portrait Detection
  console.log('--- 1. Testing Word-Bounded Portrait Detection ---');
  const techPrompts = [
    'Futuristic AI command line interface with holographic graphs',
    'Project manager dashboard with real-time statistics',
    'Database management system architecture',
    'Audio waveform manipulation and synthesis',
    'High performance server infrastructure',
    'Manifest file configuration in nodejs',
    'Permanent storage cloud solution'
  ];

  for (const p of techPrompts) {
    const isPortrait = detectPortraitPrompt(p);
    assert(!isPortrait, `Tech prompt must NOT trigger portrait: "${p}"`);
  }

  const humanPrompts = [
    'Studio portrait photography of an AI researcher smiling',
    'Close up shot of a man wearing eyeglasses in tech office',
    'A woman software engineer writing code at her desk',
    'Authentic photograph of a person giving a presentation',
    'একজন বাংলাদেশি তরুণ ফ্রিল্যান্সারের হাসিমুখের ছবি',
    'মানুষের মতো নিখুঁত অভিব্যক্তি'
  ];

  for (const p of humanPrompts) {
    const isPortrait = detectPortraitPrompt(p);
    assert(isPortrait, `Human prompt MUST trigger portrait: "${p}"`);
  }

  // 2. Test Prompt Enhancement
  console.log('\n--- 2. Testing Prompt Enhancement ---');
  const techEnhanced = enhanceVisualPrompt('Neural network cluster');
  assert(techEnhanced.includes('3D Octane Render 8K'), 'Tech prompt contains 3D Octane Render 8K');
  assert(techEnhanced.includes('futuristic office') || techEnhanced.includes('workspace aesthetics'), 'Tech prompt contains tech/office tokens');

  const portraitEnhanced = enhanceVisualPrompt('Professional developer portrait', true);
  assert(portraitEnhanced.includes('authentic studio portrait photography'), 'Portrait prompt contains studio portrait photography');
  assert(portraitEnhanced.includes('Sony A7 IV'), 'Portrait prompt contains Sony A7 IV 85mm lens');

  // 3. Test Primary Free Multi-Model Image Generation
  console.log('\n--- 3. Testing Primary Free Multi-Model Image Generation (Pollinations Flux) ---');
  const startTime = Date.now();
  const testImageUrl = await generateImageUrl('Futuristic AI Automation Robot in clean office', { width: 512, height: 512 });
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Image generated in ${duration}s: ${testImageUrl}`);

  assert(typeof testImageUrl === 'string' && testImageUrl.length > 10, 'Generated image URL is a valid non-empty string');
  assert(!testImageUrl.includes('unsplash.com'), 'Generated image is NOT an Unsplash fallback');
  assert(testImageUrl.includes('pollinations.ai') || testImageUrl.includes('generated_images'), 'Generated image is from Pollinations Flux or local cache');
  assert(!testImageUrl.includes('error'), 'Generated image URL has no error token');

  // Check that pre-warming saved a local file in data/generated_images
  const imgDir = path.resolve('D:/ai-insight-bot/data/generated_images');
  assert(fs.existsSync(imgDir), 'data/generated_images directory exists');
  const savedImages = fs.readdirSync(imgDir);
  assert(savedImages.length > 0, `Local image cache has files (${savedImages.length} found)`);

  // Verify that local cache registry mapped the URL
  const cachedLocalFile = getLocalCachedImagePath(testImageUrl);
  assert(cachedLocalFile !== null && fs.existsSync(cachedLocalFile), 'Local cached image buffer exists on disk');
  if (cachedLocalFile && fs.existsSync(cachedLocalFile)) {
    const stats = fs.statSync(cachedLocalFile);
    assert(stats.size > 5000, `Cached image file is non-trivial (${stats.size} bytes)`);
  }

  // 4. Test User Photo Upload AI Post Draft Generation
  console.log('\n--- 4. Testing User Photo Upload AI Post Draft Generation ---');
  const todayIndex = new Date().getDay();
  const dayPlan = WEEKLY_SCHEDULE[todayIndex] || WEEKLY_SCHEDULE[3];
  console.log(`Today's Roadmap: ${dayPlan.pillar} (${dayPlan.dayName})`);

  // Create mock 1x1 jpeg buffer to simulate user upload
  const mockJpgBuffer = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0xFF, 0xD9
  ]);

  const draftData = await generatePostFromUserPhoto(mockJpgBuffer, 'পোস্টে এই ছবি দাও আর সাথে দরকারি টিপস লিখো', dayPlan);
  console.log('Draft Title:', draftData.title);
  console.log('Draft Content Preview:', draftData.content.substring(0, 120) + '...');
  console.log('First Comment:', draftData.firstComment);

  assert(draftData.title && draftData.title.length > 5, 'User photo draft has valid title');
  assert(draftData.content && draftData.content.length > 50, 'User photo draft has substantial content');
  assert(draftData.content.includes('#'), 'User photo draft contains hashtags');
  assert(draftData.firstComment && draftData.firstComment.length > 10, 'User photo draft has firstComment');

  // Verify user_uploads directory setup
  const uploadsDir = path.resolve('D:/ai-insight-bot/data/user_uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  assert(fs.existsSync(uploadsDir), 'data/user_uploads directory is prepared');

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
  console.error('Test error:', err);
  process.exit(1);
});
