import React, { useState, useEffect } from 'react';
import { Retailer, RetailerPlan } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { retailerPlanService } from '@/services/retailerPlanService';

import { retailerService } from '@/services/retailerService';
import { Drawer, StatusBadge, Button, Tabs } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Store,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  Tag,
  Edit,
  Power,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
} from 'lucide-react';

interface RetailerDetailDrawerProps {
  retailer: Retailer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (retailer: Retailer) => void;
  onToggleStatus: (retailer: Retailer) => void;
}

export const RetailerDetailDrawer: React.FC<RetailerDetailDrawerProps> = ({
  retailer,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [plan, setPlan] = useState<RetailerPlan | null>(null);

  useEffect(() => {
    if (retailer?.planId) {
      retailerPlanService.getPlanById(retailer.planId).then((res) => {
        if (res.success && res.data) {
          setPlan(res.data);
        } else {
          setPlan(null);
        }
      });
    } else {
      setPlan(null);
    }
  }, [retailer?.planId]);

  if (!retailer) return null;

  // Resolve hierarchy relationships
  const parentDst = hierarchyService.getDistributorById(retailer.distributorId);
  const masterDistributor = hierarchyService.getMasterDistributorById(retailer.masterDistributorId);


  // Scoped mock metrics
  const walletSummary = retailerService.getRetailerWalletSummary(retailer.id);
  const txnSummary = retailerService.getRetailerTransactionSummary(retailer.id);
  const commissionSummary = retailerService.getRetailerCommissionSummary(retailer.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'network', label: 'Network Hierarchy' },
    { id: 'plan', label: 'Commercial Plan' },
    { id: 'financials', label: 'Financials & Activity' },
    { id: 'approval', label: 'Approval & Governance' },
  ];

  const isPending = retailer.approvalStatus === 'PENDING_APPROVAL';
  const isRejected = retailer.approvalStatus === 'REJECTED';
  const canToggle = !isPending && !isRejected;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <span>{retailer.name}</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-[#D4E1AE]">
            {retailer.code}
          </span>
        </div>
      }
      description={`${retailer.businessName} • Parent: ${parentDst?.name || 'Distributor'}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onEdit(retailer);
              }}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit Details
            </Button>

            <Button
              variant={retailer.accountStatus === 'ACTIVE' ? 'outline' : 'primary'}
              disabled={!canToggle}
              onClick={() => canToggle && onToggleStatus(retailer)}
              leftIcon={<Power className="w-4 h-4" />}
              className={
                !canToggle
                  ? 'opacity-50 cursor-not-allowed'
                  : retailer.accountStatus === 'ACTIVE'
                  ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                  : ''
              }
            >
              {retailer.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Header Bar */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">Account Status</p>
              <div className="mt-1">
                <StatusBadge status={retailer.accountStatus} />
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Approval Status</p>
              <div className="mt-1">
                <StatusBadge
                  status={retailer.approvalStatus || 'APPROVED'}
                  label={
                    retailer.approvalStatus === 'PENDING_APPROVAL'
                      ? 'Pending Admin Approval'
                      : retailer.approvalStatus === 'REJECTED'
                      ? 'Rejected'
                      : 'Approved'
                  }
                />
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <p className="text-xs text-slate-500 font-medium">KYC Status</p>
              <div className="mt-1">
                <StatusBadge status={retailer.kycStatus || 'APPROVED'} />
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Created On</p>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {formatDateTime(retailer.createdAt)}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <User className="w-4 h-4 text-indigo-600" /> Outlet Contact Profile
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Retailer Name:</span>{' '}
                    <span className="font-semibold text-slate-900">{retailer.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>{' '}
                    <span className="font-mono text-slate-800">{retailer.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Mobile:</span>{' '}
                    <span className="font-mono text-slate-800">{retailer.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">User ID:</span>{' '}
                    <span className="font-mono text-slate-600">{retailer.userId}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <Store className="w-4 h-4 text-indigo-600" /> Business Credentials
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Business / Store Name:</span>{' '}
                    <span className="font-semibold text-slate-900">{retailer.businessName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Retailer Code:</span>{' '}
                    <span className="font-mono font-bold text-slate-800">{retailer.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Wallet Account ID:</span>{' '}
                    <span className="font-mono text-slate-800">{retailer.walletId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Store Location
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="font-medium">Standard Retail Outlet Address</p>
                  <p className="text-slate-500">Location details configured in profile.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Identification Metadata
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500">Retailer System ID:</span>{' '}
                    <span className="font-mono text-slate-800">{retailer.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Created Role:</span>{' '}
                    <span className="font-semibold text-slate-800">{retailer.createdByRole || 'DISTRIBUTOR'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Creator ID:</span>{' '}
                    <span className="font-mono text-slate-800">{retailer.createdByUserId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Network Hierarchy */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" /> Assigned Master Distributor
              </h4>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  {masterDistributor?.name || 'Apex National Network'}
                  <span className="ml-2 font-mono text-[11px] px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-[#D4E1AE]">
                    {masterDistributor?.code || retailer.masterDistributorId}
                  </span>
                </p>
                <p className="text-slate-600">{masterDistributor?.businessName}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-600" /> Direct Parent Distributor
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 text-sm">
                    {parentDst?.name || 'Unknown Distributor'}
                  </p>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {parentDst?.code || retailer.distributorId}
                  </span>
                </div>
                <p className="text-slate-600">{parentDst?.businessName}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-600">
                  <div>Email: <span className="font-mono text-slate-800">{parentDst?.email || 'N/A'}</span></div>
                  <div>Mobile: <span className="font-mono text-slate-800">{parentDst?.mobile || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Commercial Plan */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-amber-600" /> Active Commercial Retailer Plan
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {plan?.code || retailer.planId}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{plan?.name || 'Standard Commercial Plan'}</p>
                  <p className="text-slate-600 mt-0.5">{plan?.description || 'Commercial plan details'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Plan Commission Rules & Commercial Rates
              </h4>
              {plan?.commissionRules && plan.commissionRules.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {plan.commissionRules.map((rule, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <span className="font-medium text-slate-700">{rule.serviceType}</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        {rule.commissionType === 'PERCENTAGE'
                          ? `${rule.value}% Margin`
                          : `₹${rule.value.toFixed(2)} Flat Fee`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  Default commercial rates: Pay-In 0.25% • Pay-Out ₹5.00 flat fee.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Financials & Activity */}
        {activeTab === 'financials' && (
          <div className="space-y-4">
            {/* Wallet Summary */}
            <div className="p-4 rounded-xl border border-[#D4E1AE] bg-gradient-to-br from-indigo-50 via-white to-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                    Retailer Wallet Overview
                  </p>
                  <p className="font-mono text-xs text-slate-500 mt-0.5">{walletSummary.walletId}</p>
                </div>
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-indigo-100 pt-3">
                <div>
                  <p className="text-xs text-slate-500">Available Balance</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {formatCurrency(walletSummary.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hold / Reserved Balance</p>
                  <p className="text-xl font-semibold text-amber-700 mt-0.5">
                    {formatCurrency(walletSummary.holdBalance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <p className="text-xs text-slate-500 font-medium">Today's Transactions</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{txnSummary.todayTxnsCount}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">
                  {txnSummary.successfulCount} Success / {txnSummary.failedCount} Failed
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <p className="text-xs text-slate-500 font-medium">Pay-In Volume Today</p>
                <p className="text-xl font-bold text-indigo-700 mt-1">
                  {formatCurrency(txnSummary.todayPayInVolume)}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <p className="text-xs text-slate-500 font-medium">Commission Today</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  {formatCurrency(commissionSummary.todayEarned)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Monthly: {formatCurrency(commissionSummary.monthlyEarned)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Approval & Governance */}
        {activeTab === 'approval' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Platform Approval & Status
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-medium">Approval Status</p>
                  <div className="mt-1">
                    <StatusBadge
                      status={retailer.approvalStatus || 'APPROVED'}
                      label={
                        retailer.approvalStatus === 'PENDING_APPROVAL'
                          ? 'Pending Approval'
                          : retailer.approvalStatus === 'REJECTED'
                          ? 'Rejected'
                          : 'Approved'
                      }
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-medium">Creator Role & Entity</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {retailer.createdByRole || 'DISTRIBUTOR'} ({retailer.createdByEntityId || 'N/A'})
                  </p>
                </div>
              </div>

              {isPending && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600" /> Awaiting Platform Admin Approval
                  </p>
                  <p className="text-amber-800">
                    This retailer account was created by Master Distributor ({retailer.createdByEntityId}) and is currently under Admin review.
                    Master Distributors cannot self-approve or activate pending retailers.
                  </p>
                </div>
              )}

              {isRejected && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600" /> Retailer Account Rejected
                  </p>
                  <p className="text-rose-800">
                    This retailer application was rejected by Platform Admin. Account activation is disabled.
                  </p>
                </div>
              )}

              {!isPending && !isRejected && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>This retailer is fully approved by Platform Admin and operating normally.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
