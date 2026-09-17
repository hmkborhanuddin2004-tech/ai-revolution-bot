import { processAssistantMessage } from './src/services/personalAssistantService.js';
async function run() {
  const msgs = [
    'oi',
    'ekta chobi banau',
    'amar chobi',
    'ami semla muke dari ache pura na halka r mathay chul ache propseshonal typer',
    '+',
    'hd  etai bnao mukh kintu gole',
    'koi tumi?',
    'chobi ki diyecho?'
  ];
  for(let m of msgs) {
    console.log('Sending:', m);
    let reply = await processAssistantMessage('7230521632', m);
    console.log('Reply:', reply);
  }
}
run().catch(console.error);
