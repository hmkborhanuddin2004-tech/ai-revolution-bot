/**
 * Agent Context & Persistent Memory Manager
 * Stores conversational memory per visitor to provide persistent, personalized interactions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEMORY_FILE = path.resolve(__dirname, '../../data/agent_memory.json');

class AgentMemory {
  constructor() {
    this.memory = {};
    this.load();
  }

  load() {
    try {
      const dir = path.dirname(MEMORY_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(MEMORY_FILE)) {
        const raw = fs.readFileSync(MEMORY_FILE, 'utf8');
        this.memory = JSON.parse(raw);
      }
    } catch (err) {
      console.error('[AgentMemory] Error loading memory file:', err.message);
      this.memory = {};
    }
  }

  save() {
    try {
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2), 'utf8');
    } catch (err) {
      console.error('[AgentMemory] Error saving memory file:', err.message);
    }
  }

  /**
   * Retrieves past interaction history for a user.
   * @param {string} userId
   * @returns {Array<Object>}
   */
  getHistory(userId) {
    if (!userId) return [];
    return this.memory[userId]?.history || [];
  }

  /**
   * Records a user turn and agent response in memory.
   * @param {string} userId
   * @param {Object} data - { userText, agentReply, toolsUsed }
   */
  recordInteraction(userId, { userText, agentReply, toolsUsed = [] }) {
    if (!userId) return;

    if (!this.memory[userId]) {
      this.memory[userId] = {
        firstSeen: new Date().toISOString(),
        totalInteractions: 0,
        history: []
      };
    }

    const record = {
      timestamp: new Date().toISOString(),
      userText,
      agentReply,
      toolsUsed
    };

    this.memory[userId].history.push(record);
    this.memory[userId].totalInteractions += 1;
    this.memory[userId].lastSeen = new Date().toISOString();

    // Keep last 6 interactions to prevent memory bloat
    if (this.memory[userId].history.length > 6) {
      this.memory[userId].history.shift();
    }

    this.save();
  }

  /**
   * Generates a concise context prompt snippet from past memory.
   * @param {string} userId
   * @returns {string}
   */
  getContextSnippet(userId) {
    const history = this.getHistory(userId);
    if (!history || history.length === 0) return '';

    const recent = history.slice(-2);
    const lines = recent.map(h => `পূর্বের মেসেজ: "${h.userText}" -> উত্তর: "${h.agentReply}"`);
    return `\n[ভিজিটরের সাথে পূর্বের কথোপকথন মেমোরি]:\n${lines.join('\n')}\n`;
  }
}

export const agentMemory = new AgentMemory();
