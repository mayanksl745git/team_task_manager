import api from './axios';

export async function getProjects() {
  const response = await api.get('/api/projects');
  return response.data;
}

export async function getProject(id) {
  const response = await api.get(`/api/projects/${id}`);
  return response.data;
}

export async function createProject(payload) {
  const response = await api.post('/api/projects', payload);
  return response.data;
}

export async function updateProject(id, payload) {
  const response = await api.put(`/api/projects/${id}`, payload);
  return response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`/api/projects/${id}`);
  return response.data;
}

export async function addMember(id, payload) {
  const response = await api.post(`/api/projects/${id}/members`, payload);
  return response.data;
}

export async function removeMember(projectId, userId) {
  const response = await api.delete(`/api/projects/${projectId}/members/${userId}`);
  return response.data;
}
