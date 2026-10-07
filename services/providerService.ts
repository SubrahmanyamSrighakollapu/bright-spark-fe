import {
  Provider,
  ProviderFilters,
  ProviderSummary,
  ApiConfiguration,
  ServiceConfiguration,
  RoutingRule,
  WebhookConfiguration,
  RoutingSimulationResult,
  TestConnectionResult,
  TransactionMode,
  IntegrationServiceType,
  EntityType,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import {
  mockProviders,
  mockApiConfigs,
  mockServiceConfigs,
  mockRoutingRules,
  mockWebhooks,
} from '@/mocks/mockIntegration';
import { notificationService } from './notificationService';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemoryProviders: Provider[] = [...mockProviders];
const inMemoryApiConfigs: ApiConfiguration[] = [...mockApiConfigs];
const inMemoryServiceConfigs: ServiceConfiguration[] = [...mockServiceConfigs];
const inMemoryRoutingRules: RoutingRule[] = [...mockRoutingRules];
const inMemoryWebhooks: WebhookConfiguration[] = [...mockWebhooks];

export interface ProviderListResult {
  items: Provider[];
  summary: ProviderSummary;
}

export const providerService = {
  /**
   * Calculate summary metrics from provider dataset.
   */
  async getSummary(): Promise<ApiResponse<ProviderSummary>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 100));

      const totalProviders = inMemoryProviders.length;
      const activeCount = inMemoryProviders.filter((p) => p.status === 'ACTIVE').length;
      const degradedCount = inMemoryProviders.filter((p) => p.healthStatus === 'DEGRADED').length;
      const downCount = inMemoryProviders.filter((p) => p.healthStatus === 'DOWN').length;

      const activeRates = inMemoryProviders.filter((p) => p.status === 'ACTIVE').map((p) => p.successRate);
      const avgSuccessRate = activeRates.length
        ? Math.round((activeRates.reduce((a, b) => a + b, 0) / activeRates.length) * 10) / 10
        : 0;

      return {
        success: true,
        data: {
          totalProviders,
          activeCount,
          degradedCount,
          downCount,
          avgSuccessRate,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as ProviderSummary, timestamp: new Date().toISOString() };
  },

  /**
   * Fetch provider list with filters.
   */
  async getProviders(filters?: ProviderFilters): Promise<ApiResponse<ProviderListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));

      let items = [...inMemoryProviders];

      if (filters?.providerType && filters.providerType !== 'ALL') {
        items = items.filter((p) => p.providerType === filters.providerType);
      }

      if (filters?.status && filters.status !== 'ALL') {
        items = items.filter((p) => p.status === filters.status);
      }

      if (filters?.environment && filters.environment !== 'ALL') {
        items = items.filter((p) => p.environment === filters.environment);
      }

      if (filters?.health && filters.health !== 'ALL') {
        items = items.filter((p) => p.healthStatus === filters.health);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.baseUrl.toLowerCase().includes(q)
        );
      }

      const summaryRes = await this.getSummary();
      const summary = summaryRes.data || {
        totalProviders: 0,
        activeCount: 0,
        degradedCount: 0,
        downCount: 0,
        avgSuccessRate: 0,
      };

      return {
        success: true,
        data: { items, summary },
        timestamp: new Date().toISOString(),
      };
    }

    if (!APP_CONFIG.useMockData) {
      try {
        const response = await apiClient.get<ApiResponse<any[]>>('/providers');
        if (response && response.data) {
          const rawItems = response.data;
          const items: Provider[] = rawItems.map((p: any) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            providerType: p.providerType || 'MULTI_SERVICE',
            environment: p.environment || 'SANDBOX',
            status: p.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
            supportedServices: ['PAY_IN', 'PAY_OUT', 'SETTLEMENT'],
            supportedModes: ['UPI', 'IMPS', 'NEFT'],
            baseUrl: p.baseUrl || 'https://api.qinstarpay.com',
            authType: 'BEARER_TOKEN',
            timeout: 5000,
            priority: 1,
            healthStatus: p.status === 'ACTIVE' ? 'OPERATIONAL' : 'DOWN',
            successRate: 99.4,
            avgResponseTime: 145,
            lastCheckedAt: new Date().toISOString(),
            createdAt: p.createdAt || new Date().toISOString(),
          }));

          const summary: ProviderSummary = {
            totalProviders: items.length,
            activeCount: items.filter((i) => i.status === 'ACTIVE').length,
            degradedCount: 0,
            downCount: items.filter((i) => i.status === 'INACTIVE').length,
            avgSuccessRate: 99.4,
          };

          return { success: true, data: { items, summary }, timestamp: new Date().toISOString() };
        }
      } catch (err) {
        console.warn('Backend /providers API error, fallback to mock:', err);
      }
    }

    return { success: false, data: null as unknown as ProviderListResult, timestamp: new Date().toISOString() };
  },

  /**
   * Fetch single provider by ID.
   */
  async getProviderById(id: string): Promise<ApiResponse<Provider | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 100));
      const prv = inMemoryProviders.find((p) => p.id === id) || null;
      return { success: !!prv, data: prv, timestamp: new Date().toISOString() };
    }
    return { success: false, data: null, timestamp: new Date().toISOString() };
  },

  /**
   * Toggle provider active/inactive status.
   */
  async toggleProviderStatus(id: string): Promise<ApiResponse<Provider>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      const prv = inMemoryProviders.find((p) => p.id === id);
      if (prv) {
        const newStatus = prv.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        prv.status = newStatus;
        prv.updatedAt = new Date().toISOString();

        // Trigger notification if provider disabled
        if (newStatus === 'INACTIVE') {
          notificationService.createNotification(
            'PROVIDER',
            'PROVIDER_DEGRADED',
            'WARNING',
            `Provider Disabled: ${prv.name}`,
            `${prv.name} (${prv.code}) has been marked INACTIVE. Active failover routing rules may be affected.`,
            'PROVIDER',
            prv.id,
            prv.name,
            'INTEGRATIONS',
            true,
            { providerId: prv.id, environment: prv.environment }
          );
        }

        return { success: true, data: { ...prv }, timestamp: new Date().toISOString() };
      }
    }
    return { success: false, data: null as unknown as Provider, timestamp: new Date().toISOString() };
  },

  /**
   * Perform mock test connection for a provider.
   */
  async testConnection(providerId: string): Promise<ApiResponse<TestConnectionResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 600));

      const prv = inMemoryProviders.find((p) => p.id === providerId);
      if (!prv) {
        return {
          success: false,
          data: {
            success: false,
            httpStatus: 404,
            responseTimeMs: 0,
            message: 'Provider not found in registry.',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }

      const isDown = prv.healthStatus === 'DOWN' || prv.status === 'INACTIVE';
      const isDegraded = prv.healthStatus === 'DEGRADED';
      const responseTimeMs = isDegraded ? Math.floor(Math.random() * 2000) + 3000 : Math.floor(Math.random() * 150) + 120;

      if (isDown) {
        return {
          success: true,
          data: {
            success: false,
            httpStatus: 504,
            responseTimeMs: 5000,
            message: `Gateway Timeout: ${prv.name} endpoint failed to respond.`,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }

      prv.lastCheckedAt = new Date().toISOString();

      return {
        success: true,
        data: {
          success: true,
          httpStatus: 200,
          responseTimeMs,
          message: `Connection Successful: ${prv.name} API endpoint responded in ${responseTimeMs}ms.`,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as TestConnectionResult, timestamp: new Date().toISOString() };
  },

  /**
   * API Configurations
   */
  async getApiConfigs(): Promise<ApiResponse<ApiConfiguration[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      return { success: true, data: [...inMemoryApiConfigs], timestamp: new Date().toISOString() };
    }
    return { success: false, data: [], timestamp: new Date().toISOString() };
  },

  async updateApiConfig(id: string, updates: Partial<ApiConfiguration>): Promise<ApiResponse<ApiConfiguration>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 250));
      const item = inMemoryApiConfigs.find((a) => a.id === id);
      if (item) {
        Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        return { success: true, data: { ...item }, timestamp: new Date().toISOString() };
      }
    }
    return { success: false, data: null as unknown as ApiConfiguration, timestamp: new Date().toISOString() };
  },

  /**
   * Service Configurations
   */
  async getServiceConfigs(): Promise<ApiResponse<ServiceConfiguration[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      return { success: true, data: [...inMemoryServiceConfigs], timestamp: new Date().toISOString() };
    }
    return { success: false, data: [], timestamp: new Date().toISOString() };
  },

  async updateServiceConfig(id: string, updates: Partial<ServiceConfiguration>): Promise<ApiResponse<ServiceConfiguration>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 250));
      const item = inMemoryServiceConfigs.find((s) => s.id === id);
      if (item) {
        Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        return { success: true, data: { ...item }, timestamp: new Date().toISOString() };
      }
    }
    return { success: false, data: null as unknown as ServiceConfiguration, timestamp: new Date().toISOString() };
  },

  /**
   * Transaction Failover Routing Rules
   */
  async getRoutingRules(): Promise<ApiResponse<RoutingRule[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      return { success: true, data: [...inMemoryRoutingRules], timestamp: new Date().toISOString() };
    }
    return { success: false, data: [], timestamp: new Date().toISOString() };
  },

  async createRoutingRule(
    service: IntegrationServiceType,
    transactionType: 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT',
    primaryProviderId: string,
    secondaryProviderId: string,
    minAmount: number,
    maxAmount: number,
    mode: TransactionMode | 'ALL',
    entityType: EntityType | 'ALL',
    priority = 1
  ): Promise<ApiResponse<RoutingRule>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));

      const primaryPrv = inMemoryProviders.find((p) => p.id === primaryProviderId);
      const secondaryPrv = inMemoryProviders.find((p) => p.id === secondaryProviderId);

      const newId = `ROUTE_${String(inMemoryRoutingRules.length + 1).padStart(3, '0')}`;
      const newRule: RoutingRule = {
        id: newId,
        service,
        transactionType,
        primaryProviderId,
        primaryProviderName: primaryPrv?.name || 'Primary Provider',
        secondaryProviderId,
        secondaryProviderName: secondaryPrv?.name || 'Secondary Provider',
        minAmount,
        maxAmount,
        mode,
        entityType,
        priority,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      inMemoryRoutingRules.unshift(newRule);
      return { success: true, data: newRule, timestamp: new Date().toISOString() };
    }
    return { success: false, data: null as unknown as RoutingRule, timestamp: new Date().toISOString() };
  },

  /**
   * Routing Simulator Tool
   */
  async simulateRouting(
    service: IntegrationServiceType,
    transactionType: 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT',
    amount: number,
    mode: TransactionMode | 'ALL' = 'UPI',
    entityType: EntityType | 'ALL' = 'MERCHANT'
  ): Promise<ApiResponse<RoutingSimulationResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 350));

      // Match rules by amount, service, mode, entityType
      const matched = inMemoryRoutingRules.find(
        (r) =>
          r.status === 'ACTIVE' &&
          r.transactionType === transactionType &&
          amount >= r.minAmount &&
          amount <= r.maxAmount &&
          (r.mode === 'ALL' || r.mode === mode) &&
          (r.entityType === 'ALL' || r.entityType === entityType)
      );

      if (matched) {
        const primaryPrv = inMemoryProviders.find((p) => p.id === matched.primaryProviderId);
        const isPrimaryActive = primaryPrv?.status === 'ACTIVE' && primaryPrv.healthStatus !== 'DOWN';

        if (isPrimaryActive) {
          return {
            success: true,
            data: {
              matchedRuleId: matched.id,
              selectedProviderId: matched.primaryProviderId,
              selectedProviderName: matched.primaryProviderName,
              fallbackProviderId: matched.secondaryProviderId,
              fallbackProviderName: matched.secondaryProviderName,
              reason: `Matched active rule ${matched.id}. Primary provider ${matched.primaryProviderName} is OPERATIONAL.`,
              simulatedAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          };
        } else {
          // Primary is degraded/down -> failover triggered to secondary
          return {
            success: true,
            data: {
              matchedRuleId: matched.id,
              selectedProviderId: matched.secondaryProviderId,
              selectedProviderName: matched.secondaryProviderName,
              fallbackProviderId: matched.primaryProviderId,
              fallbackProviderName: matched.primaryProviderName,
              reason: `Failover Triggered: Primary provider ${matched.primaryProviderName} is ${primaryPrv?.healthStatus || 'INACTIVE'}. Rerouted to secondary provider ${matched.secondaryProviderName}.`,
              simulatedAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          };
        }
      }

      // Default fallback if no specific rule matches
      const defaultPrv = inMemoryProviders.find((p) => p.status === 'ACTIVE') || inMemoryProviders[0];
      return {
        success: true,
        data: {
          matchedRuleId: 'DEFAULT_GLOBAL_RULE',
          selectedProviderId: defaultPrv.id,
          selectedProviderName: defaultPrv.name,
          fallbackProviderId: 'PRV_RZP_01',
          fallbackProviderName: 'Razorpay Enterprise',
          reason: `No custom amount/mode rule matched. Routed via default active gateway ${defaultPrv.name}.`,
          simulatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as RoutingSimulationResult, timestamp: new Date().toISOString() };
  },

  /**
   * Webhook Configurations & Mock Test Delivery
   */
  async getWebhooks(): Promise<ApiResponse<WebhookConfiguration[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      return { success: true, data: [...inMemoryWebhooks], timestamp: new Date().toISOString() };
    }
    return { success: false, data: [], timestamp: new Date().toISOString() };
  },

  async updateWebhook(id: string, updates: Partial<WebhookConfiguration>): Promise<ApiResponse<WebhookConfiguration>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 250));
      const item = inMemoryWebhooks.find((w) => w.id === id);
      if (item) {
        Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        return { success: true, data: { ...item }, timestamp: new Date().toISOString() };
      }
    }
    return { success: false, data: null as unknown as WebhookConfiguration, timestamp: new Date().toISOString() };
  },

  async testWebhook(webhookId: string): Promise<ApiResponse<TestConnectionResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 500));
      const wh = inMemoryWebhooks.find((w) => w.id === webhookId);
      if (wh) {
        wh.lastReceivedAt = new Date().toISOString();
        return {
          success: true,
          data: {
            success: true,
            httpStatus: 200,
            responseTimeMs: 185,
            message: `Webhook Mock Delivery Success: HTTP 200 OK received from ${wh.endpointUrl}`,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }
    }
    return { success: false, data: null as unknown as TestConnectionResult, timestamp: new Date().toISOString() };
  },
};
