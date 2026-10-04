'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useModal } from '@/hooks/useModal';
import { ledgerService, LedgerListResult } from '@/services/ledgerService';
import { reportService } from '@/services/reportService';
import { LedgerEntry, LedgerFilters, PaginationState } from '@/types/domain';
import { LedgerFilterBar } from '@/components/features/wallet/LedgerFilterBar';
import { LedgerTable } from '@/components/features/wallet/LedgerTable';
import { LedgerDetailsDrawer } from '@/components/features/wallet/LedgerDetailsDrawer';
import { Download } from 'lucide-react';

function LedgerContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('searchQuery') || '';

  const [data, setData] = useState<LedgerListResult | null>(null);
  const [filters, setFilters] = useState<LedgerFilters>({ searchQuery: initialSearch });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const detailDrawer = useModal<LedgerEntry>();

  useEffect(() => {
    let isCancelled = false;
    ledgerService.getLedgerEntries(filters, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [filters, pagination.page, pagination.pageSize]);

  const entries = data?.items || [];

  const handleExportCSV = () => {
    if (!entries.length) return;
    const exportRows = entries.map((e) => ({
      'Ledger ID': e.id,
      'Date': e.createdAt,
      'Wallet ID': e.walletId,
      'Entity Name': e.entityName,
      'Entry Type': e.entryType,
      'Direction': e.direction,
      'Reference ID': e.referenceId || e.transactionId || '',
      'Opening Balance': e.openingBalance,
      'Amount': e.amount,
      'Closing Balance': e.closingBalance,
      'Description': e.description,
    }));
    reportService.exportToCsv(`Admin_Financial_Ledger_${new Date().toISOString().split('T')[0]}`, exportRows);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export
        </Button>
      </div>

      {/* 1. Filter Bar */}
      <LedgerFilterBar
        onApplyFilters={(f) => {
          setIsLoading(true);
          setFilters(f);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onResetFilters={() => {
          setIsLoading(true);
          setFilters({});
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        isLoading={isLoading}
      />

      {/* 2. Ledger Data Table */}
      <LedgerTable
        entries={entries}
        pagination={pagination}
        onPageChange={(page) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page }));
        }}
        onPageSizeChange={(pageSize) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page: 1, pageSize }));
        }}
        onViewDetails={(entry) => detailDrawer.open(entry)}
        isLoading={isLoading}
      />

      {/* Ledger Details Drawer */}
      <LedgerDetailsDrawer
        isOpen={detailDrawer.isOpen}
        onClose={detailDrawer.close}
        entry={detailDrawer.data}
      />
    </div>
  );
}

export default function FinancialLedgerPage() {
  return (
    <PageContainer
      title="Financial Audit Ledger"
      description="Complete immutable financial audit history showing pay-ins, pay-outs, charges, taxes, and manual adjustments."
    >
      <Suspense fallback={<LoadingSkeleton variant="table" count={5} />}>
        <LedgerContent />
      </Suspense>
    </PageContainer>
  );
}
