import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { Role } from '../types';
import authService from '../services/authService';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: Role) => boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getToken();
      
      if (storedUser && token) {
        setUser(storedUser);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    try {
      const authData = await authService.login(credentials);
      setUser(authData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    setLoading(true);
    try {
      const authData = await authService.register(userData);
      setUser(authData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const isAuthenticated = !!user && !!authService.getToken();
  const isAdmin = hasRole(Role.ADMIN);
  const isTeacher = hasRole(Role.TEACHER);
  const isStudent = hasRole(Role.STUDENT);

  const value: AuthContextType = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    isTeacher,
    isStudent,
  }), [user, loading, isAuthenticated, isAdmin, isTeacher, isStudent]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
