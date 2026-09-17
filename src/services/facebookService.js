import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { getLocalCachedImagePath } from './imageService.js';

export async function publishToFacebook(caption, imageUrl) {
  if (!config.fbPageAccessToken || config.fbPageAccessToken === 'YOUR_PAGE_ACCESS_TOKEN_HERE') {
    return {
      success: false,
      reason: 'TOKEN_NOT_CONFIGURED',
      message: 'ফেসবুক পেজ এক্সেস টোকেন এখনো .env ফাইলে যুক্ত করা হয়নি।'
    };
  }

  // ১. লোকাল ফাইল পাথ বা প্রি-ওয়ার্মড ক্যাশ পাথ হলে (মোবাইল আপলোড বা লোকাল ক্যাশ করা ছবি)
  const localTarget = getLocalCachedImagePath(imageUrl) || (imageUrl && typeof imageUrl === 'string' && fs.existsSync(imageUrl) ? imageUrl : null);
  if (localTarget) {
    try {
      const fileBuffer = fs.readFileSync(localTarget);
      const ext = path.extname(localTarget).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      const fileName = path.basename(localTarget) || 'post_photo.jpg';

      const formData = new FormData();
      formData.append('access_token', config.fbPageAccessToken);
      formData.append('caption', caption);
      formData.append('source', new Blob([fileBuffer], { type: mimeType }), fileName);

      const response = await fetch(`https://graph.facebook.com/v21.0/${config.fbPageId}/photos`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.id) {
        const postId = data.post_id || data.id;
        return {
          success: true,
          postId,
          postUrl: `https://facebook.com/${postId}`
        };
      }
      return {
        success: false,
        error: data.error?.message || 'লোকাল ফটো আপলোড ব্যর্থ হয়েছে'
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ২. রিমোট HTTP URL হলে
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
    // নির্ভরযোগ্য ডেলিভারির জন্য বাফার ডাউনলোড করে সরাসরি FormData Blob আকারে আপলোড করার চেষ্টা
    try {
      const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(30000) });
      if (imgRes.ok) {
        const ab = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        const formData = new FormData();
        formData.append('access_token', config.fbPageAccessToken);
        formData.append('caption', caption);
        formData.append('source', new Blob([ab], { type: contentType }), 'post_photo.jpg');

        const response = await fetch(`https://graph.facebook.com/v21.0/${config.fbPageId}/photos`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.id) {
          const postId = data.post_id || data.id;
          return {
            success: true,
            postId,
            postUrl: `https://facebook.com/${postId}`
          };
        }
      }
    } catch (bufErr) {
      console.warn('[facebookService] Remote photo buffer upload failed, falling back to URL payload:', bufErr.message);
    }

    // ফলব্যাক: ফেসবুকের নিজস্ব ইউআরএল ফেচার দিয়ে আপলোড
    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${config.fbPageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: imageUrl,
          caption: caption,
          access_token: config.fbPageAccessToken
        })
      });
      const data = await response.json();
      if (data.id) {
        return {
          success: true,
          postId: data.id,
          postUrl: `https://facebook.com/${data.id}`
        };
      }
      return {
        success: false,
        error: data.error?.message || 'ফেসবুক ফটো আপলোড ব্যর্থ হয়েছে'
      };
    } catch (urlErr) {
      return { success: false, error: urlErr.message };
    }
  }

  // ৩. সাধারণ টেক্সট পোস্ট
  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${config.fbPageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: caption,
        access_token: config.fbPageAccessToken
      })
    });
    const data = await response.json();
    if (data.id) {
      return {
        success: true,
        postId: data.id,
        postUrl: `https://facebook.com/${data.id}`
      };
    }
    return {
      success: false,
      error: data.error?.message || 'ফেসবুক টেক্সট পোস্ট ব্যর্থ হয়েছে'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Post a comment or reply to an existing comment.
 * @param {string} targetId - Post ID (for top-level comment) or Comment ID (for threaded reply)
 * @param {string} text - The comment content
 */
export async function replyToComment(targetId, text) {
  if (!config.fbPageAccessToken || config.fbPageAccessToken === 'YOUR_PAGE_ACCESS_TOKEN_HERE') {
    return { success: false, error: 'TOKEN_NOT_CONFIGURED' };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${targetId}/comments`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        access_token: config.fbPageAccessToken
      })
    });
    const data = await res.json();
    if (data.id) {
      return { success: true, commentId: data.id };
    }
    console.warn(`[FacebookService] replyToComment error:`, data.error?.message);
    return { success: false, error: data.error?.message };
  } catch (err) {
    console.error(`[FacebookService] replyToComment exception:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send a direct Messenger message to a user.
 * @param {string} recipientPsid - User Page-Scoped ID
 * @param {string} text - Message text
 */
export async function sendMessengerMessage(recipientPsid, text) {
  if (!config.fbPageAccessToken || config.fbPageAccessToken === 'YOUR_PAGE_ACCESS_TOKEN_HERE') {
    return { success: false, error: 'TOKEN_NOT_CONFIGURED' };
  }

  const endpoint = `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(config.fbPageAccessToken)}`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        message: { text }
      })
    });
    const data = await res.json();
    if (data.message_id) {
      return { success: true, messageId: data.message_id };
    }
    console.warn(`[FacebookService] sendMessengerMessage error:`, data.error?.message);
    return { success: false, error: data.error?.message };
  } catch (err) {
    console.error(`[FacebookService] sendMessengerMessage exception:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch recent posts and their comments from the page feed.
 * @param {number} limit
 */
export async function getRecentPostsWithComments(limit = 5) {
  if (!config.fbPageAccessToken || config.fbPageAccessToken === 'YOUR_PAGE_ACCESS_TOKEN_HERE') {
    return [];
  }

  const endpoint = `https://graph.facebook.com/v21.0/${config.fbPageId}/feed?fields=id,message,created_time,comments{id,message,attachment,from,created_time}&limit=${limit}&access_token=${encodeURIComponent(config.fbPageAccessToken)}`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.error) {
      console.warn(`[FacebookService] getRecentPostsWithComments API error:`, data.error.message);
    }
    return data.data || [];
  } catch (err) {
    console.error(`[FacebookService] getRecentPostsWithComments exception:`, err.message);
    return [];
  }
}

let hasLoggedMessagingWarning = false;

/**
 * Fetch recent Messenger conversations.
 * @param {number} limit
 */
export async function getRecentConversations(limit = 5) {
  if (!config.fbPageAccessToken || config.fbPageAccessToken === 'YOUR_PAGE_ACCESS_TOKEN_HERE') {
    return [];
  }

  const endpoint = `https://graph.facebook.com/v21.0/${config.fbPageId}/conversations?fields=id,messages{id,message,from,attachments,created_time}&limit=${limit}&access_token=${encodeURIComponent(config.fbPageAccessToken)}`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    if (data.error) {
      if (data.error.message?.includes('pages_messaging')) {
        if (!hasLoggedMessagingWarning) {
          console.log('[FacebookService] ℹ️ ফেসবুক পেজ টোকেনে pages_messaging সক্রিয় নেই (পোস্টের কমেন্ট রিপ্লাই পুরোপুরি সক্রিয় আছে)।');
          hasLoggedMessagingWarning = true;
        }
      } else {
        console.warn(`[FacebookService] getRecentConversations API error:`, data.error.message);
      }
    }
    return data.data || [];
  } catch (err) {
    console.error(`[FacebookService] getRecentConversations exception:`, err.message);
    return [];
  }
}
