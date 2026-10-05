'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { dashboardService } from '@/services/dashboardService';
import { hierarchyService } from '@/services/hierarchyService';
import { approvalService, PendingApprovalItem } from '@/services/approvalService';
import { FullDashboardData, DashboardFilters } from '@/types/dashboard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';

import { AdminHeroGreetingCard } from '@/components/features/dashboard/AdminHeroGreetingCard';
import { DashboardFilterDrawer } from '@/components/features/dashboard/DashboardFilterDrawer';
import { PayInDashboardView } from '@/components/features/dashboard/PayInDashboardView';
import { PayOutDashboardView } from '@/components/features/dashboard/PayOutDashboardView';
import { NetworkKYCDashboardView } from '@/components/features/dashboard/NetworkKYCDashboardView';
import { AddMemberModal, MemberType } from '@/components/features/users/AddMemberModal';
import { ApprovalDetailDrawer, RejectionReasonModal } from '@/components/features/admin/network';

import KYCDashboardPage from '@/app/(protected)/kyc/dashboard/page';
import SalesDashboardPage from '@/app/(protected)/sales/dashboard/page';
import AccountsDashboardPage from '@/app/(protected)/accounts/dashboard/page';
import OperationsDashboardPage from '@/app/(protected)/operations/dashboard/page';

import { ArrowDownLeft, ArrowUpRight, Store } from 'lucide-react';

export default function AdminDashboardPage() {
  const { session } = useAuth();

  if (session?.role === 'KYC') {
    return <KYCDashboardPage />;
  }
  if (session?.role === 'SALES') {
    return <SalesDashboardPage />;
  }
  if (session?.role === 'ACCOUNTS') {
    return <AccountsDashboardPage />;
  }
  if (session?.role === 'OPERATIONS' || session?.role === 'SUPPORT') {
    return <OperationsDashboardPage />;
  }

  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const { session } = useAuth();
  const { toastSuccess, toastError } = useToast();

  // Dashboard View Tab State: PAY_IN | PAY_OUT | NETWORK_KYC
  const [activeTab, setActiveTab] = useState<'PAY_IN' | 'PAY_OUT' | 'NETWORK_KYC'>('PAY_IN');

  const [data, setData] = useState<FullDashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter Drawer Offcanvas State (Requirement 3)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  // Network Hierarchy counts
  const [mdCount, setMdCount] = useState<number>(0);
  const [distributorCount, setDistributorCount] = useState<number>(0);
  const [retailerCount, setRetailerCount] = useState<number>(0);
  const [activeRetailersCount, setActiveRetailersCount] = useState<number>(0);

  // Approval Workload
  const [approvalItems, setApprovalItems] = useState<PendingApprovalItem[]>([]);

  // Add Member Modal State
  const [addMemberModalOpen, setAddMemberModalOpen] = useState<boolean>(false);
  const [addMemberType, setAddMemberType] = useState<MemberType>('RETAILER');

  // Approval Detail Drawer & Rejection Modal State
  const [detailItem, setDetailItem] = useState<PendingApprovalItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [rejectingItem, setRejectingItem] = useState<PendingApprovalItem | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState<boolean>(false);

  const loadNetworkAndApprovalData = () => {
    try {
      const mds = hierarchyService.getAllMasterDistributors();
      const dists = hierarchyService.getAllDistributors();
      const rets = hierarchyService.getAllRetailers();

      setMdCount(mds.length);
      setDistributorCount(dists.length);
      setRetailerCount(rets.length);
      setActiveRetailersCount(rets.filter((r) => r.accountStatus === 'ACTIVE').length);

      const items = approvalService.getApprovalItems('PENDING', 'ALL');
      setApprovalItems(items);
    } catch (e) {
      console.error('Failed to fetch hierarchy & approval metrics:', e);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(loadNetworkAndApprovalData, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    dashboardService
      .getDashboardData(filters)
      .then((response) => {
        if (!isCancelled) {
          if (response.success && response.data) {
            setData(response.data);
            setError(null);
          } else {
            setError('Failed to load dashboard data.');
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError('An error occurred while fetching dashboard data.');
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  const handleApplyFilters = (newFilters: DashboardFilters) => {
    setIsLoading(true);
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setFilters({});
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadNetworkAndApprovalData();
    setFilters((prev) => ({ ...prev }));
  };

  // Add Member Modal Handler
  const handleOpenAddMember = (role: MemberType) => {
    setAddMemberType(role);
    setAddMemberModalOpen(true);
  };

  const handleMemberAddedSuccess = () => {
    loadNetworkAndApprovalData();
  };

  // Approval Drawer Action Handlers
  const handleReviewItem = (item: PendingApprovalItem) => {
    setDetailItem(item);
    setDetailDrawerOpen(true);
  };

  const handleApprove = async (item: PendingApprovalItem) => {
    if (item.entityType === 'DISTRIBUTOR') {
      const res = await approvalService.approveDistributor(item.id, session?.userId || 'usr_admin_01');
      if (res.success && res.data) {
        toastSuccess(`Distributor "${res.data.code}" approved successfully!`);
        loadNetworkAndApprovalData();
      } else {
        toastError(res.error?.message || 'Failed to approve distributor.');
      }
    } else {
      const res = await approvalService.approveRetailer(item.id, session?.userId || 'usr_admin_01');
      if (res.success && res.data) {
        toastSuccess(`Retailer "${res.data.code}" approved successfully!`);
        loadNetworkAndApprovalData();
      } else {
        toastError(res.error?.message || 'Failed to approve retailer.');
      }
    }
  };

  const handlePromptReject = (item: PendingApprovalItem) => {
    setRejectingItem(item);
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingItem) return;

    if (rejectingItem.entityType === 'DISTRIBUTOR') {
      const res = await approvalService.rejectDistributor(
        rejectingItem.id,
        reason,
        session?.userId || 'usr_admin_01'
      );
      if (res.success && res.data) {
        toastSuccess(`Distributor "${res.data.code}" application rejected.`);
        loadNetworkAndApprovalData();
      } else {
        toastError(res.error?.message || 'Failed to reject distributor.');
      }
    } else {
      const res = await approvalService.rejectRetailer(
        rejectingItem.id,
        reason,
        session?.userId || 'usr_admin_01'
      );
      if (res.success && res.data) {
        toastSuccess(`Retailer "${res.data.code}" application rejected.`);
        loadNetworkAndApprovalData();
      } else {
        toastError(res.error?.message || 'Failed to reject retailer.');
      }
    }

    setRejectingItem(null);
  };

  const pendingApprovalsCount = approvalItems.filter((i) => i.approvalStatus === 'PENDING_APPROVAL').length;
  const activeFilterCount = Object.values(filters).filter((val) => val && val !== 'ALL' && val !== '').length;

  return (
    <PageContainer fullWidth className="space-y-6 pb-12">
      {/* 1. Theme Executive Dashboard Header */}
      <AdminHeroGreetingCard
        adminName={session?.name || 'Admin'}
        lastLoginAt={session?.loggedInAt}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        pendingApprovalsCount={pendingApprovalsCount}
        activeFilterCount={activeFilterCount}
        onOpenAddMember={handleOpenAddMember}
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Error State Fallback */}
      {error ? (
        <ErrorState
          title="Dashboard Data Failed to Load"
          description={error}
          onRetry={handleRefresh}
        />
      ) : !isLoading && data && data.metrics.totalTransactions === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description="There are no transaction records matching your selected filter criteria."
          action={
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#155EEF] text-white text-xs font-semibold rounded-lg hover:bg-[#1149B8] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          }
        />
      ) : (
        /* 2. Primary Analytical Workspace with Enterprise Segmented Switcher */
        <div className="space-y-6">
          {/* Segmented Navigation Control */}
          <div className="bg-white p-1.5 rounded-xl border border-[#E5EAF1] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] rounded-lg border border-[#E5EAF1] w-full sm:w-auto">
              {/* Pay-In Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('PAY_IN')}
                className={`px-3.5 py-2 rounded-md font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'PAY_IN'
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
                }`}
              >
                <ArrowDownLeft className={`w-3.5 h-3.5 ${activeTab === 'PAY_IN' ? 'text-white' : 'text-[#155EEF]'}`} />
                <span>Pay-In</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  activeTab === 'PAY_IN' ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-[#475569]'
                }`}>
                  Collection
                </span>
              </button>

              {/* Pay-Out Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('PAY_OUT')}
                className={`px-3.5 py-2 rounded-md font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'PAY_OUT'
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
                }`}
              >
                <ArrowUpRight className={`w-3.5 h-3.5 ${activeTab === 'PAY_OUT' ? 'text-white' : 'text-[#155EEF]'}`} />
                <span>Pay-Out</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  activeTab === 'PAY_OUT' ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-[#475569]'
                }`}>
                  Settlements
                </span>
              </button>

              {/* Retailers, Dist & KYCs Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('NETWORK_KYC')}
                className={`px-3.5 py-2 rounded-md font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'NETWORK_KYC'
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/60'
                }`}
              >
                <Store className={`w-3.5 h-3.5 ${activeTab === 'NETWORK_KYC' ? 'text-white' : 'text-[#155EEF]'}`} />
                <span>Network & KYC</span>
                {pendingApprovalsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                    activeTab === 'NETWORK_KYC' ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {pendingApprovalsCount} pending
                  </span>
                )}
              </button>
            </div>

            <div className="text-xs text-[#64748B] font-medium px-3 hidden md:block">
              {activeTab === 'PAY_IN' && 'Retailer acquiring collection streams & gateway SLAs'}
              {activeTab === 'PAY_OUT' && 'Settlement disbursements, nodal escrow & bank channels'}
              {activeTab === 'NETWORK_KYC' && 'Retailer, Distributor hierarchy & onboarding verifications'}
            </div>
          </div>

          {/* Render Active View Tab Content */}
          {activeTab === 'PAY_IN' && data && (
            <PayInDashboardView
              metrics={data.metrics}
              trendData={data.trendData}
              channelStats={data.channelStats}
              providerStats={data.providerStats}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'PAY_OUT' && data && (
            <PayOutDashboardView
              metrics={data.metrics}
              trendData={data.trendData}
              balanceOverview={data.balanceOverview}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'NETWORK_KYC' && (
            <NetworkKYCDashboardView
              mdCount={mdCount}
              distributorCount={distributorCount}
              retailerCount={retailerCount}
              activeRetailersCount={activeRetailersCount}
              pendingApprovalsCount={pendingApprovalsCount}
              approvalItems={approvalItems}
              onReviewItem={handleReviewItem}
              onRefreshData={handleRefresh}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* Offcanvas Operational Filter Drawer (Requirement 3) */}
      <DashboardFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
      />

      {/* Global Add Member Modal Dialog */}
      <AddMemberModal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        defaultType={addMemberType}
        onSuccess={handleMemberAddedSuccess}
      />

      {/* Global KYC Approval Detail Drawer */}
      <ApprovalDetailDrawer
        item={detailItem}
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        onApprove={handleApprove}
        onReject={handlePromptReject}
        onRefresh={handleRefresh}
      />

      {/* Global Rejection Reason Modal */}
      {rejectingItem && (
        <RejectionReasonModal
          isOpen={rejectionModalOpen}
          onClose={() => setRejectionModalOpen(false)}
          onConfirm={handleConfirmReject}
          entityName={rejectingItem.name}
          entityCode={rejectingItem.code}
          entityType={rejectingItem.entityType}
        />
      )}
    </PageContainer>
  );
}
