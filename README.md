# AI Revolution Bot - Social Media Automation Service

An autonomous social media publishing and growth service powered by the Meta Graph API (Facebook & Instagram) and Google Gemini. Designed for scheduled operation to curate technological news, generate contextual summaries, format visual assets, and publish updates with automated interaction handling.

---

## System Features

- **Automated News Ingestion:** Scheduled web scraping and RSS analysis compiling trending technological updates.
- **Contextual Copywriting:** Multi-tier prompt processing generating structured post captions and topical hashtags.
- **Meta Graph API Publishing:** Direct automated publishing to Facebook Pages with rate-limiting compliance.
- **Interactive Engagement Engine:** Webhook-based handling of incoming comments and messaging notifications with automated Telegram alerts.
- **Service Resilience:** Integrated keep-alive pingers, memory persistence, duplicate trackers, and automated retry policies.

---

## Architecture & Technical Stack

- **Runtime:** Node.js (ES Modules) & Python
- **APIs & Protocols:** Meta Graph API, Telegram Bot API, WhatsApp Webhooks
- **Content Generation:** Google Gemini API
- **Scraping & Ingestion:** Cheerio, Axios, RSS XML Parsers
- **Resilience:** JSON state persistence and health monitoring daemons

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hmkborhanuddin2004-tech/ai-revolution-bot.git
cd ai-revolution-bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
FB_PAGE_ID=your_facebook_page_id
FB_PAGE_ACCESS_TOKEN=your_permanent_access_token
GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PORT=3000
```

### 4. Start the service

```bash
npm start
```

---

## License

This project is licensed under the MIT License.
