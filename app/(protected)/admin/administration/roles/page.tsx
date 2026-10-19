import React from 'react';
import { RolesManagementView } from '@/components/features/administration/RolesManagementView';

export const metadata = {
  title: 'Roles Management | Bright Spark Admin',
  description: 'Define system user roles and configure role-based access permissions',
};

export default function RolesPage() {
  return <RolesManagementView />;
}
