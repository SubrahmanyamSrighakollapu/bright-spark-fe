'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { adminService } from '@/services/adminService';
import { AdminSummary } from '@/types/domain';
import { AdminOverviewCards } from '@/components/features/administration/AdminOverviewCards';

export default function AdministrationOverviewPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    let isCancelled = false;
    adminService.getSummary().then((res) => {
      if (!isCancelled && res.success && res.data) {
        setSummary(res.data);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  const defaultSummary: AdminSummary = {
    totalAdminUsers: 5,
    activeAdminUsers: 5,
    inactiveAdminUsers: 0,
    lockedAdminUsers: 0,
    superAdminsCount: 1,
    totalRoles: 5,
    systemRolesCount: 5,
    customRolesCount: 0,
    activeRolesCount: 5,
    configuredPermissionsCount: 38,
    activeLimitRules: 2,
    activeFeeRules: 2,
  };

  return (
    <PageContainer
      title="Administration"
      description="Manage Bright Spark access controls, operational masters, transaction limits, platform settings, and security governance."
    >
      <AdminOverviewCards summary={summary || defaultSummary} />
    </PageContainer>
  );
}
