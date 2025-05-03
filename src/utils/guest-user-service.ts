
import api from './api-service';

export const guestUserAdminService = {
  getAllGuestUsers: async () => {
    return api.get('/api/guest-users');
  },
  
  testGuestUserEndpoints: async () => {
    return api.get('/api/test/guest-users');
  },
  
  // For real implementation (after mock data is replaced with actual DB calls)
  deleteGuestUser: async (id: number) => {
    return api.delete(`/api/guest-users/${id}`);
  },
  
  getGuestUserDetails: async (id: number) => {
    return api.get(`/api/guest-users/${id}`);
  },
  
  getGuestUserChatHistory: async (sessionId: string) => {
    return api.get(`/api/chat/history?session_id=${sessionId}`);
  }
};
