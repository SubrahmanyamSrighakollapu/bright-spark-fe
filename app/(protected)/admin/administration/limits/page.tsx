'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useModal } from '@/hooks/useModal';
import { adminService } from '@/services/adminService';
import { TransactionLimit } from '@/types/domain';
import { TransactionLimitTable } from '@/components/features/administration/TransactionLimitTable';
import { CreateLimitModal } from '@/components/features/administration/CreateLimitModal';
import { formatCurrency } from '@/utils/formatters';
import { Plus } from 'lucide-react';

export default function LimitsPage() {
  const [limits, setLimits] = useState<TransactionLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const createModal = useModal();

  const loadLimits = () => {
    setIsLoading(true);
    adminService.getTransactionLimits().then((res) => {
      if (res.success && res.data) {
        setLimits(res.data);
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    let isCancelled = false;
    adminService.getTransactionLimits().then((res) => {
      if (!isCancelled && res.success && res.data) {
        setLimits(res.data);
        setIsLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleCreateSubmit = async (formData: Omit<TransactionLimit, 'id'>) => {
    await adminService.createTransactionLimit(formData);
    loadLimits();
  };

  // Precedence evaluation test instance
  const effectiveApexLimit = adminService.resolveEffectiveLimit('ent_mch_01', 'PAY_OUT');

  return (
    <PageContainer
      title="Transaction Limits Management"
      description="Configure transaction limits, per-transaction min/max caps, daily velocity limits, and monthly commercial caps."
      actions={
        <Button variant="primary" size="sm" onClick={() => createModal.open()} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Add Limit Rule
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Precedence Inspector Banner */}
        <Card title="Deterministic Scope Precedence Inspector" subtitle="Rule Evaluation: Specific Retailer Override > Entity Rule > Global Default">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-[11px] font-sans text-slate-500 font-semibold block">Evaluated Limit: Apex Pay Solutions (PAY_OUT)</span>
              <strong className="font-extrabold text-purple-900 text-sm">
                Max Per Txn: {formatCurrency(effectiveApexLimit.maxPerTransaction)}
              </strong>
              <span className="text-[11px] text-slate-600 block mt-0.5">Scope Applied: <strong>{effectiveApexLimit.scopeType}</strong></span>
            </div>
            <div className="px-3 py-1.5 bg-white border border-purple-300 rounded font-sans text-[11px] font-bold text-purple-950 shrink-0">
              Resolved Scope Override Active
            </div>
          </div>
        </Card>

        {/* Table View */}
        <TransactionLimitTable data={limits} isLoading={isLoading} />

        {/* Modal */}
        <CreateLimitModal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          onSubmit={handleCreateSubmit}
        />
      </div>
    </PageContainer>
  );
}
