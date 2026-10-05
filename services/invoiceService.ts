import {
  Invoice,
  InvoiceFilters,
  InvoiceSummary,
  InvoiceType,
  CreditDebitNote,
  TaxRecord,
  TdsRecord,
  PaginationState,
} from '@/types/domain';
import { ApiResponse } from '@/types/common';
import { mockInvoices, mockCreditDebitNotes, mockTaxRecords, mockTdsRecords } from '@/mocks/mockInvoice';
import { calculateInvoiceBreakdown, InvoiceCalculationInput } from '@/utils/taxCalculations';
import { apiClient } from './apiClient';
import { APP_CONFIG } from '@/config';

const inMemoryInvoices: Invoice[] = [...mockInvoices];
const inMemoryNotes: CreditDebitNote[] = [...mockCreditDebitNotes];
const inMemoryTax: TaxRecord[] = [...mockTaxRecords];
const inMemoryTds: TdsRecord[] = [...mockTdsRecords];

export interface InvoiceListResult {
  items: Invoice[];
  pagination: PaginationState;
  summary: InvoiceSummary;
}

export const invoiceService = {
  /**
   * Fetch invoice summary metrics dynamically from centralized state.
   */
  async getSummary(): Promise<ApiResponse<InvoiceSummary>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));

      const totalInvoices = inMemoryInvoices.length;
      const totalInvoiced = inMemoryInvoices.reduce((acc, i) => acc + i.netReceivable, 0);
      const outstandingAmount = inMemoryInvoices.reduce((acc, i) => acc + i.outstandingAmount, 0);
      const paidAmount = inMemoryInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
      const gstCollected = inMemoryInvoices.reduce((acc, i) => acc + i.gstAmount, 0);
      const tdsDeducted = inMemoryInvoices.reduce((acc, i) => acc + i.tdsAmount, 0);
      const overdueCount = inMemoryInvoices.filter((i) => i.status === 'OVERDUE').length;

      return {
        success: true,
        data: {
          totalInvoiced,
          outstandingAmount,
          paidAmount,
          gstCollected,
          tdsDeducted,
          overdueCount,
          totalInvoices,
        },
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get('/invoices/summary');
  },

  /**
   * Fetch invoices with filtering & pagination.
   */
  async getInvoices(
    filters?: InvoiceFilters,
    page = 1,
    pageSize = 10
  ): Promise<ApiResponse<InvoiceListResult>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 200));

      let filtered = [...inMemoryInvoices];

      if (filters?.entityType && filters.entityType !== 'ALL') {
        filtered = filtered.filter((i) => i.entityType === filters.entityType);
      }

      if (filters?.invoiceType && filters.invoiceType !== 'ALL') {
        filtered = filtered.filter((i) => i.invoiceType === filters.invoiceType);
      }

      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((i) => i.status === filters.status);
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.id.toLowerCase().includes(q) ||
            i.entityName.toLowerCase().includes(q) ||
            i.entityCode.toLowerCase().includes(q) ||
            (i.gstin && i.gstin.toLowerCase().includes(q)) ||
            i.transactionIds.some((t) => t.toLowerCase().includes(q)) ||
            i.settlementIds.some((s) => s.toLowerCase().includes(q))
        );
      }

      const summaryRes = await this.getSummary();
      const summary = summaryRes.data || {
        totalInvoiced: 0,
        outstandingAmount: 0,
        paidAmount: 0,
        gstCollected: 0,
        tdsDeducted: 0,
        overdueCount: 0,
        totalInvoices: 0,
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

    return apiClient.get<ApiResponse<InvoiceListResult>>('/invoices', {
      params: { ...filters, page, pageSize } as unknown as Record<string, string | number | boolean>,
    });
  },

  /**
   * Fetch single invoice by ID.
   */
  async getInvoiceById(id: string): Promise<ApiResponse<Invoice | null>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      const inv = inMemoryInvoices.find((i) => i.id === id) || null;
      return {
        success: !!inv,
        data: inv,
        timestamp: new Date().toISOString(),
      };
    }
    return apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  },

  /**
   * Generate a new invoice with calculated financial breakdown.
   */
  async generateInvoice(
    entityId: string,
    entityName: string,
    entityCode: string,
    entityType: Invoice['entityType'],
    invoiceType: InvoiceType,
    calcInput: InvoiceCalculationInput,
    billingPeriod = 'September 2026',
    description = 'Platform service fee billing',
    createdBy = 'Qin Star Billing Admin'
  ): Promise<ApiResponse<Invoice>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 350));

      const breakdown = calculateInvoiceBreakdown(calcInput);
      const newId = `INV_20260903_${String(inMemoryInvoices.length + 1).padStart(3, '0')}`;

      const newInvoice: Invoice = {
        id: newId,
        entityId,
        entityName,
        entityCode,
        entityType,
        gstin: '36ABCDE1234F1Z5',
        billingAddress: 'Commercial Billing Address',
        invoiceType,
        billingPeriod,
        lineItems: [
          {
            id: `li_${Date.now()}`,
            description,
            quantity: 1,
            rate: breakdown.taxableAmount,
            taxableAmount: breakdown.taxableAmount,
            gstRate: breakdown.gstRate,
            gstAmount: breakdown.gstAmount,
            totalAmount: breakdown.grossAmount,
          },
        ],
        taxableAmount: breakdown.taxableAmount,
        gstRate: breakdown.gstRate,
        gstAmount: breakdown.gstAmount,
        cgstAmount: breakdown.cgstAmount,
        sgstAmount: breakdown.sgstAmount,
        igstAmount: breakdown.igstAmount,
        tdsApplicable: breakdown.tdsApplicable,
        tdsRate: breakdown.tdsRate,
        tdsAmount: breakdown.tdsAmount,
        grossAmount: breakdown.grossAmount,
        netReceivable: breakdown.netReceivable,
        paidAmount: 0.0,
        outstandingAmount: breakdown.netReceivable,
        status: 'ISSUED',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        transactionIds: [],
        settlementIds: [],
        ledgerEntryIds: [],
        walletId: `wlt_${entityId}`,
        payments: [],
        timeline: [
          {
            timestamp: new Date().toISOString(),
            event: 'Invoice Generated & Issued',
            actor: createdBy,
            description: `Invoice ${newId} generated for ${entityName}. Taxable: ₹${breakdown.taxableAmount}, Net: ₹${breakdown.netReceivable}`,
            status: 'COMPLETED',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      inMemoryInvoices.unshift(newInvoice);

      // If TDS applicable, record TDS entry
      if (breakdown.tdsApplicable && breakdown.tdsAmount > 0) {
        inMemoryTds.unshift({
          tdsId: `TDS_${Date.now()}`,
          invoiceId: newId,
          entityId,
          entityName,
          entityType,
          panMasked: 'ABCDE1234F',
          taxableAmount: breakdown.taxableAmount,
          tdsRate: breakdown.tdsRate,
          tdsAmount: breakdown.tdsAmount,
          status: 'DEDUCTED',
          deductionDate: new Date().toISOString(),
        });
      }

      return { success: true, data: newInvoice, timestamp: new Date().toISOString() };
    }

    return apiClient.post<ApiResponse<Invoice>>('/invoices', {
      entityId,
      invoiceType,
      ...calcInput,
    });
  },

  /**
   * Process payment against an outstanding invoice.
   */
  async markInvoicePaid(
    invoiceId: string,
    receivedAmount: number,
    utr: string,
    remarks = 'Payment received',
    receivedBy = 'Qin Star Accounts'
  ): Promise<ApiResponse<Invoice>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 300));

      const inv = inMemoryInvoices.find((i) => i.id === invoiceId);
      if (inv) {
        const pmtAmount = Math.max(0, receivedAmount);
        inv.paidAmount += pmtAmount;
        inv.outstandingAmount = Math.max(0, inv.netReceivable - inv.paidAmount);

        if (inv.outstandingAmount <= 0) {
          inv.status = 'PAID';
        } else {
          inv.status = 'PARTIALLY_PAID';
        }

        inv.payments.push({
          paymentId: `PMT_${Date.now()}`,
          paymentDate: new Date().toISOString(),
          utr,
          amount: pmtAmount,
          remarks,
          receivedBy,
        });

        inv.timeline.push({
          timestamp: new Date().toISOString(),
          event: inv.status === 'PAID' ? 'Full Payment Received' : 'Part Payment Received',
          actor: receivedBy,
          description: `Received ₹${pmtAmount} via UTR ${utr}. Outstanding remaining: ₹${inv.outstandingAmount}`,
          status: 'COMPLETED',
        });

        return { success: true, data: { ...inv }, timestamp: new Date().toISOString() };
      }

      return { success: false, data: null as unknown as Invoice, timestamp: new Date().toISOString() };
    }

    return apiClient.post<ApiResponse<Invoice>>(`/invoices/${invoiceId}/pay`, {
      receivedAmount,
      utr,
      remarks,
    });
  },

  /**
   * Fetch Credit / Debit Notes.
   */
  async getNotes(type: 'ALL' | 'CREDIT_NOTE' | 'DEBIT_NOTE' = 'ALL'): Promise<ApiResponse<CreditDebitNote[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      let notes = [...inMemoryNotes];
      if (type !== 'ALL') {
        notes = notes.filter((n) => n.noteType === type);
      }
      return { success: true, data: notes, timestamp: new Date().toISOString() };
    }
    return apiClient.get('/invoices/notes');
  },

  /**
   * Create a Credit or Debit Note.
   */
  async createNote(
    invoiceId: string,
    noteType: 'CREDIT_NOTE' | 'DEBIT_NOTE',
    adjustmentAmount: number,
    reason: string,
    createdBy = 'Accounts Lead'
  ): Promise<ApiResponse<CreditDebitNote>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 350));
      const inv = inMemoryInvoices.find((i) => i.id === invoiceId);
      const gstAdj = Math.round(adjustmentAmount * 0.18 * 100) / 100;
      const totalAdj = Math.round((adjustmentAmount + gstAdj) * 100) / 100;

      const newNote: CreditDebitNote = {
        noteId: `CDN_20260903_${String(inMemoryNotes.length + 1).padStart(3, '0')}`,
        invoiceId,
        entityId: inv?.entityId || 'ent_mch_01',
        entityName: inv?.entityName || 'Retailer',
        entityCode: inv?.entityCode || 'QSP-MCH',
        entityType: inv?.entityType || 'MERCHANT',
        noteType,
        reason,
        adjustmentAmount,
        gstAdjustment: gstAdj,
        totalAdjustment: totalAdj,
        status: 'APPLIED',
        createdBy,
        createdAt: new Date().toISOString(),
      };

      inMemoryNotes.unshift(newNote);

      // Adjust target invoice exposure if found
      if (inv) {
        if (noteType === 'CREDIT_NOTE') {
          inv.netReceivable = Math.max(0, inv.netReceivable - totalAdj);
          inv.outstandingAmount = Math.max(0, inv.outstandingAmount - totalAdj);
        } else {
          inv.netReceivable += totalAdj;
          inv.outstandingAmount += totalAdj;
        }

        inv.timeline.push({
          timestamp: new Date().toISOString(),
          event: `${noteType === 'CREDIT_NOTE' ? 'Credit Note' : 'Debit Note'} Applied`,
          actor: createdBy,
          description: `${newNote.noteId} applied for ₹${totalAdj} (${reason})`,
          status: 'COMPLETED',
        });
      }

      return { success: true, data: newNote, timestamp: new Date().toISOString() };
    }

    return apiClient.post<ApiResponse<CreditDebitNote>>('/invoices/notes', {
      invoiceId,
      noteType,
      adjustmentAmount,
      reason,
    });
  },

  /**
   * Fetch GST & Tax Summary.
   */
  async getTaxSummary(): Promise<ApiResponse<TaxRecord[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      return { success: true, data: inMemoryTax, timestamp: new Date().toISOString() };
    }
    return apiClient.get('/invoices/tax-summary');
  },

  /**
   * Fetch TDS Records.
   */
  async getTdsRecords(): Promise<ApiResponse<TdsRecord[]>> {
    if (APP_CONFIG.useMockData) {
      await new Promise((res) => setTimeout(res, 150));
      return { success: true, data: inMemoryTds, timestamp: new Date().toISOString() };
    }
    return apiClient.get('/invoices/tds');
  },
};
