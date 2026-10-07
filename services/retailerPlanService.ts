import { RetailerPlan } from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockRetailerPlans } from '@/mocks/mockPlans';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

class RetailerPlanService {
  private inMemoryPlans: RetailerPlan[] = [...mockRetailerPlans];

  async getPlans(): Promise<ApiResponse<RetailerPlan[]>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.get<ApiResponse<any[]>>('/plans');
        if (response && response.data) {
          const rawItems = response.data;
          const items: RetailerPlan[] = rawItems.map((p: any) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description || `${p.name} pricing & commission plan`,
            status: (p.status as any) || 'ACTIVE',
            commissionRules: p.commissionRules || [
              { id: 'rule_1', serviceType: 'ALL', isPercentage: true, value: 0.50, minAmount: 1, maxAmount: 100000 },
            ],
            effectiveFrom: p.effectiveFrom || new Date().toISOString().split('T')[0],
            assignedRetailersCount: p.assignedRetailersCount || 0,
            createdBy: p.createdBy || 'Admin',
            createdAt: p.createdAt || new Date().toISOString(),
          }));
          return { success: true, data: items, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('Backend /plans API error, fallback to mock:', err);
      }
    }

    return {
      success: true,
      data: [...this.inMemoryPlans],
      timestamp: new Date().toISOString(),
    };
  }

  async getActiveRetailerPlans(): Promise<ApiResponse<RetailerPlan[]>> {
    const res = await this.getPlans();
    if (res.success && res.data) {
      return {
        success: true,
        data: res.data.filter((p) => p.status === 'ACTIVE'),
        timestamp: new Date().toISOString(),
      };
    }
    const activePlans = this.inMemoryPlans.filter((p) => p.status === 'ACTIVE');
    return {
      success: true,
      data: activePlans,
      timestamp: new Date().toISOString(),
    };
  }

  async getPlanById(id: string): Promise<ApiResponse<RetailerPlan | null>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.get<ApiResponse<any>>(`/plans/${id}`);
        if (response && response.data) {
          const p = response.data;
          const plan: RetailerPlan = {
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description || `${p.name} plan`,
            status: (p.status as any) || 'ACTIVE',
            commissionRules: p.commissionRules || [],
            effectiveFrom: p.effectiveFrom || new Date().toISOString().split('T')[0],
            assignedRetailersCount: p.assignedRetailersCount || 0,
            createdBy: p.createdBy || 'Admin',
            createdAt: p.createdAt || new Date().toISOString(),
          };
          return { success: true, data: plan, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('Backend /plans/:id API error:', err);
      }
    }

    const plan = this.inMemoryPlans.find((p) => p.id === id || p.code === id) || null;
    return {
      success: !!plan,
      data: plan,
      timestamp: new Date().toISOString(),
    };
  }

  async createPlan(planData: Omit<RetailerPlan, 'id' | 'assignedRetailersCount' | 'createdAt'>): Promise<ApiResponse<RetailerPlan>> {
    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.post<ApiResponse<any>>('/plans', planData);
        if (response && response.data) {
          const p = response.data;
          const newPlan: RetailerPlan = {
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description || planData.description,
            status: (p.status as any) || 'ACTIVE',
            commissionRules: planData.commissionRules || [],
            effectiveFrom: planData.effectiveFrom || new Date().toISOString().split('T')[0],
            assignedRetailersCount: 0,
            createdBy: planData.createdBy || 'Admin',
            createdAt: p.createdAt || new Date().toISOString(),
          };
          return { success: true, data: newPlan, timestamp: new Date().toISOString() };
        }
      } catch (err: any) {
        return {
          success: false,
          error: {
            code: 'CREATE_PLAN_ERROR',
            message: err.message || 'Failed to create plan.',
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    const existingCode = this.inMemoryPlans.find((p) => p.code.toUpperCase() === planData.code.toUpperCase());
    if (existingCode) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_PLAN_CODE',
          message: `Plan code "${planData.code}" already exists. Please enter a unique code.`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    const newPlan: RetailerPlan = {
      ...planData,
      id: `plan_${Date.now().toString(36)}`,
      assignedRetailersCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.inMemoryPlans.unshift(newPlan);

    return {
      success: true,
      data: newPlan,
      timestamp: new Date().toISOString(),
    };
  }

  async updatePlan(id: string, updates: Partial<RetailerPlan>): Promise<ApiResponse<RetailerPlan>> {
    if (!APP_CONFIG.useMockData) {
      try {
        if (updates.status) {
          await apiClient.patch<ApiResponse<any>>(`/plans/${id}/status`, { status: updates.status });
        }
      } catch (err) {
        console.warn('Backend update plan error:', err);
      }
    }

    const index = this.inMemoryPlans.findIndex((p) => p.id === id);
    if (index === -1) {
      return {
        success: false,
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Retailer plan not found.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const updatedPlan: RetailerPlan = {
      ...this.inMemoryPlans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryPlans[index] = updatedPlan;

    return {
      success: true,
      data: updatedPlan,
      timestamp: new Date().toISOString(),
    };
  }

  async togglePlanStatus(id: string): Promise<ApiResponse<RetailerPlan>> {
    const res = await this.getPlanById(id);
    const plan = res.data;
    if (!plan) {
      return {
        success: false,
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Retailer plan not found.',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const newStatus = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updatePlan(id, { status: newStatus });
  }

  async getPlanSummary() {
    const res = await this.getPlans();
    const plans = res.data || this.inMemoryPlans;

    const totalPlans = plans.length;
    const activePlans = plans.filter((p) => p.status === 'ACTIVE').length;
    const inactivePlans = plans.filter((p) => p.status === 'INACTIVE').length;
    const assignedRetailers = plans.reduce((sum, p) => sum + (p.assignedRetailersCount || 0), 0);

    return {
      totalPlans,
      activePlans,
      inactivePlans,
      assignedRetailers,
    };
  }
}

export const retailerPlanService = new RetailerPlanService();
