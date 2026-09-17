import { config } from '../config.js';

// ৭ দিনের নির্দিষ্ট রোডম্যাপ ও প্রতিদিনের ৪টি ভিন্ন উপ-বিষয় (Sub-Themes)
export const WEEKLY_SCHEDULE = {
  0: {
    dayName: 'রবিবার',
    pillar: 'ইমেজ ও ভিজ্যুয়াল আর্ট এআই',
    topic: 'ইমেজ ও ভিজ্যুয়াল আর্ট এআই (Flux, Midjourney, Canva & Recraft)',
    focus: 'ফ্রি এআই দিয়ে টেক্সট থেকে এইচডি ছবি, কভার ডিজাইন ও আর্ট বানানোর কৌশল',
    tierThemes: {
      1: { title: 'ক্যানভা ও এআই দিয়ে সোশ্যাল মিডিয়া কভার মেকিং', focus: 'জিরো-ডিজাইন স্কিল দিয়ে ফেসবুক কভার ও পোস্টার বানানোর কৌশল', tools: ['Canva AI', 'Recraft'] },
      2: { title: 'দিনের পোস্ট কার্ড: ৩ মিনিটে যেকোনো প্রোডাক্টের ব্যাকগ্রাউন্ড রিমুভ ও স্টুডিও ফটো', focus: 'মোবাইলের সাধারণ ছবিকে প্রফেশনাল ই-কমার্স প্রোডাক্ট ফটোতে রূপান্তর', tools: ['Clipdrop', 'Photoroom'] },
      4: { title: 'ডেইলি প্রম্পট ল্যাব: রেস্তোরাঁ ও ব্যবসার ভাইরাল সোশ্যাল মিডিয়া পোস্টার প্রম্পট', focus: 'Altiam Kabir স্টাইল কপি-পেস্ট প্রম্পট রেসিপি', tools: ['ChatGPT', 'Flux AI'] },
      3: { title: 'অ্যাডভান্সড স্তর: Midjourney v6 vs Flux.1 Schnell — কোনটা কখন ফ্রি আর কখন পেইড?', focus: 'ফ্রি বনাম প্রো মডেলের গভীর বিশ্লেষণ ও খরচ বাঁচানোর উপায়', tools: ['Midjourney', 'Flux AI'] }
    }
  },
  1: {
    dayName: 'সোমবার',
    pillar: 'ভিডিও এআই ও রিলস মেকিং',
    topic: 'ভিডিও এআই ও রিলস মেকিং (CapCut AI, Kling & Runway)',
    focus: 'ক্যামেরা ছাড়া বাংলা শর্টস, ভাইরাল রিলস তৈরি ও অটো-সাবটাইটেল',
    tierThemes: {
      1: { title: 'CapCut AI দিয়ে ৫ মিনিটে বাংলা ভিডিওতে স্টাইলিশ অটো-সাবটাইটেল', focus: 'মোবাইল দিয়ে ভিডিওতে ভাইরাল ক্যাপশন যুক্ত করার সহজ ট্রিকস', tools: ['CapCut AI'] },
      2: { title: 'দিনের পোস্ট কার্ড: ফেসলেস ভিডিওর জন্য ৩টি সুপার-ফাস্ট B-Roll ও স্টক ফুটেজ হ্যাক', focus: 'ক্যামেরা ছাড়া রিলস তৈরির গোপন কৌশল', tools: ['Pexels AI', 'CapCut'] },
      4: { title: 'ডেইলি প্রম্পট ল্যাব: ফেসলেস ইউটিউব শর্টস ও রিলসের ভাইরাল হুক ও স্ক্রিপ্ট রেসিপি', focus: 'দর্শকদের আটকে রাখার মনস্তাত্ত্বিক স্ক্রিপ্ট প্রম্পট', tools: ['ChatGPT', 'ElevenLabs'] },
      3: { title: 'অ্যাডভান্সড স্তর: Kling AI vs Runway Gen-3 — ফ্রি ইউজারদের জন্য সেরা সিনেমাটিক ভিডিও মেকার', focus: 'টেক্সট থেকে হাই-কোয়ালিটি ভিডিও জেনারেশন তুলনা', tools: ['Kling AI', 'Runway Gen-3'] }
    }
  },
  2: {
    dayName: 'মঙ্গলবার',
    pillar: 'ভয়েস ও অডিও এআই',
    topic: 'ভয়েস ও অডিও এআই (ElevenLabs & Suno AI)',
    focus: 'মানুষের মতো প্রাণবন্ত বাংলা ভয়েসওভার ও গান তৈরির জাদু',
    tierThemes: {
      1: { title: 'ElevenLabs দিয়ে প্রাকৃতিক ও আবেগঘন বাংলা ভয়েসওভার তৈরি', focus: 'রোবটিক টোন ছাড়া একদম জীবন্ত মানুষের মতো অডিও বানানোর নিয়ম', tools: ['ElevenLabs'] },
      2: { title: 'দিনের পোস্ট কার্ড: অডিও নয়েজ রিমুভ ও পডকাস্ট কোয়ালিটি সাউন্ড হ্যাক', focus: 'এক ক্লিকে সাধারণ রেকর্ডিংকে স্টুডিও সাউন্ডে রূপান্তর', tools: ['Adobe Podcast AI'] },
      4: { title: 'ডেইলি প্রম্পট ল্যাব: লিরিকস থেকে পুরো বাংলা গান ও ব্যাকগ্রাউন্ড মিউজিক রেসিপি', focus: 'Suno AI দিয়ে যে কোনো জনরার সুর ও গান তৈরির প্রম্পট', tools: ['Suno AI', 'ChatGPT'] },
      3: { title: 'অ্যাডভান্সড স্তর: ফ্রি অডিও ক্লোনিং vs পেইড ElevenLabs Pro — ভয়েসওভার ক্যারিয়ার গাইড', focus: 'অডিও কন্টেন্ট ক্রিয়েটরদের জন্য কমপ্লিট ইকোসিস্টেম বিশ্লেষণ', tools: ['ElevenLabs', 'Murf AI'] }
    }
  },
  3: {
    dayName: 'বুধবার',
    pillar: 'অফিস ও প্রোডাক্টিভিটি এআই',
    topic: 'অফিস ও প্রোডাক্টিভিটি এআই (Google Gemini, Excel & Copilot)',
    focus: 'এক্সেল সূত্র, জিমেইল ও প্রেজেন্টেশন ৫ মিনিটে বানানোর পাওয়ারফুল কৌশল',
    tierThemes: {
      1: { title: 'এক ক্লিকে ৫০ স্লাইডের পাওয়ারপয়েন্ট প্রেজেন্টেশন তৈরি (Gamma AI)', focus: 'হাতে টাইপ না করে প্রফেশনাল প্রেজেন্টেশন স্লাইড বানানোর জাদু', tools: ['Gamma AI'] },
      2: { title: 'দিনের পোস্ট কার্ড: জটিল এক্সেল ফর্মুলা ও VLOOKUP ৫ সেকেন্ডে সমাধান', focus: 'ফর্মুলা মুখস্থ না করে এআই দিয়ে নিখুঁত শিট ক্যালকুলেশন', tools: ['ChatGPT Sheet AI', 'Copilot'] },
      4: { title: 'ডেইলি প্রম্পট ল্যাব: অফিস মিটিং সামারি ও কাস্টমার ফলো-আপ ইমেইল ব্লুপ্রিন্ট', focus: 'কর্মক্ষেত্রে প্রতিদিনের ১ ঘণ্টা সময় বাঁচানোর মাস্টার প্রম্পট', tools: ['Gemini Workspace', 'ChatGPT'] },
      3: { title: 'অ্যাডভান্সড স্তর: Google Workspace Gemini vs Microsoft 365 Copilot — অফিসের জন্য কোনটি সেরা?', focus: 'অফিস প্রডাক্টিভিটির তুলনামূলক বিশ্লেষণ ও ফ্রি ব্যবহারের কৌশল', tools: ['Google Workspace', 'Microsoft Copilot'] }
    }
  },
  4: {
    dayName: 'বৃহস্পতিবার',
    pillar: 'নো-কোড, অ্যাপ ও অটোমেশন এআই',
    topic: 'নো-কোড, অ্যাপ ও অটোমেশন এআই (Make, Bolt.new, v0 & Typeform)',
    focus: 'কোডিং ছাড়া স্মার্ট অটোমেশন, ইন্টারেক্টিভ ফর্ম ও ওয়েব অ্যাপ তৈরি',
    tierThemes: {
      1: { title: 'স্মার্ট নো-কোড এআই ফর্ম ও কাস্টমার লিড জেনারেশন (Tally & Typeform AI)', focus: 'কোডিং ছাড়াই প্রফেশনাল অনলাইন ফর্ম ও অটোমেটেড রেসপন্স তৈরি', tools: ['Tally AI', 'Typeform'] },
      2: { title: 'দিনের পোস্ট কার্ড: Make.com দিয়ে সোশ্যাল মিডিয়া অটো-পোস্টিং ও গুগল শিট সিঙ্ক হ্যাক', focus: 'কোনো কোড ছাড়া সম্পূর্ণ সোশ্যাল মিডিয়া পাইপলাইন অটোমেট করার ফর্মুলা', tools: ['Make.com', 'Zapier'] },
      4: { title: 'ডেইলি প্রম্পট ল্যাব: হাই-কনভার্টিং ল্যান্ডিং পেজ কপিরাইটিং ও সেলস ফানেল ব্লুপ্রিন্ট', focus: 'যেকোনো পণ্যের জন্য আকর্ষণীয় বিক্রয় কপি তৈরির রেডিমেড মাস্টার প্রম্পট', tools: ['Claude 3.5 Sonnet', 'v0.dev'] },
      3: { title: 'অ্যাডভান্সড স্তর: Lovable vs Bolt.new বনাম Cursor — নো-কোড অ্যাপ তৈরিতে কোনটি সেরা?', focus: 'ফ্রি বনাম পেইড নো-কোড প্ল্যাটফর্মের নিখুঁত রিয়েল-ওয়ার্ল্ড তুলনা', tools: ['Lovable', 'Bolt.new', 'Cursor'] }
    }
  },
  5: {
    dayName: 'শুক্রবার',
    pillar: 'এআই ক্যারিয়ার ও ফ্রিল্যান্সিং',
    topic: 'এআই ক্যারিয়ার, ভবিষ্যৎ ও সুযোগ (Freelancing & Income)',
    focus: '২০২৬ সালের সেরা এআই স্কিল ও ফ্রিল্যান্সিংয়ে আয়ের বাস্তব উপায়',
    tierThemes: {
      1: { title: '২০২৬ সালে ফ্রিল্যান্সিংয়ে সবচেয়ে চাহিদাসম্পন্ন ৫টি এআই স্কিল', focus: 'নতুনদের জন্য জিরো থেকে আন্তর্জাতিক ক্লায়েন্ট পাওয়ার গাইডলাইন', tools: ['Upwork', 'Fiverr', 'AI Skills'] },
      2: { title: 'দিনের পোস্ট কার্ড: ক্লায়েন্ট হান্টিং ও লিঙ্কডইন কোল্ড মেসেজ হ্যাক', focus: 'আন্তর্জাতিক বায়ারদের দৃষ্টি আকর্ষণ করার ৫টি মনস্তাত্ত্বিক কৌশল', tools: ['LinkedIn AI', 'ChatGPT'] },
      4: { title: 'ডেইলি প্রম্পট ল্যাব: আপওয়ার্ক ও ফাইভার কভার লেটার উইনিং ব্লুপ্রিন্ট', focus: 'যে কভার লেটার পড়লে ক্লায়েন্ট ইন্টারভিউতে ডাকতে বাধ্য হয়', tools: ['Claude 3.5', 'ChatGPT'] },
      3: { title: 'অ্যাডভান্সড স্তর: একক ফ্রিল্যান্সার বনাম এআই এজেন্সি — আয়ের গতি ৫ গুণ করার ব্লুপ্রিন্ট', focus: 'এআই অটোমেশন দিয়ে সার্ভিস ডেলিভারি স্পিড বাড়ানোর কৌশল', tools: ['AI Workflow', 'Agency Stack'] }
    }
  },
  6: {
    dayName: 'শনিবার',
    pillar: 'কন্টেন্ট রাইটিং ও ভাইরাল সোশ্যাল মিডিয়া এআই',
    topic: 'কন্টেন্ট রাইটিং ও ভাইরাল সোশ্যাল মিডিয়া এআই (ChatGPT, Claude & Copywriting)',
    focus: 'সিভি, ভাইরাল পোস্ট ও প্রফেশনাল রাইটিংয়ের রেডিমেড হ্যাকস',
    tierThemes: {
      1: { title: 'সোশ্যাল মিডিয়ায় প্রথম ৩ সেকেন্ডের স্ক্রোল-স্টপিং হুক তৈরির ফর্মুলা', focus: 'পাঠকদের মনোযোগ ধরে রেখে ভাইরাল পোস্ট লেখার আর্ট', tools: ['ChatGPT 4o', 'Claude 3.5'] },
      2: { title: 'দিনের পোস্ট কার্ড: ৩ মিনিটে আন্তর্জাতিক মানের এটিএস-ফ্রেন্ডলি রেজুমে ও সিভি হ্যাক', focus: 'রিমোট জব অ্যাপ্লিকেশনের জন্য নিখুঁত সিভি তৈরির শর্টকাট', tools: ['ChatGPT Canvas', 'Canva AI'] },
      4: { title: 'ডেইলি প্রম্পট ল্যাব: মানুষের মতো আবেগপূর্ণ ও প্রভাব বিস্তারকারী বাংলা আর্টিকেল মাস্টার প্রম্পট', focus: 'রোবটিক ভাষা ছাড়া জীবন্ত বাংলা কন্টেন্ট লেখার রেসিপি', tools: ['Claude 3.5 Sonnet', 'Gemini'] },
      3: { title: 'অ্যাডভান্সড স্তর: Claude 3.5 Sonnet vs ChatGPT Plus — কন্টেন্ট ক্রিয়েটরদের জন্য কার বুদ্ধিমত্তা এগিয়ে?', focus: 'দুই প্রধান এলএলএম-এর লেখার গভীরতা ও যুক্তি বিশ্লেষণী তুলনা', tools: ['Claude 3.5', 'ChatGPT 4o'] }
    }
  }
};

export const TIERS = {
  1: {
    name: 'বিগিনার স্তর',
    time: 'সকাল ১০:০০ টা',
    isPostCard: false,
    formatInstruction: `
[কন্টেন্ট নির্দেশিকা - সকালের পোস্ট (AI Varsity Bangla স্টাইল - পাওয়ার টুলস ও প্র্যাকটিক্যাল গাইড)]:
- 💥 লাইন ১-এ শক্তিশালী স্ক্রোল-স্টপিং ১-লাইনের হুক দিয়ে সরাসরি শুরু করবে (যেমন: সাধারণ ভুলের উন্মোচন বা সময়ের বিশাল সাশ্রয়ের ঘোষণা)।
- কোনো বক্স, ফ্রেম, ডিভাইডার দাগ (━━━━ বা ────) বা [ফেসবুক পোস্ট ক্যাপশন] জাতীয় হেডার ভুলেও থাকবে না।
- বডিতে কোনো সাধারণ বুলেট (•) বা হাইফেন (-) ব্যবহার করবে না, এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) ব্যবহার করবে। পুরো কনসেপ্ট পাঠকদের কাছে ১০০% পরিষ্কার ও বোধগম্য না হওয়া পর্যন্ত যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলোই ব্যবহার করবে (ব্লু পয়েন্টের সংখ্যার কোনো সীমা নেই)।
- 🎯 মূল কপি-পেস্ট এআই প্রম্পট রেসিপিটি পোস্টের বডিতে ব্লু পয়েন্টের ভেতরেই সরাসরি দেবে যাতে পাঠক সাথে সাথে সমাধান পায়।
- যদি ১টির বেশি অতিরিক্ত প্রম্পট থাকে, কেবল তখনই অতিরিক্ত প্রম্পটগুলো "firstComment" ফিল্ডে দেবে। ১টি মাত্র প্রম্পট হলে তা সরাসরি পোস্টেই থাকবে এবং firstComment খালি থাকবে।
- 💡 প্রো-টিপ এবং অ্যাকশনেবল স্টেপস।
- 📌 সেভ ও শেয়ার করার জন্য স্মার্ট কল-টু-অ্যাকশন (CTA)।
- ৪-৫টি হাই-রিচ হ্যাশট্যাগ (#AiRevolution #TechBangla #Productivity #AITools #BanglaTech)।
`
  },
  2: {
    name: 'এআই পোস্ট কার্ড',
    time: 'দুপুর ০২:০০ টা',
    isPostCard: true,
    formatInstruction: `
[কন্টেন্ট নির্দেশিকা - দুপুরের পোস্ট কার্ড (দিনের একমাত্র আলটিমেট পোস্ট কার্ড)]:
- কোনো দীর্ঘ ডিভাইডার দাগ (━━━━ বা ──── বা ─────) বা [ফেসবুক পোস্ট ক্যাপশন] জাতীয় হেডার ভুলেও থাকবে না।
- সরাসরি আকর্ষণীয় শিরোনাম বা ব্যাজ দিয়ে শুরু করবে: 📌 [আজকের বিষয়ের চোখধাঁধানো পাওয়ার হ্যাক]
- দ্রুত স্ক্যানযোগ্য ৩টি বা তার বেশি বুলেট হ্যাকস বা সময় বাঁচানোর সিক্রেট টেকনিক এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) দিয়ে তুলে ধরবে:
  🔹 হ্যাক ১: ...
  🔹 হ্যাক ২: ...
  🔹 হ্যাক ৩: ...
- 🎯 সরাসরি ব্যবহারের জন্য গোল্ডেন কপি-পেস্ট এআই প্রম্পট পোস্টের ভেতরেই ব্লু পয়েন্টে দেবে:
  🔹 👉 প্রম্পট: "[সরাসরি কপি-পেস্ট উপযোগী কার্যকর প্রম্পট]"
- ⚡ কুইক প্রো-টিপ এবং ৩-৪টি ট্রেন্ডিং হ্যাশট্যাগ (#AiRevolution #AIPostCard #TechHacks #BanglaAI)।
- পোস্ট কার্ডটি হবে তথ্যবহুল, ব্লু পয়েন্টে সাজানো, অত্যন্ত আকর্ষণীয় ও সরাসরি কাজের!
`
  },
  3: {
    name: 'অ্যাডভান্সড স্তর',
    time: 'রাত ০৮:৩০ টা',
    isPostCard: false,
    formatInstruction: `
[কন্টেন্ট নির্দেশিকা - রাতের অ্যাডভান্সড পোস্ট (Free vs Pro বিশ্লেষণ, এআই অটোমেশন ও ক্যারিয়ার)]:
- কোনো বক্স, ফ্রেম, ডিভাইডার দাগ (━━━━ বা ────) বা [ফেসবুক পোস্ট ক্যাপশন] জাতীয় হেডার ভুলেও থাকবে না।
- 💥 লাইন ১-এ গভীর চিন্তা-উদ্দীপক ও ক্যারিয়ার-ভিত্তিক ১-লাইনের হুক দিয়ে শুরু করবে (যেমন: কখন ফ্রি ছেড়ে পেইড টুলে যাবেন, কীভাবে এআই দিয়ে কাজের গতি ৫ গুণ করবেন)।
- বডিতে কোনো সাধারণ বুলেট (•) বা হাইফেন (-) ব্যবহার করবে না, এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) ব্যবহার করবে। পুরো কনসেপ্ট পাঠকদের কাছে ১০০% পরিষ্কার না হওয়া পর্যন্ত যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলোই ব্যবহার করবে (ব্লু পয়েন্টের সংখ্যার কোনো সীমা নেই)।
- Free vs Pro-এর বাস্তবধর্মী তুলনামূলক বিশ্লেষণ অথবা অটোমেশন ওয়ার্কফ্লো ব্লু পয়েন্ট দিয়ে সাজাবে।
- 🎯 মূল চেইন-অব-থট (Chain-of-Thought) বা মাল্টি-স্টেপ প্রম্পট ফ্রেমওয়ার্ক সরাসরি পোস্টের ভেতরে ব্লু পয়েন্টে দেবে।
- যদি ১টির বেশি অতিরিক্ত প্রম্পট থাকে, কেবল তখনই অতিরিক্ত প্রম্পটগুলো "firstComment" ফিল্ডে দেবে। ১টি মাত্র প্রম্পট হলে তা সরাসরি পোস্টেই থাকবে এবং firstComment খালি থাকবে।
- 💬 পাঠকদের মতামত জানার জন্য ১টি প্রশ্ন এবং সেভ করার আহ্বান।
- ৪-৫টি ট্রেন্ডিং হ্যাশট্যাগ (#AiRevolution #FreeVsPro #AIAutomation #FreelancingBangla #CareerHacks)।
`
  },
  4: {
    name: 'ডেইলি প্রম্পট ল্যাব',
    time: 'বিকাল ০৫:১৫ টা',
    isPostCard: false,
    formatInstruction: `
[কন্টেন্ট নির্দেশিকা - আসরের পর ডেইলি প্রম্পট ল্যাব (Altiam Kabir স্টাইল মাস্টারক্লাস)]:
- কোনো বক্স, ফ্রেম, ডিভাইডার দাগ (━━━━ বা ────) বা [ফেসবুক পোস্ট ক্যাপশন] জাতীয় হেডার ভুলেও থাকবে না।
- 💥 লাইন ১-এ কর্মব্যস্ত মানুষের একটি অতি পরিচিত বাস্তব সমস্যা ও তার ৩ মিনিটের সমাধান দিয়ে সরাসরি শক্তিশালী হুক।
- সমস্যাটির সাধারণ বোরিং সমাধান বনাম এআই দিয়ে স্মার্ট সমাধানের বাস্তব রূপ ব্লু পয়েন্ট (🔹) দিয়ে তুলে ধরবে।
- বডিতে কোনো সাধারণ বুলেট (•) বা হাইফেন (-) ব্যবহার করবে না, এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) ব্যবহার করবে। পুরো কনসেপ্ট ক্লিয়ার না হওয়া পর্যন্ত যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলোই ব্যবহার করবে (ব্লু পয়েন্টের সংখ্যার কোনো সীমা নেই)।
- 🎯 কপি-পেস্ট এআই প্রম্পট ব্লুপ্রিন্ট সরাসরি পোস্টের ভেতরে ব্লু পয়েন্টে দেবে:
  "তুমি একজন দক্ষ [ভূমিকা]। আমার [নির্দিষ্ট কাজ]-এর জন্য একটি নিখুঁত [ফলাফল] তৈরি করো।
  প্রসঙ্গ: [আপনার প্রয়োজনীয় তথ্য]।
  নিয়মাবলী: [কঠোর শর্ত]।
  আউটপুট কাঠামো: [পছন্দসই ফরম্যাট]।"
- সহজ ধাপে কীভাবে এটি দিয়ে কাজ শেষ করবেন তা ব্লু পয়েন্টে দেবে।
- যদি ১টির বেশি অতিরিক্ত প্রম্পট থাকে, কেবল তখনই অতিরিক্ত প্রম্পটগুলো "firstComment" ফিল্ডে দেবে। ১টি মাত্র প্রম্পট হলে তা সরাসরি পোস্টেই থাকবে এবং firstComment খালি থাকবে।
- 📌 বন্ধুদের সাথে শেয়ার ও টাইমলাইনে সেভ রাখার আকর্ষণীয় CTA।
- ৪-৫টি স্পেশাল হ্যাশট্যাগ (#AiRevolution #PromptLab #AltiamKabirStyle #PromptEngineering #SmartWork)।
`
  },
  5: {
    name: 'ভাইরাল ওয়ার্কফ্লো ল্যাব',
    time: 'অন-ডিমান্ড / ভাইরাল স্পেশাল',
    isPostCard: false,
    formatInstruction: `
[কন্টেন্ট নির্দেশিকা - ভাইরাল ওয়ার্কফ্লো ল্যাব (AI for Everyone Daily স্টাইল - জিরো-স্কিল মাল্টি-টুল ম্যাজিক)]:
- কোনো বক্স, ফ্রেম, ডিভাইডার দাগ (━━━━ বা ────) বা [ফেসবুক পোস্ট ক্যাপশন] জাতীয় কোনো হেডার কখনোই থাকবে না।
- 💥 লাইন ১-এ স্ক্রোল-স্টপিং জিরো-স্কিল পেইন-পয়েন্ট হুক (যেমন: "ডিজাইন পারেন না? কোনো গ্রাফিক ডিজাইনারের দরকার নেই! মাত্র ৬০ সেকেন্ডে বানিয়ে ফেলুন রেস্তোরাঁর লোভনীয় প্রফেশনাল পোস্টার। Here’s the workflow 👇")।
- দ্য ৩-টুল ফর্মুলা প্রতিটি পয়েন্টে এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) দিয়ে সুন্দরভাবে উপস্থাপন করবে:
  🔹 ✍️ [টুল ১ (যেমন ChatGPT/Claude)]: বিজ্ঞাপনের আকর্ষণীয় কপি লিখবে
  🔹 🎨 [টুল ২ (যেমন Flux AI/Ideogram)]: আল্ট্রা-রিয়েলিস্টিক চোখ ধাঁধানো ছবি বানাবে
  🔹 📐 [টুল ৩ (যেমন Canva AI/Recraft)]: পোস্টারের শেপ ও ব্র্যান্ডিং নিখুঁত করবে
- বডিতে কোনো সাধারণ বুলেট (•) বা হাইফেন (-) ব্যবহার করবে না, এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) ব্যবহার করবে। পুরো কনসেপ্ট পাঠকদের কাছে ১০০% ক্রিস্টাল ক্লিয়ার করার জন্য যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলোই ব্যবহার করবে (ব্লু পয়েন্টের সংখ্যার কোনো সীমা নেই)।
- সম্পূর্ণ প্র্যাকটিক্যাল গাইড ও সরাসরি কপি-পেস্ট এআই প্রম্পট ব্লুপ্রিন্ট সরাসরি পোস্টের ভেতরে ব্লু পয়েন্টের (🔹) ভেতরে দেবে ("ja thakbe upore dibe") যাতে পাঠক সাথে সাথে সমাধান পায়।
- 💡 প্রো-হ্যাক ও সময় বাঁচানোর সিক্রেট টেকনিক।
- 📌 বন্ধুদের সাথে শেয়ার ও টাইমলাইনে সেভ রাখার পাওয়ারফুল CTA (যেমন: "পোস্টটি এখনই সেভ করে রাখুন যাতে যে কোনো সময় কাজে লাগাতে পারেন!")।
- প্রথম কমেন্ট পলিসি: ১টির বেশি অতিরিক্ত প্রম্পট থাকলে (যেমন অলটারনেটিভ স্টাইল বা বোনাস অ্যাড ভ্যারিয়েশন প্রম্পট) তবেই তা "firstComment" ফিল্ডে দেবে। ১টি প্রম্পট হলে তা সরাসরি মূল পোস্টেই থাকবে।
- ৪-৫টি হাই-রিচ হ্যাশট্যাগ (#AiRevolution #AIFlow #CanvaAI #ChatGPT #SmartWorkflow #BanglaTech)।
`
  }
};

// সাপ্তাহিক কন্টেন্ট শিডিউল সুন্দর মেসেজ আকারে ফরম্যাট করা (কোনো ডিভাইডার দাগ ছাড়া)
export function formatWeeklyScheduleMessage() {
  const currentDayIndex = new Date().getDay();
  const currentDayData = WEEKLY_SCHEDULE[currentDayIndex];

  let msg = `📅 *Ai Revolution সাপ্তাহিক কন্টেন্ট শিডিউল*\n\n`;
  msg += `🌟 *আজকের দিন:* **${currentDayData.dayName}**\n`;
  msg += `📌 *আজকের মূল বিষয়:* ${currentDayData.pillar}\n`;
  msg += `🎯 *ফোকাস:* ${currentDayData.focus}\n\n`;

  msg += `⏰ *আজকের ৪টি দৈনিক স্তর ও উপ-বিষয়:*\n`;
  const tierOrder = [1, 2, 4, 3];
  for (const tierLevel of tierOrder) {
    const tierInfo = TIERS[tierLevel];
    const subTheme = currentDayData.tierThemes[tierLevel];
    msg += `🔹 *${tierInfo.time} (${tierInfo.name}):*\n`;
    msg += `   • বিষয়: ${subTheme.title}\n`;
    msg += `   • টুলস: ${subTheme.tools.join(', ')}\n`;
  }

  msg += `\n🗓️ *৭ দিনের পূর্ণাঙ্গ রুটিন:*\n`;
  for (let i = 0; i < 7; i++) {
    const d = WEEKLY_SCHEDULE[i];
    const isToday = (i === currentDayIndex);
    const mark = isToday ? '👉 🌟' : '•';
    msg += `${mark} *${d.dayName}:* ${d.pillar} ${isToday ? '(আজ)' : ''}\n`;
  }

  msg += `\n💡 *টিপস:* আপনি চাইলে যেকোনো সময় ভিন্ন আইডিয়ার পোস্ট বানাতে বলতে পারেন (যেমন: *'নতুন পোস্ট বানাও'*, */viral*, বা */prompt*)।`;
  return msg;
}

// পোস্টের ক্যাপশন থেকে সিস্টেম লেবেল, মেটা হেডার, ডিভাইডার দাগ ও অপ্রয়োজনীয় লিংক ছাঁটাই করা
export function sanitizePostContent(rawText) {
  if (!rawText) return '';
  let clean = rawText.trim();

  // ১. কোনো স্তরের নাম বা শিডিউলের সময় পোস্টের শুরুতে থাকলে তা মুছে ফেলা
  clean = clean.replace(/^(?:\[?[ \t]*(?:বিগিনার স্তর|অ্যাডভান্সড? স্তর|ডেইলি প্রম্পট ল্যাব|এআই পোস্ট কার্ড|ভাইরাল ওয়ার্কফ্লো ল্যাব|স্তর[ \t]*[১-৫]|লেভেল[ \t]*[১-৫]|সকাল[ \t]*১০|দুপুর[ \t]*০?২|বিকাল[ \t]*০?৫|আসরের পর|রাত[ \t]*০?৮|আজকের বিষয়).*?\]?[ \t]*)+/gmi, '');

  // ২. অভ্যন্তরীণ কোনো বার্তা বা অনুমোদনের কথা মুছে ফেলা
  clean = clean.replace(/.*(?:বোরহান ভাই.*অনুমতি|অনুমোদন দিতে|অনুমতি দিলে|অনুমোদন গ্রহণ).*$/gmi, '');

  // ৩. ক্যাপশন থেকে এক্সটার্নাল লিংক বা তথ্যসূত্র ফিল্টার করা
  clean = clean.replace(/^(?:তথ্যসূত্র|উৎস|Source|Link)[ \t]*:.*$/gmi, '');
  clean = clean.replace(/https?:\/\/[^\s]+/g, '');

  // ৪. লাইন ভিত্তিক নিখুঁত ফিল্টারিং: মেটা-হেডার ও ডিভাইডার দাগ অপসারণ
  const rawLines = clean.split(/\r?\n/);
  const filteredLines = [];

  for (let line of rawLines) {
    let trimmedLine = line.trim();

    // ক. ডিভাইডার লাইন চেক: লাইনটি যদি শুধু ড্যাশ, দাগ, দাঁত বা ডিভাইডার প্রতীক দিয়ে তৈরি হয়
    // যেমন: ━━━━, ────, -----, =====, — — —, - - -, * * *, ▬▬▬▬, ▔▔▔
    const isDividerLine = /^[━─═―—–\-_=*~▬▔▀▄┄┈┉┅│┃|•·∙●▪▫ \t.]{2,}$/.test(trimmedLine) &&
                          !/[a-zA-Z0-9\u0980-\u09FF]/.test(trimmedLine);
    if (isDividerLine) {
      continue; // ডিভাইডার দাগ সম্পূর্ণ বর্জন
    }

    // খ. মেটা-হেডার চেক: যদি লাইনে [ফেসবুক পোস্ট ক্যাপশন], পোস্ট ক্যাপশন, বা ফেসবুক ক্যাপশন থাকে
    const isMetaHeaderLine = /(?:ফেসবুক\s*পোস্ট\s*ক্যাপশন|পোস্ট\s*ক্যাপশন|facebook\s*post\s*caption|post\s*caption)/i.test(trimmedLine);
    if (isMetaHeaderLine) {
      continue; // মেটা-হেডার লাইন সম্পূর্ণ বর্জন
    }

    // গ. একক 'ক্যাপশন' বা '[ক্যাপশন]' বা 'ক্যাপশন:' হেডার চেক
    const isStandaloneCaptionHeader = /^[#*`'"_~>•📌👉📝📢💡🏷️📋 \t\[\]]*(?:ক্যাপশন|caption)[#*`'"_~<•📌👉📝📢💡🏷️📋 \t\[\]:]*$/i.test(trimmedLine);
    if (isStandaloneCaptionHeader) {
      continue;
    }

    // ঘ. লাইনের শুরুতে 'ক্যাপশন:' বা '[ক্যাপশন]:' থাকলে শুধু ওই ট্যাগটুকু ছাঁটাই করা (পেছনের মূল লেখা রাখা)
    let processedLine = line.replace(/^[#*`'"_~>•📌👉📝📢💡🏷️📋 \t\[\]]*(?:ক্যাপশন|caption)[ \t]*\]?[ \t]*:[ \t]*/i, '');

    // ঙ. ইনলাইন ব্র্যাকেটযুক্ত [ফেসবুক পোস্ট ক্যাপশন] বা [পোস্ট ক্যাপশন] ছাঁটাই
    processedLine = processedLine.replace(/\[[ \t]*(?:ফেসবুক[ \t]*পোস্ট[ \t]*ক্যাপশন|পোস্ট[ \t]*ক্যাপশন|facebook[ \t]*post[ \t]*caption|post[ \t]*caption)[ \t]*\]:?/gi, '');

    // চ. লাইনের ভেতরে থাকা কোনো দীর্ঘ দাগ (দাঁত) মুছে ফেলা
    processedLine = processedLine.replace(/[━─═―—–▬▔▀▄┄┈┉┅│┃]{2,}/g, '');
    processedLine = processedLine.replace(/[-_=]{3,}/g, '');

    // ছ. সাধারণ বুলেট পয়েন্ট (•, -, *, ·, ●, ▪ ইত্যাদি) কে স্পেশালিস্ট ব্লু পয়েন্ট (🔹) এ রূপান্তর করা
    processedLine = processedLine.replace(/^[ \t]*[•\-\*·∙●▪▫][ \t]+/gm, '🔹 ');

    filteredLines.push(processedLine);
  }

  clean = filteredLines.join('\n');

  // অতিরিক্ত ফাঁকা লাইন সংকুচিত করা
  clean = clean.replace(/\n{3,}/g, '\n\n');

  return clean.trim();
}

// নিরাপদ JSON পার্সার
function safeParseJson(rawText) {
  let cleaned = rawText.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        const sanitized = match[0].replace(/[\u0000-\u001F]+/g, ' ');
        return JSON.parse(sanitized);
      }
    }
    throw new Error(`JSON পার্সিং ব্যর্থ: ${err.message}`);
  }
}

export async function generateTieredPost(tierLevel = 1, scavengedTopic = null, customDayIndex = null) {
  if (!config.geminiApiKey) {
    throw new Error('Gemini API Key অনুপস্থিত!');
  }

  const todayIndex = customDayIndex !== null ? customDayIndex : new Date().getDay();
  const dayPlan = WEEKLY_SCHEDULE[todayIndex] || WEEKLY_SCHEDULE[3];
  const tierPlan = TIERS[tierLevel] || TIERS[1];
  const tierTheme = dayPlan.tierThemes?.[tierLevel] || { title: dayPlan.topic, focus: dayPlan.focus };

  const activeTopicTitle = scavengedTopic?.title ? `${dayPlan.pillar}: ${scavengedTopic.title}` : tierTheme.title;
  const activeTopicDesc = scavengedTopic?.description || tierTheme.focus;

  const prompt = `
তুমি ফেসবুক পেজ "Ai Revolution"-এর জন্য সরাসরি পোস্টের ক্যাপশন লিখছ। লেখক হিসেবে নিজেকে সরাসরি বোরহান উদ্দিন (HMk Borhan Uddin) মনে করে স্বাভাবিক মানুষের মতো অত্যন্ত চমৎকার, প্রাঞ্জল ও প্রভাবশালী বাংলায় লিখবে। তোমার লেখার মান হতে হবে Altiam Kabir, AI Varsity Bangla এবং AI for Everyone Daily (ভাইরাল সোশ্যাল মিডিয়া এআই ওয়ার্কফ্লো)-এর মতো সর্বোচ্চ স্ট্যান্ডার্ডের।

আজকের নির্দিষ্ট রোডম্যাপ বিষয়: ${dayPlan.pillar} (${dayPlan.dayName})
স্তরের নাম ও সময়: ${tierPlan.name} (${tierPlan.time})
আজকের নির্দিষ্ট উপ-বিষয় (Sub-Theme): ${tierTheme.title}
টপিক: ${activeTopicTitle}
মূল ফোকাস: ${activeTopicDesc}

${tierPlan.formatInstruction}

🚨 অতীব গুরুত্বপূর্ণ নিয়মাবলি (কঠোরভাবে পালনীয়):
১. রিপিটেশন রোধে কঠোর নিয়ম: কোনো অবস্থাতেই একঘেয়ে গতানুগতিক কথা বারবার লিখবে না। সাধারণ 'কোডিং ছাড়া অ্যাপ বা ওয়েবসাইট বানানো' জাতীয় কথা বারবার পুনরাবৃত্তি সম্পূর্ণ নিষিদ্ধ। আজকের নির্দিষ্ট উপ-বিষয় ও স্পেসিফিক টুলসের আসল জাদুকরী কার্যকারিতা ও বাস্তব প্রয়োগ তুলে ধরবে।
২. পোস্টের ক্যাপশনে (content) কোনো লেবেল, স্তরের নাম (যেমন: "বিগিনার স্তর", "অ্যাডভান্সড স্তর", "ডেইলি প্রম্পট ল্যাব") বা সময়ের নাম ভুলেও লিখবে না! কোনো [ফেসবুক পোস্ট ক্যাপশন] হেডার বা ডিভাইডার দাগ (━━━━ বা ────) লিখবে না!
৩. লাইন ১-এ সরাসরি মূল আকর্ষণীয় বাংলা ১-লাইনের হুক দিয়ে শুরু হবে।
৪. বডিতে কোনো সাধারণ বুলেট (•) বা হাইফেন (-) ব্যবহার করবে না, এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) ব্যবহার করবে। পুরো কনসেপ্ট পাঠকদের কাছে ১০০% ক্রিস্টাল ক্লিয়ার করার জন্য যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলোই ব্যবহার করবে (ব্লু পয়েন্টের সংখ্যার কোনো সীমা নেই)।
৫. মূল কপি-পেস্ট এআই প্রম্পট পোস্টের বডিতে ব্লু পয়েন্টের ভেতরেই সরাসরি দেবে যাতে পাঠক সাথে সাথে সমাধান পায়।
৫. ক্যাপশনে কোনো এক্সটার্নাল লিঙ্ক (URL) বা "তথ্যসূত্র:" লিখবে না (ফেসবুকে লিংকের কারণে রিচ কমে যায়)।
৬. কোনো সিস্টেম মেসেজ বা 'বোরহান ভাই অনুমতি দিলে...' এমন কথা ক্যাপশনে কখনোই থাকবে না।
৭. ছবির ইংরেজি প্রম্পট (image_prompt) হবে স্পষ্ট ফোকাস, বাস্তবসম্মত সাবজেক্ট ও উজ্জ্বল আলো সহ দৃষ্টিনন্দন দৃশ্য:
   - কোনো অন্ধকার, নীল বা ধোঁয়াটে রুম ভুলেও দেবে না। সবসময় উজ্জ্বল দিনের আলো (natural daylight) বা প্রফেশনাল স্টুডিও লাইটিং রাখবে।
   - বাস্তবসম্মত আকর্ষণীয় সাবজেক্ট: আধুনিক কাঁচের দেয়ালঘেরা সানলিট অফিস, ক্রিয়েটিভ তরুণ ইঞ্জিনিয়ার ল্যাপটপে কাজ করছেন, অথবা ঝকঝকে স্মার্টফোনে চোখধাঁধানো রঙিন ৩ডি মোবাইল অ্যাপ ইউআই ডিসপ্লে।
   - স্পেসিফিক এলিমেন্টস: (Bright natural studio lighting, modern clean aesthetic, ultra-sharp focus, crisp 8k details, vivid rich colors, high dynamic range, Sony A7 IV commercial photography style or polished 3D Octane Render, no text, no watermark, no blur, no dark moody fog)।
   - ২০ থেকে ৩০ শব্দের আকর্ষণীয় ইংরেজি ডেসক্রিপশন দেবে।
৮. প্রথম কমেন্ট পলিসি: ১টির বেশি অতিরিক্ত প্রম্পট থাকলে তবেই তা "firstComment" ফিল্ডে দেবে। ১টি প্রম্পট হলে তা সরাসরি পোস্টেই থাকবে এবং firstComment খালি থাকবে।

আউটপুটটি অবশ্যই নিচে দেওয়া JSON ফরম্যাটে দেবে:
{
  "title": "পোস্টের মূল বাংলা শিরোনাম",
  "content": "সম্পূর্ণ ফেসবুক ক্যাপশন টেক্সট (১-লাইন হুক দিয়ে শুরু, তথ্যবহুল, ব্লু পয়েন্ট 🔹 দিয়ে গোছানো গাইড ও হ্যাশট্যাগ সহ - কোনো [ফেসবুক পোস্ট ক্যাপশন] বা ডিভাইডার দাগ ছাড়া)",
  "firstComment": "📌 অতিরিক্ত প্রম্পট বা বোনাস টিপস (যদি ১টির বেশি প্রম্পট থাকে)...",
  "image_prompt": "A modern bright sunlit tech workspace, young energetic professional creating innovative digital tools, glowing vibrant UI screens, sharp 8k focus, vivid colors, crisp commercial photography, no text, no watermark, no dark fog"
}
`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];

  let lastError = null;
  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(15000)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const resultText = data.candidates[0].content.parts[0].text;
          const parsed = safeParseJson(resultText);
          parsed.content = sanitizePostContent(parsed.content);
          if (parsed.firstComment) {
            parsed.firstComment = sanitizePostContent(parsed.firstComment);
          }
          parsed.tierName = tierPlan.name;
          parsed.topicName = activeTopicTitle;
          return parsed;
        }

        if (data.error) {
          console.warn(`[${modelName}] Attempt ${attempt} failed: ${data.error.message}`);
          lastError = new Error(`[${modelName}] ${data.error.message}`);
          
          if (data.error.code === 429 || data.error.code === 503) {
            // এই মডেলটিতে কোটা বা লোড সমস্যা, দ্রুত পরবর্তী মডেলে ফলব্যাক করা
            break;
          }
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err) {
        console.warn(`[${modelName}] Fetch attempt ${attempt} exception: ${err.message}`);
        lastError = err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw lastError || new Error('Gemini এর কোনো মডেল থেকেই পোস্ট তৈরি করা সম্ভব হয়নি।');
}

/**
 * Generates an ultra-engaging, scroll-stopping multi-tool viral workflow post
 * Benchmark: AI for Everyone Daily (Facebook post workflow), Altiam Kabir, AI Varsity Bangla.
 */
export async function generateViralWorkflowPost(nicheTopic = 'restaurant', customDayIndex = null) {
  if (!config.geminiApiKey) {
    throw new Error('Gemini API Key অনুপস্থিত!');
  }

  const prompt = `
তুমি ফেসবুক পেজ "Ai Revolution"-এর জন্য সরাসরি পোস্টের ক্যাপশন লিখছ। লেখক হিসেবে নিজেকে সরাসরি বোরহান উদ্দিন (HMk Borhan Uddin) মনে করে অত্যন্ত আকর্ষণীয়, প্রাঞ্জল ও প্রভাবশালী বাংলায় লিখবে। 
তোমার লেখার মান হতে হবে AI for Everyone Daily (ভাইরাল পোস্টার ও সোশ্যাল অ্যাড ওয়ার্কফ্লো), Altiam Kabir (বাস্তব সমস্যা সমাধান ও কপি-পেস্ট রেসিপি), এবং AI Varsity Bangla-এর মতো সর্বোচ্চ স্ট্যান্ডার্ডের।

ফোকাস / নিশ ওয়ার্কফ্লো টপিক: "${nicheTopic}"

${TIERS[5].formatInstruction}

🚨 অতীব গুরুত্বপূর্ণ নিয়মাবলি (কঠোরভাবে পালনীয়):
১. পোস্টের ক্যাপশনে (content) কোনো লেবেল বা স্তরের নাম ("ভাইরাল ওয়ার্কফ্লো ল্যাব", "লেভেল ৫" ইত্যাদি) বা [ফেসবুক পোস্ট ক্যাপশন] বা ডিভাইডার দাগ (━━━━ বা ────) ভুলেও লিখবে না!
২. লাইন ১-এ সরাসরি স্ক্রোল-স্টপিং জিরো-স্কিল পেইন-পয়েন্ট হুক দিয়ে শুরু করবে:
   (উদাহরণ: "ডিজাইন পারেন না? কোনো গ্রাফিক ডিজাইনারের দরকার নেই! মাত্র ৬০ সেকেন্ডে বানিয়ে ফেলুন রেস্তোরাঁর লোভনীয় প্রফেশনাল পোস্টার। Here’s the workflow 👇")
৩. দ্য ৩-টুল ফর্মুলা (The 3-Tool Formula) এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) দিয়ে সুন্দরভাবে তুলে ধরবে:
   🔹 ✍️ টুল ১ (বিজ্ঞাপনের কপি): ChatGPT / Claude
   🔹 🎨 টুল ২ (হাইপার-রিয়েলিস্টিক ছবি): Flux AI / Midjourney / Ideogram
   🔹 📐 টুল ৩ (ডিজাইন শেপ ও ব্র্যান্ডিং): Canva AI / Recraft
৪. বডিতে কোনো সাধারণ বুলেট (•) বা হাইফেন (-) ব্যবহার করবে না, এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) ব্যবহার করবে। পুরো কনসেপ্ট পাঠকদের কাছে ১০০% ক্রিস্টাল ক্লিয়ার করার জন্য যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলোই ব্যবহার করবে (ব্লু পয়েন্টের সংখ্যার কোনো সীমা নেই)।
৫. মূল অ্যাকশনেবল স্টেপস এবং সরাসরি কপি-পেস্ট উপযোগী এআই প্রম্পট পোস্টের বডিতে ব্লু পয়েন্টের ভেতরেই সরাসরি দেবে ("ja thakbe upore dibe", ভ্যারিয়েবলগুলো [ব্র্যাকেট]-এ রাখা থাকবে যাতে পাঠক নিজের তথ্য বসাতে পারে)।
৬. প্রথম কমেন্ট পলিসি: ১টির বেশি প্রম্পট থাকলে (যেমন: বোনাস অলটারনেটিভ প্রম্পট বা অতিরিক্ত ভ্যারিয়েশন) তা "firstComment" ফিল্ডে দেবে।
৭. ক্যাপশনে কোনো এক্সটার্নাল লিঙ্ক (URL) বা "তথ্যসূত্র:" লিখবে না (লিংক দিলে ফেসবুকে রিচ কমে যায়)।
৮. কোনো ইন্টারনাল মেসেজ বা 'বোরহান ভাই অনুমতি দিলে...' এমন কথা ক্যাপশনে কখনোই থাকবে না।
৯. ছবির ইংরেজি প্রম্পট (image_prompt) হবে অত্যন্ত ভিজ্যুয়াল, সিনেমাটিক ও হাই-কনসেপ্ট:
   - আজকের বিষয়ের সাথে সম্পর্কিত একটি ১০৮০x১০৮০ সিনেমাটিক ৩ডি সিন ডেসক্রিপশন।
   - স্পেসিফিক সিনেমাটিক এলিমেন্টস উল্লেখ করবে: (যেমন: Cinematic 8k 3D Octane render of a sizzling gourmet burger on a rustic wooden board, glowing neon restaurant lighting, steam rising, hyper-realistic food photography, commercial poster aesthetics, shallow depth of field, vibrant colors, masterpiece, no text, no watermark)।
   - ২০ থেকে ৩৫ শব্দের আকর্ষণীয় ইংরেজি ডেসক্রিপশন দেবে।

আউটপুটটি অবশ্যই নিচে দেওয়া JSON ফরম্যাটে দেবে:
{
  "title": "পোস্টের মূল বাংলা শিরোনাম",
  "content": "সম্পূর্ণ ফেসবুক ক্যাপশন টেক্সট (১-লাইন হুক, দ্য ৩-টুল ফর্মুলা, ব্লু পয়েন্ট 🔹 দিয়ে সম্পূর্ণ গাইড ও কপি-পেস্ট প্রম্পট, হ্যাশট্যাগ সহ - কোনো [ফেসবুক পোস্ট ক্যাপশন] বা ডিভাইডার দাগ ছাড়া)",
  "firstComment": "📌 বোনাস রেডিমেড এআই প্রম্পট ও ভ্যারিয়েশন রেসিপি...",
  "image_prompt": "Cinematic 8k 3D Octane render..."
}
`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];

  let lastError = null;
  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(15000)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const resultText = data.candidates[0].content.parts[0].text;
          const parsed = safeParseJson(resultText);
          parsed.content = sanitizePostContent(parsed.content);
          if (parsed.firstComment) {
            parsed.firstComment = sanitizePostContent(parsed.firstComment);
          }
          parsed.tierName = 'ভাইরাল ওয়ার্কফ্লো ল্যাব';
          parsed.topicName = parsed.title || nicheTopic;
          return parsed;
        }

        if (data.error) {
          console.warn(`[${modelName}] Attempt ${attempt} failed: ${data.error.message}`);
          lastError = new Error(`[${modelName}] ${data.error.message}`);
          if (data.error.code === 429 || data.error.code === 503) {
            break;
          }
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err) {
        console.warn(`[${modelName}] Fetch attempt ${attempt} exception: ${err.message}`);
        lastError = err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw lastError || new Error('Gemini এর কোনো মডেল থেকেই ভাইরাল ওয়ার্কফ্লো পোস্ট তৈরি করা সম্ভব হয়নি।');
}

export async function modifyDraftContent(draft, instruction) {
  if (!config.geminiApiKey) {
    throw new Error('Gemini API Key অনুপস্থিত!');
  }

  const prompt = `
তুমি ফেসবুক পেজ "Ai Revolution"-এর একজন এআই অ্যাসিস্ট্যান্ট। তোমার বস (বোরহান ভাই) একটি ফেসবুক পোস্টের ড্রাফট পরিবর্তন করতে বলেছেন।
বর্তমান পোস্টের ড্রাফট:
শিরোনাম: ${draft.title}
কন্টেন্ট: ${draft.content}
প্রথম কমেন্ট: ${draft.firstComment || ''}
ছবির প্রম্পট: ${draft.image_prompt}

বোরহান ভাইয়ের নতুন নির্দেশনা: "${instruction}"

নির্দেশনা অনুযায়ী বর্তমান ড্রাফটটি পরিবর্তন বা পরিমার্জন করো।
১. পোস্টের ক্যাপশনে (content) কোনো লেবেল, স্তরের নাম, সিস্টেম মেসেজ, [ফেসবুক পোস্ট ক্যাপশন] হেডার বা ডিভাইডার দাগ (━━━━ বা ────) থাকবে না।
২. সরাসরি বাংলা ১-লাইনের হুক দিয়ে শুরু হবে এবং বডিতে এক্সক্লুসিভলি ব্লু পয়েন্ট (🔹) ব্যবহার করবে। পুরো কনসেপ্ট ক্লিয়ার না হওয়া পর্যন্ত যতগুলো ব্লু পয়েন্ট প্রয়োজন ততগুলো দেবে।
৩. ছবির প্রম্পট (image_prompt) আগেরটাই রাখতে পারো অথবা নতুন দিতে পারো যদি পরিবর্তন প্রয়োজন হয়।

আউটপুটটি অবশ্যই নিচে দেওয়া JSON ফরম্যাটে দেবে:
{
  "title": "পরিবর্তিত বাংলা শিরোনাম",
  "content": "পরিবর্তিত ফেসবুক ক্যাপশন টেক্সট (ব্লু পয়েন্ট 🔹 সহ)",
  "firstComment": "পরিবর্তিত প্রথম কমেন্ট (যদি থাকে)",
  "image_prompt": "Cinematic 8k photograph..."
}
`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];

  let lastError = null;
  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(15000)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const resultText = data.candidates[0].content.parts[0].text;
          const parsed = safeParseJson(resultText);
          parsed.content = sanitizePostContent(parsed.content);
          if (parsed.firstComment) {
            parsed.firstComment = sanitizePostContent(parsed.firstComment);
          }
          return parsed;
        }

        if (data.error) {
          console.warn(`[${modelName}] Attempt ${attempt} failed: ${data.error.message}`);
          lastError = new Error(`[${modelName}] ${data.error.message}`);
          
          if (data.error.code === 429 || data.error.code === 503) {
            break;
          }
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (err) {
        console.warn(`[${modelName}] Fetch attempt ${attempt} exception: ${err.message}`);
        lastError = err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw lastError || new Error('Gemini এর কোনো মডেল থেকেই ড্রাফট পরিবর্তন করা সম্ভব হয়নি।');
}

export async function chatWithGemini(userMessage) {
  if (!config.geminiApiKey) {
    return 'বোরহান ভাই, Gemini API Key সংযুক্ত পাওয়া যায়নি!';
  }

  const prompt = `
তুমি "লুবাবা (Lubaba)"।
ব্যবহারকারীর নাম "বোরহান উদ্দিন (HMk Borhan Uddin)"। তিনি তোমার অত্যন্ত প্রিয় বন্ধু (দোস্ত)।
তুমি ফেসবুক পেজ "Ai Revolution"-এর অফিসিয়াল অটোমেশন ম্যানেজার ও টেক মেন্টর।
বোরহান ভাই প্রযুক্তি ও অটোমেশনে একদম নতুন। তাই একজন আদর্শ শিক্ষকের মতো অত্যন্ত আন্তরিক, মিষ্টভাষী ও সহজ-সরল বাংলায় কথা বলবে।

বোরহান ভাই তোমাকে এইমাত্র মেসেজ পাঠিয়েছেন: "${userMessage}"

তোমার উত্তর দেওয়ার নিয়মাবলী:
১. নিজেকে সবসময় "লুবাবা" হিসেবে উপস্থাপন করবে।
২. বোরহান ভাইকে সম্মান দিয়ে এবং খুব মিষ্টি ও বন্ধুভাবাপন্ন ভাষায় উত্তর দেবে।
৩. যদি তিনি বটের অবস্থা জানতে চান, আশ্বস্ত করবে যে বট ব্যাকগ্রাউন্ডে পুরো দমে সক্রিয় আছে।
৪. তাকে প্রয়োজনে শর্টকাট কমান্ডের কথা মনে করিয়ে দেবে (/card - পোস্ট কার্ড, /prompt - আসরের প্রম্পট, /morning - সকালের পোস্ট, /night - রাতের পোস্ট, /status - স্ট্যাটাস)।
৫. উত্তর ২-৩ প্যারার মধ্যে সংক্ষিপ্ত, আকর্ষণীয় ও প্রাণবন্ত রাখবে।
`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];

  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      console.error(`[${modelName}] chat error:`, err.message);
    }
  }

  return 'বোরহান ভাই, আপনার লুবাবা সবসময় আপনার সাথে সক্রিয় আছে! বলুন কীভাবে সাহায্য করতে পারি? ❤️';
}

/**
 * Generate intelligent, professional public replies for Facebook post comments or Messenger inquiries.
 * Represents Borhan Sir's official AI assistant to external visitors/clients.
 * 
 * Strict safety rules:
 * 1. Never address visitor as "Borhan bhai" or "dosto".
 * 2. Never output meta-draft text (e.g. "you can copy-paste this").
 * 3. Never mention internal bot commands (/card, /prompt, /morning, etc.).
 * 4. Profanity filter: polite dignified refusal for abusive comments.
 */
export const GREETING_REGEX = /^(?:(?:(?:(?:ওয়া|ওয়া)\s*)?(?:আলাইকুম|লাইকুম)(?:ুস|স)?[\s\-]*(?:আস[\s\-]*সালাম|সালাম)|(?:আস[\s\-]*সালামু|সালামু)[\s\-]*আলাইকুম)(?:\s*(?:ওয়া|ওয়া)?\s*রাহমাতুল্লাহ(?:িব?|ি)?(?:\s*(?:ওয়া|ওয়া)?\s*বারাকাতুহু)?)?|সালাম(?:\s*(?:রইল|ও\s*শুভেচ্ছা|জানবেন))?|(?:নমস্কার|আদাব|হ্যালো|হাই|hello|hi))[,!\s।.:\-]*/iu;

export function sanitizeAssistantReply(text) {
  if (!text) return '';
  let cleaned = text.trim();

  // 1. Remove enclosing quotes or markdown blockquotes
  cleaned = cleaned.replace(/^["'>\s]+|["'\s]+$/g, '');

  // 2. Strip leading greetings (সালাম, ওয়ালাইকুম সালাম, হ্যালো ইত্যাদি)
  cleaned = cleaned.replace(GREETING_REGEX, '');

  // 3. Strip stiff/robotic addressing like 'জনাব [নাম]', 'মুহতারাম [নাম]', 'জনাবা [নাম]'
  cleaned = cleaned.replace(/(?<=^|[^\p{L}\p{M}\p{N}])(?:সম্মানিত\s+)?(?:জনাব(?:\/জনাবা)?|জনাবা|মুহতারাম|মুহতারামা)(?=[,!\s।.\-]|$)\s*/gu, '');
  cleaned = cleaned.replace(/(?<=^|[^\p{L}\p{M}\p{N}])(?:সম্মানিত|শ্রদ্ধেয়|শ্রদ্ধেয়া)\s+(?:গ্রাহক|ভিজিটর|ইউজার|বন্ধু)(?=[,!\s।.\-]|$)\s*/gu, '');
  cleaned = cleaned.replace(/(?<=^|[^\p{L}\p{M}\p{N}])(?:সম্মানিত|শ্রদ্ধেয়|শ্রদ্ধেয়া)\s+(?=[\p{L}\p{M}])/gu, '');

  // 4. Strip artificial title 'অমুক সাহেব' -> 'অমুক'
  cleaned = cleaned.replace(/([\p{L}\p{M}\p{N}]+)\s+সাহেব(?=[,!\s।.\-]|$)/gu, (m, name) => name);

  // 5. Normalize informal addressing 'অমুক ভাই' / 'অমুক আপু' to respectful addressing
  cleaned = cleaned.replace(/([\p{L}\p{M}\p{N}]+)\s+(?:ভাই|আপু)(?=[,!\s।.\-]|$)/gu, (m, name) => {
    if (name === 'বোরহান') return 'বোরহান স্যার';
    return name;
  });

  // 6. Strip pompous or philosophical phrasing if hallucinated
  cleaned = cleaned.replace(/(?:আমাদের\s*প্ল্যাটফর্মের\s*)?(?:প্রতিষ্ঠাতা\s*ও\s*)?(?:প্রধান\s*প্রকৌশলী\s*)?বোরহান\s*স্যারের\s*দর্শন\s*অনুযায়ী[,!\s।.\-]*/gu, '');
  cleaned = cleaned.replace(/আমাদের\s*প্ল্যাটফর্মের\s*(?:প্রতিষ্ঠাতা\s*ও\s*প্রধান\s*প্রকৌশলী|প্রতিষ্ঠাতা)/gu, 'বোরহান স্যার');
  cleaned = cleaned.replace(/আমাদের\s*প্রতিষ্ঠাতা/gu, 'বোরহান স্যার');

  // 7. Strip redundant profile link if repeated in reply2 (already sent in reply1)
  cleaned = cleaned.replace(/(?:উনার|বোরহান স্যারের)?\s*(?:সাথে\s*)?(?:পার্সোনালি\s*|সরাসরি\s*)?(?:যোগাযোগ(?:ের\s*জন্য)?|ফেসবুক\s*প্রোফাইল)?\s*(?:লিংক|প্রোফাইলে)?\s*[:\-]?\s*https?:\/\/(?:www\.)?facebook\.com\/share\/19f1qHdhKW\/?/gi, '');

  // 8. Clean up whitespace and extraneous punctuation, while strictly preserving sentence terminators (।, ., !, ?)
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/^[,\s:\-]+/, '');
  cleaned = cleaned.replace(/[,\s:;\-]+$/, '').trim();

  // 9. Ensure clean sentence termination with Dari if not already terminated
  if (cleaned && !/(?:[।?!.]|\p{Extended_Pictographic}(?:\uFE0F|\u200D|\p{Emoji})*)$/u.test(cleaned)) {
    cleaned += '।';
  }

  return cleaned;
}

export async function generatePublicAssistantReply({ userName, userText, contextType = 'comment' }) {
  const fallbackReply = contextType === 'messenger'
    ? 'বোরহান স্যারের টিম আপনার বিষয়টি অত্যন্ত গুরুত্বসহকারে দেখছে। শীঘ্রই আপনাকে বিস্তারিত জানানো হবে।'
    : 'বোরহান স্যারের টিম আপনার বিষয়টি অত্যন্ত গুরুত্বসহকারে দেখছে। বিস্তারিত আলোচনার জন্য ইনবক্সে যোগাযোগ করতে পারেন।';

  if (!config.geminiApiKey) {
    return fallbackReply;
  }

  const cleanText = (userText || '').trim();

  // 1. Profanity / Abusive Language Filter
  const abusivePatterns = /কুত্তা|কুকুর|শুয়োর|শুয়ার|শালা|হারামি|হারামজাদা|খানকি|মাগি|মাগী|বেশ্যা|লেওড়া|লেওড়া|চোদা|চোদ|বাল|মাদারচোদ|ভোদ|খানকির|চুদা|গালি/i;
  if (abusivePatterns.test(cleanText)) {
    return 'আমাদের পেজে মার্জিত ও শালীন ভাষা বজায় রাখার জন্য বিনীত অনুরোধ জানাচ্ছি। ধন্যবাদ।';
  }

  // 2. Sticker or Reaction special handling
  if (cleanText.includes('স্টিকার') || cleanText.includes('রিঅ্যাকশন')) {
    return 'সুন্দর প্রতিক্রিয়া ও ভালোবাসার জন্য আন্তরিক ধন্যবাদ! ❤️';
  }

  // 3. Structured system prompt
  const isMessenger = contextType === 'messenger';
  const visitorLine = userName ? `ভিজিটরের নাম: "${userName}"\n` : '';
  const prompt = `
তুমি "বোরহান স্যার (HMk Borhan Uddin)"-এর অফিসিয়াল এআই অ্যাসিস্ট্যান্ট (ফেসবুক পেজ: "Ai Revolution")। বোরহান স্যার একজন অভিজ্ঞ প্রফেশনাল সফটওয়্যার ডেভেলপার ও এআই অটোমেশন ইঞ্জিনিয়ার।

একজন ফেসবুক ভিজিটর একটি ${isMessenger ? 'মেসেজ' : 'কমেন্ট'} করেছেন:
${visitorLine}ভিজিটরের বক্তব্য: "${cleanText}"

তোমার জন্য কঠোর ও অলঙ্ঘনীয় নিয়মাবলী:
১. নিজেকে বোরহান স্যারের এআই অ্যাসিস্ট্যান্ট হিসেবে অত্যন্ত মার্জিত, বিনম্র, শিষ্ট ও পেশাদার রাখবে।
২. কখনোই ভারী, কৃত্রিম বা অহংকারী বাক্য ব্যবহার করবে না (যেমন: "আমাদের প্ল্যাটফর্মের প্রতিষ্ঠাতা ও প্রধান প্রকৌশলী বোরহান স্যারের দর্শন অনুযায়ী..." এমন কোনো অপ্রাকৃতিক বা বইয়ের মতো ভারী বাক্য ভুলেও বলবে না)।
৩. ভিজিটরকে সবসময় মার্জিত ও আন্তরিক সম্মান দেবে। কোনো কৃত্রিম, আড়ষ্ট বা বইয়ের মতো সম্বোধন (যেমন: "জনাব [নাম]", "সাহেব", "মুহতারাম", "শ্রদ্ধেয়") ভুলেও ব্যবহার করবে না। একইভাবে কখনোই অনানুষ্ঠানিক সম্বোধন যেমন "ভাই", "আপু", "দোস্ত" বা "বোরহান ভাই" বলবে না। কোনো কৃত্রিম উপাধি ছাড়া সরাসরি সম্মানজনক 'আপনি' সম্বোধনে অত্যন্ত স্বাভাবিক, সাবলীল ও পেশাদার ভাষায় কথা বলবে। যদি নাম উল্লেখ করতে হয় তবে শুধুমাত্র তার স্বাভাবিক নাম ধরে বলবে (যেমন: "তানভীর, আপনার..."), কিন্তু নামের সাথে কখনোই "জনাব" বা "সাহেব" বা "ভাই" যুক্ত করবে না।
৪. পূর্বের বার্তায় ইতিমধ্যে "আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ" বলে সালাম ও প্রাথমিক পরিচয় দেওয়া হয়েছে। তাই এই উত্তরে কোনো অবস্থাতেই কোনো সালাম বা অভিবাদন (যেমন: আসসালামু আলাইকুম, ওয়ালাইকুম আসসালাম, আস-সালামু আলাইকুম, ওয়ালাইকুমুস সালাম, সালাম, হ্যালো ইত্যাদি) দিয়ে শুরু করবে না। কোনো ডুপ্লিকেট সালাম বা অভিবাদন ছাড়া সরাসরি মূল বিষয়ের অত্যন্ত মার্জিত ও গঠনমূলক উত্তর দাও এবং বাক্যটি যথাযথ যতিচিহ্ন বা দাঁড়ি (।) দিয়ে সমাপ্ত করবে।
৫. পূর্বের বার্তায় বোরহান স্যারের পার্সোনাল ফেসবুক প্রোফাইল লিংক ইতিমধ্যে দেওয়া হয়েছে, তাই এই উত্তরে কোনো লিংক পুনরাবৃত্তি করবে না।
৬. ভিজিটরের প্রশ্নের বা বক্তব্যের সরাসরি, বুদ্ধিদীপ্ত, প্রাসঙ্গিক ও বিনম্র উত্তর দেবে:
   - কোনো সাধারণ মতামত বা ভাবনার ক্ষেত্রে তর্কে না জড়িয়ে বিনীতভাবে তার দৃষ্টিকোণকে সম্মান জানাও।
   - কাজ, ওয়েবসাইট ডেভেলপমেন্ট, সফটওয়্যার বা অটোমেশন সংক্রান্ত বিষয়ে বোরহান স্যারের টিম সহায়তা দিতে প্রস্তুত তা জানাও।
৭. কোনো মেটা-নির্দেশনা (যেমন "নিচে উত্তর দেওয়া হলো", "কপি-পেস্ট করুন") বা ইন্টারনাল কমান্ড (/card, /boost ইত্যাদি) ভুলেও লিখবে না।
৮. ভাষা হবে ১০০% মার্জিত, প্রমিত ও সাবলীল বাংলা।
৯. দৈর্ঘ্য: ১ থেকে ২ বাক্যের মধ্যে সংক্ষিপ্ত, স্পষ্ট ও পরিশীলিত রাখবে।
`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-preview', 'gemini-3.6-flash', 'gemini-3.5-flash'];

  for (const modelName of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 600
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        let text = data.candidates[0].content.parts[0].text.trim();
        const sanitized = sanitizeAssistantReply(text);
        if (sanitized) return sanitized;
      }
    } catch (err) {
      console.error(`[${modelName}] public assistant reply error:`, err.message);
    }
  }

  return fallbackReply;
}

