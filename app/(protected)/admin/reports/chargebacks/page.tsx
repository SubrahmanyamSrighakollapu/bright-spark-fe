'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { chargebackService, ChargebackListResult } from '@/services/chargebackService';
import { reportService } from '@/services/reportService';
import { Chargeback, ChargebackSummary } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ReportExportMenu } from '@/components/features/reports/ReportExportMenu';
import { AdminReportNav } from '@/components/features/reports/AdminReportNav';
import { Eye } from 'lucide-react';

export default function ChargebackReportPage() {
  const [data, setData] = useState<ChargebackListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    chargebackService.getChargebacks({}, 1, 100).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleExportCsv = () => {
    if (!data?.items) return;
    const exportRows = data.items.map((c) => ({
      'Chargeback ID': c.chargebackId,
      'Transaction ID': c.transactionId,
      'Order ID': c.orderId || 'N/A',
      'Retailer Name': c.entityName,
      'Disputed Amount (INR)': c.disputedAmount,
      'Lien Hold (INR)': c.holdAmount,
      'Dispute Reason': c.reasonCode,
      'Status': c.status,
      'Priority': c.priority,
      'Provider': c.provider,
      'Filing Date': c.filingDate,
      'Resolved Date': c.resolvedAt || 'N/A',
      'Resolution Outcome': c.status === 'WON' || c.status === 'LOST' ? c.status : 'UNRESOLVED',
    }));
    reportService.exportToCsv('Chargeback_Analytics_Report', exportRows);
  };

  const summary: ChargebackSummary = data?.summary || {
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

  const columns = [
    {
      key: 'chargebackId',
      header: 'Dispute ID / Txn',
      render: (row: Chargeback) => (
        <div>
          <span className="font-mono font-bold text-[var(--primary)] text-xs block">{row.chargebackId}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.transactionId}</span>
        </div>
      ),
    },
    {
      key: 'entityName',
      header: 'Retailer Name',
      render: (row: Chargeback) => (
        <span className="font-semibold text-xs text-slate-900">{row.entityName}</span>
      ),
    },
    {
      key: 'disputedAmount',
      header: 'Disputed Amount',
      align: 'right' as const,
      render: (row: Chargeback) => (
        <span className="font-mono font-extrabold text-xs text-rose-700">{formatCurrency(row.disputedAmount)}</span>
      ),
    },
    {
      key: 'reasonCode',
      header: 'Reason Code',
      render: (row: Chargeback) => (
        <span className="text-xs text-slate-800 font-semibold">{row.reasonCode}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center' as const,
      render: (row: Chargeback) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'filingDate',
      header: 'Filing Date',
      render: (row: Chargeback) => (
        <span className="text-xs text-slate-500 font-mono whitespace-nowrap">{formatDate(row.filingDate)}</span>
      ),
    },
  ];

  return (
    <PageContainer
      title="Chargeback Report"
      description="Operational dispute analytics, loss exposure reporting, representment win rates, and exportable logs."
      actions={
        <ReportExportMenu onExportCsv={handleExportCsv} reportTitle="Chargeback Report" disabled={!data?.items?.length} />
      }
    >
      <div className="space-y-6">
        {/* Reports Navigation Bar */}
        <AdminReportNav />

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Open Disputes</span>
            <div className="mt-1 font-mono font-extrabold text-base text-[var(--primary)]">{summary.openCases} Cases</div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active representments</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Disputed Volume</span>
            <div className="mt-1 font-mono font-extrabold text-base text-rose-700">{formatCurrency(summary.totalDisputedAmount)}</div>
            <span className="text-[11px] text-rose-600 block mt-0.5">Lien hold exposure</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Representment Win Rate</span>
            <div className="mt-1 font-mono font-extrabold text-base text-emerald-700">{summary.winRate}%</div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">{summary.wonCases} Won • {summary.lostCases} Lost</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total Booked Loss</span>
            <div className="mt-1 font-mono font-extrabold text-base text-rose-900">{formatCurrency(summary.totalLossAmount)}</div>
            <span className="text-[11px] text-rose-600 block mt-0.5">Unrecovered loss</span>
          </Card>
        </div>

        {/* Live Data Table */}
        <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
          <Table
            columns={columns}
            data={data?.items || []}
            keyExtractor={(r) => r.chargebackId}
            isLoading={isLoading}
            renderActions={() => (
              <Link href="/chargebacks">
                <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Inspect Case
                </Button>
              </Link>
            )}
          />
        </div>
      </div>
    </PageContainer>
  );
}
