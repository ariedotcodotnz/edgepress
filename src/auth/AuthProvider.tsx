import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType } from './AuthContext';
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Safely check for localStorage availability
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('authToken');
    }
    return false;
  });
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    }
  }, []);
  const login = (email: string) => {
    // Mock login: In a real app, you'd call an API and get a real token.
    const mockToken = `mock-token-for-${email}`;
    localStorage.setItem('authToken', mockToken);
    setIsAuthenticated(true);
  };
  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    // Navigate to login page after logout to prevent being stuck on a protected page
    navigate('/admin/login');
  };
  const authContextValue: AuthContextType = { isAuthenticated, login, logout };
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};