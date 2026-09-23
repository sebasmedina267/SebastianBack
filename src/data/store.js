const defaultStore = {
  tasks: [
    { id: 1, title: 'Revisar plan de entrenamiento', status: 'Pendiente', createdAt: '2026-09-23T09:00:00.000Z' },
    { id: 2, title: 'Actualizar materiales del club', status: 'Completada', createdAt: '2026-09-22T14:00:00.000Z' },
    { id: 3, title: 'Confirmar clientes del fin de semana', status: 'Pendiente', createdAt: '2026-09-21T18:30:00.000Z' }
  ],
  clients: [
    { id: 1, name: 'Ana López', status: 'Activa', plan: 'Premium', lastVisit: '2026-09-21' },
    { id: 2, name: 'Carlos Ruiz', status: 'Activa', plan: 'Básico', lastVisit: '2026-09-20' },
    { id: 3, name: 'Lucía Gómez', status: 'Inactiva', plan: 'Mensual', lastVisit: '2026-09-10' }
  ],
  sessions: [
    { id: 1, client: 'Ana López', coach: 'Mario', date: '2026-09-23', time: '09:00', status: 'Confirmada' },
    { id: 2, client: 'Carlos Ruiz', coach: 'Laura', date: '2026-09-23', time: '11:30', status: 'Pendiente' },
    { id: 3, client: 'Lucía Gómez', coach: 'Mario', date: '2026-09-24', time: '17:00', status: 'Confirmada' }
  ]
};

let store = JSON.parse(JSON.stringify(defaultStore));

const getStore = () => store;

const replaceStore = (nextStore) => {
  store = JSON.parse(JSON.stringify(nextStore));
  return store;
};

const addTask = (title) => {
  const task = {
    id: Date.now(),
    title,
    status: 'Pendiente',
    createdAt: new Date().toISOString()
  };

  store.tasks.unshift(task);
  return task;
};

const deleteTask = (id) => {
  store.tasks = store.tasks.filter((task) => task.id !== Number(id));
};

const addClient = (client) => {
  const nextClient = {
    id: Date.now(),
    ...client,
    status: client.status || 'Activa'
  };

  store.clients.unshift(nextClient);
  return nextClient;
};

const addSession = (session) => {
  const nextSession = {
    id: Date.now(),
    ...session,
    status: session.status || 'Pendiente'
  };

  store.sessions.unshift(nextSession);
  return nextSession;
};

module.exports = {
  defaultStore,
  getStore,
  replaceStore,
  addTask,
  deleteTask,
  addClient,
  addSession
};
