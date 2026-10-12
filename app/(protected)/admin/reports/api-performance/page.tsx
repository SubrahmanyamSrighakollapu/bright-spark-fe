'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { reportService } from '@/services/reportService';
import { ApiPerformanceSummary, ApiPerformanceMetric } from '@/types/domain';
import { ReportExportMenu } from '@/components/features/reports/ReportExportMenu';
import { AdminReportNav } from '@/components/features/reports/AdminReportNav';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Activity, ShieldCheck, Clock, Zap, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui';

export default function ApiPerformancePage() {
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [data, setData] = useState<ApiPerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const loadReport = () => {
    setIsLoading(true);
    reportService.getApiPerformance({ provider: providerFilter }).then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isCancelled = false;
    reportService.getApiPerformance({ provider: providerFilter }).then((res) => {
      if (!isCancelled && res.success && res.data) {
        setData(res.data);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [providerFilter]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await reportService.exportApiPerformanceCsv({
        provider: providerFilter,
      });
      toastSuccess('API performance report exported successfully');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to export API performance report');
    } finally {
      setIsExporting(false);
    }
  };

  const chartData = (data?.providers || []).map((p) => ({
    name: p.provider,
    successRate: p.successRate,
    responseTime: p.avgResponseTimeMs,
  }));

  const columns = [
    {
      key: 'provider',
      header: 'Provider & Service Node',
      render: (row: ApiPerformanceMetric) => (
        <div>
          <div className="font-bold text-xs text-slate-900">{row.provider}</div>
          <div className="text-[11px] font-mono text-slate-500">{row.service}</div>
        </div>
      ),
    },
    {
      key: 'apiType',
      header: 'API Category',
      align: 'center' as const,
      render: (row: ApiPerformanceMetric) => (
        <span className="font-semibold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {row.apiType}
        </span>
      ),
    },
    {
      key: 'totalRequests',
      header: 'Total API Calls',
      align: 'right' as const,
      render: (row: ApiPerformanceMetric) => (
        <span className="font-mono font-semibold text-xs text-slate-800">{row.totalRequests.toLocaleString()}</span>
      ),
    },
    {
      key: 'successRate',
      header: 'Success Rate (%)',
      align: 'right' as const,
      render: (row: ApiPerformanceMetric) => (
        <span
          className={`font-mono font-extrabold text-xs ${
            row.successRate >= 98 ? 'text-emerald-700' : 'text-amber-700'
          }`}
        >
          {row.successRate}%
        </span>
      ),
    },
    {
      key: 'avgResponseTimeMs',
      header: 'Avg Response (ms)',
      align: 'right' as const,
      render: (row: ApiPerformanceMetric) => (
        <span className="font-mono text-xs text-blue-700 font-semibold">{row.avgResponseTimeMs} ms</span>
      ),
    },
    {
      key: 'status',
      header: 'Node Status',
      align: 'center' as const,
      render: (row: ApiPerformanceMetric) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            row.status === 'HEALTHY'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <PageContainer
      title="API Performance Report"
      description="Third-party provider clearing node metrics, response latency trends, and gateway health monitoring."
      actions={
        <ReportExportMenu onExportCsv={handleExportCsv} reportTitle="API Performance" disabled={!data?.providers?.length} isLoading={isExporting} />
      }
    >
      <div className="space-y-6">
        {/* Reports Navigation Bar */}
        <AdminReportNav />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Total API Volume</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1 font-mono font-extrabold text-base text-slate-900">
              {data?.totalRequests.toLocaleString() || 0} Calls
            </div>
            <span className="text-[11px] text-emerald-600 block mt-0.5">{data?.successCount.toLocaleString() || 0} Cleared</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Overall Success Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1 font-mono font-extrabold text-base text-emerald-800">
              {data?.overallSuccessRate || 100}%
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Across all gateways</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Avg Latency (ms)</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-1 font-mono font-extrabold text-base text-purple-900">
              {data?.avgResponseTimeMs || 0} ms
            </div>
            <span className="text-[11px] text-purple-600 block mt-0.5">Gateway roundtrip</span>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Provider Availability</span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1 font-mono font-extrabold text-base text-amber-800">
              {data?.overallAvailability || 99.9}%
            </div>
            <span className="text-[11px] text-amber-600 block mt-0.5">Uptime SLA</span>
          </Card>
        </div>

        {/* Recharts Performance Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Provider Success Rate (%)" subtitle="Clearing gateway reliability comparison">
            <div className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Bar dataKey="successRate" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Average Response Latency (ms)" subtitle="Gateway roundtrip speed in milliseconds">
            <div className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="responseTime" stroke="#9333EA" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="w-full sm:w-64">
              <Select
                label="Filter Provider"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Provider Nodes' },
                  { value: 'HDFC', label: 'HDFC Bank' },
                  { value: 'ICICI', label: 'ICICI Bank' },
                  { value: 'Axis', label: 'Axis Bank' },
                  { value: 'Cashfree', label: 'Cashfree' },
                  { value: 'Razorpay', label: 'Razorpay' },
                ]}
              />
            </div>
            <Button variant="outline" size="sm" onClick={loadReport} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Refresh Gateway Metrics
            </Button>
          </div>
        </Card>

        {/* Performance Data Table */}
        <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-xl)] bg-white shadow-xs">
          <Table columns={columns} data={data?.providers || []} keyExtractor={(row) => row.provider} isLoading={isLoading} />
        </div>
      </div>
    </PageContainer>
  );
}
