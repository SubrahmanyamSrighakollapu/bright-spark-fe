'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AccessDeniedView } from '@/components/features/auth/AccessDeniedView';
import { LedgerEntry, LedgerFilters } from '@/types/domain';
import { ledgerService } from '@/services/ledgerService';
import { reportService } from '@/services/reportService';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Button,
  SearchInput,
  Select,
  useToast,
  DateRangeDropdown,
} from '@/components/ui';
import { LedgerTable } from '@/components/features/wallet/LedgerTable';
import { LedgerDetailsDrawer } from '@/components/features/wallet/LedgerDetailsDrawer';
import { Download, RefreshCw } from 'lucide-react';

export default function DistributorLedgerPage() {
  const { session, isAuthenticated } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const isAuthorized =
    isAuthenticated &&
    session &&
    (session.role === 'DISTRIBUTOR' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN');

  const distributorId = session?.entityId || 'dst_001';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<any>({ preset: '7d' });

  // Data & Pagination
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Ledger Entry for Drawer
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const filters: LedgerFilters = {
        searchQuery: searchQuery || undefined,
        entryType: typeFilter !== 'ALL' ? (typeFilter as any) : undefined,
        direction: directionFilter !== 'ALL' ? (directionFilter as any) : undefined,
      };

      const res = await ledgerService.getDistributorLedger(
        distributorId,
        filters,
        1,
        100
      );

      if (res.success && res.data) {
        setEntries(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load Distributor ledger data:', err);
      toastError('Failed to load ledger entries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, distributorId, typeFilter, directionFilter, searchQuery]);

  // Paginated dataset
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [entries, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, directionFilter]);

  if (!isAuthorized) {
    return (
      <AccessDeniedView message="You do not have authorization to view wallet ledger entries for this Distributor account." />
    );
  }

  const handleExportCsv = () => {
    if (entries.length === 0) {
      toastError('No ledger entries available to export');
      return;
    }
    const exportRows = entries.map((e) => ({
      'Ledger ID': e.id,
      Reference: e.referenceId || '',
      Type: e.entryType,
      Direction: e.direction,
      Amount: e.amount,
      'Opening Balance': e.openingBalance,
      'Closing Balance': e.closingBalance,
      Description: e.description,
      'Created By': e.createdBy,
      'Date & Time': e.createdAt,
    }));
    reportService.exportToCsv('Distributor_Wallet_Ledger_Statement', exportRows);
  };

  const isFiltered = searchQuery || typeFilter !== 'ALL' || directionFilter !== 'ALL';

  return (
    <PageContainer
      title="Distributor Wallet Ledger"
      description="Audit immutable historical debit, credit, and commission settlement entries for your operating wallet"
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4 text-sky-600" />}
          >
            Export Statement
          </Button>
        </div>
      }
    >

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search Ledger ID, Reference, Transaction ID, Description..."
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-40">
              <Select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                options={[
                  { label: 'All Directions', value: 'ALL' },
                  { label: 'CREDIT (+)', value: 'CREDIT' },
                  { label: 'DEBIT (-)', value: 'DEBIT' },
                ]}
              />
            </div>

            <div className="w-44">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { label: 'All Entry Types', value: 'ALL' },
                  { label: 'COMMISSION', value: 'COMMISSION' },
                  { label: 'SETTLEMENT', value: 'SETTLEMENT' },
                  { label: 'WALLET_CREDIT', value: 'WALLET_CREDIT' },
                  { label: 'WALLET_DEBIT', value: 'WALLET_DEBIT' },
                  { label: 'HOLD', value: 'HOLD' },
                  { label: 'RELEASE', value: 'RELEASE' },
                  { label: 'ADJUSTMENT', value: 'ADJUSTMENT' },
                ]}
              />
            </div>

            <DateRangeDropdown
              value={dateRange}
              onChange={(val) => setDateRange(val)}
              size="md"
            />

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setDirectionFilter('ALL');
                  setDateRange({ preset: '7d' });
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="space-y-4">
        <LedgerTable
          entries={paginatedEntries}
          pagination={{
            page: currentPage,
            pageSize,
            totalItems: entries.length,
            totalPages: Math.ceil(entries.length / pageSize) || 1,
          }}
          onPageChange={setCurrentPage}
          onViewDetails={(entry) => {
            setSelectedEntry(entry);
            setDrawerOpen(true);
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Ledger Entry Detail Drawer */}
      <LedgerDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entry={selectedEntry}
      />
    </PageContainer>
  );
}
