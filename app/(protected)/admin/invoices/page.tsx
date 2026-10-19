'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { invoiceService, InvoiceListResult } from '@/services/invoiceService';
import { Invoice, InvoiceFilters, InvoiceType, EntityType, PaginationState } from '@/types/domain';
import { InvoiceSummaryCards } from '@/components/features/invoices/InvoiceSummaryCards';
import { InvoiceFilterBar } from '@/components/features/invoices/InvoiceFilterBar';
import { InvoiceTable } from '@/components/features/invoices/InvoiceTable';
import { InvoiceDetailsDrawer } from '@/components/features/invoices/InvoiceDetailsDrawer';
import { GenerateInvoiceModal } from '@/components/features/invoices/GenerateInvoiceModal';
import { MarkPaidModal } from '@/components/features/invoices/MarkPaidModal';
import { FilePlus } from 'lucide-react';

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'OUTSTANDING' | 'PAID' | 'OVERDUE' | 'DRAFTS'>('ALL');
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [data, setData] = useState<InvoiceListResult | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers
  const detailsDrawer = useModal<Invoice>();
  const generateModal = useModal();
  const markPaidModal = useModal<Invoice>();

  const loadInvoices = () => {
    setIsLoading(true);

    const activeFilters: InvoiceFilters = { ...filters };
    if (activeTab === 'OUTSTANDING') {
      activeFilters.status = 'ISSUED';
    } else if (activeTab === 'PAID') {
      activeFilters.status = 'PAID';
    } else if (activeTab === 'OVERDUE') {
      activeFilters.status = 'OVERDUE';
    } else if (activeTab === 'DRAFTS') {
      activeFilters.status = 'DRAFT';
    }

    invoiceService.getInvoices(activeFilters, pagination.page, pagination.pageSize).then((res) => {
      if (res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isCancelled = false;
    const activeFilters: InvoiceFilters = { ...filters };
    if (activeTab === 'OUTSTANDING') {
      activeFilters.status = 'ISSUED';
    } else if (activeTab === 'PAID') {
      activeFilters.status = 'PAID';
    } else if (activeTab === 'OVERDUE') {
      activeFilters.status = 'OVERDUE';
    } else if (activeTab === 'DRAFTS') {
      activeFilters.status = 'DRAFT';
    }

    invoiceService.getInvoices(activeFilters, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [activeTab, filters, pagination.page, pagination.pageSize]);

  const handleGenerateInvoice = async (
    entityId: string,
    entityName: string,
    entityCode: string,
    entityType: EntityType,
    invoiceType: InvoiceType,
    taxableAmount: number,
    gstRate: number,
    tdsApplicable: boolean,
    tdsRate: number,
    billingPeriod: string,
    description: string
  ) => {
    await invoiceService.generateInvoice(
      entityId,
      entityName,
      entityCode,
      entityType,
      invoiceType,
      { taxableAmount, gstRate, tdsApplicable, tdsRate },
      billingPeriod,
      description
    );
    loadInvoices();
  };

  const handleMarkPaid = async (
    invoiceId: string,
    receivedAmount: number,
    utr: string,
    remarks: string
  ) => {
    await invoiceService.markInvoicePaid(invoiceId, receivedAmount, utr, remarks);
    loadInvoices();
    if (detailsDrawer.data && detailsDrawer.data.id === invoiceId) {
      const updated = await invoiceService.getInvoiceById(invoiceId);
      if (updated.data) detailsDrawer.open(updated.data);
    }
  };

  const handleDownloadInvoice = (inv: Invoice, format: 'FORMAT_1' | 'FORMAT_2' = 'FORMAT_1') => {
    const win = window.open('', '_blank');
    if (!win) return;

    const rawInv = inv as any;
    const isFormat2 = format === 'FORMAT_2' || rawInv.paymentMethod === 'BANK_TRANSFER' || rawInv.paymentMethod === 'IMPS' || rawInv.paymentMethod === 'NEFT';

    win.document.write(`
      <html>
        <head>
          <title>${isFormat2 ? 'Payout Settlement Advice' : 'Commercial Gateway Tax Invoice'} - ${inv.id}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; font-size: 13px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid ${isFormat2 ? '#4338ca' : '#047857'}; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 26px; font-weight: 800; color: ${isFormat2 ? '#3730a3' : '#065f46'}; }
            .badge { display: inline-block; padding: 4px 10px; background: ${isFormat2 ? '#e0e7ff' : '#d1fae5'}; color: ${isFormat2 ? '#3730a3' : '#065f46'}; font-weight: bold; border-radius: 4px; font-size: 11px; margin-top: 5px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .box { padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
            .table th { background: ${isFormat2 ? '#e0e7ff' : '#f0fdf4'}; color: #0f172a; font-weight: bold; }
            .text-right { text-align: right; }
            .summary { margin-top: 25px; text-align: right; font-family: monospace; }
            .footer-note { margin-top: 40px; pt: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">BRIGHT SPARK</div>
              <div style="font-weight:600; color: #475569;">${isFormat2 ? 'Corporate Settlement & Payout Engine' : 'Commercial Retailer Gateway Services'}</div>
              <div>GSTIN: 36BSPAY9981P1Z0 | CIN: U72900TG2026PTC189000</div>
            </div>
            <div style="text-align: right">
              <div class="badge">${isFormat2 ? 'FORMAT 2: CORPORATE PAYOUT ADVICE' : 'FORMAT 1: COMMERCIAL TAX INVOICE'}</div>
              <h2 style="margin: 8px 0 0 0; font-family: monospace;">${inv.id}</h2>
              <div>Issue Date: ${new Date(inv.issueDate).toLocaleDateString('en-IN')}</div>
              <div>Payment Mode: <strong>${rawInv.paymentMethod || (isFormat2 ? 'IMPS / NEFT' : 'UPI / GATEWAY')}</strong></div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="box">
              <strong style="color:#0f172a">Billed To (Entity Credentials):</strong><br/>
              <strong>${inv.entityName}</strong> (${inv.entityCode})<br/>
              EntityType: ${inv.entityType}<br/>
              GSTIN: ${inv.gstin || '27AAACG1234F1Z9'}<br/>
              Billing Period: ${inv.billingPeriod}
            </div>
            <div class="box">
              <strong style="color:#0f172a">${isFormat2 ? 'Bank & UTR Audit Track:' : 'Gateway Transaction Ref:'}</strong><br/>
              UTR / Ref ID: <strong>${rawInv.utrNumber || 'UTR98410294821'}</strong><br/>
              Status: <strong style="color:green">${inv.status}</strong><br/>
              Nodal Bank: HDFC Escrow Account<br/>
              Settlement Cycle: T+0 Real-Time
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Service Line Description</th>
                <th>Quantity</th>
                <th class="text-right">Taxable Amount</th>
                <th class="text-right">GST Rate</th>
                <th class="text-right">GST Amount</th>
                <th class="text-right">Total Net Amount</th>
              </tr>
            </thead>
            <tbody>
              ${inv.lineItems
                .map(
                  (li) => `
                <tr>
                  <td>${li.description}</td>
                  <td>${li.quantity}</td>
                  <td class="text-right">₹${li.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">${li.gstRate}%</td>
                  <td class="text-right">₹${li.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">₹${li.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="summary">
            <div>Gross Taxable Amount: ₹${inv.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div>GST (CGST 9% + SGST 9%): ₹${inv.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div>Gross Total Invoice Value: ₹${inv.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div>TDS Deducted (Sec 194H / 194C): -₹${inv.tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <h2 style="margin-top:10px; color:${isFormat2 ? '#3730a3' : '#065f46'}">Net Payable / Settled: ₹${inv.netReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>

          <div class="footer-note">
            This is a computer-generated ${isFormat2 ? 'Payout Settlement Advice Voucher' : 'Tax Invoice'} generated by Bright Spark. Signature not required.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const summary = data?.summary || {
    totalInvoiced: 0,
    outstandingAmount: 0,
    paidAmount: 0,
    gstCollected: 0,
    tdsDeducted: 0,
    overdueCount: 0,
    totalInvoices: 0,
  };

  return (
    <PageContainer
      title="Invoice Management"
      description="Manage platform fee invoices, tax components, payment status, and financial references across commercial entities."
      actions={
        <Button variant="primary" size="sm" onClick={generateModal.open} leftIcon={<FilePlus className="w-3.5 h-3.5" />}>
          Generate Invoice
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Summary Metric Cards */}
        <InvoiceSummaryCards summary={summary} />

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('ALL');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ALL'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Invoices ({summary.totalInvoices})
          </button>
          <button
            onClick={() => {
              setActiveTab('OUTSTANDING');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'OUTSTANDING'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Outstanding Invoices
          </button>
          <button
            onClick={() => {
              setActiveTab('PAID');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'PAID'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Paid Invoices
          </button>
          <button
            onClick={() => {
              setActiveTab('OVERDUE');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'OVERDUE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overdue ({summary.overdueCount})
          </button>
          <button
            onClick={() => {
              setActiveTab('DRAFTS');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'DRAFTS'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Drafts
          </button>
        </div>

        {/* Filter Bar */}
        <InvoiceFilterBar
          onFilterChange={(f) => {
            setFilters(f);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onReset={() => {
            setFilters({});
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          isLoading={isLoading}
        />

        {/* Data Table */}
        <InvoiceTable
          data={data?.items || []}
          isLoading={isLoading}
          onViewInvoice={(inv) => detailsDrawer.open(inv)}
          onDownloadInvoice={handleDownloadInvoice}
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
        />

        {/* Drawers & Modals */}
        <InvoiceDetailsDrawer
          isOpen={detailsDrawer.isOpen}
          onClose={detailsDrawer.close}
          invoice={detailsDrawer.data}
          onMarkPaid={(inv) => markPaidModal.open(inv)}
          onDownload={handleDownloadInvoice}
        />

        <GenerateInvoiceModal
          isOpen={generateModal.isOpen}
          onClose={generateModal.close}
          onGenerate={handleGenerateInvoice}
        />

        <MarkPaidModal
          isOpen={markPaidModal.isOpen}
          onClose={markPaidModal.close}
          invoice={markPaidModal.data}
          onMarkPaid={handleMarkPaid}
        />
      </div>
    </PageContainer>
  );
}
