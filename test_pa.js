import { processAssistantMessage } from './src/services/personalAssistantService.js';
async function run() {
  console.log('Sending hi...');
  let reply1 = await processAssistantMessage('7230521632', 'hi');
  console.log('Reply 1:', reply1);
  console.log('Sending question...');
  let reply2 = await processAssistantMessage('7230521632', 'tomar sokkhomota somporke bolo');
  console.log('Reply 2:', reply2);
}
run().catch(console.error);
