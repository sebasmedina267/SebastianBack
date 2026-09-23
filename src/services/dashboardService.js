function buildDashboardData({ tasks = [], clients = [], sessions = [] } = {}) {
  const summary = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === 'Completada').length,
    openTasks: tasks.filter((task) => task.status === 'Pendiente').length,
    activeClients: clients.filter((client) => client.status === 'Activa').length,
    confirmedSessions: sessions.filter((session) => session.status === 'Confirmada').length
  };

  return {
    summary,
    tasks,
    clients,
    sessions
  };
}

module.exports = {
  buildDashboardData
};
