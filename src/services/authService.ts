import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const authData = response.data;
    
    // Store token and user data
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
    
    return authData;
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    const authData = response.data;
    
    // Store token and user data
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
    
    return authData;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  /**
   * Check if username is available
   */
  async checkUsername(username: string): Promise<boolean> {
    const response = await api.get(`/auth/check-username?username=${username}`);
    return response.data.available;
  }

  /**
   * Check if email is available
   */
  async checkEmail(email: string): Promise<boolean> {
    const response = await api.get(`/auth/check-email?email=${email}`);
    return response.data.available;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Decode a JWT payload (no signature verification)
   */
  private decodeJwtPayload<T = unknown>(token: string): T | null {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /**
   * Returns true if JWT is expired based on exp claim
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload<{ exp?: number }>(token);
    if (!payload?.exp) return false;
    const expiresAtMs = payload.exp * 1000;
    return Date.now() >= expiresAtMs;
  }

  /**
   * Get token only if valid (not expired). Otherwise clears storage and returns null.
   */
  getValidToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    if (this.isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return token;
  }

  /**
   * Get stored user data
   */
  getStoredUser(): AuthResponse | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Check if user is teacher
   */
  isTeacher(): boolean {
    return this.hasRole('TEACHER');
  }

  /**
   * Check if user is student
   */
  isStudent(): boolean {
    return this.hasRole('STUDENT');
  }
}

export default new AuthService();
