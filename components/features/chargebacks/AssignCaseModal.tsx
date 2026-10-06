'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Chargeback } from '@/types/domain';
import { UserCheck } from 'lucide-react';

export interface AssignCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  chargeback: Chargeback | null;
  onAssign: (chargebackId: string, assignedTo: string) => Promise<void>;
}

export const AssignCaseModal: React.FC<AssignCaseModalProps> = ({
  isOpen,
  onClose,
  chargeback,
  onAssign,
}) => {
  const [assignedTo, setAssignedTo] = useState(chargeback?.assignedTo || 'Anjali Sharma (Risk Manager)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!chargeback) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAssign(chargeback.chargebackId, assignedTo);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Dispute Case" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="font-semibold text-slate-900">Case ID: {chargeback.chargebackId}</div>
          <div className="text-[11px] text-slate-500">Retailer: {chargeback.entityName}</div>
        </div>

        <Select
          label="Assign To Team Member"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          options={[
            { value: 'Anjali Sharma (Risk Manager)', label: 'Anjali Sharma (Risk Manager)' },
            { value: 'Rajesh Kumar (Dispute Ops Lead)', label: 'Rajesh Kumar (Dispute Ops Lead)' },
            { value: 'Suresh Raina (Accounts Team)', label: 'Suresh Raina (Accounts Team)' },
            { value: 'Super Admin', label: 'Super Admin' },
          ]}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<UserCheck className="w-3.5 h-3.5" />}>
            Assign Case
          </Button>
        </div>
      </form>
    </Modal>
  );
};
