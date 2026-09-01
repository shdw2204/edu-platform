import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: { email: string; password: string; full_name: string; role: string }) =>
    apiClient.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  me: () => apiClient.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const coursesApi = {
  getAll: () => apiClient.get('http://localhost:8001/api/courses'),
  getOne: (id: string) => apiClient.get(`http://localhost:8001/api/courses/${id}`),
  getLessons: (courseId: string) =>
    apiClient.get(`http://localhost:8001/api/courses/${courseId}/lessons`),
  getQuiz: (lessonId: string) =>
    apiClient.get(`http://localhost:8001/api/lessons/${lessonId}/quiz`),
  submitQuiz: (data: { quiz_id: string; answers: Record<string, string> }) =>
    apiClient.post('http://localhost:8001/api/quiz/attempt', data),
  getProgress: (courseId: string) =>
    apiClient.get(`http://localhost:8001/api/progress/course/${courseId}/summary`),
  updateProgress: (data: { lesson_id: string; status: string }) =>
    apiClient.post('http://localhost:8001/api/progress', data),
  create: (data: { title: string; description: string; subject: string; level: string; price: number }) =>
    apiClient.post('http://localhost:8001/api/courses', data),
  update: (id: string, data: any) =>
    apiClient.put(`http://localhost:8001/api/courses/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`http://localhost:8001/api/courses/${id}`),
  addLesson: (courseId: string, data: { title: string; content_type: string; video_url?: string; text_content?: string; order: number }) =>
    apiClient.post(`http://localhost:8001/api/courses/${courseId}/lessons`, data),
  updateLesson: (lessonId: string, data: any) =>
    apiClient.put(`http://localhost:8001/api/lessons/${lessonId}`, data),
  deleteLesson: (lessonId: string) =>
    apiClient.delete(`http://localhost:8001/api/lessons/${lessonId}`),
};