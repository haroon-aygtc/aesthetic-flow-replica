
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

export default api;
