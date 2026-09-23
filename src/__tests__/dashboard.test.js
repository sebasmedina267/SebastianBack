const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDashboardData } = require('../services/dashboardService');

test('buildDashboardData devuelve resumen del estado actual', () => {
  const data = buildDashboardData({
    tasks: [
      { status: 'Pendiente' },
      { status: 'Completada' },
      { status: 'Pendiente' }
    ],
    clients: [
      { status: 'Activa' },
      { status: 'Inactiva' },
      { status: 'Activa' },
      { status: 'Activa' }
    ],
    sessions: [
      { status: 'Confirmada' },
      { status: 'Pendiente' },
      { status: 'Confirmada' }
    ]
  });

  assert.equal(data.summary.totalTasks, 3);
  assert.equal(data.summary.completedTasks, 1);
  assert.equal(data.summary.activeClients, 3);
  assert.equal(data.summary.confirmedSessions, 2);
});
