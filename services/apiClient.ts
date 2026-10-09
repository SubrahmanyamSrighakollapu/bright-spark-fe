import { APP_CONFIG } from '@/config';

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  authToken?: string;
  isRetry?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = APP_CONFIG.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private getStoredSession(): { isLocal: boolean; session: Record<string, unknown> } | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionRaw = sessionStorage.getItem('qin-star-pay-auth-session-session');
      if (sessionRaw) return { isLocal: false, session: JSON.parse(sessionRaw) };

      const localRaw = localStorage.getItem('qin-star-pay-auth-session-local');
      if (localRaw) return { isLocal: true, session: JSON.parse(localRaw) };
    } catch {
      return null;
    }
    return null;
  }

  private getStoredToken(): string | null {
    const data = this.getStoredSession();
    return typeof data?.session?.accessToken === 'string' ? data.session.accessToken : null;
  }

  private updateStoredTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return;
    const stored = this.getStoredSession();
    if (!stored) return;

    const updatedSession = {
      ...stored.session,
      accessToken,
      ...(refreshToken ? { refreshToken } : {}),
    };

    const key = stored.isLocal ? 'qin-star-pay-auth-session-local' : 'qin-star-pay-auth-session-session';
    const storage = stored.isLocal ? localStorage : sessionStorage;
    storage.setItem(key, JSON.stringify(updatedSession));
    window.dispatchEvent(new CustomEvent('qsp:tokens-refreshed', { detail: { accessToken, refreshToken } }));
  }

  private clearSessionAndRedirect() {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('qin-star-pay-auth-session-session');
      localStorage.removeItem('qin-star-pay-auth-session-local');
    } catch {}

    if (window.location.pathname !== '/login') {
      window.location.href = '/login?session_expired=true';
    }
  }

  private async tryRefreshToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const stored = this.getStoredSession();
        const refreshToken = typeof stored?.session?.refreshToken === 'string' ? stored.session.refreshToken : undefined;
        if (!refreshToken) {
          return null;
        }

        const refreshUrl = this.buildUrl('/auth/refresh');
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          return null;
        }

        const data = await res.json();
        if (data && data.success && data.data?.accessToken) {
          const newAccess = data.data.accessToken;
          const newRefresh = data.data.refreshToken;
          this.updateStoredTokens(newAccess, newRefresh);
          return newAccess;
        }
        return null;
      } catch (err) {
        console.warn('Auto token refresh failed:', err);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private getHeaders(customHeaders?: HeadersInit, authToken?: string): HeadersInit {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Platform': 'web-admin',
    };

    const token = authToken || this.getStoredToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    return {
      ...defaultHeaders,
      ...customHeaders,
    };
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, authToken, headers, isRetry, ...customOptions } = options;
    const url = this.buildUrl(endpoint, params);

    try {
      const requestHeaders = this.getHeaders(headers, authToken) as Record<string, string>;
      if (customOptions.body instanceof FormData) delete requestHeaders['Content-Type'];
      const response = await fetch(url, {
        ...customOptions,
        headers: requestHeaders,
      });

      if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        const newToken = await this.tryRefreshToken();
        if (newToken) {
          return this.request<T>(endpoint, {
            ...options,
            authToken: newToken,
            isRetry: true,
          });
        } else {
          this.clearSessionAndRedirect();
          throw new ApiError('Session expired. Please log in again.', 401);
        }
      }

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        const message =
          (errorData as { error?: { message?: string }; message?: string })?.error?.message ||
          (errorData as { message?: string })?.message ||
          response.statusText ||
          'API Request Failed';
        throw new ApiError(message, response.status, errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError((err as Error).message || 'Network request failed', 500);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public upload<T>(endpoint: string, data: FormData, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }

  public async blob(endpoint: string): Promise<Blob> {
    const response = await fetch(this.buildUrl(endpoint), { headers: this.getHeaders() });
    if (!response.ok) throw new ApiError('Unable to open document', response.status);
    return response.blob();
  }
}

export const apiClient = new ApiClient();
