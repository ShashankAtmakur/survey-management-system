import api from './api';

export const analyticsService = {
  getAnalytics: async (surveyId) => {
    const response = await api.get(`/surveys/${surveyId}/analytics`);
    return response.data;
  }
};
