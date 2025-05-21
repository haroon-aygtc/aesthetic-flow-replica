import httpClient from "@/api/http-client";
import { endpoints } from "@/api/endpoints";

/**
 * Guest user admin services
 */
export const guestUserAdminService = {
  /**
   * Get all guest users
   */
  getAllGuestUsers: async () => {
    return httpClient.get(endpoints.guestUsers.base);
  },

  /**
   * Delete a guest user by ID
   */
  deleteGuestUser: async (id: number) => {
    return httpClient.delete(endpoints.guestUsers.byId(id));
  },

  /**
   * Get details for a specific guest user
   */
  getGuestUserDetails: async (id: number) => {
    return httpClient.get(endpoints.guestUsers.byId(id));
  },

  /**
   * Get chat history for a guest user session
   */
  getGuestUserChatHistory: async (sessionId: string) => {
    return httpClient.get(endpoints.guestUsers.chatHistory(sessionId));
  },
};

export default guestUserAdminService;
