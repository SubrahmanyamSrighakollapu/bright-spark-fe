'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

export interface ReportExportMenuProps {
  onExportCsv: () => void;
  reportTitle?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ReportExportMenu: React.FC<ReportExportMenuProps> = ({
  onExportCsv,
  reportTitle = 'Report',
  disabled = false,
  isLoading = false,
}) => {
  const handleExport = () => {
    onExportCsv();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      leftIcon={<Download className="w-3.5 h-3.5" />}
      title={`Export ${reportTitle} to Excel`}
      aria-label={`Export ${reportTitle} to Excel`}
    >
      Export
    </Button>
  );
};
