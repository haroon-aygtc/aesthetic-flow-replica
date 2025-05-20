import api from "./api";

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
    // Extract the base URL from the API URL (removing /api if present)
    const envUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = envUrl.replace(/\/api\/?$/, "");

    // Use fetch with credentials to ensure cookies are sent and stored
    const response = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
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
    throw error;
  }
};

// Authenticated login
export const login = async (email: string, password: string): Promise<User> => {
  // Get CSRF token first
  await getCsrfToken();

  // Send login request
  const response = await api.post("/login", { email, password });

  return response.data.user;
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
  const response = await api.post("/register", userData);

  return response.data.user;
};

// Authenticated logout
export const logout = async (): Promise<void> => {
  await api.post("/logout");
};

// Fetch current user info
export const getUser = async (): Promise<User> => {
  const response = await api.get("/user");
  return response.data;
};
