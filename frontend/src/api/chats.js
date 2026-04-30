import API from './axios';

export const getChatSessions = () => API.get('/chats/sessions/');
export const getChatSession = (id) => API.get(`/chats/sessions/${id}/`);
export const createChatSession = (data) => API.post('/chats/sessions/', data);
export const sendMessage = (sessionId, message) => 
  API.post(`/chats/sessions/${sessionId}/messages/`, message);
export const getMessages = (sessionId) => 
  API.get(`/chats/sessions/${sessionId}/messages/`);