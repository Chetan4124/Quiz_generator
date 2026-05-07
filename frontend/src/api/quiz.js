import API from './axios';

// Topics
export const getTopics = () => API.get('/quiz/topics/');
export const getTopic = (id) => API.get(`/quiz/topics/${id}/`);
export const createTopic = (data) => API.post('/quiz/topics/', data);
export const updateTopic = (id, data) => API.patch(`/quiz/topics/${id}/`, data);
export const deleteTopic = (id) => API.delete(`/quiz/topics/${id}/`);

// Questions
export const getQuestions = (params = {}) => API.get('/quiz/questions/', { params });
export const getQuestion = (id) => API.get(`/quiz/questions/${id}/`);
export const createQuestion = (data) => API.post('/quiz/questions/', data);
export const updateQuestion = (id, data) => API.patch(`/quiz/questions/${id}/`, data);
export const deleteQuestion = (id) => API.delete(`/quiz/questions/${id}/`);

// Generate Questions (AI + DB)
export const generateQuestions = (data) => API.post('/quiz/questions/generate/', data);

// Quiz Sessions
export const getSessions = () => API.get('/quiz/sessions/');
export const getSession = (id) => API.get(`/quiz/sessions/${id}/`);
export const createSession = (data) => API.post('/quiz/sessions/', data);
export const bulkUploadQuestions = (formData) => 
  API.post('/quiz/questions/bulk_upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });