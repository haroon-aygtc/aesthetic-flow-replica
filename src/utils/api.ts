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

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    console.error("API Error:", error);
    
    // Format error messages for display
    if (error.response) {
      const statusCode = error.response.status;
      const responseData = error.response.data;
      
      // Handle validation errors (422)
      if (statusCode === 422) {
        // Get validation errors
        const validationErrors = responseData.errors || {};
        
        // Display the first validation error in a toast
        const firstErrorKey = Object.keys(validationErrors)[0];
        if (firstErrorKey) {
          // Get the first error message for the first field with an error
          const firstErrorMessage = validationErrors[firstErrorKey][0];
          
          toast({
            title: "Validation Error",
            description: firstErrorMessage,
            variant: "destructive",
          });
        } else if (responseData.message) {
          toast({
            title: "Validation Error",
            description: responseData.message,
            variant: "destructive",
          });
        }
      } 
      // Handle unauthorized (401)
      else if (statusCode === 401) {
        toast({
          title: "Authentication Error",
          description: "You are not authorized to perform this action. Please log in again.",
          variant: "destructive",
        });
        
        // Redirect to login or refresh token as needed
      }
      // Handle forbidden (403) 
      else if (statusCode === 403) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
      }
      // Handle not found (404)
      else if (statusCode === 404) {
        toast({
          title: "Not Found",
          description: responseData.message || "The requested resource was not found.",
          variant: "destructive",
        });
      }
      // Handle server errors (500)
      else if (statusCode >= 500) {
        toast({
          title: "Server Error",
          description: "Something went wrong on the server. Please try again later.",
          variant: "destructive",
        });
      }
      // Handle all other errors
      else {
        toast({
          title: "Error",
          description: responseData.message || "An error occurred while processing your request.",
          variant: "destructive",
        });
      }
    } 
    // Handle network errors (no response)
    else if (error.request) {
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
    } 
    // Handle other errors
    else {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    
    // Rethrow the error for the component to handle if needed
    return Promise.reject(error);
  }
);

export default api;
