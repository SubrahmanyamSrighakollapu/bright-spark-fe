import {
  WalletAccount,
  WalletFilters,
  DebitRequest,
  BulkAdjustmentRow,
  PaginationState,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockWallets, mockDebitRequests } from '@/mocks/mockWallet';
import { ledgerService } from './ledgerService';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemoryWallets: WalletAccount[] = [...mockWallets];
const inMemoryDebitRequests: DebitRequest[] = [...mockDebitRequests];

export interface WalletListResult {
  items: WalletAccount[];
  pagination: PaginationState;
  summary: {
    totalAvailable: number;
    totalLedger: number;
    totalHold: number;
    totalPendingSettlement: number;
  };
}

export interface DebitRequestListResult {
  items: DebitRequest[];
  pagination: PaginationState;
}

export const walletService = {
  /**
   * Get single wallet balance for Header or Payout form.
   */
  async getBalance(): Promise<ApiResponse<{ availableBalance: number; lienAmount: number; unsettledAmount: number; currency: string }>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const masterWallet = inMemoryWallets.find((w) => w.walletId === 'wlt_master_001') || inMemoryWallets[0];
      return {
        success: true,
        data: {
          availableBalance: masterWallet ? masterWallet.availableBalance : 9953681.66,
          lienAmount: masterWallet ? masterWallet.holdBalance : 500000.0,
          unsettledAmount: masterWallet ? masterWallet.pendingSettlement : 1540000.0,
          currency: 'INR',
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get('/wallets/balance', { cache: 'no-store' });
  },

  /**
   * Fetch wallets with optional filtering and pagination.
   */
  async getWallets(
    filters?: WalletFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<WalletListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = [...inMemoryWallets];

      if (filters?.entityType && filters.entityType !== 'ALL') {
        filtered = filtered.filter((w) => w.entityType === filters.entityType);
      }

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((w) => w.status === filters.status);
      }

      if (filters?.distributorId && filters.distributorId !== 'ALL') {
        filtered = filtered.filter(
          (w) => w.parentName === filters.distributorId || w.entityId === filters.distributorId
        );
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (w) =>
            w.walletId.toLowerCase().includes(q) ||
            w.entityCode.toLowerCase().includes(q) ||
            w.entityName.toLowerCase().includes(q)
        );
      }

      const totalAvailable = filtered.reduce((acc, curr) => acc + curr.availableBalance, 0);
      const totalLedger = filtered.reduce((acc, curr) => acc + curr.ledgerBalance, 0);
      const totalHold = filtered.reduce((acc, curr) => acc + curr.holdBalance, 0);
      const totalPendingSettlement = filtered.reduce((acc, curr) => acc + curr.pendingSettlement, 0);

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const items = filtered.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          items,
          pagination: { page, pageSize, totalItems, totalPages },
          summary: { totalAvailable, totalLedger, totalHold, totalPendingSettlement },
        },
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<ApiResponse<WalletListResult>>('/wallets', {
      params: { role: filters?.entityType, status: filters?.status, search: filters?.searchQuery, page, pageSize } as any,
    });
  },

  async getMasterDistributorWallet(masterDistributorId: string): Promise<ApiResponse<WalletAccount>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const wallet = inMemoryWallets.find(
        (w) => w.entityId === masterDistributorId || w.walletId === `wlt_${masterDistributorId}`
      ) || {
        walletId: `wlt_${masterDistributorId}`,
        entityId: masterDistributorId,
        entityType: 'MASTER',
        entityName: 'Apex Financial Services Master Pvt Ltd',
        entityCode: 'MD001',
        availableBalance: 245800.00,
        ledgerBalance: 250800.00,
        holdBalance: 5000.00,
        pendingSettlement: 14500.00,
        currency: 'INR',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: wallet as WalletAccount,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<WalletAccount>>(`/wallets/entity/${masterDistributorId}`, { cache: 'no-store' });
  },

  async getDistributorWallet(distributorId: string): Promise<ApiResponse<WalletAccount>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const wallet = inMemoryWallets.find(
        (w) =>
          w.entityId === distributorId ||
          w.entityId === 'ent_dist_01' ||
          w.walletId === `wlt_${distributorId}` ||
          w.walletId === 'wlt_dst_001'
      ) || {
        walletId: `wlt_dst_001`,
        entityId: distributorId,
        entityType: 'DISTRIBUTOR',
        entityName: 'North Zone Distributor',
        entityCode: 'DST001',
        availableBalance: 85200.00,
        ledgerBalance: 87650.00,
        holdBalance: 0.00,
        pendingSettlement: 2450.00,
        currency: 'INR',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: wallet as WalletAccount,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<WalletAccount>>(`/wallets/entity/${distributorId}`, { cache: 'no-store' });
  },

  async getRetailerWallet(retailerId: string): Promise<ApiResponse<WalletAccount>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const wallet = inMemoryWallets.find(
        (w) =>
          w.entityId === retailerId ||
          w.walletId === `wlt_${retailerId}` ||
          w.walletId === 'wlt_ret_001'
      ) || {
        walletId: `wlt_ret_001`,
        entityId: retailerId,
        entityType: 'RETAILER',
        entityName: 'Metro Store #01',
        entityCode: 'RET001',
        availableBalance: 45350.00,
        ledgerBalance: 46350.00,
        holdBalance: 1000.00,
        pendingSettlement: 0.00,
        currency: 'INR',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: wallet as WalletAccount,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<WalletAccount>>(`/wallets/entity/${retailerId}`, { cache: 'no-store' });
  },

  async getWalletByEntityId(entityId: string): Promise<ApiResponse<WalletAccount | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const wallet = inMemoryWallets.find((w) => w.entityId === entityId || w.entityCode === entityId) || null;
      return {
        success: !!wallet,
        data: wallet,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<WalletAccount>>(`/wallets/entity/${entityId}`, { cache: 'no-store' });
  },

  async getWalletById(walletId: string): Promise<ApiResponse<WalletAccount | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const wallet = inMemoryWallets.find((w) => w.walletId === walletId) || null;
      return {
        success: !!wallet,
        data: wallet,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<WalletAccount>>(`/wallets/entity/${walletId}`);
  },

  /**
   * Controlled Credit Adjustment.
   */
  async creditWallet(
    partyId: string,
    amount: number,
    reason: string,
    reference?: string,
    createdBy = 'Bright Spark Admin'
  ): Promise<ApiResponse<WalletAccount>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 350));
      const wallet = inMemoryWallets.find((w) => w.walletId === partyId || w.entityId === partyId);
      if (wallet) {
        const openingBalance = wallet.availableBalance;
        wallet.availableBalance += amount;
        wallet.ledgerBalance += amount;
        wallet.updatedAt = new Date().toISOString();

        ledgerService.addMockLedgerEntry({
          walletId: wallet.walletId,
          entityId: wallet.entityId,
          entityType: wallet.entityType,
          entityName: wallet.entityName,
          referenceId: reference || `CR_REF_${Date.now()}`,
          entryType: 'WALLET_CREDIT',
          openingBalance,
          amount,
          closingBalance: wallet.availableBalance,
          direction: 'CREDIT',
          description: reason || 'Manual credit adjustment',
          createdBy,
        });

        return { success: true, data: { ...wallet }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as WalletAccount, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<WalletAccount>>(`/wallets/entity/${partyId}/credit`, {
      amount,
      referenceType: 'MANUAL_CREDIT',
      referenceId: reference,
      narration: reason,
    });
  },

  /**
   * Controlled Debit Adjustment.
   */
  async debitWallet(
    partyId: string,
    amount: number,
    reason: string,
    reference?: string,
    createdBy = 'Bright Spark Admin'
  ): Promise<ApiResponse<WalletAccount>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 350));
      const wallet = inMemoryWallets.find((w) => w.walletId === partyId || w.entityId === partyId);
      if (wallet) {
        if (amount > wallet.availableBalance) {
          throw new Error('Debit amount cannot exceed available wallet balance.');
        }

        const openingBalance = wallet.availableBalance;
        wallet.availableBalance -= amount;
        wallet.ledgerBalance -= amount;
        wallet.updatedAt = new Date().toISOString();

        ledgerService.addMockLedgerEntry({
          walletId: wallet.walletId,
          entityId: wallet.entityId,
          entityType: wallet.entityType,
          entityName: wallet.entityName,
          referenceId: reference || `DB_REF_${Date.now()}`,
          entryType: 'WALLET_DEBIT',
          openingBalance,
          amount,
          closingBalance: wallet.availableBalance,
          direction: 'DEBIT',
          description: reason || 'Manual debit adjustment',
          createdBy,
        });

        return { success: true, data: { ...wallet }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as WalletAccount, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<WalletAccount>>(`/wallets/entity/${partyId}/debit`, {
      amount,
      referenceType: 'MANUAL_DEBIT',
      referenceId: reference,
      narration: reason,
    });
  },

  async bulkAdjustWallets(
    rows: BulkAdjustmentRow[],
    createdBy = 'Bright Spark Admin'
  ): Promise<ApiResponse<{ processedRows: number; failedRows: number }>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 500));
      let processed = 0;
      let failed = 0;

      for (const row of rows) {
        if (!row.isValid) {
          failed++;
          continue;
        }

        const wallet = inMemoryWallets.find((w) => w.entityId === row.entityId || w.entityCode === row.entityId);
        if (wallet) {
          if (row.operationType === 'CREDIT') {
            await this.creditWallet(wallet.walletId, row.amount, row.reason, row.reference, createdBy);
            processed++;
          } else {
            if (row.amount <= wallet.availableBalance) {
              await this.debitWallet(wallet.walletId, row.amount, row.reason, row.reference, createdBy);
              processed++;
            } else {
              failed++;
            }
          }
        } else {
          failed++;
        }
      }

      return {
        success: true,
        data: { processedRows: processed, failedRows: failed },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.post<ApiResponse<{ processedRows: number; failedRows: number }>>('/wallets/bulk-adjust', { rows });
  },

  /**
   * Hold or Release Funds
   */
  async holdFunds(
    partyId: string,
    mode: 'HOLD' | 'RELEASE',
    amount: number,
    reason: string
  ): Promise<ApiResponse<any>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const wallet = inMemoryWallets.find((w) => w.walletId === partyId || w.entityId === partyId);
      if (wallet) {
        if (mode === 'HOLD') {
          if (amount > wallet.availableBalance) throw new Error('Cannot hold amount exceeding available balance.');
          wallet.availableBalance -= amount;
          wallet.holdBalance += amount;
        } else {
          if (amount > wallet.holdBalance) throw new Error('Cannot release amount exceeding hold balance.');
          wallet.availableBalance += amount;
          wallet.holdBalance -= amount;
        }
        return { success: true, data: wallet, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null, timestamp: new Date().toISOString() };
    }
    return apiClient.post(`/wallets/entity/${partyId}/hold`, { mode, amount, reason });
  },

  /**
   * Freeze or Unfreeze Wallet Status
   */
  async toggleWalletStatus(partyId: string, status: 'ACTIVE' | 'FROZEN', reason: string): Promise<ApiResponse<any>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      const wallet = inMemoryWallets.find((w) => w.walletId === partyId || w.entityId === partyId);
      if (wallet) {
        wallet.status = status;
        wallet.updatedAt = new Date().toISOString();
        return { success: true, data: wallet, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null, timestamp: new Date().toISOString() };
    }
    return apiClient.patch(`/wallets/entity/${partyId}/status`, { status, reason });
  },

  async freezeWallet(partyId: string, reason = 'Suspicious activity lock'): Promise<ApiResponse<any>> {
    return this.toggleWalletStatus(partyId, 'FROZEN', reason);
  },

  async unfreezeWallet(partyId: string, reason = 'Administrative restore'): Promise<ApiResponse<any>> {
    return this.toggleWalletStatus(partyId, 'ACTIVE', reason);
  },

  // DEBIT REQUESTS MODULE
  async getDebitRequests(
    status = 'ALL',
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<DebitRequestListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));
      let filtered = [...inMemoryDebitRequests];
      if (status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === status);
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
    return apiClient.get<ApiResponse<DebitRequestListResult>>('/wallets/debit-requests', {
      params: { status, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  async createDebitRequest(input: {
    entityId: string;
    walletId?: string;
    amount: number;
    reason: string;
    remarks?: string;
  }): Promise<ApiResponse<DebitRequest>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const wallet = inMemoryWallets.find((w) => w.walletId === input.walletId || w.entityId === input.entityId);

      const newReq: DebitRequest = {
        id: `dbt_req_${Date.now()}`,
        entityId: wallet ? wallet.entityId : input.entityId,
        entityType: wallet ? wallet.entityType : 'MERCHANT',
        entityName: wallet ? wallet.entityName : 'Commercial Entity',
        walletId: wallet ? wallet.walletId : (input.walletId || `wlt_${input.entityId}`),
        amount: input.amount,
        reason: input.reason,
        status: 'PENDING',
        requestedBy: 'Operations Lead',
        requestedAt: new Date().toISOString(),
        remarks: input.remarks,
      };

      inMemoryDebitRequests.unshift(newReq);
      return { success: true, data: newReq, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<DebitRequest>>('/wallets/debit-requests', {
      partyId: input.entityId,
      amount: input.amount,
      reason: input.reason,
    });
  },

  async reviewDebitRequest(
    requestId: string,
    action: 'APPROVE' | 'REJECT' | 'PROCESS',
    remarks?: string
  ): Promise<ApiResponse<DebitRequest>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 350));
      const req = inMemoryDebitRequests.find((r) => r.id === requestId);
      if (req) {
        if (action === 'APPROVE') {
          req.status = 'APPROVED';
          req.reviewedBy = 'Super Admin';
          req.reviewedAt = new Date().toISOString();
          req.remarks = remarks || 'Debit request approved by accounts team. Awaiting processing.';
        } else if (action === 'REJECT') {
          req.status = 'REJECTED';
          req.rejectedBy = 'Super Admin';
          req.rejectedAt = new Date().toISOString();
          req.rejectionReason = remarks || 'Debit request rejected by accounts team.';
          req.remarks = remarks;
        } else if (action === 'PROCESS') {
          req.status = 'PROCESSED';
          req.processedAt = new Date().toISOString();
          req.reviewedBy = req.reviewedBy || 'Super Admin';
          req.reviewedAt = req.reviewedAt || new Date().toISOString();
          req.remarks = remarks || 'Debit request processed and debited from wallet.';

          await this.debitWallet(
            req.walletId,
            req.amount,
            `Debit Request Processed: ${req.reason}`,
            req.id,
            'Super Admin'
          );
        }

        return { success: true, data: { ...req }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as DebitRequest, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<DebitRequest>>(`/wallets/debit-requests/${requestId}/review`, {
      action: action === 'PROCESS' ? 'APPROVE' : action,
      rejectionReason: remarks,
    });
  },
};
