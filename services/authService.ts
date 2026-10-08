import { apiClient } from './apiClient';
import { UserRole } from '@/config/roles';
import { AuthSession, getDefaultRouteForRole } from './mockAuthService';

export interface LoginApiResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
    user: {
      userId: string;
      partyId: string | null;
      email: string;
      name: string;
      roles: string[];
      permissions: string[];
      mustChangePassword: boolean;
    };
  };
}

export interface RefreshApiResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

export interface MeApiResponse {
  success: boolean;
  data: {
    userId: string;
    partyId: string | null;
    email: string;
    roles: string[];
    permissions: string[];
    mustChangePassword: boolean;
  };
}

export class AuthService {
  /**
   * Authenticates user against real backend REST API endpoint /auth/login.
   */
  async login(
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; session?: AuthSession; error?: string; defaultRoute?: string; isNetworkError?: boolean }> {
    try {
      const response = await apiClient.post<LoginApiResponse>('/auth/login', {
        identifier,
        password: password || '',
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        const primaryRole = (user.roles[0] as UserRole) || 'RETAILER';

        const session: AuthSession = {
          userId: user.userId,
          name: user.name || user.email.split('@')[0] || 'User',
          email: user.email,
          mobile: '',
          role: primaryRole,
          entityId: user.partyId || undefined,
          approvalStatus: 'APPROVED',
          accountStatus: 'ACTIVE',
          permissions: user.permissions || [],
          accessToken,
          refreshToken,
          mustChangePassword: user.mustChangePassword,
          loggedInAt: new Date().toISOString(),
        };

        const defaultRoute = getDefaultRouteForRole(primaryRole);
        return { success: true, session, defaultRoute };
      }

      return { success: false, error: 'Authentication failed', isNetworkError: false };
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Invalid credentials or server unavailable';
      const isNetworkError = message === 'Failed to fetch' || message.includes('Network request failed');
      return { success: false, error: message, isNetworkError };
    }
  }

  /**
   * Refreshes access token using refresh token via /auth/refresh.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const response = await apiClient.post<RefreshApiResponse>('/auth/refresh', {
        refreshToken,
      });

      if (response.success && response.data) {
        return {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Logs out user from backend via /auth/logout.
   */
  async logout(refreshToken?: string, accessToken?: string): Promise<boolean> {
    if (!refreshToken) return true;
    try {
      await apiClient.post<{ success: boolean }>(
        '/auth/logout',
        { refreshToken },
        { authToken: accessToken }
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetches current authenticated user profile via /auth/me.
   */
  async getCurrentUser(accessToken: string): Promise<MeApiResponse['data'] | null> {
    try {
      const response = await apiClient.get<MeApiResponse>('/auth/me', {
        authToken: accessToken,
      });
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch {
      return null;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<RefreshApiResponse>('/auth/change-password', { currentPassword, newPassword });
    if (!response.success || !response.data) throw new Error('Unable to change password');
    return { accessToken: response.data.accessToken, refreshToken: response.data.refreshToken };
  }
}

export const authService = new AuthService();
