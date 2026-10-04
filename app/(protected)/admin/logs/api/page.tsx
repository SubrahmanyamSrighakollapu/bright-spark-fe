'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { logService, LogListResult } from '@/services/logService';
import { ApiLog, ApiLogSummary, PaginationState } from '@/types/domain';
import { ApiLogTable } from '@/components/features/logs/ApiLogTable';
import { LogDetailsDrawer } from '@/components/features/logs/LogDetailsDrawer';
import { TraceSearchDrawer } from '@/components/features/logs/TraceSearchDrawer';
import { Search, Download, GitCommit } from 'lucide-react';
import { reportService } from '@/services/reportService';

export default function ApiLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<LogListResult<ApiLog> | null>(null);
  const [summary, setSummary] = useState<ApiLogSummary | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers
  const detailsDrawer = useModal<ApiLog>();
  const traceDrawer = useModal<string>();

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      logService.getApiLogs(searchQuery, pagination.page, pagination.pageSize),
      logService.getApiSummary(),
    ]).then(([logsRes, sumRes]) => {
      if (!isCancelled) {
        if (logsRes.success && logsRes.data) {
          setData(logsRes.data);
          setPagination(logsRes.data.pagination);
        }
        if (sumRes.success && sumRes.data) {
          setSummary(sumRes.data);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [searchQuery, pagination.page, pagination.pageSize]);

  const handleExportCsv = () => {
    if (!data?.items) return;
    reportService.exportToCsv('API_Logs', data.items as unknown as Record<string, unknown>[]);
  };

  const sum = summary || {
    totalRequests: 0,
    successCount: 0,
    failedCount: 0,
    avgResponseTimeMs: 0,
    timeoutCount: 0,
    criticalErrors: 0,
  };

  return (
    <PageContainer
      title="API Logs"
      description="Inspect Qin Star Pay API requests, provider interactions, response statuses and processing latency."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => traceDrawer.open('TRACE_20260903_001')} leftIcon={<GitCommit className="w-3.5 h-3.5" />}>
            Trace Search
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCsv} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Total API Requests</span>
            <div className="mt-1 font-mono font-extrabold text-base text-[var(--primary)]">
              {sum.totalRequests} Requests
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Recorded endpoints</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Successful Calls</span>
            <div className="mt-1 font-mono font-extrabold text-base text-emerald-700">
              {sum.successCount} Success
            </div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">HTTP 200 OK</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Failed / Errors</span>
            <div className="mt-1 font-mono font-extrabold text-base text-rose-700">
              {sum.failedCount} Failed
            </div>
            <span className="text-[11px] text-rose-600 block mt-0.5">Exceptions & retries</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Avg Latency</span>
            <div className="mt-1 font-mono font-extrabold text-base text-purple-900">
              {sum.avgResponseTimeMs}ms
            </div>
            <span className="text-[11px] text-purple-600 block mt-0.5 font-mono">Response time</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Timeouts</span>
            <div className="mt-1 font-mono font-extrabold text-base text-amber-700">
              {sum.timeoutCount} Timeouts
            </div>
            <span className="text-[11px] text-amber-600 block mt-0.5">Gateway &gt; 5000ms</span>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <Input
            placeholder="Search Log ID, Trace ID, Correlation ID, Reference ID, Provider..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </Card>

        {/* Table View */}
        <ApiLogTable
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
