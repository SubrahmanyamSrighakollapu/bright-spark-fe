import React, { useState, useEffect } from 'react';
import { MasterDistributor, AccountStatus } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { Modal, Button, Input, Select, FormField, MobileInput } from '@/components/ui';
import { User, Building2, ShieldCheck } from 'lucide-react';

interface MasterDistributorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<MasterDistributor>) => Promise<boolean>;
  initialData?: MasterDistributor | null;
  mode: 'create' | 'edit';
}

export const MasterDistributorFormModal: React.FC<MasterDistributorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    businessName: '',
    email: '',
    mobile: '',
    status: 'ACTIVE' as AccountStatus,
    payinRate: 0.1,
    payoutRate: 1.0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        businessName: initialData.businessName || '',
        email: initialData.email || '',
        mobile: initialData.mobile || '',
        status: initialData.status || 'ACTIVE',
        payinRate: initialData.commissionConfig?.payinRate ?? 0.1,
        payoutRate: initialData.commissionConfig?.payoutRate ?? 1.0,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        businessName: '',
        email: '',
        mobile: '',
        status: 'ACTIVE',
        payinRate: 0.1,
        payoutRate: 1.0,
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Master Distributor Name is required';
    if (mode === 'create' && !formData.code.trim()) {
      newErrors.code = 'MD Code is required';
    } else if (mode === 'create' && !/^[A-Z0-9_-]{3,15}$/i.test(formData.code.trim())) {
      newErrors.code = 'Code must be 3-15 alphanumeric characters';
    }

    if (!formData.businessName.trim()) newErrors.businessName = 'Business Entity Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.trim().replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<MasterDistributor> = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        businessName: formData.businessName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        status: formData.status,
        commissionConfig: {
          payinRate: Number(formData.payinRate),
          payoutRate: Number(formData.payoutRate),
        },
      };

      const success = await onSubmit(payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Master Distributor' : `Edit Master Distributor - ${initialData?.code || ''}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Basic Contact Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            Contact & Identity
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Master Distributor Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Apex National Network"
              error={errors.name}
            />

            <Input
              label="Master Distributor Code *"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g. MD003"
              disabled={mode === 'edit'}
              error={errors.code}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="md@qinstarpay.com"
              type="email"
              error={errors.email}
            />

            <MobileInput
              label="Mobile Number *"
              value={formData.mobile}
              onChange={(e: any) => handleChange('mobile', typeof e === 'string' ? e : e?.target?.value || '')}
              error={errors.mobile}
              required
            />
          </div>
        </div>

        {/* Business & Commission */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            Business & Commission Rates
          </p>

          <Input
            label="Business Entity Name *"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="e.g. Apex Financial Services Master Pvt Ltd"
            error={errors.businessName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Pay-In Commission Rate (%)"
              type="number"
              step="0.01"
              value={formData.payinRate}
              onChange={(e) => handleChange('payinRate', parseFloat(e.target.value) || 0)}
              placeholder="0.10"
            />

            <Input
              label="Pay-Out Commission Flat (₹)"
              type="number"
              step="0.5"
              value={formData.payoutRate}
              onChange={(e) => handleChange('payoutRate', parseFloat(e.target.value) || 0)}
              placeholder="1.00"
            />
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Account Status Configuration
          </p>

          <FormField label="Account Status">
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as AccountStatus)}
              options={[
                { label: 'ACTIVE (Direct Operational Access)', value: 'ACTIVE' },
                { label: 'INACTIVE (Blocked)', value: 'INACTIVE' },
                { label: 'SUSPENDED', value: 'SUSPENDED' },
              ]}
            />
          </FormField>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create Master Distributor' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
