import fs from 'fs';
import path from 'path';

const SEEN_FILE = path.resolve('D:/ai-insight-bot/data/seenTopics.json');

function getSeenTopics() {
  try {
    if (fs.existsSync(SEEN_FILE)) {
      return JSON.parse(fs.readFileSync(SEEN_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading seen topics:', err);
  }
  return [];
}

function saveSeenTopic(topicTitle) {
  try {
    const list = getSeenTopics();
    list.push({ title: topicTitle, date: new Date().toISOString() });
    // Keep last 200 topics
    const trimmed = list.slice(-200);
    fs.writeFileSync(SEEN_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving seen topic:', err);
  }
}

const ROADMAP_SEARCH_QUERIES = {
  0: { // রবিবার - ইমেজ ও ডিজাইন
    1: 'canva ai design poster OR recraft ai vector',
    2: 'product photography ai background remove OR clipdrop photoroom',
    4: 'restaurant food poster design ai prompt OR social media poster',
    3: 'midjourney v6 vs flux schnell image generator review'
  },
  1: { // সোমবার - ভিডিও ও রিলস
    1: 'capcut ai auto captions subtitle video editing',
    2: 'faceless reels b-roll ai stock video footage',
    4: 'viral short video script prompt chatgpt reels',
    3: 'kling ai vs runway gen-3 video generator comparison'
  },
  2: { // মঙ্গলবার - ভয়েস ও অডিও
    1: 'elevenlabs realistic voiceover ai speech',
    2: 'adobe podcast enhance speech audio cleanup ai',
    4: 'suno ai v3 prompt song lyrics music generate',
    3: 'ai voice cloning elevenlabs pro review pricing'
  },
  3: { // বুধবার - অফিস ও প্রডাক্টিভিটি
    1: 'gamma ai presentation slides maker',
    2: 'excel formula ai vlookup formula bot chatgpt',
    4: 'ai meeting summary email followup prompt workspace',
    3: 'google workspace gemini vs microsoft 365 copilot enterprise'
  },
  4: { // বৃহস্পতিবার - নো-কোড, অ্যাপ ও অটোমেশন
    1: 'typeform ai tally forms lead generation no-code',
    2: 'make.com zapier social media automation workflow',
    4: 'high converting landing page copywriting prompt claude',
    3: 'lovable dev vs bolt new vs cursor ai comparison'
  },
  5: { // শুক্রবার - ফ্রিল্যান্সিং ও ক্যারিয়ার
    1: 'best ai freelancing skills in-demand 2026 upwork fiverr',
    2: 'client acquisition cold email linkedin outreach ai',
    4: 'winning upwork proposal cover letter prompt',
    3: 'solopreneur vs ai agency workflow scale income'
  },
  6: { // শনিবার - কন্টেন্ট ও কপিরাইটিং
    1: 'social media scroll stopping hook formula viral',
    2: 'ats resume cv builder prompt chatgpt canvas',
    4: 'emotional storytelling bangla article prompt claude',
    3: 'claude 3.5 sonnet vs chatgpt 4o writing comparison'
  }
};

export const VIRAL_WORKFLOW_TOPICS = [
  {
    niche: 'restaurant',
    title: 'রেস্তোরাঁর লোভনীয় সোশ্যাল মিডিয়া পোস্টার মাত্র ৬০ সেকেন্ডে (ChatGPT + Flux + Canva)',
    description: 'কোনো গ্রাফিক ডিজাইনার ছাড়া রেস্তোরাঁ ও ফুড বিজনেসের জন্য প্রফেশনাল পোস্টার তৈরির কমপ্লিট ব্লুপ্রিন্ট',
    tools: ['ChatGPT (Ad Copy)', 'Flux AI (Ultra-Realistic Food Image)', 'Canva AI (Typography & Layout)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'faceless_reels',
    title: 'চেহারা না দেখিয়ে ভাইরাল বাংলা রিলস ৫ মিনিটে (ChatGPT + ElevenLabs + CapCut)',
    description: 'সোশ্যাল মিডিয়ায় ফেসলেস ভিডিও দিয়ে লাখ লাখ ভিউ ও পেজ গ্রোথের ফুল অটোমেটেড পাইপলাইন',
    tools: ['ChatGPT (Viral Script)', 'ElevenLabs (Lifelike Bangla Voiceover)', 'CapCut AI (Auto-Captions & B-roll)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'excel_automation',
    title: 'জটিল এক্সেল ফর্মুলা ও ডাটা ক্লিন মাত্র ৫ সেকেন্ডে (ChatGPT + Google Sheets)',
    description: 'কর্মক্ষেত্রে ঘণ্টার পর ঘণ্টার এক্সেল হিসাব ও VLOOKUP ফর্মুলা পলকে তৈরি করার পাওয়ারফুল হ্যাক',
    tools: ['ChatGPT (Formula Engine)', 'Google Sheets (Auto Data Clean)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'ecommerce',
    title: 'ই-কমার্স প্রোডাক্ট অ্যাড মাত্র ৬০ সেকেন্ডে (ChatGPT + Clipdrop + Canva)',
    description: 'মোবাইলের সাধারণ ছবিকে আন্তর্জাতিক ব্র্যান্ডের বিজ্ঞাপনে রূপান্তরের ৩-টুল এআই ফর্মুলা',
    tools: ['ChatGPT (Hooks & Angles)', 'Clipdrop AI (Background Replacement)', 'Canva AI (Price Tag & CTA)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'freelance_gig',
    title: '২০২৬ সালে আপওয়ার্ক ও ফাইভারের সবচেয়ে লাভজনক এআই অটোমেশন সার্ভিস',
    description: 'জিরো কোডিংয়ে ক্লায়েন্টের জন্য সোশ্যাল মিডিয়া ও ইমেইল অটোমেশন করে আয়ের স্টেপ-বাই-স্টেপ গাইড',
    tools: ['Make.com', 'ChatGPT', 'Upwork'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'realestate',
    title: 'রিয়েল এস্টেট ব্যানার বিজ্ঞাপন মাত্র ২ মিনিটে (Claude + Flux + Canva)',
    description: 'ফ্ল্যাট বা জমির হাই-কনভার্টিং ফেসবুক ব্যানার তৈরির সিক্রেট এআই ওয়ার্কফ্লো',
    tools: ['Claude 3.5 (Property Pitch)', 'Flux AI (Luxury Architectural Visuals)', 'Canva AI (Banner Design)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'landing_page',
    title: 'কোডিং ছাড়া ইনস্ট্যান্ট ল্যান্ডিং পেজ মাত্র ২ মিনিটে (Claude + v0.dev + Vercel)',
    description: 'বিজনেস বা সার্ভিসের জন্য ফুললি ফাংশনাল ও রেসপন্সিভ ওয়েবসাইট লাইভ করার ম্যাজিক',
    tools: ['Claude 3.5 (Content Architecture)', 'v0.dev (Instant UI Code)', 'Vercel (Free 1-Click Hosting)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'cv_portfolio',
    title: '৩ মিনিটে আন্তর্জাতিক মানের সিভি ও পোর্টফোলিও (ChatGPT Canvas + Canva AI)',
    description: 'রিমোট জব ও হাই-পেয়িং ক্লায়েন্টদের নজরে পড়ার মতো রেজুমে ও কভার লেটার তৈরির রেসিপি',
    tools: ['ChatGPT Canvas (ATS-Friendly Copy)', 'Canva AI (Executive Layout)', 'LinkedIn AI (Keyword Optimizer)'],
    source: 'AI for Everyone Benchmark'
  }
];

const ROADMAP_FALLBACKS = {
  0: [
    VIRAL_WORKFLOW_TOPICS[0], // Restaurant Posters
    { title: 'Flux AI & Recraft: সেরা ফ্রি আল্ট্রা-রিয়েলিস্টিক ইমেজ তৈরির ম্যাজিক', description: 'বিনামূল্যে টেক্সট দিয়ে প্রফেশনাল ১০৮০x১০৮০ ছবি ও ডিজাইন বানানোর বাস্তব কৌশল', source: 'Curated AI Hub' },
    { title: 'Midjourney Prompt Engineering: চোখ ধাঁধানো আর্ট বানানোর গোপন সূত্র', description: 'সঠিক লাইটিং ও ক্যামেরা অ্যাঙ্গেল দিয়ে পারফেক্ট ইমেজ জেনারেশন', source: 'Curated AI Hub' }
  ],
  1: [
    VIRAL_WORKFLOW_TOPICS[1], // Faceless Reels
    { title: 'Kling AI & Runway Gen-3: ক্যামেরা ছাড়া সিনেমাটিক ভিডিও বানানোর জাদু', description: 'টেক্সট বা ছবি থেকে সরাসরি হাই-কোয়ালিটি ভিডিও ক্লিপ তৈরির সহজ গাইড', source: 'Curated AI Hub' },
    { title: 'CapCut AI & Auto-Subtitles: ৫ মিনিটে ভাইরাল বাংলা রিলস তৈরি', description: 'ভিডিও এডিটিং না জেনেও সোশ্যাল মিডিয়ার জন্য নজরকাড়া শর্টস মেকিং', source: 'Curated AI Hub' }
  ],
  2: [
    { title: 'ElevenLabs Voice Clone: হুবহু মানুষের মতো প্রাণবন্ত বাংলা ভয়েসওভার', description: 'ন্যাচারাল ইমোশন ও স্পষ্ট উচ্চারণে এআই ভয়েস দিয়ে ভিডিও বানানোর ট্রিকস', source: 'Curated AI Hub' },
    { title: 'Suno AI v3: এক প্রম্পটেই পুরো বাংলা গান ও মিউজিক তৈরি', description: 'লিরিকস লিখে মনের মতো সুর ও ব্যাকগ্রাউন্ড মিউজিক বানানোর রোমাঞ্চকর উপায়', source: 'Curated AI Hub' },
    { title: 'Adobe Podcast AI: স্টুডিও মাইক্রোফোন ছাড়া প্রফেশনাল ক্রিস্টাল ক্লিয়ার অডিও', description: 'মোবাইলের নয়েজযুক্ত অডিওকে ব্রডকাস্ট সাউন্ডে রূপান্তরের টেকনিক', source: 'Curated AI Hub' }
  ],
  3: [
    VIRAL_WORKFLOW_TOPICS[2], // Excel Automation
    { title: 'Google Gemini & Copilot: এক্সেল ডাটা অ্যানালাইসিস ও ফর্মুলার ম্যাজিক', description: 'ঘণ্টার পর ঘণ্টার এক্সেল ক্যালকুলেশন ও জটিল ফর্মুলা ৫ সেকেন্ডে সমাধানের হ্যাকস', source: 'Curated AI Hub' },
    { title: 'Gamma AI: ১ ক্লিকে প্রফেশনাল বিজনেস প্রেজেন্টেশন ও স্লাইড ডেক মেকিং', description: 'টাইপ করার ঝামেলা ছাড়া নিখুঁত প্রেজেন্টেশন স্লাইড তৈরির সহজ ট্রিকস', source: 'Curated AI Hub' }
  ],
  4: [
    { title: 'Make.com ও Zapier: কোডিং ছাড়া সোশ্যাল মিডিয়া অটোমেশনের পাওয়ারফুল হ্যাক', description: 'ফেসবুক ও ইনস্টাগ্রামে স্বয়ংক্রিয় শিডিউল ও গুগল শিট সিঙ্ক করার কমপ্লিট গাইড', source: 'Curated AI Hub' },
    { title: 'Tally & Typeform AI: ৫ মিনিটে স্মার্ট লিড জেনারেশন ফর্ম তৈরি', description: 'বিজনেস ক্লায়েন্টদের থেকে স্বয়ংক্রিয় ডাটা সংগ্রহ ও রেসপন্সের নো-কোড ট্রিকস', source: 'Curated AI Hub' },
    { title: 'হাই-কনভার্টিং ল্যান্ডিং পেজ ও সেলস ফানেল লেখার মাস্টার ব্লুপ্রিন্ট', description: 'যেকোনো প্রোডাক্টের জন্য আকর্ষণীয় বিক্রয় কপি তৈরির রেডিমেড কপি-পেস্ট প্রম্পট', source: 'Curated AI Hub' },
    { title: 'Lovable vs Bolt.new বনাম Cursor: নো-কোড অ্যাপ তৈরিতে কোনটি সেরা?', description: 'ফ্রি বনাম পেইড নো-কোড প্ল্যাটফর্মের প্রফেশনাল বিশ্লেষণ ও রিয়েল-লাইফ তুলনা', source: 'Curated AI Hub' }
  ],
  5: [
    VIRAL_WORKFLOW_TOPICS[4], // Freelancing Automation
    { title: '২০২৬ সালে ফ্রিল্যান্সিংয়ে সবচেয়ে চাহিদাসম্পন্ন ৫টি এআই স্কিল', description: 'আপওয়ার্ক ও ফাইভারে এআই অটোমেশন ও প্রম্পট ইঞ্জিনিয়ারিং দিয়ে ক্লায়েন্ট পাওয়ার রোডম্যাপ', source: 'Curated AI Hub' },
    { title: 'এআই দিয়ে ফ্রিল্যান্স ক্যারিয়ার শুরু: নতুনদের জন্য স্টেপ-বাই-স্টেপ গাইড', description: 'জিরো স্কিল থেকে এআই টুলস আয়ত্ত করে ঘরে বসে আন্তর্জাতিক আয়ের বাস্তব পথ', source: 'Curated AI Hub' }
  ],
  6: [
    VIRAL_WORKFLOW_TOPICS[7], // CV & Portfolio
    { title: 'ChatGPT Canvas & Memory: প্রফেশনাল কন্টেন্ট ও সিভি তৈরির সুপার ট্রিকস', description: 'সাধারণ চ্যাটের বাইরে ক্যানভাস ব্যবহার করে নিখুঁত ডকুমেন্ট ও সিভি লেখার উপায়', source: 'Curated AI Hub' },
    { title: 'Claude 3.5 Sonnet: মানুষের মতো ন্যাচারাল বাংলা আর্টিকেলের ম্যাজিক', description: 'রোবটিক টোন ছাড়া একদম জীবন্ত বাংলা কন্টেন্ট ও ব্লগ লেখার সেরা প্রম্পট', source: 'Curated AI Hub' }
  ]
};

// কী-ওয়ার্ড ভিত্তিক কঠোর ডুপ্লিকেট অডিটর (একই বিষয় বা টুলের পুনরাবৃত্তি ঠেকাবে)
export function isDuplicateTopic(candidateTitle, seenTopics = [], thresholdHours = 48) {
  if (!candidateTitle) return true;
  const cand = candidateTitle.toLowerCase();

  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'vs', 'best', 'top', 'ai', 'how', 'এআই', 'দিয়ে', 'ও', 'এবং', 'করার', 'তৈরি', 'সেরা', 'এর']);
  const candWords = cand.split(/[\s,–—\-:;()\[\]]+/).filter(w => w.length > 2 && !stopWords.has(w));

  const now = Date.now();
  const recentCutoff = now - (thresholdHours * 3600 * 1000);

  // কোর সাবজেক্ট ক্লাস্টার (একই ক্লাস্টারের বিষয় বারবার এলে ব্লক করবে)
  const CORE_CLUSTERS = [
    ['website', 'ওয়েবসাইট', 'web app', 'v0', 'bolt.new', 'bolt', 'cursor', 'lovable', 'replit', 'কোডিং ছাড়া'],
    ['poster', 'পোস্টার', 'canva', 'flux', 'recraft', 'photoshop', 'ফুড', 'রেস্তোরাঁ', 'ডিজাইন'],
    ['video', 'ভিডিও', 'reels', 'রিলস', 'capcut', 'kling', 'runway', 'শর্টস', 'ক্যাপশন'],
    ['voice', 'ভয়েস', 'audio', 'গান', 'elevenlabs', 'suno', 'ভয়েসওভার', 'পডকাস্ট'],
    ['excel', 'এক্সেল', 'sheets', 'vlookup', 'formula', 'ফর্মুলা', 'হিসাব'],
    ['freelance', 'ফ্রিল্যান্সিং', 'upwork', 'fiverr', 'client', 'গিগ', 'ইনকাম', 'রিমোট জব'],
    ['writing', 'লেখা', 'article', 'কপিরাইটিং', 'hook', 'হুক', 'রিভিউ']
  ];

  for (const item of seenTopics) {
    if (!item.title) continue;
    const itemDate = item.date ? new Date(item.date).getTime() : now;
    if (itemDate < recentCutoff) continue; // ৪৮ ঘণ্টার আগের হলে বিবেচনা থেকে বাদ

    const prev = item.title.toLowerCase();

    // ১. সম্পূর্ণ হুবহু বা সাবস্ট্রিং মিল
    if (cand.includes(prev) || prev.includes(cand)) {
      return true;
    }

    // ২. কোর ক্লাস্টার ওভারল্যাপ চেক
    for (const cluster of CORE_CLUSTERS) {
      const candMatches = cluster.filter(kw => cand.includes(kw));
      const prevMatches = cluster.filter(kw => prev.includes(kw));
      if (candMatches.length >= 2 && prevMatches.length >= 2) {
        return true;
      }
    }

    // ৩. কিওয়ার্ড ওভারল্যাপ ৪০% এর বেশি হলে
    const prevWords = new Set(prev.split(/[\s,–—\-:;()\[\]]+/).filter(w => w.length > 2 && !stopWords.has(w)));
    let matchCount = 0;
    for (const w of candWords) {
      if (prevWords.has(w)) matchCount++;
    }
    if (candWords.length > 0 && (matchCount / candWords.length) > 0.4) {
      return true;
    }
  }

  return false;
}

export async function fetchDailyTrendingAITopic(pillarKeyword = null, dayIndex = null, tierLevel = 1, forceRotate = false) {
  console.log(`🌐 আজকের রোডম্যাপ অনুযায়ী তাজা এআই খবর ও ট্রেন্ড কুড়ানো হচ্ছে (স্তর ${tierLevel})...`);
  const currentDay = dayIndex !== null ? dayIndex : new Date().getDay();
  
  const dayQueries = ROADMAP_SEARCH_QUERIES[currentDay] || ROADMAP_SEARCH_QUERIES[3];
  const searchQuery = (typeof dayQueries === 'object' ? dayQueries[tierLevel] : dayQueries) || 'artificial intelligence tools';

  const seen = getSeenTopics();
  const candidateTopics = [];

  // ১. যদি ফোর্স রোটেট বলা হয় (যেমন ব্যবহারকারী "আরেকটা দাও" বা "নতুন পোস্ট দাও" বলেছেন)
  if (forceRotate) {
    console.log('🔄 ফোর্স রোটেশন সক্রিয় — ভিন্ন কোনো ভাইরাল ওয়ার্কফ্লো থেকে বাছাই করা হচ্ছে...');
    for (const vTopic of VIRAL_WORKFLOW_TOPICS) {
      if (!isDuplicateTopic(vTopic.title, seen, 24)) {
        saveSeenTopic(vTopic.title);
        console.log(`🎯 ফোর্স রোটেটেড ফ্রেশ টপিক: ${vTopic.title}`);
        return vTopic;
      }
    }
  }

  // ২. Google News AI RSS (রোডম্যাপের নির্দিষ্ট স্তরের কিওয়ার্ড দিয়ে সার্চ)
  try {
    const encodedQuery = encodeURIComponent(searchQuery);
    const res = await fetch(`https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`, { signal: AbortSignal.timeout(6000) });
    const xml = await res.text();
    const matches = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<description>(.*?)<\/description>[\s\S]*?<\/item>/g)];
    for (const m of matches) {
      const title = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      const desc = m[2].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim();
      if (title && !title.includes('Google News')) {
        candidateTopics.push({ title, description: desc, source: 'Google News AI' });
      }
    }
  } catch (e) {
    console.warn('Google News fetch warning:', e.message);
  }

  // ৩. কঠোর অ্যান্টি-রিপিটিশন ফিল্টারিং
  const freshCandidates = candidateTopics.filter(c => !isDuplicateTopic(c.title, seen, 48));

  if (freshCandidates.length > 0) {
    const selected = freshCandidates[0];
    saveSeenTopic(selected.title);
    console.log(`🎯 নির্বাচিত ফ্রেশ তাজা টপিক (${selected.source}): ${selected.title}`);
    return selected;
  }

  // ৪. যদি লাইভ ফিডে নতুন কিছু না থাকে, তবে আজকের রোডম্যাপের কিউরেটেড ফলব্যাক থেকে নন-ডুপ্লিকেট টপিক
  const fallbacksForToday = ROADMAP_FALLBACKS[currentDay] || ROADMAP_FALLBACKS[3];
  const freshFallback = fallbacksForToday.find(f => !isDuplicateTopic(f.title, seen, 48));

  if (freshFallback) {
    saveSeenTopic(freshFallback.title);
    console.log(`🎯 আজকের রোডম্যাপ অনুযায়ী নন-ডুপ্লিকেট ফলব্যাক: ${freshFallback.title}`);
    return freshFallback;
  }

  // ৫. আজকের সব ফলব্যাক যদি ইতোমধ্যেই ব্যবহৃত হয়ে থাকে, তবে অন্য কোনো ভাইরাল ওয়ার্কফ্লো থেকে একদম আনকোরা টপিক দেওয়া
  for (const vTopic of VIRAL_WORKFLOW_TOPICS) {
    if (!isDuplicateTopic(vTopic.title, seen, 24)) {
      saveSeenTopic(vTopic.title);
      console.log(`🎯 রোটেটেড অলটারনেটিভ ফ্রেশ টপিক: ${vTopic.title}`);
      return vTopic;
    }
  }

  // ৬. চরমতম সেফটি ফলব্যাক
  const ultimate = VIRAL_WORKFLOW_TOPICS[Math.floor(Math.random() * VIRAL_WORKFLOW_TOPICS.length)];
  saveSeenTopic(ultimate.title);
  return ultimate;
}
