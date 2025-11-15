import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('authToken');
  });
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
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
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};