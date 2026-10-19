import React, { useState } from 'react';
import { Distributor } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { masterDistributorService } from '@/services/masterDistributorService';
import { Drawer, StatusBadge, Button, Tabs } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  Percent,
  Store,
  Calendar,
  Edit,
  Power,
  TrendingUp,
} from 'lucide-react';

interface DistributorDetailDrawerProps {
  distributor: Distributor | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (distributor: Distributor) => void;
  onToggleStatus: (distributor: Distributor) => void;
}

export const DistributorDetailDrawer: React.FC<DistributorDetailDrawerProps> = ({
  distributor,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!distributor) return null;

  // Calculate scoped network details for this distributor
  const linkedRetailers = hierarchyService.getDistributorRetailers(distributor.id);
  const activeRetailers = linkedRetailers.filter((r) => r.accountStatus === 'ACTIVE').length;
  const inactiveRetailers = linkedRetailers.filter((r) => r.accountStatus !== 'ACTIVE').length;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'network', label: `Retailers (${linkedRetailers.length})` },
    { id: 'wallet', label: 'Wallet & Ledger' },
    { id: 'commission', label: 'Commission Plan' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <span>{distributor.name}</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-[#D4E1AE]">
            {distributor.code}
          </span>
        </div>
      }
      description={`${distributor.businessName} • ${distributor.city || 'Location N/A'}`}
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
                onEdit(distributor);
              }}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit Details
            </Button>

            <Button
              variant={distributor.status === 'ACTIVE' ? 'outline' : 'primary'}
              onClick={() => onToggleStatus(distributor)}
              leftIcon={<Power className="w-4 h-4" />}
              className={
                distributor.status === 'ACTIVE'
                  ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                  : ''
              }
            >
              {distributor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
                <StatusBadge status={distributor.status} />
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <p className="text-xs text-slate-500 font-medium">KYC Verification</p>
              <div className="mt-1">
                <StatusBadge status={distributor.kycStatus || 'APPROVED'} />
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Created On</p>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              {formatDateTime(distributor.createdAt)}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary Contact & Entity Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <User className="w-4 h-4 text-indigo-600" /> Contact Profile
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Contact Name:</span>{' '}
                    <span className="font-semibold text-slate-900">{distributor.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>{' '}
                    <span className="font-mono text-slate-800">{distributor.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Mobile:</span>{' '}
                    <span className="font-mono text-slate-800">{distributor.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">User ID:</span>{' '}
                    <span className="font-mono text-slate-600">{distributor.userId}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Business Credentials
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Business Name:</span>{' '}
                    <span className="font-semibold text-slate-900">{distributor.businessName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Entity Type:</span>{' '}
                    <span className="text-slate-800">{distributor.businessType || 'Private Limited'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">GST Number:</span>{' '}
                    <span className="font-mono text-slate-800">{distributor.gstNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">PAN (Masked):</span>{' '}
                    <span className="font-mono text-slate-800">{distributor.panNumberMasked || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Audit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Registered Location
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="font-medium">{distributor.address || 'Address details pending update'}</p>
                  <p>
                    {distributor.city || 'N/A'}, {distributor.state || 'N/A'} - {distributor.pincode || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Audit & Metadata
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500">Created By:</span>{' '}
                    <span className="font-mono text-slate-800">{distributor.createdByUserId || 'usr_md_01'}</span> (
                    {distributor.createdByRole || 'MASTER_DISTRIBUTOR'})
                  </div>
                  <div>
                    <span className="text-slate-500">Master Distributor ID:</span>{' '}
                    <span className="font-mono text-slate-800">{distributor.masterDistributorId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Distributor ID:</span>{' '}
                    <span className="font-mono text-slate-800">{distributor.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scoped Network */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-blue-50/50">
                <p className="text-xs text-slate-500 font-medium">Total Linked Retailers</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{linkedRetailers.length}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-emerald-50/50">
                <p className="text-xs text-slate-500 font-medium">Active Retailers</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">{activeRetailers}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-amber-50/50">
                <p className="text-xs text-slate-500 font-medium">Inactive Retailers</p>
                <p className="text-xl font-bold text-amber-700 mt-1">{inactiveRetailers}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Managed Retailer Outlets List
              </h4>

              {linkedRetailers.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No retailers currently assigned under this distributor.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {linkedRetailers.map((retailer) => (
                    <div key={retailer.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          {retailer.name}
                          <span className="font-mono text-[11px] text-slate-500 font-normal">
                            ({retailer.code})
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {retailer.businessName} • Mobile: {retailer.mobile}
                        </p>
                      </div>
                      <StatusBadge status={retailer.accountStatus} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Scoped Wallet */}
        {activeTab === 'wallet' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#D4E1AE] bg-gradient-to-br from-indigo-50 via-white to-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                    Distributor Main Wallet
                  </p>
                  <p className="font-mono text-xs text-slate-500 mt-0.5">{distributor.walletId}</p>
                </div>
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-indigo-100 pt-3">
                <div>
                  <p className="text-xs text-slate-500">Available Balance</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {formatCurrency(145800.5)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hold / Reserved Balance</p>
                  <p className="text-xl font-semibold text-amber-700 mt-0.5">
                    {formatCurrency(5000)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-white">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Recent Scoped Wallet Activity
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span>Pay-In Commission Settlement</span>
                  <span className="font-semibold text-emerald-600">+₹4,250.00</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span>Retailer Topup Settlement</span>
                  <span className="font-semibold text-rose-600">-₹25,000.00</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span>Opening Balance Credit</span>
                  <span className="font-semibold text-emerald-600">+₹1,66,550.50</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Scoped Commission */}
        {activeTab === 'commission' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Percent className="w-4 h-4 text-indigo-600" /> Active Commission Plan
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  DISTRIBUTOR_STANDARD_SLAB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">Pay-In Commission Rate:</p>
                  <p className="font-semibold text-slate-900 mt-0.5">0.15% per transaction</p>
                </div>
                <div>
                  <p className="text-slate-500">Pay-Out Commission Flat:</p>
                  <p className="font-semibold text-slate-900 mt-0.5">₹ 2.50 flat per transaction</p>
                </div>
                <div>
                  <p className="text-slate-500">TDS Deduction:</p>
                  <p className="font-semibold text-slate-900 mt-0.5">5.0% under Sec 194H</p>
                </div>
                <div>
                  <p className="text-slate-500">Settlement Frequency:</p>
                  <p className="font-semibold text-slate-900 mt-0.5">Real-time Auto Credit</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
