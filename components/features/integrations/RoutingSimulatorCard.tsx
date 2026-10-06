'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { TransactionMode, EntityType, RoutingSimulationResult } from '@/types/domain';
import { providerService } from '@/services/providerService';
import { Play, GitFork } from 'lucide-react';

export const RoutingSimulatorCard: React.FC = () => {
  const [transactionType, setTransactionType] = useState<'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT'>('PAY_OUT');
  const [amount, setAmount] = useState('25000');
  const [mode, setMode] = useState<TransactionMode>('IMPS');
  const [entityType, setEntityType] = useState<EntityType | 'ALL'>('MERCHANT');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<RoutingSimulationResult | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    const numAmount = parseFloat(amount) || 0;
    const res = await providerService.simulateRouting(transactionType, transactionType, numAmount, mode, entityType);
    if (res.success && res.data) {
      setResult(res.data);
    }
    setIsSimulating(false);
  };

  return (
    <Card title="Interactive Transaction Routing Simulator" subtitle="Test live gateway selection and automatic failover logic">
      <form onSubmit={handleSimulate} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            label="Transaction Type"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as 'PAY_IN' | 'PAY_OUT' | 'SETTLEMENT')}
            options={[
              { value: 'PAY_IN', label: 'Pay-In Processing' },
              { value: 'PAY_OUT', label: 'Pay-Out Disbursement' },
              { value: 'SETTLEMENT', label: 'Settlement Batch' },
            ]}
          />

          <Input
            label="Transaction Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Select
            label="Payment Mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as TransactionMode)}
            options={[
              { value: 'UPI', label: 'UPI' },
              { value: 'IMPS', label: 'IMPS' },
              { value: 'NEFT', label: 'NEFT' },
              { value: 'RTGS', label: 'RTGS' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
            ]}
          />

          <Select
            label="Entity Scope"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as EntityType | 'ALL')}
            options={[
              { value: 'MERCHANT', label: 'Retailer' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
              { value: 'RETAILER', label: 'Retailer' },
              { value: 'ALL', label: 'All Entity Types' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">Evaluates active routing rules against provider health.</span>
          <Button variant="primary" size="sm" type="submit" isLoading={isSimulating} leftIcon={<Play className="w-3.5 h-3.5" />}>
            Run Routing Test
          </Button>
        </div>

        {result && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-purple-200 pb-2">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-purple-700" />
                <span className="font-bold text-slate-900 text-xs">Rule Matched: <strong className="font-mono text-purple-800">{result.matchedRuleId}</strong></span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Simulated: {result.simulatedAt.split('T')[1].slice(0, 8)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block">Selected Gateway Provider</span>
                <span className="font-bold text-sm text-emerald-800">{result.selectedProviderName}</span>
                <span className="font-mono text-[10px] text-slate-400 block">{result.selectedProviderId}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block">Fallback Secondary Provider</span>
                <span className="font-semibold text-xs text-purple-900">{result.fallbackProviderName}</span>
                <span className="font-mono text-[10px] text-slate-400 block">{result.fallbackProviderId}</span>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-purple-200 rounded text-xs text-purple-950 font-sans leading-relaxed">
              <strong>Evaluation Reason:</strong> {result.reason}
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};
