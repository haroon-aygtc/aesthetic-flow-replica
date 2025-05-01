
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 error (unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    // Get CSRF cookie first
    await api.get("/sanctum/csrf-cookie");
    return api.post("/api/login", { email, password });
  },
  
  register: async (userData: { name: string; email: string; password: string; password_confirmation: string }) => {
    await api.get("/sanctum/csrf-cookie");
    return api.post("/api/register", userData);
  },
  
  logout: async () => {
    return api.post("/api/logout");
  },
  
  getCurrentUser: async () => {
    return api.get("/api/user");
  },
};

// User management services
export const userService = {
  getAllUsers: async () => {
    return api.get("/api/users");
  },
  
  getUser: async (id: number) => {
    return api.get(`/api/users/${id}`);
  },
  
  createUser: async (userData: { name: string; email: string; password: string; status: string }) => {
    return api.post("/api/users", userData);
  },
  
  updateUser: async (id: number, userData: { name?: string; email?: string; password?: string; status?: string }) => {
    return api.put(`/api/users/${id}`, userData);
  },
  
  deleteUser: async (id: number) => {
    return api.delete(`/api/users/${id}`);
  },
  
  assignRoles: async (userId: number, roles: number[]) => {
    return api.post(`/api/users/${userId}/roles`, { roles });
  }
};

// Role management services
export const roleService = {
  getAllRoles: async () => {
    return api.get("/api/roles");
  },
  
  getRole: async (id: number) => {
    return api.get(`/api/roles/${id}`);
  },
  
  createRole: async (roleData: { name: string; description?: string }) => {
    return api.post("/api/roles", roleData);
  },
  
  updateRole: async (id: number, roleData: { name?: string; description?: string }) => {
    return api.put(`/api/roles/${id}`, roleData);
  },
  
  deleteRole: async (id: number) => {
    return api.delete(`/api/roles/${id}`);
  },
  
  assignPermissions: async (roleId: number, permissions: number[]) => {
    return api.post(`/api/roles/${roleId}/permissions`, { permissions });
  }
};

// Permission management services
export const permissionService = {
  getAllPermissions: async () => {
    return api.get("/api/permissions");
  },
  
  getPermission: async (id: number) => {
    return api.get(`/api/permissions/${id}`);
  },
  
  createPermission: async (permissionData: { name: string; description?: string; category: string; type: string }) => {
    return api.post("/api/permissions", permissionData);
  },
  
  updatePermission: async (id: number, permissionData: { name?: string; description?: string; category?: string; type?: string }) => {
    return api.put(`/api/permissions/${id}`, permissionData);
  },
  
  deletePermission: async (id: number) => {
    return api.delete(`/api/permissions/${id}`);
  }
};

export default api;
