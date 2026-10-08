'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/EmptyState';

interface FinancialEmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  imageSrc?: string;
  className?: string;
}

export const FinancialEmptyState: React.FC<FinancialEmptyStateProps> = ({
  title = 'No Records Found',
  description = 'Try adjusting your search criteria or filter parameters.',
  action,
  icon,
  imageSrc = '/no-data-found.png',
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
      icon={icon}
      imageSrc={imageSrc}
      className={className}
    />
  );
};

