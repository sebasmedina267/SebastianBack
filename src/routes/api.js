const express = require('express');
const { pool } = require('../config/db');
const { getStore, addTask, deleteTask, addClient, addSession } = require('../data/store');
const { buildDashboardData } = require('../services/dashboardService');

const router = express.Router();

router.get('/health', async (req, res) => {
  if (!pool) {
    return res.json({
      success: true,
      message: 'Backend funcionando en modo local',
      database: 'sin-configuracion',
      time: new Date().toISOString()
    });
  }

  try {
    const result = await pool.query('SELECT NOW()');
    return res.json({
      success: true,
      message: 'Backend funcionando',
      database: 'conectada',
      time: result.rows[0].now
    });
  } catch (error) {
    return res.json({
      success: true,
      message: 'Backend funcionando en modo local',
      database: 'sin-configuracion',
      time: new Date().toISOString(),
      warning: error.message
    });
  }
});

router.get('/dashboard', (req, res) => {
  const store = getStore();
  res.json(buildDashboardData(store));
});

router.get('/tasks', (req, res) => {
  res.json(getStore().tasks);
});

router.post('/tasks', (req, res) => {
  const title = String(req.body.title || '').trim();

  if (!title) {
    return res.status(400).json({ message: 'El título es obligatorio' });
  }

  const task = addTask(title);
  res.status(201).json(task);
});

router.patch('/tasks/:id/toggle', (req, res) => {
  const { id } = req.params;
  const store = getStore();
  const task = store.tasks.find((item) => item.id === Number(id));

  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }

  task.status = task.status === 'Completada' ? 'Pendiente' : 'Completada';
  res.json(task);
});

router.delete('/tasks/:id', (req, res) => {
  deleteTask(req.params.id);
  res.json({ success: true });
});

router.get('/clients', (req, res) => {
  res.json(getStore().clients);
});

router.post('/clients', (req, res) => {
  const client = addClient(req.body || {});
  res.status(201).json(client);
});

router.get('/sessions', (req, res) => {
  res.json(getStore().sessions);
});

router.post('/sessions', (req, res) => {
  const session = addSession(req.body || {});
  res.status(201).json(session);
});

module.exports = router;
