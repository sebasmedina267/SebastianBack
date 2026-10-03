const express = require('express');
const { pool } = require('../config/db');
const { buildDashboardData } = require('../services/dashboardService');

const router = express.Router();

const ensureDatabaseSchema = async () => {
  if (!pool) {
    return false;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendiente',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Activa',
      plan TEXT,
      last_visit DATE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      client TEXT NOT NULL,
      coach TEXT,
      date DATE,
      time TEXT,
      status TEXT NOT NULL DEFAULT 'Pendiente'
    );
  `);

  return true;
};

const formatTaskRow = (task) => ({
  id: task.id,
  title: task.title,
  status: task.status,
  createdAt: task.createdat || task.created_at
});

const formatClientRow = (client) => ({
  id: client.id,
  name: client.name,
  status: client.status,
  plan: client.plan,
  lastVisit: client.lastvisit || client.last_visit
});

const formatSessionRow = (session) => ({
  id: session.id,
  client: session.client,
  coach: session.coach,
  date: session.date,
  time: session.time,
  status: session.status
});

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
    await ensureDatabaseSchema();
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

router.get('/dashboard', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  try {
    await ensureDatabaseSchema();
    const [tasksResult, clientsResult, sessionsResult] = await Promise.all([
      pool.query('SELECT id, title, status, created_at AS "createdAt" FROM tasks ORDER BY created_at DESC, id DESC'),
      pool.query('SELECT id, name, status, plan, last_visit AS "lastVisit" FROM clients ORDER BY id DESC'),
      pool.query('SELECT id, client, coach, date, time, status FROM sessions ORDER BY id DESC')
    ]);

    const payload = {
      tasks: tasksResult.rows.map(formatTaskRow),
      clients: clientsResult.rows.map(formatClientRow),
      sessions: sessionsResult.rows.map(formatSessionRow)
    };

    return res.json(buildDashboardData(payload));
  } catch (error) {
    return res.status(500).json({ message: 'Error al consultar el dashboard', error: error.message });
  }
});

router.get('/tasks', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  try {
    await ensureDatabaseSchema();
    const result = await pool.query('SELECT id, title, status, created_at AS "createdAt" FROM tasks ORDER BY created_at DESC, id DESC');
    return res.json(result.rows.map(formatTaskRow));
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener tareas', error: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  const title = String(req.body?.title || '').trim();

  if (!title) {
    return res.status(400).json({ message: 'El título es obligatorio' });
  }

  try {
    await ensureDatabaseSchema();
    const result = await pool.query(
      'INSERT INTO tasks (title, status, created_at) VALUES ($1, $2, NOW()) RETURNING id, title, status, created_at AS "createdAt"',
      [title, 'Pendiente']
    );

    return res.status(201).json(formatTaskRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la tarea', error: error.message });
  }
});

router.patch('/tasks/:id/toggle', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  try {
    await ensureDatabaseSchema();
    const result = await pool.query(
      `UPDATE tasks
       SET status = CASE WHEN status = 'Completada' THEN 'Pendiente' ELSE 'Completada' END
       WHERE id = $1
       RETURNING id, title, status, created_at AS "createdAt"`,
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json(formatTaskRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Error al cambiar el estado de la tarea', error: error.message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  try {
    await ensureDatabaseSchema();
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar la tarea', error: error.message });
  }
});

router.get('/clients', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  try {
    await ensureDatabaseSchema();
    const result = await pool.query('SELECT id, name, status, plan, last_visit AS "lastVisit" FROM clients ORDER BY id DESC');
    return res.json(result.rows.map(formatClientRow));
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
});

router.post('/clients', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  const client = req.body || {};

  try {
    await ensureDatabaseSchema();
    const result = await pool.query(
      'INSERT INTO clients (name, status, plan, last_visit) VALUES ($1, $2, $3, $4) RETURNING id, name, status, plan, last_visit AS "lastVisit"',
      [client.name || '', client.status || 'Activa', client.plan || null, client.lastVisit || null]
    );

    return res.status(201).json(formatClientRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
  }
});

router.get('/sessions', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  try {
    await ensureDatabaseSchema();
    const result = await pool.query('SELECT id, client, coach, date, time, status FROM sessions ORDER BY id DESC');
    return res.json(result.rows.map(formatSessionRow));
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener sesiones', error: error.message });
  }
});

router.post('/sessions', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ message: 'Base de datos no configurada' });
  }

  const session = req.body || {};

  try {
    await ensureDatabaseSchema();
    const result = await pool.query(
      'INSERT INTO sessions (client, coach, date, time, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, client, coach, date, time, status',
      [session.client || '', session.coach || null, session.date || null, session.time || null, session.status || 'Pendiente']
    );

    return res.status(201).json(formatSessionRow(result.rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la sesión', error: error.message });
  }
});

module.exports = router;
