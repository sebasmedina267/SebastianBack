const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API del gimnasio funcionando' });
});

// Crear servidor HTTP manualmente
const server = http.createServer(app);

// Crear WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/ws'
});

// Manejo de conexiones
wss.on('connection', (ws) => {
  console.log('Cliente conectado vía WebSocket');

  ws.send('WebSocket conectado');

  ws.on('message', (msg) => {
    console.log('Mensaje recibido:', msg.toString());

    // Broadcast
    wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(`Broadcast: ${msg.toString()}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API y WebSocket ejecutándose en puerto ${PORT}`);
});
