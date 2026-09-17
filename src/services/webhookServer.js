/**
 * Native Node.js HTTP Webhook Server for Facebook Graph API
 * Zero external dependencies (No express needed!).
 * Handles Webhook verification (GET /webhook), Events (POST /webhook), and Health checks.
 */

import http from 'http';
import url from 'url';
import { config } from '../config.js';
import { messengerHandler } from './messengerHandler.js';
import { commentHandler } from './commentHandler.js';

const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'ai_revolution_webhook_2026';
const PORT = parseInt(process.env.PORT || '3000', 10);

export function startWebhookServer(port = PORT) {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // 1. Health Check
    if (pathname === '/health' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        assistant: 'Ai Revolution Assistant',
        pageId: config.fbPageId,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // 2. Facebook Webhook Verification (GET /webhook)
    if (pathname === '/webhook' && method === 'GET') {
      const mode = parsedUrl.searchParams.get('hub.mode');
      const token = parsedUrl.searchParams.get('hub.verify_token');
      const challenge = parsedUrl.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        console.log('[Webhook] ✅ ফেসবুকের সাথে Webhook ভেরিফিকেশন সফল হয়েছে!');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(challenge);
      } else {
        console.warn('[Webhook] ⚠️ Webhook ভেরিফিকেশন ব্যর্থ (Token mismatch)');
        res.writeHead(403);
        res.end('Forbidden');
      }
      return;
    }

    // 3. Facebook Webhook Event Processing (POST /webhook)
    if (pathname === '/webhook' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        // Return 200 OK immediately as required by Meta
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('EVENT_RECEIVED');

        try {
          const data = JSON.parse(body);
          if (data.object === 'page' && Array.isArray(data.entry)) {
            for (const entry of data.entry) {
              // Messenger events
              if (Array.isArray(entry.messaging)) {
                for (const event of entry.messaging) {
                  messengerHandler.handleMessage(event).catch(err => {
                    console.error('[Webhook] Messenger handler error:', err.message);
                  });
                }
              }

              // Feed / Comments events
              if (Array.isArray(entry.changes)) {
                for (const change of entry.changes) {
                  if (change.field === 'feed' && change.value) {
                    const val = change.value;
                    if (val.item === 'comment' && val.verb === 'add') {
                      const commentData = {
                        id: val.comment_id,
                        message: val.message,
                        from: val.from || { id: val.sender_id, name: val.sender_name },
                        postId: val.post_id
                      };
                      commentHandler.handleComment(commentData).catch(err => {
                        console.error('[Webhook] Comment handler error:', err.message);
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (parseErr) {
          console.error('[Webhook] Failed to parse webhook JSON body:', parseErr.message);
        }
      });
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Webhook] পোর্ট ${port} ইতিমধ্যে ব্যবহৃত হচ্ছে। অন্য প্রসেস বা ইনস্ট্যান্স ইতিমধ্যে সক্রিয় আছে।`);
    } else {
      console.error('[Webhook] সার্ভার এরর:', err.message);
    }
  });

  server.listen(port, () => {
    console.log(`🌐 ওয়েবহুক সার্ভার প্রস্তুত: http://localhost:${port}/webhook (পোর্ট: ${port})`);
  });

  return server;
}
