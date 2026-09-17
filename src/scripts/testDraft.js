import { runScavengedCycle } from '../index.js';

console.log('🧪 টেস্ট ড্রাফট তৈরি করা হচ্ছে...');
runScavengedCycle().then(() => {
  console.log('🎉 টেস্ট সম্পন্ন! আপনার টেলিগ্রাম চেক করুন।');
  setTimeout(() => process.exit(0), 1000);
}).catch((err) => {
  console.error('❌ টেস্ট ব্যর্থ:', err);
  process.exit(1);
});
