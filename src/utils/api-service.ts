
import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest"
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
    console.log(`API Request to ${config.url}:`, config);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error);
    
    // Handle HTML response instead of JSON
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      console.error("Server returned HTML instead of JSON:", error.response.data.substring(0, 200));
      toast({
        title: "Server Error",
        description: "The server returned an invalid response. Please contact support.",
        variant: "destructive",
      });
      return Promise.reject(new Error("Invalid server response (HTML returned instead of JSON)"));
    }
    
    // User-friendly error message
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
    
    // Handle unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default api;
