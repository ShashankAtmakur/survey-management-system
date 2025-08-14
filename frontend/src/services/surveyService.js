import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method && config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response && error.response.data || error.message);
    
    if (error.response && error.response.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response && error.response.status === 500) {
      throw new Error('Server error occurred');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error - please check your connection');
    }
    
    throw error;
  }
);

export const surveyService = {
  // Survey CRUD operations
  async getSurveys() {
    const response = await api.get('/surveys');
    return response.data;
  },

  async getSurvey(id) {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  async createSurvey(surveyData) {
    const response = await api.post('/surveys', surveyData);
    return response.data;
  },

  async updateSurvey(id, surveyData) {
    const response = await api.put(`/surveys/${id}`, surveyData);
    return response.data;
  },

  async deleteSurvey(id) {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },

  // Response operations
  async submitResponse(surveyId, responseData) {
    const response = await api.post(`/surveys/${surveyId}/responses`, responseData);
    return response.data;
  },

  async getResponses(surveyId) {
    const response = await api.get(`/surveys/${surveyId}/responses`);
    return response.data;
  },

  async exportResponses(surveyId) {
    const response = await api.get(`/surveys/${surveyId}/responses/export`);
    return response.data;
  },

  // Analytics
  async getAnalytics(surveyId) {
    const response = await api.get(`/surveys/${surveyId}/analytics`);
    return response.data;
  },

  async getSurveyStats(surveyId) {
    const response = await api.get(`/surveys/${surveyId}/stats`);
    return response.data;
  },

  // AI Operations
  async generateQuestions(prompt, questionCount = 5) {
    const response = await api.post('/generate-questions', {
      prompt,
      question_count: questionCount,
    });
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default surveyService;
