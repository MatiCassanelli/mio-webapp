import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { handleBotMessage } from './bot/webhook.js';

initializeApp();

// WhatsApp bot webhook
// Body: { phoneNumber: string, message: string }
export const botWebhook = onRequest({ cors: true, secrets: ['ANTHROPIC_API_KEY'] }, async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    res.status(400).send('phoneNumber and message are required');
    return;
  }

  try {
    const reply = await handleBotMessage(phoneNumber, message);
    res.status(200).set('Content-Type', 'text/plain').send(reply);
  } catch (error) {
    console.error('Bot error:', error);
    res.status(500).send({ name: 'Internal Server Error', error });
  }
});

export const telegramWebhook = onRequest({ secrets: ['ANTHROPIC_API_KEY', 'TELEGRAM_BOT_TOKEN'] }, async (req, res) => {
  res.sendStatus(200);

  const msg = req.body.message;
  if (!msg) return;

  const chatId = String(msg.chat.id);
  const message = msg.text || msg.caption || null;

  let imageData = null;
  if (msg.photo) {
    // Telegram sends multiple sizes; last one is highest resolution
    const photo = msg.photo[msg.photo.length - 1];
    imageData = await downloadTelegramFile(photo.file_id);
  } else if (msg.document?.mime_type === 'application/pdf') {
    imageData = await downloadTelegramFile(msg.document.file_id, 'application/pdf');
  }

  console.log('Received Telegram message:', { chatId, message, hasImage: !!imageData });

  if (!message && !imageData) return;

  try {
    const reply = await handleBotMessage(chatId, message, imageData);
    await sendTelegramMessage(msg.chat.id, reply);
  } catch (error) {
    console.error('Bot error:', error);
  }
});

async function downloadTelegramFile(fileId, forceMimeType = null) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  const fileJson = await fileRes.json();
  const filePath = fileJson.result?.file_path;
  if (!filePath) return null;

  const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const fileResponse = await fetch(fileUrl);
  const buffer = await fileResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  let mimeType = forceMimeType;
  if (!mimeType) {
    const ext = filePath.split('.').pop().toLowerCase();
    mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  }

  return { base64, mimeType };
}

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}