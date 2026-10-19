'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Button, MobileInput } from '@/components/ui';
import { Role, AdminUser } from '@/types/domain';
import { UserPlus } from 'lucide-react';

export interface CreateAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  onSubmit: (data: Omit<AdminUser, 'id' | 'createdAt' | 'createdBy' | 'roleNames'>) => Promise<void>;
}

export const CreateAdminUserModal: React.FC<CreateAdminUserModalProps> = ({
  isOpen,
  onClose,
  roles,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('Payment Operations');
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || 'role_operations');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !employeeId) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        name,
        employeeId,
        email,
        mobile,
        department,
        roleIds: [selectedRoleId],
        status: 'ACTIVE',
      });
      setIsSubmitting(false);
      onClose();
      // Reset form
      setName('');
      setEmployeeId('');
      setEmail('');
      setMobile('');
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Failed to create admin user.';
      setErrorMsg(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite New Administrative Staff" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name *"
            placeholder="e.g. Rahul Kapoor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Employee ID *"
            placeholder="e.g. EMP_BSP_102"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Work Email Address *"
            type="email"
            placeholder="e.g. rahul@brightspark.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <MobileInput
            label="Mobile Number"
            value={mobile}
            onChange={(e: any) => setMobile(typeof e === 'string' ? e : e?.target?.value || '')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: 'Payment Operations', label: 'Payment Operations' },
              { value: 'Finance & Taxation', label: 'Finance & Taxation' },
              { value: 'Risk & Compliance', label: 'Risk & Compliance' },
              { value: 'Retailer Support', label: 'Retailer Support' },
              { value: 'Executive Operations', label: 'Executive Operations' },
            ]}
          />
          <Select
            label="Assigned System Role *"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            options={roles.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` }))}
          />
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 leading-relaxed text-[11px]">
          <strong>Account Security Note:</strong> An invitation link will be sent to the staff member&apos;s email address to configure their password and set up MFA.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
            Create Admin Staff
          </Button>
        </div>
      </form>
    </Modal>
  );
};
