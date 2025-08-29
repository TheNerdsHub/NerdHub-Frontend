import React, { createContext, useContext, useState, useEffect } from 'react';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication (placeholder for Authentik integration)
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // TODO: Replace with Authentik initialization logic
      // For now, set authentication to false and user to null
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      // TODO: Implement Authentik login logic
      console.log('Login functionality to be implemented with Authentik');
      // Placeholder: redirect to Authentik login page
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      // TODO: Implement Authentik logout logic
      console.log('Logout functionality to be implemented with Authentik');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserProfile = () => {
    // Return user profile data in a standardized format
    return user ? {
      username: user.preferred_username || user.username || 'Unknown',
      email: user.email || '',
      firstName: user.given_name || user.firstName || '',
      lastName: user.family_name || user.lastName || '',
      avatar: user.avatar || `https://www.gravatar.com/avatar/${user.emailHash || ''}?d=identicon`
    } : null;
  };

  const value = {
    isAuthenticated,
    user: getUserProfile(),
    loading,
    login,
    logout,
    initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
