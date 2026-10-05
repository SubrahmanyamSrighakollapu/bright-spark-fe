'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { useModal } from '@/hooks/useModal';
import { logService, LogListResult } from '@/services/logService';
import { ClientLog, PaginationState } from '@/types/domain';
import { ClientLogTable } from '@/components/features/logs/ClientLogTable';
import { LogDetailsDrawer } from '@/components/features/logs/LogDetailsDrawer';
import { TraceSearchDrawer } from '@/components/features/logs/TraceSearchDrawer';
import { Search } from 'lucide-react';

export default function ClientLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<LogListResult<ClientLog> | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawers
  const detailsDrawer = useModal<ClientLog>();
  const traceDrawer = useModal<string>();

  useEffect(() => {
    let isCancelled = false;
    logService.getClientLogs(searchQuery, pagination.page, pagination.pageSize).then((res) => {
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

  return (
    <PageContainer
      title="Client Logs"
      description="Track requests, authentication calls, and API usage originating from retailers, distributors, and commercial consumers."
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <Input
            placeholder="Search Client Entity, Client ID, Request Reference..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </Card>

        {/* Table View */}
        <ClientLogTable
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
