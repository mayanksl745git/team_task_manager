import api from './axios';

export async function getTasks(params = {}) {
  const response = await api.get('/api/tasks', { params });
  return response.data;
}

export async function getDashboard() {
  const response = await api.get('/api/tasks/dashboard');
  return response.data;
}

export async function createTask(payload) {
  const response = await api.post('/api/tasks', payload);
  return response.data;
}

export async function updateTask(id, payload) {
  const response = await api.put(`/api/tasks/${id}`, payload);
  return response.data;
}

export async function deleteTask(id) {
  const response = await api.delete(`/api/tasks/${id}`);
  return response.data;
}
