// This file is a compatibility layer for code that imports from api-service.ts
// It re-exports everything from the new modular files to maintain backward compatibility

// Import the API instance
import api from "./api";

// Import services from their dedicated files
import * as authServiceModule from "./authService";

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

// Role management services
export const roleService = {
  getAllRoles: async () => {
    return api.get("roles");
  },

  getRole: async (id: number) => {
    return api.get(`roles/${id}`);
  },

  createRole: async (roleData: { name: string; description?: string }) => {
    return api.post("roles", roleData);
  },

  updateRole: async (
    id: number,
    roleData: {
      name?: string;
      description?: string;
    },
  ) => {
    return api.put(`roles/${id}`, roleData);
  },

  deleteRole: async (id: number) => {
    return api.delete(`roles/${id}`);
  },

  assignPermissions: async (roleId: number, permissions: number[]) => {
    return api.post(`roles/${roleId}/permissions`, { permissions });
  },
};

// User management services
export const userService = {
  getAllUsers: async () => {
    return api.get("users");
  },

  getUser: async (id: number) => {
    return api.get(`users/${id}`);
  },

  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    status: string;
  }) => {
    return api.post("users", userData);
  },

  updateUser: async (
    id: number,
    userData: {
      name?: string;
      email?: string;
      password?: string;
      status?: string;
    },
  ) => {
    return api.put(`users/${id}`, userData);
  },

  deleteUser: async (id: number) => {
    return api.delete(`users/${id}`);
  },

  assignRoles: async (userId: number, roles: number[]) => {
    return api.post(`users/${userId}/roles`, { roles });
  },
};

// Guest user services
export const guestUserService = {
  register: async (data: {
    fullname: string;
    email?: string;
    phone: string;
    widget_id: string;
  }) => {
    return api.post("guest/register", data);
  },

  validateSession: async (sessionId: string) => {
    return api.post("guest/validate", { session_id: sessionId });
  },

  getDetails: async (sessionId: string) => {
    return api.post("guest/details", { session_id: sessionId });
  },
};
