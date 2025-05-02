
import axios from "axios";
import { toast } from "@/hooks/use-toast";

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
    // Create a more user-friendly error message
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "An unexpected error occurred";
    
    // For validation errors, don't show a toast since we'll show inline errors
    if (error.response?.status !== 422) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    // Handle 401 error (unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// Export the API instance
export default api;
