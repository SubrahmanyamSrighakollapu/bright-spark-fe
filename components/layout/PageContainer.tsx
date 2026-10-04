import React from 'react';
import { BreadcrumbItem } from '@/types/common';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/utils/cn';

export interface PageContainerProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  statusBadge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  statusBadge,
  children,
  className,
  fullWidth = false,
}) => {
  return (
    <div
      className={cn(
        'w-full min-h-full space-y-6 mx-auto animate-page-enter',
        fullWidth ? 'max-w-full' : 'max-w-[1440px]',
        className
      )}
    >
      {title && (
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={actions}
          statusBadge={statusBadge}
        />
      )}

      {children}
    </div>
  );
};
