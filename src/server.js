const express = require('express');
const cors = require('cors');
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API ejecutándose en puerto ${PORT}`);
});