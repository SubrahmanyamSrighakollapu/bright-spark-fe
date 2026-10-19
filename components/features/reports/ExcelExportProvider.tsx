'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Download, FileSpreadsheet } from 'lucide-react';

export const EXCEL_EXPORT_EVENT = 'bright-spark:excel-export';

interface ExportRequest {
  filename: string;
  rows: Record<string, unknown>[];
}

const escapeXml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const getRowDate = (row: Record<string, unknown>): Date | null => {
  const dateKey = Object.keys(row).find((key) => /(date|created|submitted|processed|timestamp|time)/i.test(key));
  if (!dateKey || !row[dateKey]) return null;
  const parsed = new Date(String(row[dateKey]));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const downloadExcel = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const worksheetRows = [
    `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join('')}</Row>`,
    ...rows.map((row) => `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(row[header])}</Data></Cell>`).join('')}</Row>`),
  ].join('');
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Export"><Table>${worksheetRows}</Table></Worksheet></Workbook>`;
  const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function ExcelExportProvider() {
  const [request, setRequest] = useState<ExportRequest | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleRequest = (event: Event) => {
      const detail = (event as CustomEvent<ExportRequest>).detail;
      setRequest(detail);
      setStartDate('');
      setEndDate('');
      setError('');
    };
    window.addEventListener(EXCEL_EXPORT_EVENT, handleRequest);
    return () => window.removeEventListener(EXCEL_EXPORT_EVENT, handleRequest);
  }, []);

  const handleExport = () => {
    if (!request || !startDate || !endDate) {
      setError('Select both start and end dates.');
      return;
    }
    if (startDate > endDate) {
      setError('End date must be on or after the start date.');
      return;
    }
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59.999`);
    const hasDatedRows = request.rows.some((row) => getRowDate(row));
    const filteredRows = hasDatedRows
      ? request.rows.filter((row) => {
          const date = getRowDate(row);
          return date && date >= start && date <= end;
        })
      : request.rows;
    if (!filteredRows.length) {
      setError('No records are available for the selected period.');
      return;
    }
    downloadExcel(`${request.filename}_${startDate}_to_${endDate}`, filteredRows);
    setRequest(null);
  };

  return (
    <Modal
      isOpen={!!request}
      onClose={() => setRequest(null)}
      title={<span className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Export to Excel</span>}
      description="Select the reporting period to include in the Excel workbook."
      size="sm"
      footer={<div className="flex w-full justify-end gap-2"><Button variant="outline" onClick={() => setRequest(null)}>Cancel</Button><Button variant="primary" onClick={handleExport} leftIcon={<Download className="h-4 w-4" />}>Export</Button></div>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-slate-700">Start Date<input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setError(''); }} className="block h-10 w-full rounded-xl border border-slate-300 px-3 text-sm" /></label>
          <label className="space-y-1 text-xs font-semibold text-slate-700">End Date<input type="date" value={endDate} min={startDate} onChange={(event) => { setEndDate(event.target.value); setError(''); }} className="block h-10 w-full rounded-xl border border-slate-300 px-3 text-sm" /></label>
        </div>
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
      </div>
    </Modal>
  );
}
