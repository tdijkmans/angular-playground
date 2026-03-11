/**
 * Simple WebSocket broadcast server for the Angular chat demo.
 *
 * Run:  node server.js
 *       (or `npm start` inside this directory)
 *
 * Every message a client sends is broadcast to ALL connected clients.
 * After a short delay a bot reply is sent to simulate a conversation.
 */

const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const BOT_REPLIES = [
  "Hey there! 👋",
  "That's interesting!",
  "Tell me more 😊",
  "I totally agree!",
  "Sounds great!",
  "Really? That's cool!",
  "Ha! 😄",
  "I hear you.",
  "Got it 👍",
  "Wow, nice!",
];

function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws) => {
  console.log(`[ws] client connected  (total: ${wss.clients.size})`);

  ws.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      console.warn('[ws] Received non-JSON message, ignoring.');
      return;
    }

    console.log(`[ws] message from "${message.sender}": ${message.text}`);

    // Echo / broadcast the original message back to all clients
    // (the sender already pushed it locally so mark isSelf=false for others)
    broadcast({ ...message, isSelf: false });

    // Bot reply after a short random delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const botReply = {
        id: `bot-${Date.now()}`,
        sender: 'Bot',
        text: BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)],
        timestamp: new Date().toISOString(),
        isSelf: false,
      };
      broadcast(botReply);
    }, delay);
  });

  ws.on('close', () => {
    console.log(`[ws] client disconnected (total: ${wss.clients.size})`);
  });

  ws.on('error', (err) => console.error('[ws] error:', err));
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);
