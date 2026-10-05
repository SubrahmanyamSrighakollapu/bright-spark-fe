'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { hierarchyService } from '@/services/hierarchyService';
import { retailerPermissionService, RetailerModulePermission } from '@/services/retailerPermissionService';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Wallet,
  Percent,
  BarChart3,
  Bell,
  UserRoundCog,
  Store,
  Save,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface RetailerPermission {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const DEFAULT_PERMISSIONS: RetailerPermission[] = [
  { id: 'pay-in', name: 'Pay-In', description: 'Accept customer collections through enabled payment methods.', icon: <ArrowDownLeft className="h-4 w-4 text-emerald-600" />, enabled: true },
  { id: 'pay-out', name: 'Pay-Out', description: 'Initiate beneficiary and retailer disbursements.', icon: <ArrowUpRight className="h-4 w-4 text-rose-600" />, enabled: true },
  { id: 'transactions', name: 'Transactions', description: 'View Pay-In and Pay-Out transaction history and details.', icon: <ArrowLeftRight className="h-4 w-4 text-blue-600" />, enabled: true },
  { id: 'wallet-ledger', name: 'Wallet & Ledger', description: 'View available balance, holds and wallet ledger entries.', icon: <Wallet className="h-4 w-4 text-indigo-600" />, enabled: true },
  { id: 'commissions', name: 'Commissions', description: 'View earned commission summaries and transaction-level earnings.', icon: <Percent className="h-4 w-4 text-violet-600" />, enabled: true },
  { id: 'reports', name: 'Reports', description: 'Access retailer transaction, settlement and business reports.', icon: <BarChart3 className="h-4 w-4 text-cyan-600" />, enabled: true },
  { id: 'notifications', name: 'Notifications', description: 'Receive operational, transaction and compliance notifications.', icon: <Bell className="h-4 w-4 text-amber-600" />, enabled: true },
  { id: 'profile', name: 'Profile Management', description: 'View and maintain permitted retailer profile information.', icon: <UserRoundCog className="h-4 w-4 text-slate-600" />, enabled: true },
];

const cloneDefaults = () => DEFAULT_PERMISSIONS.map((permission) => ({ ...permission }));

export const UserServiceSettings: React.FC = () => {
  const { toastSuccess, toastInfo } = useToast();
  const retailers = useMemo(() => hierarchyService.getAllRetailers(), []);
  const [selectedRetailerId, setSelectedRetailerId] = useState(retailers[0]?.id || '');
  const [retailerPermissions, setRetailerPermissions] = useState<Record<string, RetailerPermission[]>>(() =>
    Object.fromEntries(
      retailers.map((retailer) => {
        const enabled = retailerPermissionService.getEnabledModules(
          retailer.id,
          DEFAULT_PERMISSIONS.map((permission) => permission.id as RetailerModulePermission)
        );
        return [retailer.id, cloneDefaults().map((permission) => ({ ...permission, enabled: enabled.includes(permission.id as RetailerModulePermission) }))];
      })
    )
  );

  const selectedRetailer = retailers.find((retailer) => retailer.id === selectedRetailerId);
  const permissions = retailerPermissions[selectedRetailerId] || DEFAULT_PERMISSIONS;

  const updatePermissions = (nextPermissions: RetailerPermission[]) => {
    if (!selectedRetailerId) return;
    setRetailerPermissions((previous) => ({ ...previous, [selectedRetailerId]: nextPermissions }));
  };

  const handleToggle = (permissionId: string) => {
    updatePermissions(
      permissions.map((permission) =>
        permission.id === permissionId ? { ...permission, enabled: !permission.enabled } : permission
      )
    );
  };

  const handleSave = () => {
    if (!selectedRetailer) return;
    retailerPermissionService.saveEnabledModules(
      selectedRetailer.id,
      permissions.filter((permission) => permission.enabled).map((permission) => permission.id as RetailerModulePermission)
    );
    toastSuccess(`Retailer settings for ${selectedRetailer.name} (${selectedRetailer.code}) updated successfully.`);
  };

  const handleReset = () => {
    updatePermissions(cloneDefaults());
    toastInfo('Retailer permissions reset to the default configuration.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/60 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-900/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-700">Retailer access control</span>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Retailer Settings</h1>
              <p className="mt-1 text-sm text-slate-500">Select a retailer and manage the Qin Star Pay modules available to that account.</p>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:w-[390px]">
            <Select
              label="Select Retailer"
              value={selectedRetailerId}
              onChange={(event) => setSelectedRetailerId(event.target.value)}
              options={retailers.map((retailer) => ({
                value: retailer.id,
                label: `${retailer.businessName} (${retailer.code})`,
              }))}
            />
          </div>
        </div>
      </section>

      {selectedRetailer ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Store className="h-5 w-5" /></div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">{selectedRetailer.businessName}</h2>
                <p className="text-xs text-slate-500">{selectedRetailer.name} · {selectedRetailer.code} · {selectedRetailer.mobile}</p>
              </div>
            </div>
            <StatusBadge status={selectedRetailer.accountStatus} label={selectedRetailer.accountStatus} size="sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Retailer Module</th>
                  <th className="px-5 py-3.5">Access Description</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((permission) => (
                  <tr key={permission.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">{permission.icon}</div>
                        <span className="text-sm font-bold text-slate-900">{permission.name}</span>
                      </div>
                    </td>
                    <td className="max-w-xl px-5 py-4 text-xs leading-5 text-slate-500">{permission.description}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${permission.enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                        {permission.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={permission.enabled}
                        aria-label={`${permission.enabled ? 'Disable' : 'Enable'} ${permission.name}`}
                        onClick={() => handleToggle(permission.id)}
                        className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${permission.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${permission.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={handleReset} leftIcon={<RotateCcw className="h-4 w-4" />}>Reset Defaults</Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<Save className="h-4 w-4" />}>Save Retailer Permissions</Button>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No retailers are available for configuration.</div>
      )}
    </div>
  );
};
