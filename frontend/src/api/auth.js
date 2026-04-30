import API from './axios';

export const loginUser = async (username, password) => {
  const response = await API.post('/auth/login/', { username, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register/', userData);
  return response.data;
};

export const refreshToken = async (refresh) => {
  const response = await API.post('/auth/refresh/', { refresh });
  return response.data;
};