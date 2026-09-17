import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { EdgeTTS } from '@andresaya/edge-tts';
import { generateImageUrl } from './imageService.js';
import { config } from '../config.js';

ffmpeg.setFfmpegPath(ffmpegStatic);

const TEMP_DIR = path.resolve('D:/ai-insight-bot/data/temp_reels');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function generateReelScript(topic) {
  const prompt = `
  You are an expert short-form video scriptwriter (Facebook Reels, TikTok, YouTube Shorts).
  Topic: ${topic}
  Write a high-energy, engaging Bengali script for a 30-45 seconds vertical video.
  It must have a strong hook, 2-3 main points, and a call-to-action (CTA).
  Provide ONLY the spoken text in Bengali. No scene directions, no brackets, just the raw text that will be spoken by a TTS engine.
  Make it natural, conversational, and energetic.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${config.geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    })
  });


  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text.trim();
}

export async function generateReelAudio(text, outputPath) {
  const tts = new EdgeTTS();
  await tts.synthesize(text, 'bn-BD-NabanitaNeural');
  await tts.toFile(outputPath.replace('.mp3', ''));
}

export async function generateReelVideo(audioPath, imagePath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .loop()
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-shortest',
        "-vf scale=1080:1920,zoompan=z='min(zoom+0.0015,1.5)':d=700:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
      ])
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err));
  });
}

export async function createAiReel(topic) {
  const timestamp = Date.now();
  const audioPath = path.join(TEMP_DIR, `audio_${timestamp}.mp3`);
  const imagePath = path.join(TEMP_DIR, `image_${timestamp}.jpg`);
  const videoPath = path.join(TEMP_DIR, `reel_${timestamp}.mp4`);

  try {
    const script = await generateReelScript(topic);
    await generateReelAudio(script, audioPath);


    const imagePrompt = `Vertical 9:16 cinematic 8k 3D octane render, highly detailed, futuristic AI concept related to: ${topic}, vibrant colors, masterpiece, no text`;
    const imageUrl = await generateImageUrl(imagePrompt);
    
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    fs.writeFileSync(imagePath, Buffer.from(imgBuffer));


    await generateReelVideo(audioPath, imagePath, videoPath);

    return { videoPath, script };
  } catch (err) {
    console.error('Reel generation error:', err);
    throw err;
  }
}
