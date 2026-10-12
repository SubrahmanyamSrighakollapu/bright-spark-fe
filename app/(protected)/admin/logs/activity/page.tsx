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
import { useToast } from '@/components/ui';

export default function ActivityLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<LogListResult<ActivityLog> | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const detailsDrawer = useModal<ActivityLog>();
  const traceDrawer = useModal<string>();

  const loadLogs = async (query: string, page: number, pageSize: number) => {
    setIsLoading(true);
    try {
      const res = await logService.getActivityLogs(query, page, pageSize);
      if (res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
      } else {
        toastError('Failed to load activity logs');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const res = await logService.getActivityLogs(searchQuery, pagination.page, pagination.pageSize);
      if (cancelled) return;
      if (res.success && res.data) {
        setData(res.data);
        setPagination(res.data.pagination);
      } else {
        toastError('Failed to load activity logs');
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    run().catch((err) => {
      if (cancelled) return;
      toastError(err instanceof Error ? err.message : 'Failed to load activity logs');
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, pagination.page, pagination.pageSize]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await logService.exportActivityCsv({ searchQuery });
      toastSuccess('Activity logs exported successfully');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to export activity logs');
    } finally {
      setIsExporting(false);
    }
  };

  const totalCount = data?.pagination.totalItems ?? 0;

  return (
    <PageContainer
      title="Activity & Audit Logs"
      description="Central immutable audit trail for administrative operations, wallet adjustments, settlement executions, and security decisions."
      actions={
        <div className="flex items-center gap-2">
          <span className="hidden md:block text-xs text-slate-500 mr-2">
            {isLoading ? 'Loading…' : `${totalCount.toLocaleString('en-IN')} record${totalCount === 1 ? '' : 's'}`}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            isLoading={isExporting}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by actor name, action, description, or target entity…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadLogs(searchQuery, 1, pagination.pageSize)}>
              Refresh
            </Button>
          </div>
        </Card>

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
