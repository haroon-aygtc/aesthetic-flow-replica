import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
  // add more fields as necessary
}

// Authenticated login
export const login = async (
  email: string,
  password: string
): Promise<User & { token: string }> => {
  await getCsrfToken();
  const response = await api.post('/login', { email, password });

  // The backend returns { message, user, token }
  // We need to merge the user object with the token
  const { user, token } = response.data;

  return { ...user, token };
};

// Authenticated logout
export const logout = async (): Promise<void> => {
  await api.post('/logout');
};

// Fetch current user info
export const getUser = async (): Promise<User> => {
  const response = await api.get<User>('/user');
  return response.data;
};

// Register a new user
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<User> => {
  await getCsrfToken();
  const response = await api.post<User>('/register', userData);
  return response.data;
};

/**
 * Fetch CSRF cookie from Sanctum.
 * Should be called before login or registration.
 */
export const getCsrfToken = async (): Promise<void> => {
  try {
    // Extract the base URL from the API URL (removing /api if present)
    const envUrl = import.meta.env.VITE_API_URL || '';
    const baseUrl = envUrl.replace(/\/api\/?$/, '');

    console.log('Fetching CSRF token from:', `${baseUrl}/sanctum/csrf-cookie`);

    // Use fetch with credentials to ensure cookies are sent and stored
    const response = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF cookie: ${response.status} ${response.statusText}`);
    }

    console.log('CSRF token fetch successful');
  } catch (error) {
    console.error('❌ Failed to fetch CSRF cookie:', error);
    throw error;
  }
};
