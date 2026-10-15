import {
  Transaction,
  TransactionFilters,
  PaginationState,
  PayoutRequestInput,
  PayInRequestInput,
  PayoutChargeBreakdown,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockTransactions } from '@/mocks/mockTransactions';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

import { hierarchyService } from './hierarchyService';

const inMemoryTransactions: Transaction[] = [...mockTransactions];

function filterTransactionsByDateRange(items: Transaction[], dateRange?: string): Transaction[] {
  if (!dateRange) return items;

  const now = new Date();
  let start: Date | null = null;
  let end: Date = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (dateRange.includes('_to_')) {
    const [startValue, endValue] = dateRange.split('_to_');
    start = startValue ? new Date(`${startValue}T00:00:00`) : null;
    end = endValue ? new Date(`${endValue}T23:59:59.999`) : end;
  } else {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (dateRange === 'yesterday') {
      start.setDate(start.getDate() - 1);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    } else if (dateRange === '7d') {
      start.setDate(start.getDate() - 6);
    } else if (dateRange === '30d') {
      start.setDate(start.getDate() - 29);
    }
  }

  if (!start || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return items;
  return items.filter((transaction) => {
    const createdAt = new Date(transaction.createdAt).getTime();
    return createdAt >= start!.getTime() && createdAt <= end.getTime();
  });
}

export interface TransactionListResult {
  items: Transaction[];
  pagination: PaginationState;
  summary?: { totalAmount:number;successfulCount:number;failedCount:number;pendingCount:number;successRate:number;totalCount:number };
}
export interface TransactionFilterOptions { retailers:Array<{value:string;label:string}>;providers:Array<{value:string;label:string}> }

export const transactionService = {
  getFilterOptions: () => apiClient.get<ApiResponse<TransactionFilterOptions>>('/transactions/filter-options', { cache:'no-store' }),
  /**
   * Fetches network-scoped transactions for a Master Distributor.
   */
  async getTransactionsForMasterDistributor(
    masterDistributorId: string,
    filters?: TransactionFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<TransactionListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const networkRetailers = hierarchyService.getMasterDistributorRetailers(masterDistributorId);
      const networkDistributors = hierarchyService.getMasterDistributorDistributors(masterDistributorId);

      const retailerIds = new Set(networkRetailers.map((r) => r.id));
      const retailerNames = new Set(networkRetailers.map((r) => r.name.toLowerCase()));
      const distributorIds = new Set(networkDistributors.map((d) => d.id));
      const distributorNames = new Set(networkDistributors.map((d) => d.name.toLowerCase()));

      // Security scoping validation for filter parameters
      if (filters?.distributorId && filters.distributorId !== 'ALL') {
        const dst = hierarchyService.getDistributorById(filters.distributorId);
        if (!dst || dst.masterDistributorId !== masterDistributorId) {
          return {
            success: true,
            data: { items: [], pagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 } },
            timestamp: new Date().toISOString(),
          };
        }
      }

      if (filters?.retailerId && filters.retailerId !== 'ALL') {
        const ret = hierarchyService.getRetailerById(filters.retailerId);
        if (!ret || ret.masterDistributorId !== masterDistributorId) {
          return {
            success: true,
            data: { items: [], pagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 } },
            timestamp: new Date().toISOString(),
          };
        }
      }

      let filtered = inMemoryTransactions.filter((t) => {
        if (t.masterDistributorId) return t.masterDistributorId === masterDistributorId;
        if (t.retailerId && retailerIds.has(t.retailerId)) return true;
        if (t.retailerName && retailerNames.has(t.retailerName.toLowerCase())) return true;
        if (t.distributorName && distributorNames.has(t.distributorName.toLowerCase())) return true;
        return true;
      });

      if (filters?.type && filters.type !== 'ALL') {
        filtered = filtered.filter((t) => t.type === filters.type);
      }

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((t) => t.status === filters.status);
      }

      filtered = filterTransactionsByDateRange(filtered, filters?.dateRange);

      if (filters?.distributorId && filters.distributorId !== 'ALL') {
        const targetDst = hierarchyService.getDistributorById(filters.distributorId);
        filtered = filtered.filter(
          (t) =>
            t.distributorId === filters.distributorId ||
            (targetDst && t.distributorName?.toLowerCase() === targetDst.name.toLowerCase())
        );
      }

      if (filters?.retailerId && filters.retailerId !== 'ALL') {
        const targetRet = hierarchyService.getRetailerById(filters.retailerId);
        filtered = filtered.filter(
          (t) =>
            t.retailerId === filters.retailerId ||
            (targetRet && t.retailerName?.toLowerCase() === targetRet.name.toLowerCase())
        );
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.transactionRef.toLowerCase().includes(q) ||
            (t.orderId && t.orderId.toLowerCase().includes(q)) ||
            (t.utr && t.utr.toLowerCase().includes(q)) ||
            (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
            t.merchantName.toLowerCase().includes(q) ||
            (t.retailerName && t.retailerName.toLowerCase().includes(q)) ||
            (t.distributorName && t.distributorName.toLowerCase().includes(q)) ||
            (t.customerMobile && t.customerMobile.includes(q)) ||
            (t.customerName && t.customerName.toLowerCase().includes(q)) ||
            (t.beneficiaryName && t.beneficiaryName.toLowerCase().includes(q))
        );
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<ApiResponse<TransactionListResult>>(`/master-distributor/${masterDistributorId}/transactions`, {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  async getTransactionByIdForMasterDistributor(
    masterDistributorId: string,
    idOrRef: string
  ): Promise<ApiResponse<Transaction | null>> {
    const listRes = await this.getTransactionsForMasterDistributor(masterDistributorId, { searchQuery: idOrRef }, 1, 10);
    const tx = listRes.data?.items.find((t) => t.id === idOrRef || t.transactionRef === idOrRef) || null;

    if (!tx) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found or access denied for your Master Distributor account.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: tx,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Fetches network-scoped transactions for a Distributor.
   */
  async getTransactionsForDistributor(
    distributorId: string,
    filters?: TransactionFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<TransactionListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const dst = hierarchyService.getDistributorById(distributorId);
      if (!dst) {
        return {
          success: true,
          data: { items: [], pagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 } },
          timestamp: new Date().toISOString(),
        };
      }

      const networkRetailers = hierarchyService.getDistributorRetailers(distributorId);
      const retailerIds = new Set(networkRetailers.map((r) => r.id));
      const retailerNames = new Set(networkRetailers.map((r) => r.name.toLowerCase()));

      // Security scoping validation for filter parameters
      if (filters?.retailerId && filters.retailerId !== 'ALL') {
        const ret = hierarchyService.getRetailerById(filters.retailerId);
        if (!ret || ret.distributorId !== distributorId) {
          return {
            success: true,
            data: { items: [], pagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 } },
            timestamp: new Date().toISOString(),
          };
        }
      }

      let filtered = inMemoryTransactions.filter((t) => {
        if (t.distributorId) return t.distributorId === distributorId;
        if (t.retailerId && retailerIds.has(t.retailerId)) return true;
        if (t.retailerName && retailerNames.has(t.retailerName.toLowerCase())) return true;
        if (t.distributorName && t.distributorName.toLowerCase() === dst.name.toLowerCase()) return true;
        return true; // Fallback pool for rich demo metrics
      });

      if (filters?.type && filters.type !== 'ALL') {
        filtered = filtered.filter((t) => t.type === filters.type);
      }

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((t) => t.status === filters.status);
      }

      if (filters?.retailerId && filters.retailerId !== 'ALL') {
        const targetRet = hierarchyService.getRetailerById(filters.retailerId);
        filtered = filtered.filter(
          (t) =>
            t.retailerId === filters.retailerId ||
            (targetRet && t.retailerName?.toLowerCase() === targetRet.name.toLowerCase())
        );
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.transactionRef.toLowerCase().includes(q) ||
            (t.orderId && t.orderId.toLowerCase().includes(q)) ||
            (t.utr && t.utr.toLowerCase().includes(q)) ||
            (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
            t.merchantName.toLowerCase().includes(q) ||
            (t.retailerName && t.retailerName.toLowerCase().includes(q)) ||
            (t.customerMobile && t.customerMobile.includes(q)) ||
            (t.customerName && t.customerName.toLowerCase().includes(q)) ||
            (t.beneficiaryName && t.beneficiaryName.toLowerCase().includes(q))
        );
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.get<ApiResponse<TransactionListResult>>(`/distributor/${distributorId}/transactions`, {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  async getTransactionByIdForDistributor(
    distributorId: string,
    idOrRef: string
  ): Promise<ApiResponse<Transaction | null>> {
    const listRes = await this.getTransactionsForDistributor(distributorId, { searchQuery: idOrRef }, 1, 10);
    const tx = listRes.data?.items.find((t) => t.id === idOrRef || t.transactionRef === idOrRef) || null;

    if (!tx) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found or access denied for your Distributor account.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: tx,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Fetches network-scoped transactions for a Retailer.
   */
  async getTransactionsForRetailer(
    retailerId: string,
    filters?: TransactionFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<TransactionListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const targetRet = hierarchyService.getRetailerById(retailerId);

      let filtered = inMemoryTransactions.filter((t) => {
        if (t.retailerId) return t.retailerId === retailerId;
        if (targetRet && t.retailerName && t.retailerName.toLowerCase() === targetRet.name.toLowerCase()) return true;
        return true; // Fallback pool for demo metrics
      });

      if (filters?.type && filters.type !== 'ALL') {
        filtered = filtered.filter((t) => t.type === filters.type);
      }

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((t) => t.status === filters.status);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.transactionRef.toLowerCase().includes(q) ||
            (t.orderId && t.orderId.toLowerCase().includes(q)) ||
            (t.utr && t.utr.toLowerCase().includes(q)) ||
            (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
            (t.customerMobile && t.customerMobile.includes(q)) ||
            (t.customerName && t.customerName.toLowerCase().includes(q)) ||
            (t.beneficiaryName && t.beneficiaryName.toLowerCase().includes(q))
        );
      }

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
        },
        timestamp: new Date().toISOString(),
      };
    }

    void retailerId; // Backend derives and enforces the Retailer scope from the authenticated token.
    return apiClient.get<ApiResponse<TransactionListResult>>('/transactions', {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  async getTransactionByIdForRetailer(
    retailerId: string,
    idOrRef: string
  ): Promise<ApiResponse<Transaction | null>> {
    const listRes = await this.getTransactionsForRetailer(retailerId, { searchQuery: idOrRef }, 1, 10);
    const tx = listRes.data?.items.find((t) => t.id === idOrRef || t.transactionRef === idOrRef) || null;

    if (!tx) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found or access denied for your Retailer account.' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: tx,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Fetches transactions with filtering and pagination.
   */
  async getTransactions(
    filters?: TransactionFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<TransactionListResult>> {
    return apiClient.get<ApiResponse<TransactionListResult>>('/transactions', {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  /**
   * Fetches Pay-In specific transactions.
   */
  async getPayinTransactions(
    filters?: TransactionFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<TransactionListResult>> {
    return this.getTransactions({ ...filters, type: 'PAY_IN' }, page, pageSize);
  },

  /**
   * Fetches Pay-Out specific transactions.
   */
  async getPayoutTransactions(
    filters?: TransactionFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<TransactionListResult>> {
    return this.getTransactions({ ...filters, type: 'PAY_OUT' }, page, pageSize);
  },

  /**
   * Search transactions by keyword/ID.
   */
  async searchTransactions(query: string, filters?: TransactionFilters, page=1, pageSize=10): Promise<ApiResponse<TransactionListResult>> {
    return this.getTransactions({ ...filters, searchQuery: query }, page, pageSize);
  },

  /**
   * Get single transaction details by ID or transactionRef.
   */
  async getTransactionById(idOrRef: string): Promise<ApiResponse<Transaction | null>> {
    return apiClient.get<ApiResponse<Transaction>>(`/transactions/${idOrRef}`);
  },

  /**
   * Mock calculation for Payout charges (Fee + GST + TDS).
   */
  calculateMockPayoutCharges(amount: number): PayoutChargeBreakdown {
    const fee = Math.max(10.0, +(amount * 0.001).toFixed(2)); // 0.1% or min ₹10
    const gst = +(fee * 0.18).toFixed(2); // 18% GST on fee
    const tds = +(amount * 0.001).toFixed(2); // 0.1% TDS
    const totalDebit = +(amount + fee + gst + tds).toFixed(2);

    return {
      amount,
      fee,
      gst,
      tds,
      totalDebit,
    };
  },

  /**
   * Create mock Pay-In Payment Request.
   */
  async createMockPayinRequest(input: PayInRequestInput): Promise<ApiResponse<Transaction>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 400));
      const refNum = `QSP${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        transactionRef: refNum,
        orderId: input.orderId || `ORD_${Date.now()}`,
        merchantName: input.merchantId || 'Apex Pay Solutions',
        distributorName: input.distributorId,
        retailerName: input.retailerId,
        type: 'PAY_IN',
        amount: input.amount,
        fee: +(input.amount * 0.001).toFixed(2),
        gst: +(input.amount * 0.00018).toFixed(2),
        netAmount: +(input.amount * 0.99882).toFixed(2),
        status: 'PENDING',
        paymentMode: 'UPI',
        provider: 'Provider A',
        service: input.service || 'UPI Payment Request',
        channel: 'Web',
        customerName: input.customerName,
        customerMobile: input.customerMobile,
        customerEmail: input.customerEmail,
        createdAt: new Date().toISOString(),
        timeline: [
          { timestamp: new Date().toLocaleTimeString(), event: 'Payment Request Generated', description: 'Mock Pay-In payment request created', status: 'COMPLETED' },
          { timestamp: new Date().toLocaleTimeString(), event: 'Awaiting Payer Action', description: 'Payment link sent to payer', status: 'PENDING' },
        ],
      };

      inMemoryTransactions.unshift(newTx);

      return {
        success: true,
        data: newTx,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.post<ApiResponse<Transaction>>('/transactions/payin/request', input);
  },

  /**
   * Create mock Pay-Out initiation.
   */
  async createMockPayout(input: PayoutRequestInput): Promise<ApiResponse<Transaction>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 500));
      const charges = this.calculateMockPayoutCharges(input.amount);
      const refNum = `QSP${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        transactionRef: refNum,
        orderId: input.orderReference || `ORD_${Date.now()}`,
        referenceId: `REF_${Date.now()}`,
        utr: `UTR${Date.now()}`,
        merchantName: input.merchantId || 'Apex Pay Solutions',
        distributorName: input.distributorId,
        retailerName: input.retailerId,
        type: 'PAY_OUT',
        amount: input.amount,
        fee: charges.fee,
        gst: charges.gst,
        tds: charges.tds,
        netAmount: charges.totalDebit,
        status: 'PROCESSING',
        paymentMode: input.paymentMode,
        provider: 'Provider B',
        service: `${input.paymentMode} Disburser`,
        channel: 'Web',
        beneficiaryName: input.beneficiaryName,
        beneficiaryAccount: input.accountNumber ? `XXXXXX${input.accountNumber.slice(-4)}` : undefined,
        beneficiaryIfsc: input.ifscCode,
        beneficiaryBank: input.bankName || 'HDFC Bank',
        customerMobile: input.mobileNumber,
        accountNumberMasked: input.accountNumber ? `XXXXXX${input.accountNumber.slice(-4)}` : input.upiId,
        createdAt: new Date().toISOString(),
        timeline: [
          { timestamp: new Date().toLocaleTimeString(), event: 'Payout Initiated', description: 'Payout request received', status: 'COMPLETED' },
          { timestamp: new Date().toLocaleTimeString(), event: 'Wallet Validated', description: `Debited ₹${charges.totalDebit}`, status: 'COMPLETED' },
          { timestamp: new Date().toLocaleTimeString(), event: 'Sent to Bank Switch', description: 'Awaiting beneficiary bank acknowledgement', status: 'PENDING' },
        ],
        callbackSummary: {
          callbackReceived: false,
          processingStatus: 'AWAITING_CALLBACK',
          retryCount: 0,
        },
      };

      inMemoryTransactions.unshift(newTx);

      return {
        success: true,
        data: newTx,
        timestamp: new Date().toISOString(),
      };
    }

    return apiClient.post<ApiResponse<Transaction>>('/transactions/payout', input);
  },

  /**
   * Requery / Check Latest Status mock method.
   */
  async checkStatus(id: string): Promise<ApiResponse<Transaction>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 400));
      const tx = inMemoryTransactions.find((t) => t.id === id || t.transactionRef === id);
      if (tx) {
        // If it was PROCESSING or PENDING, simulate transition to SUCCESS
        if (tx.status === 'PROCESSING' || tx.status === 'PENDING') {
          tx.status = 'SUCCESS';
          tx.updatedAt = new Date().toISOString();
          tx.timeline?.push({
            timestamp: new Date().toLocaleTimeString(),
            event: 'Status Check Requery',
            description: 'Provider confirmed transaction SUCCESS',
            status: 'COMPLETED',
          });
        }
        return {
          success: true,
          data: { ...tx },
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: false,
        data: null as unknown as Transaction,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/check-status`);
  },
};
