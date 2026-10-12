import { LedgerEntry, LedgerFilters, PaginationState } from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockLedgerEntries } from '@/mocks/mockWallet';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemoryLedger: LedgerEntry[] = [...mockLedgerEntries];

export interface LedgerListResult {
  items: LedgerEntry[];
  pagination: PaginationState;
}

export const ledgerService = {
  /**
   * Internal helper to record mock ledger entries synchronously with wallet adjustments.
   */
  addMockLedgerEntry(entryInput: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
    const newEntry: LedgerEntry = {
      id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...entryInput,
    };
    inMemoryLedger.unshift(newEntry);
    return newEntry;
  },

  async getMasterDistributorLedger(
    masterDistributorId: string,
    filters?: LedgerFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<LedgerListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = inMemoryLedger.filter(
        (l) => l.entityId === masterDistributorId || l.walletId === `wlt_${masterDistributorId}`
      );

      if (filtered.length === 0) {
        filtered = inMemoryLedger.filter((l) => l.walletId === 'wlt_md_001');
      }

      if (filters?.direction && filters.direction !== 'ALL') {
        filtered = filtered.filter((l) => l.direction === filters.direction);
      }

      if (filters?.entryType && filters.entryType !== 'ALL') {
        filtered = filtered.filter((l) => l.entryType === filters.entryType);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.id.toLowerCase().includes(q) ||
            l.walletId.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
            (l.referenceId && l.referenceId.toLowerCase().includes(q))
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

    return apiClient.get<ApiResponse<LedgerListResult>>(`/wallets/entity/${masterDistributorId}/ledger`, {
      params: { type: filters?.entryType, fromDate: filters?.dateFrom, toDate: filters?.dateTo, page, pageSize } as any,
    });
  },

  async getDistributorLedger(
    distributorId: string,
    filters?: LedgerFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<LedgerListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = inMemoryLedger.filter(
        (l) =>
          l.entityId === distributorId ||
          l.entityId === 'ent_dist_01' ||
          l.walletId === `wlt_${distributorId}` ||
          l.walletId === 'wlt_dist_001'
      );

      if (filters?.direction && filters.direction !== 'ALL') {
        filtered = filtered.filter((l) => l.direction === filters.direction);
      }

      if (filters?.entryType && filters.entryType !== 'ALL') {
        filtered = filtered.filter((l) => l.entryType === filters.entryType);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.id.toLowerCase().includes(q) ||
            l.walletId.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
            (l.referenceId && l.referenceId.toLowerCase().includes(q))
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

    return apiClient.get<ApiResponse<LedgerListResult>>(`/wallets/entity/${distributorId}/ledger`, {
      params: { type: filters?.entryType, fromDate: filters?.dateFrom, toDate: filters?.dateTo, page, pageSize } as any,
    });
  },

  async getRetailerLedger(
    retailerId: string,
    filters?: LedgerFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<LedgerListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = inMemoryLedger.filter(
        (l) =>
          l.entityId === retailerId ||
          l.entityId === 'ret_001' ||
          l.entityId === 'RET001' ||
          l.walletId === `wlt_${retailerId}` ||
          l.walletId === 'wlt_ret_001'
      );

      if (filtered.length === 0) {
        filtered = inMemoryLedger.filter((l) => l.walletId === 'wlt_ret_001');
      }

      if (filters?.direction && filters.direction !== 'ALL') {
        filtered = filtered.filter((l) => l.direction === filters.direction);
      }

      if (filters?.entryType && filters.entryType !== 'ALL') {
        filtered = filtered.filter((l) => l.entryType === filters.entryType);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.id.toLowerCase().includes(q) ||
            l.walletId.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
            (l.referenceId && l.referenceId.toLowerCase().includes(q))
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

    return apiClient.get<ApiResponse<LedgerListResult>>(`/wallets/entity/${retailerId}/ledger`, {
      params: { type: filters?.entryType, fromDate: filters?.dateFrom, toDate: filters?.dateTo, page, pageSize } as any,
    });
  },

  async getLedgerEntries(
    filters?: LedgerFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<LedgerListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = [...inMemoryLedger];

      if (filters?.entityType && filters.entityType !== 'ALL') {
        filtered = filtered.filter((l) => l.entityType === filters.entityType);
      }

      if (filters?.direction && filters.direction !== 'ALL') {
        filtered = filtered.filter((l) => l.direction === filters.direction);
      }

      if (filters?.entryType && filters.entryType !== 'ALL') {
        filtered = filtered.filter((l) => l.entryType === filters.entryType);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.id.toLowerCase().includes(q) ||
            l.walletId.toLowerCase().includes(q) ||
            l.entityName.toLowerCase().includes(q) ||
            (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
            (l.referenceId && l.referenceId.toLowerCase().includes(q))
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

    return apiClient.get<ApiResponse<LedgerListResult>>('/wallets/entity/admin/ledger', {
      params: { type: filters?.entryType, fromDate: filters?.dateFrom, toDate: filters?.dateTo, page, pageSize } as any,
    });
  },

  async getPartyLedger(
    partyId: string,
    filters?: LedgerFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<LedgerListResult>> {
    if (APP_CONFIG.useMockData) {
      return this.getLedgerEntries(filters, page, pageSize);
    }
    return apiClient.get<ApiResponse<LedgerListResult>>(`/wallets/entity/${partyId}/ledger`, {
      params: { type: filters?.entryType, fromDate: filters?.dateFrom, toDate: filters?.dateTo, page, pageSize } as any,
    });
  },

  async getLedgerEntryById(id: string): Promise<ApiResponse<LedgerEntry | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const entry = inMemoryLedger.find((l) => l.id === id) || null;
      return {
        success: !!entry,
        data: entry,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<LedgerEntry>>(`/wallets/entity/${id}/ledger`);
  },
};
