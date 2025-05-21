import httpClient from "@/api/http-client";
import { endpoints } from "@/api/endpoints";

export interface User {
  id: number;
  name: string;
  email: string;
  // add more fields as necessary
}

/**
 * Fetch CSRF cookie from Sanctum.
 * Should be called before login or registration.
 */
export const getCsrfToken = async (): Promise<void> => {
  try {
    // In development environment, we'll skip CSRF token fetch
    // This is a temporary solution for local development without a running Laravel backend
    if (import.meta.env.DEV) {
      console.warn("Development mode: Skipping CSRF token fetch");
      return;
    }

    // Extract the base URL from the API URL (removing /api if present)
    const envUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = envUrl.replace(/\/api\/?$/, "");

    // Use fetch with credentials to ensure cookies are sent and stored
    const response = await fetch(`${baseUrl}${endpoints.auth.csrfToken}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch CSRF cookie: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Failed to fetch CSRF cookie:", error);
    // In development, we'll continue despite CSRF errors
    if (import.meta.env.DEV) {
      console.warn(
        "Development mode: Continuing despite CSRF token fetch error",
      );
      return;
    }
    throw error;
  }
};

// Authenticated login
export const login = async (email: string, password: string): Promise<User> => {
  try {
    // Get CSRF token first
    await getCsrfToken();

    // Send login request
    const response = await httpClient.post(endpoints.auth.login, {
      email,
      password,
    });

    return response.data.user;
  } catch (error) {
    // In development mode, provide a mock user for testing
    if (import.meta.env.DEV) {
      console.warn("Development mode: Using mock user authentication");
      // Return a mock user for development purposes
      const mockUser = {
        id: 1,
        name: "Admin User",
        email: email,
        role: "admin",
      };
      return mockUser;
    }
    throw error;
  }
};

// Register a new user
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<User> => {
  // Get CSRF token first
  await getCsrfToken();

  // Send registration request
  const response = await httpClient.post(endpoints.auth.register, userData);

  return response.data.user;
};

// Authenticated logout
export const logout = async (): Promise<void> => {
  await httpClient.post(endpoints.auth.logout);
};

// Fetch current user info
export const getUser = async (): Promise<User> => {
  try {
    const response = await httpClient.get(endpoints.auth.user);
    return response.data;
  } catch (error) {
    // In development mode, check if we have a mock user in localStorage
    if (import.meta.env.DEV) {
      console.warn("Development mode: Attempting to use mock user");
      const mockUserJson = localStorage.getItem("mock_user");
      if (mockUserJson) {
        return JSON.parse(mockUserJson);
      }
    }
    throw error;
  }
};

// Export the auth service as a single object for easier imports
export const authService = {
  getCsrfToken,
  login,
  register,
  logout,
  getCurrentUser: getUser,
};

export default authService;
