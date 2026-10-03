const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { setupWebSocketServer } = require('./services/socketService');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API del gimnasio funcionando' });
});

const server = http.createServer(app);
setupWebSocketServer(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API y WebSocket ejecutándose en puerto ${PORT}`);
});
