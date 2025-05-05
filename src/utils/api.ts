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

export default api;
