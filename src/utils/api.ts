import axios from "axios";
import { toast } from "@/components/ui/use-toast";

// Configure axios defaults for CSRF handling
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Log API URL for debugging
const apiUrl = import.meta.env.VITE_API_URL;
console.log("API URL from environment:", apiUrl);

if (!apiUrl) {
  console.error("VITE_API_URL is not defined in environment variables!");
}

// Axios instance with baseURL from .env
const api = axios.create({
  baseURL: apiUrl, // e.g., http://localhost:8000/api
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  withCredentials: true, // Needed for Sanctum (cookie-based auth)
  withXSRFToken: true // Automatically include XSRF token from cookies
});

// Request interceptor to attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and show toast
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Response Error:", error);

    // Check if server returned HTML instead of JSON
    if (
      typeof error?.response?.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      toast({
        title: "Server Error",
        description: "The server returned an invalid HTML response. Please contact support.",
        variant: "destructive"
      });
      return Promise.reject(new Error("Invalid HTML response received from the server."));
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "An unexpected error occurred";

    // Show toast for general errors except validation (422)
    if (error.response?.status !== 422) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }

    // Handle unauthorized access
    if (error.response?.status === 401) {
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

// Guest user admin services
export const guestUserAdminService = {
  getAllGuestUsers: async () => {
    return api.get("/api/guest-users");
  },

  getGuestUserDetails: async (id: number) => {
    return api.get(`/api/guest-users/${id}`);
  },

  deleteGuestUser: async (id: number) => {
    return api.delete(`/api/guest-users/${id}`);
  },

  getGuestUserChatHistory: async (sessionId: string) => {
    return api.get(`/api/chat/history?session_id=${sessionId}`);
  }
};

export default api;
