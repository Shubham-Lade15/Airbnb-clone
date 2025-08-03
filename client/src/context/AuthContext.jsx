import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Auth Context
const AuthContext = createContext(null);

// Custom hook to use the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage (persists login across page refreshes)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });

  // Update localStorage whenever token or user state changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [token, user]);

  // Function to handle login
  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  // Function to handle logout
  const logout = () => {
    setToken(null);
    setUser(null);
    // localStorage is cleared by the useEffect above
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token, // Convenience boolean
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};