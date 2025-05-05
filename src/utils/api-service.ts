
// This file is a compatibility layer for code that imports from api-service.ts
// It re-exports everything from the new modular files to maintain backward compatibility

// Import the API instance
import api from "./api";

// Import services from their dedicated files
import * as authServiceModule from './authService';
import { guestUserAdminService as guestUserAdminServiceModule } from './guest-user-service';
import { widgetService as widgetServiceModule } from './widgetService';
import { roleService as roleServiceModule } from './roleService';
import { permissionService as permissionServiceModule } from './permissionService';

// Re-export the API instance as default
export default api;

// Re-export auth services
export const authService = {
  login: authServiceModule.login,
  register: authServiceModule.register,
  logout: authServiceModule.logout,
  getCurrentUser: authServiceModule.getUser,
  getCsrfToken: authServiceModule.getCsrfToken,
};

// User management services
export const userService = {
  getAllUsers: async () => {
    return api.get("users");
  },

  getUser: async (id: number) => {
    return api.get(`users/${id}`);
  },

  createUser: async (userData: { name: string; email: string; password: string; status: string }) => {
    return api.post("users", userData);
  },

  updateUser: async (id: number, userData: { name?: string; email?: string; password?: string; status?: string }) => {
    return api.put(`users/${id}`, userData);
  },

  deleteUser: async (id: number) => {
    return api.delete(`users/${id}`);
  },

  assignRoles: async (userId: number, roles: number[]) => {
    return api.post(`users/${userId}/roles`, { roles });
  }
};

// Re-export role and permission services
export const roleService = roleServiceModule;
export const permissionService = permissionServiceModule;

// Re-export guest user admin services
export const guestUserAdminService = guestUserAdminServiceModule;

// Guest user services
export const guestUserService = {
  register: async (data: { fullname: string; email?: string; phone: string; widget_id: string }) => {
    return api.post('guest/register', data);
  },

  validateSession: async (sessionId: string) => {
    return api.post('guest/validate', { session_id: sessionId });
  },

  getDetails: async (sessionId: string) => {
    return api.post('guest/details', { session_id: sessionId });
  },
};

// Re-export widget services
export const widgetService = widgetServiceModule;
