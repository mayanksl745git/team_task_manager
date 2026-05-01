import api from './axios';

export async function getUsers() {
  const response = await api.get('/api/users');
  return response.data;
}
