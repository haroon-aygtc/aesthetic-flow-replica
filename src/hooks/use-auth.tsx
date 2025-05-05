
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the auth context's value type
interface AuthContextType {
  user: {
    name?: string;
    email?: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
});

// Create a provider component for the auth context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name?: string; email?: string; } | null>(null);

  // Mock implementation for login
  const login = async (email: string, password: string) => {
    // In a real app, you would validate credentials with your API
    // For now, we'll simulate a successful login
    setUser({
      name: 'Demo User',
      email: email,
    });
  };

  // Mock implementation for logout
  const logout = async () => {
    // In a real app, you would call your API to invalidate the session
    setUser(null);
  };

  // Create the value object that will be provided by the context
  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
