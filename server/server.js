/**
 * WebSocket server for real-time device location tracking.
 * Clients connect, share their location, and receive all other clients' locations.
 *
 * Message protocol:
 *   Client → Server: { type: 'location', id, name, lat, lng, accuracy }
 *   Server → All clients: { type: 'location', id, name, lat, lng, accuracy, timestamp }
 *   Server → Client on disconnect: { type: 'leave', id }
 */

const { WebSocketServer, WebSocket } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

// Map of clientId → { ws, id, name }
const clients = new Map();

wss.on('connection', (ws) => {
  let clientId = null;

  ws.on('message', (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (message.type === 'location' && message.id && message.lat != null && message.lng != null) {
      clientId = message.id;
      clients.set(clientId, { ws, id: message.id, name: message.name || message.id });

      const broadcast = JSON.stringify({
        type: 'location',
        id: message.id,
        name: message.name || message.id,
        lat: message.lat,
        lng: message.lng,
        accuracy: message.accuracy || null,
        timestamp: Date.now(),
      });

      // Broadcast to all connected clients (including sender for confirmation)
      for (const client of clients.values()) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(broadcast);
        }
      }
    }
  });

  ws.on('close', () => {
    if (clientId) {
      clients.delete(clientId);
      const leaveMsg = JSON.stringify({ type: 'leave', id: clientId });
      for (const client of clients.values()) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(leaveMsg);
        }
      }
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

console.log(`Location tracking WebSocket server running on ws://localhost:${PORT}`);
