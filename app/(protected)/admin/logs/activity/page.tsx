'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { logService, LogListResult } from '@/services/logService';
import { ActivityLog, PaginationState } from '@/types/domain';
import { ActivityLogTable } from '@/components/features/logs/ActivityLogTable';
import { LogDetailsDrawer } from '@/components/features/logs/LogDetailsDrawer';
import { TraceSearchDrawer } from '@/components/features/logs/TraceSearchDrawer';
import { Search, Download } from 'lucide-react';
import { reportService } from '@/services/reportService';

export default function ActivityLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<LogListResult<ActivityLog> | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers
  const detailsDrawer = useModal<ActivityLog>();
  const traceDrawer = useModal<string>();

  useEffect(() => {
    let isCancelled = false;
    logService.getActivityLogs(searchQuery, pagination.page, pagination.pageSize).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [searchQuery, pagination.page, pagination.pageSize]);

  const handleExportCsv = () => {
    if (!data?.items) return;
    reportService.exportToCsv('Activity_Audit_Logs', data.items as unknown as Record<string, unknown>[]);
  };

  return (
    <PageContainer
      title="Activity & Audit Logs"
      description="Central immutable audit trail for administrative operations, wallet adjustments, settlement executions, and security decisions."
      actions={
        <Button variant="primary" size="sm" onClick={handleExportCsv} leftIcon={<Download className="w-3.5 h-3.5" />}>
          Export
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <Input
            placeholder="Search Actor Name, Action, Target Entity ID, Description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </Card>

        {/* Table View */}
        <ActivityLogTable
          data={data?.items || []}
          isLoading={isLoading}
          onViewLog={(log) => detailsDrawer.open(log)}
          onOpenTraceSearch={(tId) => traceDrawer.open(tId)}
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, page: 1, pageSize }))}
        />

        {/* Drawers */}
        <LogDetailsDrawer
          isOpen={detailsDrawer.isOpen}
          onClose={detailsDrawer.close}
          log={detailsDrawer.data}
          onOpenTraceSearch={(tId) => traceDrawer.open(tId)}
        />

        <TraceSearchDrawer
          isOpen={traceDrawer.isOpen}
          onClose={traceDrawer.close}
          initialReferenceId={traceDrawer.data || ''}
        />
      </div>
    </PageContainer>
  );
}
