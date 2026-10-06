import {
  Chargeback,
  ChargebackFilters,
  ChargebackSummary,
  ChargebackEvidence,
  PaginationState,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockChargebacks } from '@/mocks/mockChargeback';
import { walletService } from './walletService';
import { ledgerService } from './ledgerService';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemoryChargebacks: Chargeback[] = [...mockChargebacks];

export interface ChargebackListResult {
  items: Chargeback[];
  pagination: PaginationState;
  summary: ChargebackSummary;
}

export const chargebackService = {
  /**
   * Fetch summary dashboard metrics.
   */
  async getSummary(): Promise<ApiResponse<ChargebackSummary>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));

      const openCases = inMemoryChargebacks.filter(
        (c) => c.status === 'RAISED' || c.status === 'UNDER_REVIEW' || c.status === 'EVIDENCE_REQUIRED' || c.status === 'RESPONDED'
      ).length;

      const underReview = inMemoryChargebacks.filter((c) => c.status === 'UNDER_REVIEW').length;
      const evidenceRequired = inMemoryChargebacks.filter((c) => c.status === 'EVIDENCE_REQUIRED').length;
      const responseDueSoon = inMemoryChargebacks.filter((c) => c.status === 'EVIDENCE_REQUIRED' || c.status === 'UNDER_REVIEW').length;

      const wonCases = inMemoryChargebacks.filter((c) => c.status === 'WON').length;
      const lostCases = inMemoryChargebacks.filter((c) => c.status === 'LOST').length;

      const totalDisputedAmount = inMemoryChargebacks.reduce((acc, c) => acc + c.disputedAmount, 0);
      const totalLossAmount = inMemoryChargebacks.reduce((acc, c) => acc + c.finalLoss, 0);

      const resolvedTotal = wonCases + lostCases;
      const winRate = resolvedTotal > 0 ? Math.round((wonCases / resolvedTotal) * 1000) / 10 : 100;

      return {
        success: true,
        data: {
          openCases,
          underReview,
          evidenceRequired,
          responseDueSoon,
          wonCases,
          lostCases,
          totalDisputedAmount,
          totalLossAmount,
          winRate,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get('/chargebacks/summary');
  },

  /**
   * Fetch chargebacks with filtering & pagination.
   */
  async getChargebacks(
    filters?: ChargebackFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<ChargebackListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = [...inMemoryChargebacks];

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((c) => c.status === filters.status);
      }

      if (filters?.priority && filters.priority !== 'ALL') {
        filtered = filtered.filter((c) => c.priority === filters.priority);
      }

      if (filters?.reasonCode && filters.reasonCode !== 'ALL') {
        filtered = filtered.filter((c) => c.reasonCode === filters.reasonCode);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.chargebackId.toLowerCase().includes(q) ||
            c.transactionId.toLowerCase().includes(q) ||
            c.entityName.toLowerCase().includes(q) ||
            (c.orderId && c.orderId.toLowerCase().includes(q))
        );
      }

      const summaryRes = await this.getSummary();
      const summary = summaryRes.data || {
        openCases: 0,
        underReview: 0,
        evidenceRequired: 0,
        responseDueSoon: 0,
        wonCases: 0,
        lostCases: 0,
        totalDisputedAmount: 0,
        totalLossAmount: 0,
        winRate: 100,
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

    return apiClient.get<ApiResponse<ChargebackListResult>>('/chargebacks', {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  /**
   * Fetch single chargeback detail by ID.
   */
  async getChargebackById(chargebackId: string): Promise<ApiResponse<Chargeback | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const c = inMemoryChargebacks.find((item) => item.chargebackId === chargebackId) || null;
      return {
        success: !!c,
        data: c,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<Chargeback>>(`/chargebacks/${chargebackId}`);
  },

  /**
   * Assign case to operational team member.
   */
  async assignCase(
    chargebackId: string,
    assignedTo: string,
    assignedBy = 'Qin Star Admin'
  ): Promise<ApiResponse<Chargeback>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 250));
      const c = inMemoryChargebacks.find((item) => item.chargebackId === chargebackId);
      if (c) {
        c.assignedTo = assignedTo;
        c.assignedAt = new Date().toISOString();

        c.timeline.push({
          timestamp: new Date().toISOString(),
          event: 'Case Re-Assigned',
          actor: assignedBy,
          description: `Dispute case assigned to ${assignedTo}.`,
          status: 'COMPLETED',
        });

        return { success: true, data: { ...c }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as Chargeback, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<Chargeback>>(`/chargebacks/${chargebackId}/assign`, { assignedTo });
  },

  /**
   * Attach evidence document.
   */
  async addEvidence(
    chargebackId: string,
    documentType: string,
    fileName: string,
    fileSize = '500 KB',
    uploadedBy = 'Retailer Admin'
  ): Promise<ApiResponse<Chargeback>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));
      const c = inMemoryChargebacks.find((item) => item.chargebackId === chargebackId);
      if (c) {
        const newEvidence: ChargebackEvidence = {
          id: `ev_${Date.now()}`,
          documentType,
          fileName,
          fileSize,
          uploadedBy,
          uploadedAt: new Date().toISOString(),
          status: 'READY',
        };
        c.evidence.push(newEvidence);
        c.status = 'EVIDENCE_REQUIRED';

        c.timeline.push({
          timestamp: new Date().toISOString(),
          event: 'Evidence Uploaded',
          actor: uploadedBy,
          description: `Document "${fileName}" (${documentType}) uploaded for representment payload.`,
          status: 'COMPLETED',
        });

        return { success: true, data: { ...c }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as Chargeback, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<Chargeback>>(`/chargebacks/${chargebackId}/evidence`, {
      documentType,
      fileName,
    });
  },

  /**
   * Submit representment response.
   */
  async submitResponse(
    chargebackId: string,
    responseSummary: string,
    merchantExplanation: string,
    submittedBy = 'Qin Star Risk Lead'
  ): Promise<ApiResponse<Chargeback>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 400));
      const c = inMemoryChargebacks.find((item) => item.chargebackId === chargebackId);
      if (c) {
        c.status = 'RESPONDED';
        c.responseSummary = responseSummary;
        c.merchantExplanation = merchantExplanation;
        c.submittedBy = submittedBy;
        c.submittedAt = new Date().toISOString();

        // Mark all evidence ready as SUBMITTED
        c.evidence.forEach((ev) => {
          ev.status = 'SUBMITTED';
        });

        c.timeline.push({
          timestamp: new Date().toISOString(),
          event: 'Representment Submitted',
          actor: submittedBy,
          description: `Dispute representment package submitted to card network. Summary: ${responseSummary}`,
          status: 'COMPLETED',
        });

        return { success: true, data: { ...c }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as Chargeback, timestamp: new Date().toISOString() };
    }
    return apiClient.post<ApiResponse<Chargeback>>(`/chargebacks/${chargebackId}/submit-response`, {
      responseSummary,
      merchantExplanation,
    });
  },

  /**
   * Resolve Dispute (WON / LOST / WITHDRAWN).
   * Orchestrates wallet hold releases and immutable ledger entries.
   */
  async resolveCase(
    chargebackId: string,
    resolution: 'WON' | 'LOST' | 'WITHDRAWN',
    resolutionReason: string,
    resolvedBy = 'Qin Star Risk Board'
  ): Promise<ApiResponse<Chargeback>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 450));
      const c = inMemoryChargebacks.find((item) => item.chargebackId === chargebackId);
      if (c) {
        c.status = resolution;
        c.resolvedBy = resolvedBy;
        c.resolvedAt = new Date().toISOString();
        c.resolutionReason = resolutionReason;

        if (resolution === 'WON' || resolution === 'WITHDRAWN') {
          // Release hold on wallet
          const walletRes = await walletService.getWalletById(c.walletId);
          if (walletRes.success && walletRes.data) {
            walletRes.data.holdBalance = Math.max(0, walletRes.data.holdBalance - c.holdAmount);
          }

          c.holdAmount = 0;
          c.potentialLoss = 0;
          c.recoveredAmount = c.disputedAmount;
          c.finalLoss = 0;

          // Add RELEASE ledger entry
          ledgerService.addMockLedgerEntry({
            walletId: c.walletId,
            entityId: c.entityId,
            entityType: c.entityType,
            entityName: c.entityName,
            referenceId: c.chargebackId,
            entryType: 'RELEASE',
            openingBalance: walletRes.data ? walletRes.data.availableBalance : 0,
            amount: c.disputedAmount,
            closingBalance: walletRes.data ? walletRes.data.availableBalance : 0,
            direction: 'CREDIT',
            description: `Dispute won. Lien hold of ${c.disputedAmount} released for case ${c.chargebackId}`,
            createdBy: resolvedBy,
          });

          c.timeline.push({
            timestamp: new Date().toISOString(),
            event: 'Case Won & Closed',
            actor: resolvedBy,
            description: `Dispute ruled in favor of retailer. Lien hold released back to wallet. Reason: ${resolutionReason}`,
            status: 'COMPLETED',
          });
        } else if (resolution === 'LOST') {
          // Convert hold to final loss
          const walletRes = await walletService.getWalletById(c.walletId);
          if (walletRes.success && walletRes.data) {
            walletRes.data.holdBalance = Math.max(0, walletRes.data.holdBalance - c.holdAmount);
          }

          c.holdAmount = 0;
          c.potentialLoss = 0;
          c.recoveredAmount = 0;
          c.finalLoss = c.disputedAmount;

          // Add CHARGE / DEBIT ledger entry for booked loss
          ledgerService.addMockLedgerEntry({
            walletId: c.walletId,
            entityId: c.entityId,
            entityType: c.entityType,
            entityName: c.entityName,
            referenceId: c.chargebackId,
            entryType: 'CHARGE',
            openingBalance: walletRes.data ? walletRes.data.availableBalance : 0,
            amount: c.disputedAmount,
            closingBalance: walletRes.data ? walletRes.data.availableBalance : 0,
            direction: 'DEBIT',
            description: `Dispute lost. Financial loss booked for case ${c.chargebackId} (Reason: ${resolutionReason})`,
            createdBy: resolvedBy,
          });

          c.timeline.push({
            timestamp: new Date().toISOString(),
            event: 'Case Lost & Closed',
            actor: resolvedBy,
            description: `Dispute lost. Chargeback financial loss booked against retailer. Reason: ${resolutionReason}`,
            status: 'FAILED',
          });
        }

        return { success: true, data: { ...c }, timestamp: new Date().toISOString() };
      }
      return { success: false, data: null as unknown as Chargeback, timestamp: new Date().toISOString() };
    }

    return apiClient.post<ApiResponse<Chargeback>>(`/chargebacks/${chargebackId}/resolve`, {
      resolution,
      resolutionReason,
    });
  },
};
