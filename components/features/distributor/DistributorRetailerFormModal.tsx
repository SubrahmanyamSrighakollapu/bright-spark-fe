import React, { useState, useEffect } from 'react';
import { Retailer, KYCStatus, RetailerPlan } from '@/types/domain';
import { CreateRetailerInput, UpdateRetailerInput } from '@/services/retailerService';
import { retailerPlanService } from '@/services/retailerPlanService';
import { Modal, Button, Input, Select, FormField, MobileInput } from '@/components/ui';
import { User, ShieldCheck, Tag, Info, AlertTriangle } from 'lucide-react';

interface DistributorRetailerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRetailerInput | UpdateRetailerInput) => Promise<boolean>;
  initialData?: Retailer | null;
  mode: 'create' | 'edit';
  distributorId: string;
}

export const DistributorRetailerFormModal: React.FC<DistributorRetailerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  distributorId,
}) => {
  const [formData, setFormData] = useState({
    planId: '',
    name: '',
    code: '',
    businessName: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    kycStatus: 'APPROVED' as KYCStatus,
  });

  const [activePlans, setActivePlans] = useState<RetailerPlan[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    retailerPlanService.getActiveRetailerPlans().then((plansRes) => {
      if (isMounted && plansRes.success && plansRes.data) {
        const plans = plansRes.data;
        setActivePlans(plans);
        if (mode === 'create' && plans.length > 0) {
          setFormData((prev) => (prev.planId ? prev : { ...prev, planId: plans[0].id }));
        }
      }
    });

    if (initialData && mode === 'edit') {
      setFormData({
        planId: initialData.planId || '',
        name: initialData.name || '',
        code: initialData.code || '',
        businessName: initialData.businessName || '',
        email: initialData.email || '',
        mobile: initialData.mobile || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        kycStatus: initialData.kycStatus || 'APPROVED',
      });
    } else if (mode === 'create') {
      setFormData({
        planId: '',
        name: '',
        code: '',
        businessName: '',
        email: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        kycStatus: 'APPROVED',
      });
    }
    setErrors({});

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.planId) newErrors.planId = 'Commercial Retailer Plan is required';
    if (!formData.name.trim()) newErrors.name = 'Retailer Full Name is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business Name is required';

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
      const payload: CreateRetailerInput = {
        distributorId,
        planId: formData.planId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase() || undefined,
        businessName: formData.businessName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        kycStatus: formData.kycStatus,
      };
      const success = await onSubmit(payload);
      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('Submit distributor retailer form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Retailer' : `Edit Retailer - ${initialData?.code || ''}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {mode === 'create' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Admin Approval Requirement:</span> Retailers created from the Distributor portal require Admin approval before activation. Newly created retailers are set to <code className="bg-amber-100 px-1 rounded text-amber-900 font-bold">PENDING_APPROVAL</code> and <code className="bg-amber-100 px-1 rounded text-amber-900 font-bold">INACTIVE</code>.
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-blue-900">
            <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Plan Change Notice:</span> Plan changes apply only to future transactions. Historical commission records remain unchanged.
            </div>
          </div>
        )}

        {/* Section 1: Retailer Plan Selection */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            Commercial Plan Assignment
          </p>

          <FormField label="Commercial Retailer Plan *" error={errors.planId}>
            <Select
              value={formData.planId}
              onChange={(e) => handleChange('planId', e.target.value)}
              options={
                activePlans.length > 0
                  ? activePlans.map((p) => {
                      const payinRule = p.commissionRules?.find((r) => r.serviceType === 'PAY_IN');
                      const payoutRule = p.commissionRules?.find((r) => r.serviceType === 'PAY_OUT');
                      const payinRate = payinRule ? payinRule.value : 0.10;
                      const payoutRate = payoutRule ? payoutRule.value : 1.00;
                      return {
                        label: `${p.name} (${p.code}) — PayIn: ${payinRate}% | PayOut: ₹${payoutRate}`,
                        value: p.id,
                      };
                    })
                  : [{ label: 'No Active Commercial Plans Available', value: '' }]
              }
            />
          </FormField>
        </div>

        {/* Section 2: Contact & Identification */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Retailer & Store Information
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Retailer Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              error={errors.name}
            />

            <Input
              label="Business / Store Name *"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="e.g. Ramesh Digital Pay Point"
              error={errors.businessName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="ramesh@digitalpay.com"
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

        {/* Section 3: Location & KYC Status */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Location & Compliance Settings
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. New Delhi"
            />

            <Input
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="e.g. Delhi NCR"
            />

            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              placeholder="110001"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="KYC Status">
              <Select
                value={formData.kycStatus}
                onChange={(e) => handleChange('kycStatus', e.target.value as KYCStatus)}
                options={[
                  { label: 'APPROVED', value: 'APPROVED' },
                  { label: 'PENDING', value: 'PENDING' },
                  { label: 'UNDER_REVIEW', value: 'UNDER_REVIEW' },
                  { label: 'REJECTED', value: 'REJECTED' },
                ]}
              />
            </FormField>

            {mode === 'create' && (
              <Input
                label="Custom Retailer Code (Optional)"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="Auto-generated if empty"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={activePlans.length === 0 && mode === 'create'}
          >
            {mode === 'create' ? 'Submit Retailer for Approval' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
