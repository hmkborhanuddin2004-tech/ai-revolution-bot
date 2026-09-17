import { config } from './src/config.js';

async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.geminiApiKey}`);
  const data = await res.json();
  if(data.models) {
    console.log(data.models.map(m => m.name).join('\n'));
  } else {
    console.log(data);
  }
}
run();
