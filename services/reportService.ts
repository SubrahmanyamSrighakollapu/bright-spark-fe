import {
  TransactionReportRecord,
  SettlementStatus,
  LedgerEntry,
  Settlement,
  WalletAccount,
  ReportFilters,
  ApiPerformanceFilters,
  TransactionReportSummary,
  LedgerReportSummary,
  SettlementReportSummary,
  BalanceReportSummary,
  AccountSummary,
  ApiPerformanceSummary,
  PaginationState,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { transactionService } from './transactionService';
import { ledgerService } from './ledgerService';
import { walletService } from './walletService';
import { settlementService } from './settlementService';
import { APP_CONFIG } from '@/config';

import { hierarchyService } from './hierarchyService';
import { commissionService, MasterDistributorCommissionRecord } from './commissionService';

export interface ReportListResult<T, S> {
  items: T[];
  pagination: PaginationState;
  summary: S;
}

export interface MasterDistributorReportRow {
  id: string;
  code: string;
  name: string;
  businessName: string;
  parentName?: string;
  retailersCount?: number;
  activeRetailers?: number;
  pendingRetailers?: number;
  todayTxns?: number;
  volume?: number;
  commission?: number;
  planName?: string;
  kycStatus?: string;
  approvalStatus?: string;
  accountStatus?: string;
  createdAt: string;
}

export const reportService = {
  /**
   * Master Distributor Network-Scoped Transaction Report
   */
  async getScopedTransactionReport(
    masterDistributorId: string,
    filters?: ReportFilters,
    mode: 'ALL' | 'LIVE' | 'UNSETTLED' | 'ORDERS' = 'ALL',
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<TransactionReportRecord, TransactionReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const txRes = await transactionService.getTransactionsForMasterDistributor(masterDistributorId, {}, 1, 100);
      const rawItems = txRes.data?.items || [];

      let items: TransactionReportRecord[] = rawItems.map((t, idx) => {
        const gst = t.gst ?? Number((t.fee * 0.18).toFixed(2));
        const total = Number((t.amount + t.fee + gst).toFixed(2));
        const retailerId = t.retailerId || `RET_${1001 + (idx % 5)}`;
        const retailerName = t.retailerName || t.merchantName || 'Metro Store #12';
        const mobileNumber = t.customerMobile || `98765${43210 + idx}`;
        const transactionId = t.transactionRef || t.id;
        const apiReferenceId = t.referenceId || t.orderId || `API_REF_${t.id}`;
        const serviceType = t.service || `${t.type === 'PAY_IN' ? 'Pay-In' : 'Pay-Out'} (${t.paymentMode})`;
        const responseMessage = t.status === 'SUCCESS'
          ? 'Transaction processed successfully'
          : (t.failureReason || t.failureCode || 'Provider processing error');
        
        let settlementStatus: SettlementStatus = 'PENDING';
        if (t.status === 'SUCCESS') {
          settlementStatus = idx % 2 === 0 ? 'SETTLED' : 'ELIGIBLE';
        } else if (t.status === 'FAILED') {
          settlementStatus = 'NOT_ELIGIBLE';
        }

        const settlementDate = settlementStatus === 'SETTLED' ? (t.updatedAt || t.createdAt) : undefined;
        const rrnOrUtr = t.utr || (t.status === 'SUCCESS' ? `UTR991823${idx + 10}` : undefined);
        const bankReferenceNumber = (t.providerResponse?.providerRef as string) || (rrnOrUtr ? `BKREF_${rrnOrUtr}` : undefined);
        const remarks = t.status === 'SUCCESS'
          ? `Settled in batch STB_20260903_00${(idx % 3) + 1}`
          : (t.status === 'FAILED' ? 'Reversed after bank clearance failure' : 'Awaiting provider clearance');

        return {
          retailerName,
          retailerId,
          mobileNumber,
          transactionId,
          apiReferenceId,
          serviceType,
          status: t.status,
          responseMessage,
          requestedAt: t.createdAt,
          updatedAt: t.updatedAt || t.createdAt,
          transactionAmount: t.amount,
          transactionCharges: t.fee,
          gstAmount: gst,
          totalAmount: total,
          settlementStatus,
          settlementDate,
          paymentMode: t.paymentMode,
          rrnOrUtr,
          bankReferenceNumber,
          remarks,
        };
      });

      if (filters?.transactionType && filters.transactionType !== 'ALL') {
        items = items.filter((t) => t.serviceType.toUpperCase().includes(filters.transactionType!));
      }

      if (filters?.status && filters.status !== 'ALL') {
        items = items.filter((t) => t.status === filters.status);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (t) =>
            t.transactionId.toLowerCase().includes(q) ||
            t.retailerName.toLowerCase().includes(q) ||
            t.retailerId.toLowerCase().includes(q) ||
            t.mobileNumber.toLowerCase().includes(q) ||
            t.apiReferenceId.toLowerCase().includes(q)
        );
      }

      const totalTransactions = items.length;
      const totalAmount = items.reduce((acc, t) => acc + t.transactionAmount, 0);

      const successfulItems = items.filter((t) => t.status === 'SUCCESS');
      const successfulCount = successfulItems.length;
      const successfulAmount = successfulItems.reduce((acc, t) => acc + t.transactionAmount, 0);

      const failedItems = items.filter((t) => t.status === 'FAILED');
      const failedCount = failedItems.length;
      const failedAmount = failedItems.reduce((acc, t) => acc + t.transactionAmount, 0);

      const pendingItems = items.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING');
      const pendingCount = pendingItems.length;
      const pendingAmount = pendingItems.reduce((acc, t) => acc + t.transactionAmount, 0);

      const successRate = totalTransactions > 0 ? Math.round((successfulCount / totalTransactions) * 1000) / 10 : 100;

      const summary: TransactionReportSummary = {
        totalTransactions,
        totalAmount,
        successfulCount,
        successfulAmount,
        failedCount,
        failedAmount,
        pendingCount,
        pendingAmount,
        successRate,
      };

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as ReportListResult<TransactionReportRecord, TransactionReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Master Distributor Scoped Distributor Report
   */
  async getScopedDistributorReport(
    masterDistributorId: string,
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<MasterDistributorReportRow, { totalDistributors: number; totalRetailers: number; totalVolume: number }>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const distributors = hierarchyService.getMasterDistributorDistributors(masterDistributorId);

      let items: MasterDistributorReportRow[] = distributors.map((d, idx) => {
        const dstRetailers = hierarchyService.getDistributorRetailers(d.id);
        const activeCount = dstRetailers.filter((r) => r.accountStatus === 'ACTIVE').length;
        const pendingCount = dstRetailers.filter((r) => r.approvalStatus === 'PENDING_APPROVAL').length;
        const volume = d.code === 'DST001' ? 124500.0 : 45000.0 + idx * 10000;

        return {
          id: d.id,
          code: d.code,
          name: d.name,
          businessName: d.businessName,
          retailersCount: dstRetailers.length,
          activeRetailers: activeCount,
          pendingRetailers: pendingCount,
          todayTxns: 12 + idx * 5,
          volume,
          commission: +(volume * 0.0015).toFixed(2),
          kycStatus: d.kycStatus || 'APPROVED',
          approvalStatus: d.approvalStatus || 'APPROVED',
          accountStatus: d.status,
          createdAt: d.createdAt,
        };
      });

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.code.toLowerCase().includes(q) ||
            d.businessName.toLowerCase().includes(q)
        );
      }

      const totalDistributors = items.length;
      const totalRetailers = items.reduce((sum, d) => sum + (d.retailersCount || 0), 0);
      const totalVolume = items.reduce((sum, d) => sum + (d.volume || 0), 0);

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary: { totalDistributors, totalRetailers, totalVolume },
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as ReportListResult<MasterDistributorReportRow, { totalDistributors: number; totalRetailers: number; totalVolume: number }>, timestamp: new Date().toISOString() };
  },

  /**
   * Master Distributor Scoped Retailer Report
   */
  async getScopedRetailerReport(
    masterDistributorId: string,
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<MasterDistributorReportRow, { totalRetailers: number; activeRetailers: number; totalVolume: number }>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const retailers = hierarchyService.getMasterDistributorRetailers(masterDistributorId);

      let items: MasterDistributorReportRow[] = retailers.map((r, idx) => {
        const parentDst = hierarchyService.getDistributorById(r.distributorId);
        const volume = r.accountStatus === 'ACTIVE' ? 18500.0 + idx * 4000 : 0;

        return {
          id: r.id,
          code: r.code,
          name: r.name,
          businessName: r.businessName,
          parentName: parentDst?.name || 'Distributor',
          planName: r.planId === 'plan_prm_02' ? 'Premium Retailer Plan' : 'Standard Retailer Plan',
          todayTxns: r.accountStatus === 'ACTIVE' ? 8 + idx : 0,
          volume,
          commission: +(volume * 0.0025).toFixed(2),
          kycStatus: r.kycStatus || 'APPROVED',
          approvalStatus: r.approvalStatus || 'APPROVED',
          accountStatus: r.accountStatus,
          createdAt: r.createdAt,
        };
      });

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.code.toLowerCase().includes(q) ||
            r.businessName.toLowerCase().includes(q)
        );
      }

      const totalRetailers = items.length;
      const activeRetailers = items.filter((r) => r.accountStatus === 'ACTIVE').length;
      const totalVolume = items.reduce((sum, r) => sum + (r.volume || 0), 0);

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary: { totalRetailers, activeRetailers, totalVolume },
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as ReportListResult<MasterDistributorReportRow, { totalRetailers: number; activeRetailers: number; totalVolume: number }>, timestamp: new Date().toISOString() };
  },

  /**
   * Transaction Analytical Report
   */
  async getTransactionReport(
    filters?: ReportFilters,
    mode: 'ALL' | 'LIVE' | 'UNSETTLED' | 'ORDERS' = 'ALL',
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<TransactionReportRecord, TransactionReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const txRes = await transactionService.getTransactions({}, 1, 100);
      const rawItems = txRes.data?.items || [];

      let items: TransactionReportRecord[] = rawItems.map((t, idx) => {
        const gst = t.gst ?? Number((t.fee * 0.18).toFixed(2));
        const total = Number((t.amount + t.fee + gst).toFixed(2));
        const retailerId = t.retailerId || `RET_${1001 + (idx % 5)}`;
        const retailerName = t.retailerName || t.merchantName || 'Metro Store #12';
        const mobileNumber = t.customerMobile || `98765${43210 + idx}`;
        const transactionId = t.transactionRef || t.id;
        const apiReferenceId = t.referenceId || t.orderId || `API_REF_${t.id}`;
        const serviceType = t.service || `${t.type === 'PAY_IN' ? 'Pay-In' : 'Pay-Out'} (${t.paymentMode})`;
        const responseMessage = t.status === 'SUCCESS'
          ? 'Transaction processed successfully'
          : (t.failureReason || t.failureCode || 'Provider processing error');
        
        let settlementStatus: SettlementStatus = 'PENDING';
        if (t.status === 'SUCCESS') {
          settlementStatus = idx % 2 === 0 ? 'SETTLED' : 'ELIGIBLE';
        } else if (t.status === 'FAILED') {
          settlementStatus = 'NOT_ELIGIBLE';
        }

        const settlementDate = settlementStatus === 'SETTLED' ? (t.updatedAt || t.createdAt) : undefined;
        const rrnOrUtr = t.utr || (t.status === 'SUCCESS' ? `UTR991823${idx + 10}` : undefined);
        const bankReferenceNumber = (t.providerResponse?.providerRef as string) || (rrnOrUtr ? `BKREF_${rrnOrUtr}` : undefined);
        const remarks = t.status === 'SUCCESS'
          ? `Settled in batch STB_20260903_00${(idx % 3) + 1}`
          : (t.status === 'FAILED' ? 'Reversed after bank clearance failure' : 'Awaiting provider clearance');

        return {
          retailerName,
          retailerId,
          mobileNumber,
          transactionId,
          apiReferenceId,
          serviceType,
          status: t.status,
          responseMessage,
          requestedAt: t.createdAt,
          updatedAt: t.updatedAt || t.createdAt,
          transactionAmount: t.amount,
          transactionCharges: t.fee,
          gstAmount: gst,
          totalAmount: total,
          settlementStatus,
          settlementDate,
          paymentMode: t.paymentMode,
          rrnOrUtr,
          bankReferenceNumber,
          remarks,
        };
      });

      if (filters?.transactionType && filters.transactionType !== 'ALL') {
        items = items.filter((t) => t.serviceType.toUpperCase().includes(filters.transactionType!));
      }

      if (filters?.status && filters.status !== 'ALL') {
        items = items.filter((t) => t.status === filters.status);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (t) =>
            t.transactionId.toLowerCase().includes(q) ||
            t.retailerName.toLowerCase().includes(q) ||
            t.retailerId.toLowerCase().includes(q) ||
            t.mobileNumber.toLowerCase().includes(q) ||
            t.apiReferenceId.toLowerCase().includes(q) ||
            (t.rrnOrUtr && t.rrnOrUtr.toLowerCase().includes(q)) ||
            (t.bankReferenceNumber && t.bankReferenceNumber.toLowerCase().includes(q))
        );
      }

      if (mode === 'LIVE') {
        items = items.slice(0, 5);
      } else if (mode === 'UNSETTLED') {
        items = items.filter((t) => t.status === 'SUCCESS' && t.settlementStatus !== 'SETTLED');
      } else if (mode === 'ORDERS') {
        items = items.filter((t) => !!t.apiReferenceId);
      }

      const totalTransactions = items.length;
      const totalAmount = items.reduce((acc, t) => acc + t.transactionAmount, 0);

      const successfulItems = items.filter((t) => t.status === 'SUCCESS');
      const successfulCount = successfulItems.length;
      const successfulAmount = successfulItems.reduce((acc, t) => acc + t.transactionAmount, 0);

      const failedItems = items.filter((t) => t.status === 'FAILED');
      const failedCount = failedItems.length;
      const failedAmount = failedItems.reduce((acc, t) => acc + t.transactionAmount, 0);

      const pendingItems = items.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING');
      const pendingCount = pendingItems.length;
      const pendingAmount = pendingItems.reduce((acc, t) => acc + t.transactionAmount, 0);

      const successRate = totalTransactions > 0 ? Math.round((successfulCount / totalTransactions) * 1000) / 10 : 100;

      const summary: TransactionReportSummary = {
        totalTransactions,
        totalAmount,
        successfulCount,
        successfulAmount,
        failedCount,
        failedAmount,
        pendingCount,
        pendingAmount,
        successRate,
      };

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return { success: false, data: null as unknown as ReportListResult<TransactionReportRecord, TransactionReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Ledger Audit Report
   */
  async getLedgerReport(
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<LedgerEntry, LedgerReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const ledRes = await ledgerService.getLedgerEntries({}, 1, 100);
      let items = ledRes.data?.items || [];

      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        items = items.filter(
          (l) =>
            l.id.toLowerCase().includes(q) ||
            l.entityName.toLowerCase().includes(q) ||
            (l.referenceId && l.referenceId.toLowerCase().includes(q))
        );
      }

      if (filters?.direction && filters.direction !== 'ALL') {
        items = items.filter((l) => l.direction === filters.direction);
      }

      if (filters?.entryType && filters.entryType !== 'ALL') {
        items = items.filter((l) => l.entryType === filters.entryType);
      }

      const totalCredits = items.filter((l) => l.direction === 'CREDIT').reduce((acc, l) => acc + l.amount, 0);
      const totalDebits = items.filter((l) => l.direction === 'DEBIT').reduce((acc, l) => acc + l.amount, 0);
      const netMovement = totalCredits - totalDebits;

      const summary: LedgerReportSummary = {
        totalCredits,
        totalDebits,
        netMovement,
        entryCount: items.length,
      };

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as ReportListResult<LedgerEntry, LedgerReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Settlement Management Report
   */
  async getSettlementReport(
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<Settlement, SettlementReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const setRes = await settlementService.getSettlements({}, 1, 100);
      let items = setRes.data?.items || [];

      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        items = items.filter(
          (s) =>
            s.settlementId.toLowerCase().includes(q) ||
            s.entityName.toLowerCase().includes(q) ||
            (s.utr && s.utr.toLowerCase().includes(q))
        );
      }

      if (filters?.status && filters.status !== 'ALL') {
        items = items.filter((s) => s.status === filters.status);
      }

      const totalSettlements = items.length;
      const pendingCount = items.filter((s) => s.status === 'ELIGIBLE' || s.status === 'QUEUED').length;
      const processingCount = items.filter((s) => s.status === 'PROCESSING').length;
      const settledCount = items.filter((s) => s.status === 'SETTLED').length;
      const failedCount = items.filter((s) => s.status === 'FAILED').length;
      const grossSettlementAmount = items.reduce((acc, s) => acc + s.grossAmount, 0);
      const netSettlementAmount = items.reduce((acc, s) => acc + s.netSettlementAmount, 0);

      const summary: SettlementReportSummary = {
        totalSettlements,
        pendingCount,
        processingCount,
        settledCount,
        failedCount,
        grossSettlementAmount,
        netSettlementAmount,
      };

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as ReportListResult<Settlement, SettlementReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Balance Report across Master, Distributors, Retailers, Merchants
   */
  async getBalanceReport(
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<WalletAccount, BalanceReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const wltRes = await walletService.getWallets({}, 1, 100);
      let items = wltRes.data?.items || [];

      if (filters?.entityType && filters.entityType !== 'ALL') {
        items = items.filter((w) => w.entityType === filters.entityType);
      }

      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        items = items.filter(
          (w) =>
            w.walletId.toLowerCase().includes(q) ||
            w.entityName.toLowerCase().includes(q) ||
            w.entityCode.toLowerCase().includes(q)
        );
      }

      const totalAvailable = items.reduce((acc, w) => acc + w.availableBalance, 0);
      const totalLedger = items.reduce((acc, w) => acc + w.ledgerBalance, 0);
      const totalHold = items.reduce((acc, w) => acc + w.holdBalance, 0);
      const pendingSettlement = items.reduce((acc, w) => acc + w.pendingSettlement, 0);

      const summary: BalanceReportSummary = {
        totalAvailable,
        totalLedger,
        totalHold,
        pendingSettlement,
      };

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return { success: false, data: null as unknown as ReportListResult<WalletAccount, BalanceReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Account Statement Breakdown Report
   */
  async getAccountSummary(): Promise<ApiResponse<AccountSummary[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const wltRes = await walletService.getWallets({}, 1, 100);
      const wallets = wltRes.data?.items || [];

      const summaries: AccountSummary[] = wallets.map((w) => ({
        entityId: w.entityId,
        entityName: w.entityName,
        entityType: w.entityType,
        walletId: w.walletId,
        openingBalance: w.ledgerBalance - 50000,
        totalCredits: 150000,
        totalDebits: 100000,
        closingBalance: w.availableBalance,
        holdBalance: w.holdBalance,
        pendingSettlement: w.pendingSettlement,
        transactionCount: 12,
        settlementCount: 3,
      }));

      return { success: true, data: summaries, timestamp: new Date().toISOString() };
    }
    return { success: false, data: [], timestamp: new Date().toISOString() };
  },

  /**
   * API Provider Performance Analytics
   */
  async getApiPerformance(
    filters?: ApiPerformanceFilters
  ): Promise<ApiResponse<ApiPerformanceSummary>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let providers: ApiPerformanceSummary['providers'] = [
        {
          provider: 'HDFC Bank',
          service: 'Pay-In & Pay-Out Gateway',
          apiType: 'PAY_IN',
          totalRequests: 1450,
          successCount: 1420,
          failedCount: 30,
          successRate: 97.9,
          avgResponseTimeMs: 185,
          providerAvailability: 99.8,
          status: 'HEALTHY',
        },
        {
          provider: 'ICICI Bank',
          service: 'IMPS Direct Node',
          apiType: 'SETTLEMENT',
          totalRequests: 890,
          successCount: 885,
          failedCount: 5,
          successRate: 99.4,
          avgResponseTimeMs: 142,
          providerAvailability: 99.9,
          status: 'HEALTHY',
        },
        {
          provider: 'Axis Bank',
          service: 'NEFT Clearance Gateway',
          apiType: 'PAY_OUT',
          totalRequests: 620,
          successCount: 580,
          failedCount: 40,
          successRate: 93.5,
          avgResponseTimeMs: 310,
          providerAvailability: 96.2,
          lastFailureAt: '2026-09-03T12:10:00Z',
          status: 'DEGRADED',
        },
        {
          provider: 'Cashfree Payments',
          service: 'UPI Collection Service',
          apiType: 'PAY_IN',
          totalRequests: 2100,
          successCount: 2085,
          failedCount: 15,
          successRate: 99.2,
          avgResponseTimeMs: 110,
          providerAvailability: 99.9,
          status: 'HEALTHY',
        },
        {
          provider: 'Razorpay Node',
          service: 'Cards & NetBanking Hub',
          apiType: 'PAY_IN',
          totalRequests: 950,
          successCount: 935,
          failedCount: 15,
          successRate: 98.4,
          avgResponseTimeMs: 165,
          providerAvailability: 99.5,
          status: 'HEALTHY',
        },
      ];

      if (filters?.provider && filters.provider !== 'ALL') {
        providers = providers.filter((p) => p.provider.toLowerCase().includes(filters.provider!.toLowerCase()));
      }

      const totalRequests = providers.reduce((acc, p) => acc + p.totalRequests, 0);
      const successCount = providers.reduce((acc, p) => acc + p.successCount, 0);
      const failedCount = providers.reduce((acc, p) => acc + p.failedCount, 0);
      const overallSuccessRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 1000) / 10 : 100;
      const avgResponseTimeMs = Math.round(providers.reduce((acc, p) => acc + p.avgResponseTimeMs, 0) / (providers.length || 1));
      const overallAvailability = Math.round((providers.reduce((acc, p) => acc + p.providerAvailability, 0) / (providers.length || 1)) * 10) / 10;

      return {
        success: true,
        data: {
          totalRequests,
          successCount,
          failedCount,
          overallSuccessRate,
          avgResponseTimeMs,
          overallAvailability,
          providers,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return { success: false, data: null as unknown as ApiPerformanceSummary, timestamp: new Date().toISOString() };
  },

  /**
   * Distributor Scoped Transaction Report
   */
  async getDistributorTransactionReport(
    distributorId: string,
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<TransactionReportRecord, TransactionReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const txRes = await transactionService.getTransactionsForDistributor(distributorId, {}, 1, 100);
      const rawItems = txRes.data?.items || [];

      let items: TransactionReportRecord[] = rawItems.map((t, idx) => {
        const gst = t.gst ?? Number((t.fee * 0.18).toFixed(2));
        const total = Number((t.amount + t.fee + gst).toFixed(2));
        const retailerId = t.retailerId || `RET_${1001 + (idx % 5)}`;
        const retailerName = t.retailerName || t.merchantName || 'Metro Store #12';
        const mobileNumber = t.customerMobile || `98765${43210 + idx}`;
        const transactionId = t.transactionRef || t.id;
        const apiReferenceId = t.referenceId || t.orderId || `API_REF_${t.id}`;
        const serviceType = t.service || `${t.type === 'PAY_IN' ? 'Pay-In' : 'Pay-Out'} (${t.paymentMode})`;
        const responseMessage = t.status === 'SUCCESS'
          ? 'Transaction processed successfully'
          : (t.failureReason || t.failureCode || 'Provider processing error');

        let settlementStatus: SettlementStatus = 'PENDING';
        if (t.status === 'SUCCESS') {
          settlementStatus = idx % 2 === 0 ? 'SETTLED' : 'ELIGIBLE';
        } else if (t.status === 'FAILED') {
          settlementStatus = 'NOT_ELIGIBLE';
        }

        const settlementDate = settlementStatus === 'SETTLED' ? (t.updatedAt || t.createdAt) : undefined;
        const rrnOrUtr = t.utr || (t.status === 'SUCCESS' ? `UTR991823${idx + 10}` : undefined);
        const bankReferenceNumber = (t.providerResponse?.providerRef as string) || (rrnOrUtr ? `BKREF_${rrnOrUtr}` : undefined);

        return {
          retailerName,
          retailerId,
          mobileNumber,
          transactionId,
          apiReferenceId,
          serviceType,
          status: t.status,
          responseMessage,
          requestedAt: t.createdAt,
          updatedAt: t.updatedAt || t.createdAt,
          transactionAmount: t.amount,
          transactionCharges: t.fee,
          gstAmount: gst,
          totalAmount: total,
          settlementStatus,
          settlementDate,
          paymentMode: t.paymentMode || 'UPI',
          rrnOrUtr,
          bankReferenceNumber,
          remarks: 'Distributor scoped report record',
        };
      });

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (i) =>
            i.transactionId.toLowerCase().includes(q) ||
            i.retailerName.toLowerCase().includes(q) ||
            i.mobileNumber.includes(q)
        );
      }

      if (filters?.status && filters.status !== 'ALL') {
        items = items.filter((i) => i.status === filters.status);
      }

      if (filters?.retailerId && filters.retailerId !== 'ALL') {
        items = items.filter((i) => i.retailerId === filters.retailerId);
      }

      const totalTransactions = items.length;
      const totalAmount = items.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const successfulItems = items.filter((i) => i.status === 'SUCCESS');
      const successfulCount = successfulItems.length;
      const successfulAmount = successfulItems.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const failedItems = items.filter((i) => i.status === 'FAILED');
      const failedCount = failedItems.length;
      const failedAmount = failedItems.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const pendingItems = items.filter((i) => i.status === 'PENDING' || i.status === 'PROCESSING');
      const pendingCount = pendingItems.length;
      const pendingAmount = pendingItems.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const successRate = totalTransactions > 0 ? Math.round((successfulCount / totalTransactions) * 1000) / 10 : 100;

      const summary: TransactionReportSummary = {
        totalTransactions,
        totalAmount,
        successfulCount,
        successfulAmount,
        failedCount,
        failedAmount,
        pendingCount,
        pendingAmount,
        successRate,
      };

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return { success: false, data: null as unknown as ReportListResult<TransactionReportRecord, TransactionReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Distributor Scoped Retailer Report
   */
  async getDistributorRetailerReport(
    distributorId: string,
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<MasterDistributorReportRow, { totalRetailers: number; activeRetailers: number; pendingRetailers: number; totalVolume: number }>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const retailers = hierarchyService.getDistributorRetailers(distributorId);
      let items: MasterDistributorReportRow[] = retailers.map((r, idx) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        businessName: r.businessName,
        parentName: 'North Zone Distributor',
        todayTxns: idx === 0 ? 18 : idx === 1 ? 10 : idx === 2 ? 0 : 6,
        volume: idx === 0 ? 54500 : idx === 1 ? 28000 : idx === 2 ? 0 : 42000,
        commission: idx === 0 ? 320 : idx === 1 ? 180 : idx === 2 ? 0 : 180,
        planName: r.planId === 'plan_prm_02' ? 'Premium Payout Plan' : 'Standard Retailer Plan',
        kycStatus: r.kycStatus || 'APPROVED',
        approvalStatus: r.approvalStatus || 'APPROVED',
        accountStatus: r.accountStatus || 'ACTIVE',
        createdAt: r.createdAt,
      }));

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.code.toLowerCase().includes(q) ||
            i.businessName.toLowerCase().includes(q)
        );
      }

      const totalRetailers = items.length;
      const activeRetailers = items.filter((i) => i.approvalStatus === 'APPROVED' && i.accountStatus === 'ACTIVE').length;
      const pendingRetailers = items.filter((i) => i.approvalStatus === 'PENDING_APPROVAL').length;
      const totalVolume = items.reduce((acc, curr) => acc + (curr.volume || 0), 0);

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary: { totalRetailers, activeRetailers, pendingRetailers, totalVolume },
        },
        timestamp: new Date().toISOString(),
      };
    }

    return { success: false, data: null as unknown as ReportListResult<MasterDistributorReportRow, any>, timestamp: new Date().toISOString() };
  },

  /**
   * Retailer-Scoped Transaction Report
   */
  async getRetailerTransactionReport(
    retailerId: string,
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<TransactionReportRecord, TransactionReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const txRes = await transactionService.getTransactionsForRetailer(retailerId, {}, 1, 500);
      const rawTxList = txRes.data?.items || [];

      let items: TransactionReportRecord[] = rawTxList.map((t, idx) => {
        const isPayIn = t.type === 'PAY_IN';
        const fee = t.fee || (isPayIn ? Math.max(5.0, +(t.amount * 0.004).toFixed(2)) : 20.0);
        const gst = t.gst || +(fee * 0.18).toFixed(2);
        const total = +(t.amount + fee + gst).toFixed(2);
        const rrnOrUtr = t.utr || (t.status === 'SUCCESS' ? `UTR998${t.id.slice(-6)}` : undefined);

        return {
          retailerName: 'Metro Store #01',
          retailerId: retailerId,
          mobileNumber: t.customerMobile || '9876543210',
          transactionId: t.transactionRef || t.id,
          apiReferenceId: t.referenceId || t.orderId || `API_REF_${t.id}`,
          serviceType: t.service || `${t.type === 'PAY_IN' ? 'Pay-In' : 'Pay-Out'} (${t.paymentMode})`,
          status: t.status,
          responseMessage: t.status === 'SUCCESS' ? 'Processed successfully' : (t.failureReason || 'Failed'),
          requestedAt: t.createdAt,
          updatedAt: t.updatedAt || t.createdAt,
          transactionAmount: t.amount,
          transactionCharges: fee,
          gstAmount: gst,
          totalAmount: total,
          settlementStatus: t.status === 'SUCCESS' ? 'SETTLED' : 'PENDING',
          settlementDate: t.status === 'SUCCESS' ? t.updatedAt || t.createdAt : undefined,
          paymentMode: t.paymentMode || 'UPI',
          rrnOrUtr,
          bankReferenceNumber: rrnOrUtr ? `BKREF_${rrnOrUtr}` : undefined,
          remarks: 'Retailer scoped transaction record',
        };
      });

      if (filters?.type && filters.type !== 'ALL') {
        items = items.filter((r) => r.serviceType.toUpperCase().includes(filters.type!));
      }

      if (filters?.status && filters.status !== 'ALL') {
        items = items.filter((r) => r.status === filters.status);
      }

      if (filters?.paymentMode && filters.paymentMode !== 'ALL') {
        items = items.filter((r) => r.paymentMode === filters.paymentMode);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        items = items.filter(
          (r) =>
            r.transactionId.toLowerCase().includes(q) ||
            r.apiReferenceId.toLowerCase().includes(q) ||
            (r.rrnOrUtr && r.rrnOrUtr.toLowerCase().includes(q))
        );
      }

      const totalTransactions = items.length;
      const totalAmount = items.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const successfulItems = items.filter((i) => i.status === 'SUCCESS');
      const successfulCount = successfulItems.length;
      const successfulAmount = successfulItems.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const failedItems = items.filter((i) => i.status === 'FAILED');
      const failedCount = failedItems.length;
      const failedAmount = failedItems.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const pendingItems = items.filter((i) => i.status === 'PENDING');
      const pendingCount = pendingItems.length;
      const pendingAmount = pendingItems.reduce((acc, curr) => acc + curr.transactionAmount, 0);

      const successRate = totalTransactions > 0 ? +((successfulCount / totalTransactions) * 100).toFixed(1) : 100;

      const summary: TransactionReportSummary = {
        totalTransactions,
        totalAmount,
        successfulCount,
        successfulAmount,
        failedCount,
        failedAmount,
        pendingCount,
        pendingAmount,
        successRate,
      };

      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

      return {
        success: true,
        data: {
          items: paginatedItems,
          pagination: { page, pageSize, totalItems, totalPages },
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return { success: false, data: null as unknown as ReportListResult<TransactionReportRecord, TransactionReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Retailer-Scoped Commission Report
   */
  async getRetailerCommissionReport(
    retailerId: string,
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<MasterDistributorCommissionRecord, any>>> {
    return commissionService.getCommissionsForRetailer(retailerId, { searchQuery: filters?.searchQuery, status: filters?.status }, page, pageSize);
  },

  /**
   * Retailer-Scoped Wallet Statement / Ledger Report
   */
  async getRetailerWalletStatement(
    retailerId: string,
    filters?: ReportFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ReportListResult<LedgerEntry, LedgerReportSummary>>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      const ledRes = await ledgerService.getRetailerLedger(retailerId, { searchQuery: filters?.searchQuery, direction: filters?.type as any }, page, pageSize);
      const items = ledRes.data?.items || [];
      const pagination = ledRes.data?.pagination || { page: 1, pageSize, totalItems: 0, totalPages: 1 };

      const totalCredits = items.filter((i) => i.direction === 'CREDIT').reduce((acc, curr) => acc + curr.amount, 0);
      const totalDebits = items.filter((i) => i.direction === 'DEBIT').reduce((acc, curr) => acc + curr.amount, 0);
      const netMovement = totalCredits - totalDebits;

      const summary: LedgerReportSummary = {
        totalCredits,
        totalDebits,
        netMovement,
        entryCount: pagination.totalItems,
      };

      return {
        success: true,
        data: {
          items,
          pagination,
          summary,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return { success: false, data: null as unknown as ReportListResult<LedgerEntry, LedgerReportSummary>, timestamp: new Date().toISOString() };
  },

  /**
   * Reusable CSV Exporter for Report Data
   */
  exportToCsv(filename: string, rows: Record<string, unknown>[]) {
    if (!rows || rows.length === 0) return;
    window.dispatchEvent(new CustomEvent('qin-star-pay:excel-export', { detail: { filename, rows } }));
  },
};
