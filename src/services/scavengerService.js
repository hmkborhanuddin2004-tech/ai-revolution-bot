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
  0: 'no design skills ai poster OR make posters in 60 seconds with ai OR flux ai image generator OR recraft ai',
  1: 'runway ai video OR kling ai video OR capcut ai OR faceless viral reels ai',
  2: 'elevenlabs ai voice OR suno ai music OR ai audio voiceover',
  3: 'google gemini workspace OR microsoft copilot excel OR ai office productivity',
  4: 'v0 dev OR bolt new OR ai website in 60 seconds OR framer ai',
  5: 'ai freelancing jobs OR ai workflow canva chatgpt OR best ai skills OR ai career income',
  6: 'chatgpt ad copy prompts OR claude 3.5 sonnet OR ai writing assistant OR viral prompt lab'
};

export const VIRAL_WORKFLOW_TOPICS = [
  {
    niche: 'restaurant',
    title: 'রেস্তোরাঁর লোভনীয় পোস্টার মাত্র ৬০ সেকেন্ডে (ChatGPT + Flux + Canva)',
    description: 'কোনো ডিজাইন স্কিল ছাড়া রেস্তোরাঁ ও ফুড বিজনেসের জন্য প্রফেশনাল সোশ্যাল মিডিয়া পোস্টার তৈরির কমপ্লিট ব্লুপ্রিন্ট',
    tools: ['ChatGPT (Ad Copy)', 'Flux AI (Ultra-Realistic Food Image)', 'Canva AI (Typography & Layout)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'ecommerce',
    title: 'ই-কমার্স প্রোডাক্ট অ্যাড ৬০ সেকেন্ডে (ChatGPT + Clipdrop + Canva)',
    description: 'মোবাইলের সাধারণ ছবিকে আন্তর্জাতিক ব্র্যান্ডের বিজ্ঞাপনে রূপান্তরের ৩-টুল এআই ফর্মুলা',
    tools: ['ChatGPT (Hooks & Angles)', 'Clipdrop AI (Background Replacement)', 'Canva AI (Price Tag & CTA)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'realestate',
    title: 'রিয়েল এস্টেট ব্যানার অ্যাড মাত্র ২ মিনিটে (Claude + Flux + Canva)',
    description: 'ফ্ল্যাট বা জমির হাই-কনভার্টিং ফেসবুক ব্যানার তৈরির সিক্রেট এআই ওয়ার্কফ্লো',
    tools: ['Claude 3.5 (Property Pitch)', 'Flux AI (Luxury Architectural Visuals)', 'Canva AI (Banner Design)'],
    source: 'AI for Everyone Benchmark'
  },
  {
    niche: 'faceless_reels',
    title: 'চেহারা না দেখিয়ে ভাইরাল বাংলা রিলস ৫ মিনিটে (ChatGPT + ElevenLabs + CapCut)',
    description: 'সোশ্যাল মিডিয়ায় ফেসলেস ভিডিও দিয়ে লাখ লাখ ভিউ ও চ্যানেল গ্রোথের অটোমেটেড পাইপলাইন',
    tools: ['ChatGPT (Viral Script)', 'ElevenLabs (Lifelike Bangla Voiceover)', 'CapCut AI (Auto-Captions & B-roll)'],
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
    VIRAL_WORKFLOW_TOPICS[0], // Restaurant Posters in 60s
    { title: 'Flux AI & Recraft: সেরা ফ্রি আল্ট্রা-রিয়েলিস্টিক ইমেজ তৈরির ম্যাজিক', description: 'বিনামূল্যে টেক্সট দিয়ে প্রফেশনাল ১০৮০x১০৮০ ছবি ও ডিজাইন বানানোর বাস্তব কৌশল', source: 'Curated AI Hub' },
    { title: 'Midjourney Prompt Engineering: চোখ ধাঁধানো আর্ট বানানোর গোপন সূত্র', description: 'সঠিক লাইটিং ও ক্যামেরা অ্যাঙ্গেল দিয়ে পারফেক্ট ইমেজ জেনারেশন', source: 'Curated AI Hub' }
  ],
  1: [
    VIRAL_WORKFLOW_TOPICS[3], // Faceless Reels in 5 mins
    { title: 'Kling AI & Runway Gen-3: ক্যামেরা ছাড়া সিনেমাটিক ভিডিও বানানোর জাদু', description: 'টেক্সট বা ছবি থেকে সরাসরি হাই-কোয়ালিটি ভিডিও ক্লিপ তৈরির সহজ গাইড', source: 'Curated AI Hub' },
    { title: 'CapCut AI & Auto-Subtitles: ৫ মিনিটে ভাইরাল বাংলা রিলস তৈরি', description: 'ভিডিও এডিটিং না জেনেও সোশ্যাল মিডিয়ার জন্য নজরকাড়া শর্টস মেকিং', source: 'Curated AI Hub' }
  ],
  2: [
    { title: 'ElevenLabs Voice Clone: হুবহু মানুষের মতো প্রাণবন্ত বাংলা ভয়েসওভার', description: 'ন্যাচারাল ইমোশন ও স্পষ্ট উচ্চারণে এআই ভয়েস দিয়ে ভিডিও বানানোর ট্রিকস', source: 'Curated AI Hub' },
    { title: 'Suno AI v3: এক প্রম্পটেই পুরো বাংলা গান ও মিউজিক তৈরি', description: 'লিরিকস লিখে মনের মতো সুর ও ব্যাকগ্রাউন্ড মিউজিক বানানোর রোমাঞ্চকর উপায়', source: 'Curated AI Hub' }
  ],
  3: [
    { title: 'Google Gemini & Copilot: এক্সেল ডাটা অ্যানালাইসিস ও ফর্মুলার ম্যাজিক', description: 'ঘণ্টার পর ঘণ্টার এক্সেল ক্যালকুলেশন ও জটিল ফর্মুলা ৫ সেকেন্ডে সমাধানের হ্যাকস', source: 'Curated AI Hub' },
    { title: 'Gmail & Google Docs-এ Gemini AI: ৫ মিনিটে প্রফেশনাল ইমেইল ও প্রেজেন্টেশন', description: 'কর্মক্ষেত্রে কাজের গতি ১০ গুণ বাড়িয়ে দ্রুত প্রফেশনাল রিপোর্ট তৈরির পাওয়ারফুল ট্রিকস', source: 'Curated AI Hub' }
  ],
  4: [
    VIRAL_WORKFLOW_TOPICS[4], // Landing Page in 2 mins
    { title: 'v0.dev & Bolt.new: কোডিং না জেনেও বাংলায় লিখে সম্পূর্ণ ওয়েবসাইট তৈরি', description: 'প্রম্পট দিয়ে আধুনিক রেসপন্সিভ ল্যান্ডিং পেজ ও ওয়েব অ্যাপ বানিয়ে লাইভ করার কৌশল', source: 'Curated AI Hub' },
    { title: 'Framer AI: ১০ মিনিটে ক্লায়েন্টের জন্য বিজনেস ওয়েবসাইট ডিজাইন', description: 'ড্র্যাগ অ্যান্ড ড্রপ ছাড়াই অত্যাধুনিক নো-কোড ওয়েবসাইট তৈরির সহজ টিউটোরিয়াল', source: 'Curated AI Hub' }
  ],
  5: [
    VIRAL_WORKFLOW_TOPICS[1], // Ecommerce Product Ad in 60s
    { title: '২০২৬ সালে ফ্রিল্যান্সিংয়ে সবচেয়ে চাহিদাসম্পন্ন ৫টি এআই স্কিল', description: 'আপওয়ার্ক ও ফাইভারে এআই অটোমেশন ও প্রম্পট ইঞ্জিনিয়ারিং দিয়ে ক্লায়েন্ট পাওয়ার রোডম্যাপ', source: 'Curated AI Hub' },
    { title: 'এআই দিয়ে ফ্রিল্যান্স ক্যারিয়ার শুরু: নতুনদের জন্য স্টেপ-বাই-স্টেপ গাইড', description: 'জিরো স্কিল থেকে এআই টুলস আয়ত্ত করে ঘরে বসে আন্তর্জাতিক আয়ের বাস্তব পথ', source: 'Curated AI Hub' }
  ],
  6: [
    VIRAL_WORKFLOW_TOPICS[5], // CV & Portfolio in 3 mins
    { title: 'ChatGPT Canvas & Memory: প্রফেশনাল কন্টেন্ট ও সিভি তৈরির সুপার ট্রিকস', description: 'সাধারণ চ্যাটের বাইরে ক্যানভাস ব্যবহার করে নিখুঁত ডকুমেন্ট ও সিভি লেখার উপায়', source: 'Curated AI Hub' },
    { title: 'Claude 3.5 Sonnet: মানুষের মতো ন্যাচারাল বাংলা আর্টিকেলের ম্যাজিক', description: 'রোবটিক টোন ছাড়া একদম জীবন্ত বাংলা কন্টেন্ট ও ব্লগ লেখার সেরা প্রম্পট', source: 'Curated AI Hub' }
  ]
};

export async function fetchDailyTrendingAITopic(pillarKeyword = null, dayIndex = null) {
  console.log('🌐 আজকের রোডম্যাপ অনুযায়ী তাজা এআই খবর ও ট্রেন্ড কুড়ানো হচ্ছে...');
  const currentDay = dayIndex !== null ? dayIndex : new Date().getDay();
  const searchQuery = ROADMAP_SEARCH_QUERIES[currentDay] || 'artificial intelligence tools';

  const seen = getSeenTopics().map(t => t.title.toLowerCase());
  const candidateTopics = [];

  // ১. Google News AI RSS (রোডম্যাপের সুনির্দিষ্ট কিওয়ার্ড দিয়ে সার্চ)
  try {
    const encodedQuery = encodeURIComponent(searchQuery);
    const res = await fetch(`https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`);
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

  // ফিল্টারিং: যা আগে ব্যবহার করা হয়নি
  const freshCandidates = candidateTopics.filter(c => !seen.some(s => s.includes(c.title.toLowerCase()) || c.title.toLowerCase().includes(s)));

  if (freshCandidates.length > 0) {
    const selected = freshCandidates[0];
    saveSeenTopic(selected.title);
    console.log(`🎯 আজকের নির্বাচিত তাজা টপিক (${selected.source}): ${selected.title}`);
    return selected;
  }

  // যদি তাজা লাইভ ফিডে না পাওয়া যায়, তবে আজকের রোডম্যাপের সুনির্দিষ্ট কিউরেটেড টপিক
  const fallbacksForToday = ROADMAP_FALLBACKS[currentDay] || ROADMAP_FALLBACKS[3];
  const fallback = fallbacksForToday.find(f => !seen.some(s => s.includes(f.title.toLowerCase()))) || fallbacksForToday[0];
  saveSeenTopic(fallback.title);
  console.log(`🎯 আজকের রোডম্যাপ অনুযায়ী কোর টপিক: ${fallback.title}`);
  return fallback;
}
