import { processAssistantMessage } from '../services/personalAssistantService.js';

import { agentMemory } from '../services/agentMemory.js';


async function runTests() {

  const userId = "TEST_USER_123";

  console.log("Testing Personal Assistant...");

  

  let res = await processAssistantMessage(userId, "/remember ami ekjon developer");

  console.log("Remember:", res);

  

  res = await processAssistantMessage(userId, "/memory");

  console.log("Memory:", res);

  

  res = await processAssistantMessage(userId, "/task API banabo");

  console.log("Task:", res);

  

  res = await processAssistantMessage(userId, "/forget");

  console.log("Forget:", res);

  

  console.log("✅ Tests completed.");

  process.exit(0);

}


runTests();
