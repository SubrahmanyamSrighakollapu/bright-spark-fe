'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/hooks/useModal';
import {
  settlementService,
  SettlementListResult,
  BatchListResult,
  ReconciliationListResult,
} from '@/services/settlementService';
import {
  Settlement,
  SettlementBatch,
  SettlementReconciliation,
  SettlementFilters,
  BatchFilters,
  ReconciliationFilters,
  PaginationState,
} from '@/types/domain';
import { SettlementSummaryCards } from '@/components/features/settlements/SettlementSummaryCards';
import { SettlementFilterBar } from '@/components/features/settlements/SettlementFilterBar';
import { SettlementTable } from '@/components/features/settlements/SettlementTable';
import { SettlementDetailsDrawer } from '@/components/features/settlements/SettlementDetailsDrawer';
import { SettlementBatchTable } from '@/components/features/settlements/SettlementBatchTable';
import { BatchDetailsModal } from '@/components/features/settlements/BatchDetailsModal';
import { ReconciliationTable } from '@/components/features/settlements/ReconciliationTable';
import { ReconciliationDetailsModal } from '@/components/features/settlements/ReconciliationDetailsModal';
import { Download, RefreshCw } from 'lucide-react';
import { reportService } from '@/services/reportService';

export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUEUE' | 'BATCHES' | 'HISTORY' | 'RECONCILIATION'>('OVERVIEW');

  // Main Settlements State
  const [settlementData, setSettlementData] = useState<SettlementListResult | null>(null);
  const [filters, setFilters] = useState<SettlementFilters>({});
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Batches State
  const [batchData, setBatchData] = useState<BatchListResult | null>(null);
  const [batchFilters] = useState<BatchFilters>({});
  const [batchPagination, setBatchPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });

  // Reconciliation State
  const [reconcileData, setReconcileData] = useState<ReconciliationListResult | null>(null);
  const [reconcileFilters] = useState<ReconciliationFilters>({});
  const [reconcilePagination, setReconcilePagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });

  // Modals / Drawers
  const detailsDrawer = useModal<Settlement>();
  const batchModal = useModal<SettlementBatch>();
  const reconcileModal = useModal<SettlementReconciliation>();

  const loadSettlements = useCallback(() => {
    setIsLoading(true);
    let tabStatus: 'ALL' | Settlement['status'] = 'ALL';
    if (activeTab === 'QUEUE') {
      tabStatus = 'ELIGIBLE';
    } else if (activeTab === 'HISTORY') {
      tabStatus = 'SETTLED';
    }

    const currentFilters = { ...filters, status: filters.status || (tabStatus !== 'ALL' ? tabStatus : undefined) };

    settlementService.getSettlements(currentFilters, pagination.page, pagination.pageSize).then((res) => {
      if (res.success && res.data) {
        setSettlementData(res.data);
        setPagination(res.data.pagination);
      }
      setIsLoading(false);
    });
  }, [activeTab, filters, pagination.page, pagination.pageSize]);

  useEffect(() => {
    let isCancelled = false;
    if (activeTab === 'OVERVIEW' || activeTab === 'QUEUE' || activeTab === 'HISTORY') {
      let tabStatus: 'ALL' | Settlement['status'] = 'ALL';
      if (activeTab === 'QUEUE') {
        tabStatus = 'ELIGIBLE';
      } else if (activeTab === 'HISTORY') {
        tabStatus = 'SETTLED';
      }
      const currentFilters = { ...filters, status: filters.status || (tabStatus !== 'ALL' ? tabStatus : undefined) };
      settlementService.getSettlements(currentFilters, pagination.page, pagination.pageSize).then((res) => {
        if (!isCancelled && res.success && res.data) {
          setSettlementData(res.data);
          setPagination(res.data.pagination);
          setIsLoading(false);
        }
      });
    } else if (activeTab === 'BATCHES') {
      settlementService.getBatches(batchFilters, batchPagination.page, batchPagination.pageSize).then((res) => {
        if (!isCancelled && res.success && res.data) {
          setBatchData(res.data);
          setBatchPagination(res.data.pagination);
          setIsLoading(false);
        }
      });
    } else if (activeTab === 'RECONCILIATION') {
      settlementService
        .getReconciliationRecords(reconcileFilters, reconcilePagination.page, reconcilePagination.pageSize)
        .then((res) => {
          if (!isCancelled && res.success && res.data) {
            setReconcileData(res.data);
            setReconcilePagination(res.data.pagination);
            setIsLoading(false);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [activeTab, filters, pagination.page, pagination.pageSize, batchFilters, batchPagination.page, batchPagination.pageSize, reconcileFilters, reconcilePagination.page, reconcilePagination.pageSize]);

  const handleProcessSettlement = async (s: Settlement) => {
    setIsLoading(true);
    await settlementService.processMockSettlement(s.settlementId, 'PROCESS');
    loadSettlements();
  };

  const handleCheckStatus = async (s: Settlement) => {
    setIsLoading(true);
    await settlementService.processMockSettlement(s.settlementId, 'PROCESS');
    loadSettlements();
  };

  const handleResolveReconciliation = async (reconciliationId: string, action: 'MATCH' | 'MANUAL_REVIEW', remarks?: string) => {
    await settlementService.reconcileMockSettlement(reconciliationId, action, remarks);
    if (activeTab === 'RECONCILIATION') {
      setIsLoading(true);
      settlementService
        .getReconciliationRecords(reconcileFilters, reconcilePagination.page, reconcilePagination.pageSize)
        .then((res) => {
          if (res.success && res.data) {
            setReconcileData(res.data);
            setReconcilePagination(res.data.pagination);
          }
          setIsLoading(false);
        });
    }
  };

  const exportActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Download className="w-3.5 h-3.5" />}
        onClick={() => {
          const rows = activeTab === 'BATCHES'
            ? (batchData?.items || [])
            : activeTab === 'RECONCILIATION'
            ? (reconcileData?.items || [])
            : (settlementData?.items || []);
          reportService.exportToCsv(`Settlements_${activeTab}`, rows as unknown as Record<string, unknown>[]);
        }}
      >
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={loadSettlements} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
        Refresh
      </Button>
    </div>
  );

  return (
    <PageContainer
      title="Settlement Management"
      description="Monitor settlement eligibility, processing, payouts, settlement batches, and bank reconciliation."
      actions={exportActions}
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <SettlementSummaryCards summary={settlementData?.summary || null} isLoading={isLoading} />

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('OVERVIEW');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Settlement Overview
          </button>

          <button
            onClick={() => {
              setActiveTab('QUEUE');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'QUEUE'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Settlement Queue
          </button>

          <button
            onClick={() => {
              setActiveTab('BATCHES');
              setBatchPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'BATCHES'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Settlement Batches
          </button>

          <button
            onClick={() => {
              setActiveTab('HISTORY');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'HISTORY'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Settlement History
          </button>

          <button
            onClick={() => {
              setActiveTab('RECONCILIATION');
              setReconcilePagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'RECONCILIATION'
                ? 'border-[var(--primary)] text-[var(--primary)] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Bank Reconciliation
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <SettlementFilterBar
              onApplyFilters={(f) => {
                setFilters(f);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              onResetFilters={() => {
                setFilters({});
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              isLoading={isLoading}
            />

            <SettlementTable
              settlements={settlementData?.items || []}
              pagination={pagination}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
              onViewDetails={(s) => detailsDrawer.open(s)}
              onProcessSettlement={handleProcessSettlement}
              onCheckStatus={handleCheckStatus}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 2: QUEUE */}
        {activeTab === 'QUEUE' && (
          <div className="space-y-6">
            <SettlementFilterBar
              onApplyFilters={(f) => {
                setFilters({ ...f, status: 'ELIGIBLE' });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              onResetFilters={() => {
                setFilters({ status: 'ELIGIBLE' });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              hideStatusFilter
              isLoading={isLoading}
            />

            <SettlementTable
              settlements={settlementData?.items || []}
              pagination={pagination}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
              onViewDetails={(s) => detailsDrawer.open(s)}
              onProcessSettlement={handleProcessSettlement}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 3: BATCHES */}
        {activeTab === 'BATCHES' && (
          <div className="space-y-6">
            <SettlementBatchTable
              batches={batchData?.items || []}
              pagination={batchPagination}
              onPageChange={(page) => setBatchPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setBatchPagination((prev) => ({ ...prev, page: 1, pageSize }))}
              onViewBatch={(b) => batchModal.open(b)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 4: HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-6">
            <SettlementFilterBar
              onApplyFilters={(f) => {
                setFilters({ ...f, status: 'SETTLED' });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              onResetFilters={() => {
                setFilters({ status: 'SETTLED' });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              hideStatusFilter
              isLoading={isLoading}
            />

            <SettlementTable
              settlements={settlementData?.items || []}
              pagination={pagination}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
              onViewDetails={(s) => detailsDrawer.open(s)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 5: RECONCILIATION */}
        {activeTab === 'RECONCILIATION' && (
          <div className="space-y-6">
            <ReconciliationTable
              records={reconcileData?.items || []}
              pagination={reconcilePagination}
              onPageChange={(page) => setReconcilePagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setReconcilePagination((prev) => ({ ...prev, page: 1, pageSize }))}
              onViewRecord={(r) => reconcileModal.open(r)}
              onResolveMismatch={(r) => reconcileModal.open(r)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Modals & Drawers */}
        <SettlementDetailsDrawer
          isOpen={detailsDrawer.isOpen}
          onClose={detailsDrawer.close}
          settlement={detailsDrawer.data}
          onCheckStatus={handleCheckStatus}
        />

        <BatchDetailsModal
          isOpen={batchModal.isOpen}
          onClose={batchModal.close}
          batch={batchModal.data}
        />

        <ReconciliationDetailsModal
          isOpen={reconcileModal.isOpen}
          onClose={reconcileModal.close}
          record={reconcileModal.data}
          onResolve={handleResolveReconciliation}
        />
      </div>
    </PageContainer>
  );
}
