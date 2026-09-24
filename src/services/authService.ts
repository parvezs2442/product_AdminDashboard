import apiClient from '@/lib/axios';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

/**
 * Authentication service encapsulating all auth-related API calls
 */
export const authService = {
  /**
   * Log in user using DummyJSON /auth/login.
   * If an email is provided, resolves the corresponding username from DummyJSON first.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    let resolvedUsername = credentials.username.trim();

    // If user entered an email address, lookup their DummyJSON username
    if (resolvedUsername.includes('@')) {
      try {
        const searchRes = await apiClient.get<{ users: Array<{ username: string; email: string }> }>(
          `/users/search?q=${encodeURIComponent(resolvedUsername)}`
        );
        const match = searchRes.data.users?.find(
          (u) => u.email.toLowerCase() === resolvedUsername.toLowerCase()
        );
        if (match?.username) {
          resolvedUsername = match.username;
        }
      } catch {
        // Fall back to original input if search fails
      }
    }

    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username: resolvedUsername,
      password: credentials.password,
    });
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
