import apiClient from '@/lib/axios';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

/**
 * Authentication service encapsulating all auth-related API calls
 */
export const authService = {
  /**
   * Log in user using DummyJSON /auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Save session data to local storage
   */
  saveSession(user: User, token: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  /**
   * Get active user from storage
   */
  getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get active token from storage
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Clear session data from storage
   */
  clearSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};
