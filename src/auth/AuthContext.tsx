import { createContext, useContext } from 'react';
export interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextType | null>(null);
