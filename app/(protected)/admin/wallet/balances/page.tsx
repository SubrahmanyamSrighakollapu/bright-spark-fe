'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/hooks/useModal';
import { walletService, WalletListResult } from '@/services/walletService';
import { reportService } from '@/services/reportService';
import { WalletAccount, WalletFilters, PaginationState, EntityType } from '@/types/domain';
import { WalletSummaryCards } from '@/components/features/wallet/WalletSummaryCards';
import { WalletFilterBar } from '@/components/features/wallet/WalletFilterBar';
import { WalletTable } from '@/components/features/wallet/WalletTable';
import { WalletDetailsDrawer } from '@/components/features/wallet/WalletDetailsDrawer';
import { CreditDebitFormModal } from '@/components/features/wallet/CreditDebitFormModal';
import { Layers, Download } from 'lucide-react';

export default function AvailableBalancesPage() {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'DISTRIBUTOR' | 'RETAILER'>('MASTER');
  const [data, setData] = useState<WalletListResult | null>(null);
  const [filters, setFilters] = useState<WalletFilters>({ entityType: 'MASTER' });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Drawers
  const walletDrawer = useModal<WalletAccount>();
  const creditDebitModal = useModal<WalletAccount>();

  const fetchWallets = useCallback(
    async (type: EntityType, activeFilters?: WalletFilters, page = 1, pageSize = 10) => {
      setIsLoading(true);
      try {
        const mergedFilters: WalletFilters = { ...activeFilters, entityType: type };
        const res = await walletService.getWallets(mergedFilters, page, pageSize);
        if (res.success && res.data) {
          setData(res.data);
          setPagination(res.data.pagination);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let isCancelled = false;
    walletService
      .getWallets({ ...filters, entityType: activeTab }, pagination.page, pagination.pageSize)
      .then((res) => {
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

  const handleTabChange = (tab: 'MASTER' | 'DISTRIBUTOR' | 'RETAILER') => {
    setActiveTab(tab);
    setFilters({ entityType: tab });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleToggleFreeze = async (w: WalletAccount) => {
    if (w.status === 'FROZEN') {
      await walletService.unfreezeWallet(w.walletId);
    } else {
      await walletService.freezeWallet(w.walletId);
    }
    fetchWallets(activeTab, filters, pagination.page, pagination.pageSize);
  };

  const wallets = data?.items || [];
  const summary = data?.summary || {
    totalAvailable: 0,
    totalLedger: 0,
    totalHold: 0,
    totalPendingSettlement: 0,
  };

  const handleExportCSV = () => {
    if (!wallets.length) return;
    const exportRows = wallets.map((w) => ({
      'Wallet ID': w.walletId,
      'Entity Code': w.entityCode,
      'Entity Name': w.entityName,
      'Entity Type': w.entityType,
      'Parent Name': w.parentName || 'Direct',
      'Available Balance': w.availableBalance,
      'Ledger Balance': w.ledgerBalance,
      'Hold Balance': w.holdBalance,
      'Pending Settlement': w.pendingSettlement,
      'Status': w.status,
      'Last Updated': w.updatedAt,
    }));
    reportService.exportToCsv(`Admin_Wallet_Balances_${activeTab}_${new Date().toISOString().split('T')[0]}`, exportRows);
  };

  return (
    <PageContainer
      title="Available Balances"
      description="Monitor available, ledger, hold, and pending settlement balances across Master Distributors, Distributors, and Retailers."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export
        </Button>
      }
      className="space-y-6"
    >
      {/* 1. Top Summary Cards */}
      <WalletSummaryCards metrics={summary} isLoading={isLoading} />

      {/* 2. Entity Segmented Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] bg-white p-1 rounded-lg">
        {(
          [
            { id: 'MASTER', label: 'Master Treasury' },
            { id: 'DISTRIBUTOR', label: 'Distributors' },
            { id: 'RETAILER', label: 'Retailers' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Filter Bar (Show distributor filter for retailer records) */}
      {activeTab !== 'MASTER' && (
        <WalletFilterBar
          onApplyFilters={(f) => {
            setIsLoading(true);
            setFilters(f);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onResetFilters={() => {
            setIsLoading(true);
            setFilters({ entityType: activeTab });
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          showDistributorFilter={activeTab === 'RETAILER'}
          isLoading={isLoading}
        />
      )}

      {/* 4. Wallet Balances Table */}
      <WalletTable
        wallets={wallets}
        pagination={pagination}
        onPageChange={(page) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page }));
        }}
        onPageSizeChange={(pageSize) => {
          setIsLoading(true);
          setPagination((prev) => ({ ...prev, page: 1, pageSize }));
        }}
        onViewWallet={(w) => walletDrawer.open(w)}
        onCreditDebit={(w) => creditDebitModal.open(w)}
        onToggleFreeze={handleToggleFreeze}
        isLoading={isLoading}
      />

      {/* Wallet Details Drawer */}
      <WalletDetailsDrawer
        isOpen={walletDrawer.isOpen}
        onClose={walletDrawer.close}
        wallet={walletDrawer.data}
        onCreditDebit={(w) => creditDebitModal.open(w)}
        onToggleFreeze={handleToggleFreeze}
      />

      {/* Credit / Debit Form Modal */}
      <CreditDebitFormModal
        isOpen={creditDebitModal.isOpen}
        onClose={creditDebitModal.close}
        wallet={creditDebitModal.data}
        onSuccess={() => fetchWallets(activeTab, filters, pagination.page, pagination.pageSize)}
      />
    </PageContainer>
  );
}
