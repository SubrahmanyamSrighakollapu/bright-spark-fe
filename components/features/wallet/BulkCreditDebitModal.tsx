'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { ColumnDefinition } from '@/types/common';
import { BulkAdjustmentRow } from '@/types/domain';
import { walletService } from '@/services/walletService';
import { formatCurrency } from '@/utils/formatters';
import { Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface BulkCreditDebitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkCreditDebitModal: React.FC<BulkCreditDebitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rows] = useState<BulkAdjustmentRow[]>([
    {
      entityId: 'ent_mch_01',
      entityName: 'Apex Pay Solutions',
      operationType: 'CREDIT',
      amount: 25000,
      reference: 'BULK_COMM_001',
      reason: 'Batch retailer bonus',
      isValid: true,
    },
    {
      entityId: 'ent_dist_01',
      entityName: 'North Zone Dist',
      operationType: 'CREDIT',
      amount: 50000,
      reference: 'BULK_COMM_002',
      reason: 'Batch distributor payout',
      isValid: true,
    },
    {
      entityId: 'ent_rtl_03',
      entityName: 'Coastal Traders',
      operationType: 'DEBIT',
      amount: 500000,
      reference: 'BULK_CLAWBACK_003',
      reason: 'Exceeds available balance',
      isValid: false,
      validationError: 'Debit exceeds available balance (₹1,45,000.00)',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);
  const totalCredit = validRows
    .filter((r) => r.operationType === 'CREDIT')
    .reduce((acc, r) => acc + r.amount, 0);
  const totalDebit = validRows
    .filter((r) => r.operationType === 'DEBIT')
    .reduce((acc, r) => acc + r.amount, 0);

  const handleProcessBulk = async () => {
    setIsSubmitting(true);
    try {
      const res = await walletService.bulkAdjustWallets(validRows);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch {
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDefinition<BulkAdjustmentRow>[] = [
    {
      key: 'entityName',
      header: 'Entity / Code',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-slate-900 block">{row.entityName}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.entityId}</span>
        </div>
      ),
    },
    {
      key: 'operationType',
      header: 'Type',
      align: 'center',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            row.operationType === 'CREDIT'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.operationType}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-slate-900">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: 'isValid',
      header: 'Validation',
      align: 'center',
      render: (row) =>
        row.isValid ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs" title={row.validationError}>
            <AlertTriangle className="w-3.5 h-3.5" /> Invalid
          </span>
        ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Credit / Debit Adjustments (Demo Preview)"
      description="Validate and process multiple wallet adjustments in a single batch"
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* CSV Template Mock Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-medium text-slate-700">CSV Batch Input (3 Demo Rows Pre-loaded)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">BATCH_ID_9901.csv</span>
        </div>

        {/* Validation Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-slate-500 block text-[11px]">Valid Rows</span>
            <span className="font-bold text-emerald-800 text-sm">{validRows.length}</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <span className="text-slate-500 block text-[11px]">Invalid Rows</span>
            <span className="font-bold text-rose-800 text-sm">{invalidRows.length}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block text-[11px]">Total Credit Batch</span>
            <span className="font-mono font-bold text-emerald-700 text-xs">{formatCurrency(totalCredit)}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block text-[11px]">Total Debit Batch</span>
            <span className="font-mono font-bold text-rose-700 text-xs">{formatCurrency(totalDebit)}</span>
          </div>
        </div>

        {/* Batch Preview Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <Table columns={columns} data={rows} keyExtractor={(r) => r.entityId + r.amount} />
        </div>

        {invalidRows.length > 0 && (
          <p className="text-[11px] text-rose-700 italic">
            * Invalid rows will be skipped automatically during batch execution.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleProcessBulk}
            isLoading={isSubmitting}
            disabled={validRows.length === 0}
          >
            Process {validRows.length} Valid Row{validRows.length === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
