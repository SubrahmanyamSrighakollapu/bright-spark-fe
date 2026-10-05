'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddMemberModal } from '@/components/features/users/AddMemberModal';
import { hierarchyService } from '@/services/hierarchyService';
import { UserPlus, Building2, Store, Award, Calendar } from 'lucide-react';
import { DateRangeDropdown, DateRangeValue } from '@/components/ui/DateRangeDropdown';

export interface DailyOnboardedMembersCardProps {
  onMemberAdded?: () => void;
}

export const DailyOnboardedMembersCard: React.FC<DailyOnboardedMembersCardProps> = ({ onMemberAdded }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ preset: 'today' });

  const counts = hierarchyService.getDailyOnboardingCounts();

  const handleOpenAddModal = () => setModalOpen(true);

  const getSelectedPeriodCounts = () => {
    if (dateRange.preset === 'today') {
      return {
          md: counts.masterDistributorsToday,
          dist: counts.distributorsToday,
          ret: counts.retailersToday,
          total: counts.totalToday,
          label: 'Today',
      };
    }

    if (dateRange.preset === 'yesterday') {
      return {
          md: counts.masterDistributorsYesterday,
          dist: counts.distributorsYesterday,
          ret: counts.retailersYesterday,
          total: counts.masterDistributorsYesterday + counts.distributorsYesterday + counts.retailersYesterday,
          label: 'Yesterday',
      };
    }

    const end = dateRange.preset === 'custom' && dateRange.endDate
      ? new Date(`${dateRange.endDate}T23:59:59.999`)
      : new Date();
    const start = dateRange.preset === 'custom' && dateRange.startDate
      ? new Date(`${dateRange.startDate}T00:00:00`)
      : new Date(end);

    if (dateRange.preset === '7d') start.setDate(start.getDate() - 6);
    if (dateRange.preset === '30d') start.setDate(start.getDate() - 29);

    const isInRange = (createdAt: string) => {
      const timestamp = new Date(createdAt).getTime();
      return timestamp >= start.getTime() && timestamp <= end.getTime();
    };
    const md = hierarchyService.getAllMasterDistributors().filter((item) => isInRange(item.createdAt)).length;
    const dist = hierarchyService.getAllDistributors().filter((item) => isInRange(item.createdAt)).length;
    const ret = hierarchyService.getAllRetailers().filter((item) => isInRange(item.createdAt)).length;
    const label = dateRange.preset === '7d'
      ? 'Last 7 Days'
      : dateRange.preset === '30d'
      ? 'One Month'
      : dateRange.label || 'Custom Range';

    return { md, dist, ret, total: md + dist + ret, label };
  };

  const currentCounts = getSelectedPeriodCounts();

  return (
    <>
      <Card
        title={
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-base font-extrabold text-slate-900">
                Daily Onboarded Members ({currentCounts.total} New Members)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddModal}
                className="font-bold"
                leftIcon={<UserPlus className="h-3.5 w-3.5" />}
              >
                Add User
              </Button>
            </div>
          </div>
        }
        subtitle="Number of new Retailers, Distributors, and Master Distributors added each day"
      >
        <div className="space-y-4 pt-1">
          {/* Day Selector Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Onboarding Period:</span>
            </div>
            <DateRangeDropdown
              value={dateRange}
              onChange={setDateRange}
              size="sm"
            />
          </div>

          {/* 3 User Type Daily Onboarding Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Master Distributors */}
            <div className="space-y-2 rounded-xl border border-purple-200 bg-purple-50/70 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" /> Master Distributors
                </span>
                <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded font-bold">
                  {currentCounts.label}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-extrabold text-purple-950 font-mono">
                  {currentCounts.md} <span className="text-xs font-normal text-purple-700">New Members</span>
                </span>
              </div>
              <div className="w-full bg-purple-200/60 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full" style={{ width: `${(currentCounts.md / (currentCounts.total || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Distributors */}
            <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" /> Distributors
                </span>
                <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-bold">
                  {currentCounts.label}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-extrabold text-blue-950 font-mono">
                  {currentCounts.dist} <span className="text-xs font-normal text-blue-700">New Members</span>
                </span>
              </div>
              <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${(currentCounts.dist / (currentCounts.total || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Retailers */}
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" /> Retailers
                </span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  {currentCounts.label}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-extrabold text-emerald-950 font-mono">
                  {currentCounts.ret} <span className="text-xs font-normal text-emerald-700">New Members</span>
                </span>
              </div>
              <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${(currentCounts.ret / (currentCounts.total || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AddMemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="DISTRIBUTOR"
        onSuccess={onMemberAdded}
      />
    </>
  );
};
