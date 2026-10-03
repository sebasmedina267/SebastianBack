const { WebSocketServer, WebSocket } = require('ws');

let wss = null;

const setupWebSocketServer = (server) => {
  if (wss) {
    return wss;
  }

  wss = new WebSocketServer({
    server,
    path: '/ws'
  });

  wss.on('connection', (ws) => {
    console.log('Cliente conectado vía WebSocket');

    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'WebSocket conectado'
    }));

    ws.on('message', (msg) => {
      const raw = msg.toString();

      try {
        const parsed = JSON.parse(raw);
        const payload = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'broadcast',
              message: payload
            }));
          }
        });
      } catch (error) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'broadcast',
              message: raw
            }));
          }
        });
      }
    });

    ws.on('close', () => {
      console.log('Cliente desconectado');
    });
  });

  return wss;
};

const broadcast = (event, payload = {}) => {
  if (!wss) {
    return;
  }

  const message = JSON.stringify({
    type: event,
    payload,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

module.exports = {
  setupWebSocketServer,
  broadcast
};
