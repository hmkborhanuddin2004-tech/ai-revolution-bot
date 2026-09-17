/**
 * AI Revolution Autonomous Agent Core Engine
 * Powered by Gemini Multi-Model Tool Calling & ReAct Decision Loop.
 */

import { config } from '../config.js';
import { AGENT_TOOL_DECLARATIONS, executeAgentTool } from './agentTools.js';
import { agentMemory } from './agentMemory.js';
import { sanitizeAssistantReply } from './geminiService.js';
import { BORHAN_FB_PROFILE } from '../config.js';

export class AgentEngine {
  constructor() {
    this.models = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-3.7-flash'];
    this.tools = [{ functionDeclarations: AGENT_TOOL_DECLARATIONS }];
  }

  /**
   * Builds the autonomous system prompt with ReAct guidelines.
   */
  buildAgentPrompt({ userName, userText, contextType, userId }) {
    const isMessenger = contextType === 'messenger';
    const visitorLine = userName ? `ভিজিটরের নাম: ${userName}\n` : '';
    const memorySnippet = userId ? agentMemory.getContextSnippet(userId) : '';

    return `
তুমি "Ai Revolution" ফেসবুক পেজের সার্বক্ষণিক ও দায়িত্বশীল স্বায়ত্তশাসিত এআই এজেন্ট (Autonomous AI Agent)। তুমি পেজের প্রতিষ্ঠাতা ও প্রধান প্রকৌশলী "বোরহান স্যার (HMk Borhan Uddin)"-এর প্রতিনিধিত্ব করো। বোরহান স্যার একজন অভিজ্ঞ প্রফেশনাল সফটওয়্যার ডেভেলপার ও এআই অটোমেশন আর্কিটেক্ট।

তোমার দায়িত্ব:
১. ভিজিটরের বক্তব্য মনোযোগ দিয়ে বিশ্লেষণ করা।
২. প্রয়োজন হলে তোমার হাতে থাকা টুলস (Function Calling) স্বয়ংক্রিয়ভাবে ব্যবহার করে সঠিক তথ্য জেনে নেওয়া (যেমন: বোরহান স্যারের সার্ভিস বা পোর্টফোলিও জানতে 'get_borhan_profile_services', এআই তথ্যের জন্য 'search_ai_knowledge', বা সরাসরি কাজের চুক্তি/অ্যালার্টের জন্য 'escalate_to_telegram')।
৩. তথ্য পাওয়ার পর অত্যন্ত মার্জিত, প্রমিত ও সাবলীল বাংলায় সংক্ষিপ্ত ও কার্যকর চূড়ান্ত উত্তর প্রস্তুত করা।

বর্তমান পরিস্থিতি:
প্লাটফর্ম: ${isMessenger ? 'ফেসবুক মেসেঞ্জার ইনবক্স' : 'ফেসবুক পোস্ট কমেন্ট'}
${visitorLine}ভিজিটরের বক্তব্য: "${userText}"${memorySnippet}

কঠোর আচরণবিধি ও সীমাবদ্ধতা:
১. কখনোই ভারী, অহংকারী বা বইয়ের মতো কৃত্রিম বাক্য বলবে না (যেমন: "আমাদের প্ল্যাটফর্মের প্রতিষ্ঠাতা ও প্রধান প্রকৌশলী বোরহান স্যারের দর্শন অনুযায়ী..." এমন ভারী কথা ভুলেও বলবে না)।
২. ভিজিটরকে সম্বোধনে কোনো কৃত্রিম উপাধি ("জনাব [নাম]", "মুহতারাম", "সাহেব") বা অনানুষ্ঠানিক উপাধি ("ভাই", "আপু", "দোস্ত") ব্যবহার করবে না। সবসময় সরাসরি মার্জিত ও সম্মানজনক 'আপনি' সম্বোধনে কথা বলবে। যদি নাম বলতেই হয় তবে স্বাভাবিক নাম বলবে (যেমন: "তানভীর, আপনার..."), কিন্তু নামের আগে-পিছে "জনাব" বা "ভাই" লাগাবে না।
৩. কোনো ডুপ্লিকেট সালাম বা অভিবাদন (আসসালামু আলাইকুম, ওয়ালাইকুম আসসালাম ইত্যাদি) দিয়ে শুরু করবে না, কারণ প্রাথমিক বার্তায় সালাম ইতিমধ্যে দেওয়া হয়েছে। সরাসরি মূল পয়েন্টের উত্তর দাও।
৪. পূর্বের বার্তায় বোরহান স্যারের ফেসবুক প্রোফাইল লিংক (${BORHAN_FB_PROFILE}) ইতিমধ্যে দেওয়া হয়েছে, তাই চূড়ান্ত উত্তরে অযথা কোনো লিংক পুনরাবৃত্তি করবে না।
৫. উত্তর ১ থেকে ২ বাক্যের মধ্যে সংক্ষিপ্ত, তথ্যবহুল ও আকর্ষণীয় রাখবে এবং বাক্যটি প্রমিত বাংলা দাঁড়ি (।) দিয়ে সমাপ্ত করবে।
`;
  }

  /**
   * Executes the autonomous ReAct agent loop for a user input.
   * @param {Object} params
   * @param {string} params.userText
   * @param {string} [params.userName]
   * @param {string} [params.contextType] - 'comment' | 'messenger'
   * @param {string} [params.userId] - Comment ID or Sender PSID
   * @returns {Promise<{ reply: string, toolsUsed: Array<string>, escalated: boolean }>}
   */
  async runAgent({ userText, userName = '', contextType = 'comment', userId = '', telegramAlert = null }) {
    const prompt = this.buildAgentPrompt({ userName, userText, contextType, userId });
    const toolsUsed = [];
    let isEscalated = false;

    for (const modelName of this.models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;

      try {
        let contents = [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ];

        // Max 3 ReAct turns to prevent infinite loops
        for (let turn = 0; turn < 3; turn++) {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              tools: this.tools,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 600
              }
            }),
            signal: AbortSignal.timeout(15000)
          });

          if (!res.ok) {
            const errData = await res.text();
            console.warn(`[AgentEngine] ${modelName} returned HTTP ${res.status}: ${errData.slice(0, 150)}`);
            break; // Try next model
          }

          const data = await res.json();
          const candidate = data.candidates?.[0]?.content;
          if (!candidate || !candidate.parts || candidate.parts.length === 0) {
            break;
          }

          const functionCallPart = candidate.parts.find(p => p.functionCall);

          if (functionCallPart && functionCallPart.functionCall) {
            const fc = functionCallPart.functionCall;
            const toolName = fc.name;
            const toolArgs = fc.args || {};

            console.log(`[AgentEngine] 🤖 Agent reasoning chose tool: '${toolName}' with args:`, JSON.stringify(toolArgs));
            toolsUsed.push(toolName);

            if (toolName === 'escalate_to_telegram') {
              isEscalated = true;
            }

            // Execute the selected tool
            const toolResult = await executeAgentTool(toolName, toolArgs, {
              userName,
              userText,
              contextType,
              referenceId: userId,
              telegramAlert
            });

            // Append model's functionCall and tool's functionResponse to conversation contents
            contents.push(candidate);
            contents.push({
              role: 'user',
              parts: [
                {
                  functionResponse: {
                    name: toolName,
                    response: {
                      name: toolName,
                      content: toolResult
                    }
                  }
                }
              ]
            });
            // Continue the loop for Gemini to digest tool results
          } else {
            // Direct textual answer received
            const textPart = candidate.parts.find(p => p.text);
            if (textPart && textPart.text) {
              let finalText = textPart.text.trim();
              const sanitized = sanitizeAssistantReply(finalText);

              if (sanitized) {
                // Record interaction in agent persistent memory
                if (userId) {
                  agentMemory.recordInteraction(userId, {
                    userText,
                    agentReply: sanitized,
                    toolsUsed
                  });
                }

                return {
                  reply: sanitized,
                  toolsUsed,
                  escalated: isEscalated
                };
              }
            }
            break;
          }
        }
      } catch (err) {
        console.error(`[AgentEngine] Error on ${modelName}:`, err.message);
      }
    }

    // Contextual fallback if LLM unreachable
    const fallbackText = 'সফটওয়্যার ডেভেলপমেন্ট, ওয়েবসাইট ও অটোমেশন সংক্রান্ত যেকোনো প্রয়োজনে বোরহান স্যারের টিম আপনাকে সর্বাত্মক সহায়তা দিতে প্রস্তুত রয়েছে।';
    return {
      reply: fallbackText,
      toolsUsed,
      escalated: isEscalated
    };
  }
}

export const agentEngine = new AgentEngine();
