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
}

class ApiClient {
  private baseUrl: string;

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

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionRaw =
        sessionStorage.getItem('qin-star-pay-auth-session-session') ||
        localStorage.getItem('qin-star-pay-auth-session-local');
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        return parsed.accessToken || null;
      }
    } catch {
      return null;
    }
    return null;
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
    const { params, authToken, headers, ...customOptions } = options;
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        ...customOptions,
        headers: this.getHeaders(headers, authToken),
      });

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
}

export const apiClient = new ApiClient();
