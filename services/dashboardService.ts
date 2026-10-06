import { FullDashboardData, DashboardFilters } from '@/types/dashboard';
import { ApiResponse } from '@/types/common';
import { initialMockDashboardData } from '@/mocks/mockDashboard';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

export const dashboardService = {
  /**
   * Fetches operational dashboard datasets.
   * Supports filter application and mock/API switching.
   */
  async getDashboardData(filters?: DashboardFilters): Promise<ApiResponse<FullDashboardData>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.get<ApiResponse<FullDashboardData>>('/dashboard', {
          params: filters as unknown as Record<string, string | number | boolean>,
        });
        if (response && response.data) {
          return response;
        }
      } catch (err) {
        console.warn('Backend /dashboard API endpoint not available, serving mock dashboard UI data:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));

    let data = { ...initialMockDashboardData, lastRefreshedAt: new Date().toISOString() };

    // Filter simulation
    if (filters?.type && filters.type !== 'ALL') {
      const isPayIn = filters.type === 'PAY_IN';
      data = {
        ...data,
        metrics: {
          ...data.metrics,
          totalTransactions: isPayIn ? 8450 : 5128,
          successfulTransactions: isPayIn ? 8120 : 4722,
          failedTransactions: isPayIn ? 330 : 406,
        },
      };
    }

    if (filters?.status && filters.status !== 'ALL') {
      const isSuccess = filters.status === 'SUCCESS';
      data = {
        ...data,
        metrics: {
          ...data.metrics,
          totalTransactions: isSuccess ? 12842 : 736,
          successRate: isSuccess ? 100 : 0,
        },
      };
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  },
};
