import api from './api';

// Guest user admin services
// This file is a compatibility layer for code that imports from guest-user-service.ts
// It re-exports everything from the new modular file to maintain backward compatibility

export const guestUserAdminService = {
  getAllGuestUsers: async () => {
    return api.get('guest-users');
  },

  deleteGuestUser: async (id: number) => {
    return api.delete(`guest-users/${id}`);
  },

  getGuestUserDetails: async (id: number) => {
    return api.get(`guest-users/${id}`);
  },

  getGuestUserChatHistory: async (sessionId: string) => {
    return api.get(`chat/history?session_id=${sessionId}`);
  }
};
