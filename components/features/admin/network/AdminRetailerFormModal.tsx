import React, { useState, useEffect } from 'react';
import { Retailer, AccountStatus, KYCStatus, RetailerPlan } from '@/types/domain';
import { hierarchyService } from '@/services/hierarchyService';
import { retailerPlanService } from '@/services/retailerPlanService';
import { Modal, Button, Input, Select, FormField, MobileInput } from '@/components/ui';
import { User, Building2, ShieldCheck, Network, Store, Percent } from 'lucide-react';

export interface CreateAdminRetailerInput {
  masterDistributorId: string;
  distributorId: string;
  planId: string;
  name: string;
  businessName: string;
  email: string;
  mobile: string;
  kycStatus?: KYCStatus;
  accountStatus?: AccountStatus;
}

interface AdminRetailerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdminRetailerInput) => Promise<boolean>;
  initialData?: Retailer | null;
  mode: 'create' | 'edit';
}

export const AdminRetailerFormModal: React.FC<AdminRetailerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const masterDistributors = hierarchyService.getAllMasterDistributors();
  const [activePlans, setActivePlans] = useState<RetailerPlan[]>([]);

  const [parentMdId, setParentMdId] = useState(masterDistributors[0]?.id || 'md_001');
  const [parentDstId, setParentDstId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    businessName: '',
    email: '',
    mobile: '',
    kycStatus: 'APPROVED' as KYCStatus,
    accountStatus: 'ACTIVE' as AccountStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter distributors dependent on selected Master Distributor
  const filteredDistributors = hierarchyService
    .getMasterDistributorDistributors(parentMdId)
    .filter((d) => (d.approvalStatus || 'APPROVED') === 'APPROVED' && d.status === 'ACTIVE');

  // Load Active Plans
  useEffect(() => {
    async function loadPlans() {
      const res = await retailerPlanService.getActiveRetailerPlans();
      if (res.success && res.data) {
        setActivePlans(res.data);
        if (!selectedPlanId && res.data.length > 0) {
          setSelectedPlanId(res.data[0].id);
        }
      }
    }
    loadPlans();
  }, []);

  // Update dependent distributor dropdown when parent MD changes
  useEffect(() => {
    if (filteredDistributors.length > 0) {
      if (!filteredDistributors.some((d) => d.id === parentDstId)) {
        setParentDstId(filteredDistributors[0].id);
      }
    } else {
      setParentDstId('');
    }
  }, [parentMdId]);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setParentMdId(initialData.masterDistributorId || masterDistributors[0]?.id || 'md_001');
      setParentDstId(initialData.distributorId || '');
      setSelectedPlanId(initialData.planId || activePlans[0]?.id || '');
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        businessName: initialData.businessName || '',
        email: initialData.email || '',
        mobile: initialData.mobile || '',
        kycStatus: initialData.kycStatus || 'APPROVED',
        accountStatus: initialData.accountStatus || 'ACTIVE',
      });
    } else {
      setParentMdId(masterDistributors[0]?.id || 'md_001');
      const initialDsts = hierarchyService
        .getMasterDistributorDistributors(masterDistributors[0]?.id || 'md_001')
        .filter((d) => (d.approvalStatus || 'APPROVED') === 'APPROVED' && d.status === 'ACTIVE');
      setParentDstId(initialDsts[0]?.id || '');
      setSelectedPlanId(activePlans[0]?.id || 'plan_std_01');
      setFormData({
        code: '',
        name: '',
        businessName: '',
        email: '',
        mobile: '',
        kycStatus: 'APPROVED',
        accountStatus: 'ACTIVE',
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen, activePlans.length]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!parentMdId) newErrors.parentMdId = 'Parent Master Distributor is required';
    if (!parentDstId) newErrors.parentDstId = 'Parent Distributor is required';
    if (!selectedPlanId) newErrors.selectedPlanId = 'Retailer Plan selection is required';

    if (!formData.name.trim()) newErrors.name = 'Retailer Full Name is required';
    if (mode === 'create' && !formData.code.trim()) {
      newErrors.code = 'Retailer Code is required';
    } else if (mode === 'create' && !/^[A-Z0-9_-]{3,15}$/i.test(formData.code.trim())) {
      newErrors.code = 'Code must be 3-15 alphanumeric characters';
    }

    if (!formData.businessName.trim()) newErrors.businessName = 'Business Store / Outlet Name is required';

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
      const payload: CreateAdminRetailerInput = {
        masterDistributorId: parentMdId,
        distributorId: parentDstId,
        planId: selectedPlanId,
        name: formData.name.trim(),
        businessName: formData.businessName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        kycStatus: formData.kycStatus,
        accountStatus: formData.accountStatus,
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
      title={mode === 'create' ? 'Add New Retailer (Admin Portal)' : `Edit Retailer - ${initialData?.code || ''}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Parent Hierarchy Selector */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-indigo-600" />
            Hierarchy Parent Assignment *
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="1. Master Distributor *" error={errors.parentMdId}>
              <Select
                value={parentMdId}
                onChange={(e) => setParentMdId(e.target.value)}
                disabled={mode === 'edit'}
                options={masterDistributors.map((md) => ({
                  label: `${md.name} (${md.code})`,
                  value: md.id,
                }))}
              />
            </FormField>

            <FormField label="2. Parent Distributor *" error={errors.parentDstId}>
              <Select
                value={parentDstId}
                onChange={(e) => setParentDstId(e.target.value)}
                disabled={mode === 'edit' || filteredDistributors.length === 0}
                options={
                  filteredDistributors.length > 0
                    ? filteredDistributors.map((d) => ({
                        label: `${d.name} (${d.code})`,
                        value: d.id,
                      }))
                    : [{ label: 'No Active Distributors Found under selected MD', value: '' }]
                }
              />
            </FormField>
          </div>
        </div>

        {/* Plan Assignment */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-emerald-600" />
            Retailer Plan & Commission Assignment *
          </p>
          <FormField label="Select Active Retailer Plan *" error={errors.selectedPlanId}>
            <Select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              options={activePlans.map((plan) => ({
                label: `${plan.name} (${plan.code}) — PayIn: ${plan.commissionRules.find((r) => r.serviceType === 'PAY_IN')?.value || 0}% | PayOut: ₹${plan.commissionRules.find((r) => r.serviceType === 'PAY_OUT')?.value || 0}`,
                value: plan.id,
              }))}
            />
          </FormField>
        </div>

        {/* Contact Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            Retailer Contact Profile
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Retailer Full Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Vikram Retailer"
              error={errors.name}
            />

            <Input
              label="Retailer Code *"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="e.g. RET009"
              disabled={mode === 'edit'}
              error={errors.code}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="vikram@example.com"
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

        {/* Business Store Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-indigo-600" />
            Store & Business Details
          </p>

          <Input
            label="Business Store / Outlet Name *"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="e.g. Vikram Digital Outlet Store"
            error={errors.businessName}
          />
        </div>

        {/* Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Status Configuration
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="KYC Verification Status">
              <Select
                value={formData.kycStatus}
                onChange={(e) => handleChange('kycStatus', e.target.value as KYCStatus)}
                options={[
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'REJECTED', value: 'REJECTED' },
                  { label: 'EXPIRED', value: 'EXPIRED' },
                ]}
              />
            </FormField>

            <FormField label="Account Status">
              <Select
                value={formData.accountStatus}
                onChange={(e) => handleChange('accountStatus', e.target.value as AccountStatus)}
                options={[
                  { label: 'ACTIVE (Operational)', value: 'ACTIVE' },
                  { label: 'INACTIVE (Blocked)', value: 'INACTIVE' },
                  { label: 'SUSPENDED', value: 'SUSPENDED' },
                ]}
              />
            </FormField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create Retailer' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
