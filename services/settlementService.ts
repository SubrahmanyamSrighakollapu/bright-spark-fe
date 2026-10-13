import {
  Settlement,
  SettlementBatch,
  SettlementReconciliation,
  SettlementFilters,
  BatchFilters,
  ReconciliationFilters,
  PaginationState,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import {
  mockSettlements,
  mockSettlementBatches,
  mockSettlementReconciliations,
} from '@/mocks/mockSettlement';
import { walletService } from './walletService';
import { ledgerService } from './ledgerService';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemorySettlements: Settlement[] = [...mockSettlements];
const inMemoryBatches: SettlementBatch[] = [...mockSettlementBatches];
const inMemoryReconciliations: SettlementReconciliation[] = [...mockSettlementReconciliations];

export interface SettlementOverviewData {
  pendingSettlement: number;
  eligibleAmount: number;
  processingAmount: number;
  settledToday: number;
  failedCount: number;
  totalSettledAmount: number;
}

export interface SettlementListResult {
  items: Settlement[];
  pagination: PaginationState;
  summary: SettlementOverviewData;
}

export interface BatchListResult {
  items: SettlementBatch[];
  pagination: PaginationState;
}

export interface ReconciliationListResult {
  items: SettlementReconciliation[];
  pagination: PaginationState;
}

export interface SettlementBeneficiary {
  id: string; accountType: 'CURRENT'|'SAVINGS'; contact: string; holderName: string;
  accountNumber: string; accountNumberLast4: string; bankName: string; ifsc: string;
  status: 'VALIDATED'|'PROVIDER_PENDING'|'VERIFIED'|'FAILED'; createdAt: string;
}
export interface RetailerSettlementOverview {
  wallet: { availableBalance:number; holdBalance:number; ledgerBalance:number; currency:string; status:string };
  registeredBanks:number; latestLimitRequest:null|{id:string;requestedLimit:number;status:string;reason:string;createdAt:string}; kycStatus:string;
}
export interface BeneficiaryInput { accountType:'CURRENT'|'SAVINGS';contact:string;holderName:string;accountNumber:string;confirmAccount:string;bankName:string;ifsc:string }

export const settlementService = {
  overview: () => apiClient.get<ApiResponse<RetailerSettlementOverview>>('/settlements/overview', { cache:'no-store' }),
  beneficiaries: (mobile?:string) => apiClient.get<ApiResponse<SettlementBeneficiary[]>>('/settlements/beneficiaries', { params: mobile ? {mobile}:undefined, cache:'no-store' }),
  validateBeneficiary: (input:BeneficiaryInput) => apiClient.post<ApiResponse<{valid:boolean;verificationStatus:string;providerVerificationPending:boolean;message:string}>>('/settlements/beneficiaries/validate',input),
  registerBeneficiary: (input:BeneficiaryInput) => apiClient.post<ApiResponse<SettlementBeneficiary>>('/settlements/beneficiaries',input),
  deleteBeneficiary: (id:string) => apiClient.delete<ApiResponse<{deleted:boolean}>>(`/settlements/beneficiaries/${id}`),
  createPayout: (input:{beneficiaryId:string;amount:number;mode:string;idempotencyKey:string}) => apiClient.post<ApiResponse<{id:string;transactionRef:string;status:string;amount:number;charge:number;gst:number;totalHeld:number;availableBalance:number}>>('/settlements/payouts',input),
  requestLimit: (input:{requestedLimit:number;reason:string}) => apiClient.post<ApiResponse<{id:string;status:string;requestedLimit:number;reason:string}>>('/settlements/limit-requests',input),
  /**
   * Fetch overview summary metrics.
   */
  async getOverview(): Promise<ApiResponse<SettlementOverviewData>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));

      const eligibleAmount = inMemorySettlements
        .filter((s) => s.status === 'ELIGIBLE')
        .reduce((acc, s) => acc + s.netSettlementAmount, 0);

      const processingAmount = inMemorySettlements
        .filter((s) => s.status === 'PROCESSING' || s.status === 'QUEUED')
        .reduce((acc, s) => acc + s.netSettlementAmount, 0);

      const settledToday = inMemorySettlements
        .filter((s) => s.status === 'SETTLED')
        .reduce((acc, s) => acc + s.netSettlementAmount, 0);

      const failedCount = inMemorySettlements.filter((s) => s.status === 'FAILED').length;

      const totalSettledAmount = inMemorySettlements
        .filter((s) => s.status === 'SETTLED')
        .reduce((acc, s) => acc + s.netSettlementAmount, 0);

      const pendingSettlement = eligibleAmount + processingAmount;

      return {
        success: true,
        data: {
          pendingSettlement,
          eligibleAmount,
          processingAmount,
          settledToday,
          failedCount,
          totalSettledAmount,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get('/settlements/overview');
  },

  /**
   * Fetch settlements with filtering & pagination.
   */
  async getSettlements(
    filters?: SettlementFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<SettlementListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = [...inMemorySettlements];

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((s) => s.status === filters.status);
      }

      if (filters?.entityType && filters.entityType !== 'ALL') {
        filtered = filtered.filter((s) => s.entityType === filters.entityType);
      }

      if (filters?.settlementCycle && filters.settlementCycle !== 'ALL') {
        filtered = filtered.filter((s) => s.settlementCycle === filters.settlementCycle);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.settlementId.toLowerCase().includes(q) ||
            s.entityName.toLowerCase().includes(q) ||
            (s.utr && s.utr.toLowerCase().includes(q)) ||
            (s.bankReference && s.bankReference.toLowerCase().includes(q))
        );
      }

      const overviewRes = await this.getOverview();
      const summary = overviewRes.data || {
        pendingSettlement: 0,
        eligibleAmount: 0,
        processingAmount: 0,
        settledToday: 0,
        failedCount: 0,
        totalSettledAmount: 0,
      };

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<ApiResponse<SettlementListResult>>('/settlements', {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  /**
   * Fetch single settlement detail by ID.
   */
  async getSettlementById(settlementId: string): Promise<ApiResponse<Settlement | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const s = inMemorySettlements.find((item) => item.settlementId === settlementId) || null;
      return {
        success: !!s,
        data: s,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<Settlement>>(`/settlements/${settlementId}`);
  },

  /**
   * Configurable calculation helper for gross-to-net settlement breakdown.
   */
  calculateMockSettlement(grossAmount: number, chargeRate = 0.01) {
    const charges = Math.round(grossAmount * chargeRate * 100) / 100;
    const tax = Math.round(charges * 0.18 * 100) / 100;
    const tds = Math.round(charges * 0.1 * 100) / 100;
    const netSettlementAmount = grossAmount - charges - tax - tds;
    return {
      grossAmount,
      charges,
      tax,
      tds,
      adjustments: 0,
      holdAmount: 0,
      netSettlementAmount,
    };
  },

  /**
   * Mock Process Settlement action.
   * Updates status, reduces wallet pendingSettlement, and creates immutable SETTLEMENT Ledger entry.
   */
  async processMockSettlement(
    settlementId: string,
    action: 'PROCESS' | 'FAIL' = 'PROCESS'
  ): Promise<ApiResponse<Settlement>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 400));
      const s = inMemorySettlements.find((item) => item.settlementId === settlementId);

      if (!s) {
        return { success: false, data: null as unknown as Settlement, timestamp: new Date().toISOString() };
      }

      if (action === 'FAIL') {
        s.status = 'FAILED';
        s.failureCode = 'PROVIDER_NODE_TIMEOUT';
        s.failureReason = 'Settlement clearance timed out at clearing gateway.';
        s.timeline.push({
          timestamp: new Date().toISOString(),
          event: 'Settlement Failed',
          status: 'FAILED',
          description: 'Cleared timed out at provider gateway node.',
        });
        return { success: true, data: { ...s }, timestamp: new Date().toISOString() };
      }

      // Process to SETTLED
      s.status = 'SETTLED';
      const mockUtr = `UTR20260903${Math.floor(10000 + Math.random() * 90000)}`;
      s.utr = mockUtr;
      s.bankReference = `REF_${s.provider.toUpperCase().replace(/\s+/g, '')}_${Date.now()}`;
      s.processedAt = new Date().toISOString();
      s.settledAt = new Date().toISOString();

      s.timeline.push({
        timestamp: new Date().toISOString(),
        event: 'Settlement Cleared',
        status: 'COMPLETED',
        description: `Settlement cleared via ${s.provider}. UTR: ${mockUtr}.`,
        actor: 'System Auto Processor',
      });

      // Integrate with Wallet & Ledger:
      // 1. Update wallet pendingSettlement
      const walletRes = await walletService.getWalletById(s.walletId);
      if (walletRes.success && walletRes.data) {
        const targetWallet = walletRes.data;
        targetWallet.pendingSettlement = Math.max(0, targetWallet.pendingSettlement - s.grossAmount);
      }

      // 2. Insert immutable SETTLEMENT Ledger Entry
      ledgerService.addMockLedgerEntry({
        walletId: s.walletId,
        entityId: s.entityId,
        entityType: s.entityType,
        entityName: s.entityName,
        referenceId: s.settlementId,
        entryType: 'SETTLEMENT',
        openingBalance: walletRes.data ? walletRes.data.availableBalance : 0,
        amount: s.netSettlementAmount,
        closingBalance: walletRes.data ? walletRes.data.availableBalance : 0,
        direction: 'DEBIT',
        description: `Settlement processed for ${s.settlementId} via ${s.provider} (UTR: ${mockUtr})`,
        createdBy: 'System Engine',
      });

      return { success: true, data: { ...s }, timestamp: new Date().toISOString() };
    }

    return apiClient.post<ApiResponse<Settlement>>(`/settlements/${settlementId}/process`, { action });
  },

  /**
   * Fetch settlement batches.
   */
  async getBatches(
    filters?: BatchFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<BatchListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = [...inMemoryBatches];
      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((b) => b.status === filters.status);
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (b) => b.batchId.toLowerCase().includes(q) || b.provider.toLowerCase().includes(q)
        );
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<BatchListResult>>('/settlements/batches', {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  /**
   * Fetch single batch details by ID.
   */
  async getBatchById(batchId: string): Promise<ApiResponse<SettlementBatch | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const b = inMemoryBatches.find((item) => item.batchId === batchId) || null;
      return {
        success: !!b,
        data: b,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<SettlementBatch>>(`/settlements/batches/${batchId}`);
  },

  /**
   * Fetch reconciliation records.
   */
  async getReconciliationRecords(
    filters?: ReconciliationFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReconciliationListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = [...inMemoryReconciliations];
      if (filters?.reconciliationStatus && filters.reconciliationStatus !== 'ALL') {
        filtered = filtered.filter((r) => r.reconciliationStatus === filters.reconciliationStatus);
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.reconciliationId.toLowerCase().includes(q) ||
            r.settlementId.toLowerCase().includes(q) ||
            r.entityName.toLowerCase().includes(q)
        );
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<ReconciliationListResult>>('/settlements/reconciliation', {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  /**
   * Mark reconciliation record as reconciled or send to manual review.
   */
  async reconcileMockSettlement(
    reconciliationId: string,
    action: 'MATCH' | 'MANUAL_REVIEW',
    remarks?: string
  ): Promise<ApiResponse<SettlementReconciliation>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const r = inMemoryReconciliations.find((item) => item.reconciliationId === reconciliationId);
      if (r) {
        if (action === 'MATCH') {
          r.reconciliationStatus = 'MATCHED';
          r.difference = 0;
          r.reconciledBy = 'Qin Star Admin';
          r.reconciledAt = new Date().toISOString();
          r.remarks = remarks || 'Manually reconciled and approved by finance admin.';
        } else {
          r.reconciliationStatus = 'MANUAL_REVIEW';
          r.remarks = remarks || 'Flagged for operational review.';
        }
        return { success: true, data: { ...r }, timestamp: new Date().toISOString() };
      }
      return {
        success: false,
        data: null as unknown as SettlementReconciliation,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.post<ApiResponse<SettlementReconciliation>>(
      `/settlements/reconciliation/${reconciliationId}/resolve`,
      { action, remarks }
    );
  },
};
